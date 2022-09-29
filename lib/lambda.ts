import * as cdk from "aws-cdk-lib";
import { ManagedPolicy, PolicyStatement } from "aws-cdk-lib/aws-iam";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as lambdaNodejs from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import * as path from "path";
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import { Duration } from "aws-cdk-lib";

export interface LambdaProps extends cdk.StackProps {
    table: dynamodb.Table
    eventBus: events.EventBus
  }

export class LambdaStack extends cdk.Stack {

    public readonly backend: lambda.Function

    constructor(scope: Construct, id: string, props: LambdaProps) {
        super(scope, id, props);

        this.backend = new lambda.Function(this, "Dummy", {
            handler: "org.springframework.cloud.function.adapter.aws.FunctionInvoker",
            runtime: lambda.Runtime.JAVA_11,
            timeout: cdk.Duration.seconds(30),
            memorySize: 512,
            functionName: 'dummy',
        
            code: lambda.Code.fromAsset(path.join(__dirname, '/../apps/backend/spring-lambda/build/libs/spring-lambda-all.jar'))
        });

        props.eventBus.grantPutEventsTo(this.backend)
        props.table.grantReadWriteData(this.backend)

        const healthcheck = new events.Rule(this, "healthCheck", {
            schedule: events.Schedule.rate(Duration.minutes(3)), 
        });


        healthcheck.addTarget(new targets.LambdaFunction(this.backend, {
            event: events.RuleTargetInput.fromObject({ 
                httpMethod: "GET",
                resource: "/healthcheck"
            }),
        }))

        targets.addLambdaPermission(healthcheck, this.backend)
    }
}