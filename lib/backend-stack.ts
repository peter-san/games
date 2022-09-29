import { Construct } from "constructs";
import { ContainerImage, FargateService, FargateTaskDefinition, ICluster, LogDriver, Protocol } from "aws-cdk-lib/aws-ecs";
import { Duration, Stack, StackProps } from "aws-cdk-lib";
import {
  ApplicationListener,
  ApplicationListenerRule,
  ApplicationProtocol,
  ApplicationTargetGroup,
  IApplicationTargetGroup,
  ListenerAction,
  ListenerCondition
} from "aws-cdk-lib/aws-elasticloadbalancingv2";
import { IVpc, Peer, Port, SecurityGroup } from "aws-cdk-lib/aws-ec2";
import { DockerImageAsset } from "aws-cdk-lib/aws-ecr-assets";
import * as path from "path";

export interface BackendProps extends StackProps {
  cluster: ICluster
  vpc: IVpc
  listener: ApplicationListener
}

export class BackendApp extends Stack {
  readonly service: FargateService
  readonly targetGroup: IApplicationTargetGroup

  constructor(scope: Construct, id: string, props: BackendProps) {
    super(scope, id);

    const taskDefinition = new FargateTaskDefinition(this, 'TaskDefinition', {
      cpu: 1024,
      memoryLimitMiB: 2048,
    });
    const image = ContainerImage.fromDockerImageAsset(new DockerImageAsset(this, 'Image', {
        directory: path.join(__dirname, '..', 'apps', 'backend', 'spring-web')
      })
    );
    const healthCheckPath = '/actuator/health'
    const containerDefinition = taskDefinition.addContainer(`Container`, {
      image,
      logging: LogDriver.awsLogs({
        streamPrefix: 'catan-backend'
      }),
      stopTimeout: Duration.seconds(10),
    //   healthCheck: {
    //     command: ['CMD-SHELL', `curl -f http://localhost:8080${healthCheckPath} || exit 1`],
    //     startPeriod: Duration.seconds(30),
    //     retries: 3,
    //     interval: Duration.seconds(30),
    //   },
      essential: true,
      portMappings: [{
        protocol: Protocol.TCP,
        containerPort: 8080,
      }],
      environment: {
        'server.error.include-message': 'always'
      },
    });

    const securityGroup = new SecurityGroup(this, 'SecurityGroup', {
      vpc: props.vpc,
      allowAllOutbound: true
    });

    securityGroup.addIngressRule(Peer.anyIpv4(), Port.tcp(containerDefinition.containerPort))

    this.service = new FargateService(this, 'Service', {
      cluster: props.cluster,
      taskDefinition: taskDefinition,
      securityGroups: [securityGroup],
      desiredCount: 1
    });

    this.targetGroup = new ApplicationTargetGroup(this, 'TargetGroup', {
      vpc: props.vpc,
      protocol: ApplicationProtocol.HTTP,
      port: 8080,
      targets: [
        this.service
      ],
      healthCheck: {
        path: '/actuator/health',
        healthyThresholdCount: 2,
        unhealthyThresholdCount: 5,
        timeout: Duration.seconds(120),
        interval: Duration.seconds(200),
      },
      targetGroupName: `backend-tg`,
    });

    new ApplicationListenerRule(this, 'ListenerRule', {
      action: ListenerAction.forward([this.targetGroup]),
      listener: props.listener,
      conditions: [ListenerCondition.pathPatterns(["*"])],
      priority: 5,
    });
  }
}
