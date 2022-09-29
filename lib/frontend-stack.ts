import * as cdk from 'aws-cdk-lib';
import {Construct} from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3Deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import {Certificate} from 'aws-cdk-lib/aws-certificatemanager';
import {Duration} from 'aws-cdk-lib';
import { PriceClass } from 'aws-cdk-lib/aws-cloudfront';
import { RestApi } from 'aws-cdk-lib/aws-apigateway';
import * as agw  from '@aws-cdk/aws-apigatewayv2-alpha';
import * as integrations  from '@aws-cdk/aws-apigatewayv2-integrations-alpha';

export interface FrontendProps extends cdk.StackProps {
}

export class FrontendStack extends cdk.Stack {
    constructor(scope : Construct, id : string, props: FrontendProps) {
        super(scope, id, props);

        const bucket = new s3.Bucket(this, "Bucket", {
          publicReadAccess: true,
          removalPolicy: cdk.RemovalPolicy.DESTROY,
          bucketName: "north-static-dev",
          websiteIndexDocument: "index.html",
          websiteErrorDocument: "index.html",
          autoDeleteObjects: true
      });

      const src = new s3Deploy.BucketDeployment(this, "DeployCRA", {
        sources: [s3Deploy.Source.asset("./apps/frontend/build")],
        destinationBucket: bucket
    });
    }

    cloudfrontDistribution = (id: string) => {

      const siteBucket = new s3.Bucket(this, 'SiteBucket', {
        bucketName: "north-psa-dev",
        publicReadAccess: false,
        blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
        removalPolicy: cdk.RemovalPolicy.DESTROY, // NOT recommended for production code

        autoDeleteObjects: true, // NOT recommended for production code
      });

      const cloudfrontOAI = new cloudfront.OriginAccessIdentity(this, 'cloudfront-OAI', {comment: `OAI for ${id}`});

      siteBucket.addToResourcePolicy(new iam.PolicyStatement({
          actions: ['s3:GetObject'],
          resources: [ siteBucket.arnForObjects('*') ],
          principals: [new iam.CanonicalUserPrincipal(cloudfrontOAI.cloudFrontOriginAccessIdentityS3CanonicalUserId)]
      }));

      const certificate = Certificate.fromCertificateArn(this, 'Certificate', 'arn:aws:acm:us-east-1:169119119606:certificate/b323810f-62a8-460a-9594-eb829ea6ce7c')

      const distribution = new cloudfront.Distribution(this, 'SiteDistribution', {
          certificate: certificate,
          defaultRootObject: "index.html",
          domainNames: ['catan.petersan.de'],
          minimumProtocolVersion: cloudfront.SecurityPolicyProtocol.TLS_V1_2_2021,
          errorResponses: [
              {
                  httpStatus: 403,
                  responseHttpStatus: 403,
                  responsePagePath: '/index.html',
                  ttl: Duration.seconds(10)
              }
          ],
          priceClass: PriceClass.PRICE_CLASS_100,
          defaultBehavior: {
              origin: new cdk.aws_cloudfront_origins.S3Origin(siteBucket, {originAccessIdentity: cloudfrontOAI}),
              compress: true,
              allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD,
              viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS
          }
      })

      new s3Deploy.BucketDeployment(this, 'DeployWithInvalidation', {
          sources: [ s3Deploy.Source.asset("./apps/frontend/build")],
          destinationBucket: siteBucket,
          distribution,
          distributionPaths: ['/*']
      });
    }
}
