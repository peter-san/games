import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as elb from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { Cluster } from 'aws-cdk-lib/aws-ecs';
import { ListenerCertificate } from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { ICertificate, Certificate } from 'aws-cdk-lib/aws-certificatemanager';
import { DomainName } from '@aws-cdk/aws-apigatewayv2-alpha';

export class CatanStack extends cdk.Stack {

  readonly vpc: ec2.Vpc
  readonly listener: elb.ApplicationListener
  readonly cluster: Cluster
  readonly certificate: ICertificate

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.certificate = Certificate.fromCertificateArn(
      this,
      "Certificate",
      "arn:aws:acm:eu-north-1:169119119606:certificate/7059c4d1-70c1-456d-9ce7-25ba9e000cde"
    )

    this.vpc = new ec2.Vpc(this, "Vpc", {
      vpcName: 'north-dev-vpc',
      maxAzs: 2,
      cidr: '10.0.0.0/16',
    });

    this.cluster = new ecs.Cluster(this, "Cluster", {
      vpc: this.vpc,
      clusterName: 'north-dev',

    });

    const alb = new elb.ApplicationLoadBalancer(this, 'LB', {
      vpc: this.vpc,
      internetFacing: true,
      loadBalancerName: 'north-alb'

    });

    alb.addRedirect({
      sourcePort: 80,
      sourceProtocol: elb.ApplicationProtocol.HTTP,
      targetPort: 443,
      targetProtocol: elb.ApplicationProtocol.HTTPS,
    });

    this.listener = alb.addListener('HttpsListener', {
      protocol: elb.ApplicationProtocol.HTTPS,
      certificates: [ListenerCertificate.fromArn('arn:aws:acm:eu-north-1:169119119606:certificate/7059c4d1-70c1-456d-9ce7-25ba9e000cde')],


      // 'open: true' is the default, you can leave it out if you want. Set it
      // to 'false' and use `listener.connections` if you want to be selective
      // about who can access the load balancer.
      open: true,
      defaultAction: elb.ListenerAction.fixedResponse(503, {
        contentType: 'text/html',
        messageBody: 'no rules configured',
      }),
    });
  }
}
