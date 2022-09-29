
import * as S3 from "aws-cdk-lib/aws-s3";
import * as Iam from "aws-cdk-lib/aws-iam";
import * as ApiGateway from "aws-cdk-lib/aws-apigateway";
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3Deploy from 'aws-cdk-lib/aws-s3-deployment';

export class NewFrontendStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const assetsBucket = this.createBucketForAssets();

        const apiGateway = this.createAPIGateway();

        const executeRole = this.createExecutionRole(assetsBucket);
        //assetsBucket.grantRead(executeRole);


        assetsBucket.addToResourcePolicy(new Iam.PolicyStatement({
            actions: ['s3:GetObject'],
            resources: [ assetsBucket.arnForObjects("*") ],
            principals: [executeRole]
        }));


        const s3Integration = this.createS3Integration(assetsBucket, executeRole);

        //this.addAssetsEndpoint(apiGateway, s3Integration);
        //const integration = new ApiGateway.HttpIntegration("s3-proxy")

        apiGateway.root.addResource("{item}").addMethod("GET",new ApiGateway.HttpIntegration(
            `${assetsBucket.bucketWebsiteUrl}/{item}`,
            {
              httpMethod: "GET",
              proxy: false,
              
              options: {
                requestParameters: {
                  "integration.request.path.item": "method.request.path.item",
                },
                credentialsRole: executeRole
              },
            },
          ), { 

            
            requestParameters: {
            "method.request.path.item": true,
            "method.request.header.Content-Type": true,
        }},

        )
        
        const src = new s3Deploy.BucketDeployment(this, "DeployCRA", {
            sources: [s3Deploy.Source.asset("./apps/frontend/build")],
            destinationBucket: assetsBucket
        });
    }

    private createBucketForAssets() {
        const bucket = new S3.Bucket(this, 'SiteBucket', {
            bucketName: "north-psa-dev-1",
            publicReadAccess: true,
            //blockPublicAccess: S3.BlockPublicAccess.,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            autoDeleteObjects: true,


            websiteIndexDocument: "index.html",
            websiteErrorDocument: "index.html",
        });


        return bucket
    }

    private createAPIGateway() {
        return new ApiGateway.RestApi(this, "assets-api", {
            restApiName: "Static assets provider",
            description: "Serves assets from the S3 bucket.",
            binaryMediaTypes: ["*/*"],
            minimumCompressionSize: 0,
            deployOptions: {
                stageName: "v0",
            },
            deploy: true
        });
    }

    private createExecutionRole(bucket: S3.IBucket) {
        const executeRole = new Iam.Role(this, "api-gateway-s3-assume-role", {
            assumedBy: new Iam.ServicePrincipal("apigateway.amazonaws.com"),
            roleName: "API-Gateway-S3-Integration-Role-1",
        });

        executeRole.addToPolicy(
            
            new Iam.PolicyStatement({
                resources: ["*"],//[bucket.bucketArn, bucket.bucketArn+"/*"],
                actions: ["s3:*"],
            })
        );

        return executeRole;
    }

    private createS3Integration(assetsBucket: S3.IBucket, executeRole: Iam.Role) {

        return new ApiGateway.AwsIntegration({
            service: "s3",
            integrationHttpMethod: "GET",
            
            path: `${assetsBucket.bucketName}/{folder}/{key}`,
            options: {
                credentialsRole: executeRole,
                
                integrationResponses: [
                    {
                        statusCode: "200",
                        responseParameters: {
                            "method.response.header.Content-Type": "integration.response.header.Content-Type",
                        },
                    },
                ],

                requestParameters: {
                    "integration.request.path.folder": "method.request.path.folder",
                    "integration.request.path.key": "method.request.path.key",
                },
            },
        });
    }

    private addAssetsEndpoint(
        apiGateway: ApiGateway.RestApi,
        s3Integration: ApiGateway.AwsIntegration
    ) {
        apiGateway.root
            .addResource("assets")
            .addResource("{folder}")
            .addResource("{key}")
            .addMethod("GET", s3Integration, {
                authorizationType: ApiGateway.AuthorizationType.IAM,
                methodResponses: [
                    {
                        statusCode: "200",
                        responseParameters: {
                            "method.response.header.Content-Type": true,
                        },
                    },
                ],
                requestParameters: {
                    "method.request.path.folder": true,
                    "method.request.path.key": true,
                    "method.request.header.Content-Type": true,
                },
            });
    }
}