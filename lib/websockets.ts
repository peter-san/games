import * as cdk from "aws-cdk-lib";
import * as cognito from "aws-cdk-lib/aws-cognito";
import * as lambda from "aws-cdk-lib/aws-lambda";
// import * as lambdaNodejs from "aws-cdk-lib/aws-lambda-nodejs";
// import * as waf from "aws-cdk-lib/aws-wafv2";
import { Construct } from "constructs";
import * as apigwv2 from '@aws-cdk/aws-apigatewayv2-alpha';
import { WebSocketLambdaIntegration } from "@aws-cdk/aws-apigatewayv2-integrations-alpha";
import * as lambdaNodejs from "aws-cdk-lib/aws-lambda-nodejs";
import { Effect, PolicyStatement } from "aws-cdk-lib/aws-iam";
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as events from "aws-cdk-lib/aws-events";
import * as targets from 'aws-cdk-lib/aws-events-targets';
import { ICertificate } from "aws-cdk-lib/aws-certificatemanager";
// import * as path from "path";

interface WebsocketApiStackProps extends cdk.StackProps {
    userPool: cognito.UserPool
    certificate: ICertificate
}

export class WebsocketApiStack extends cdk.Stack {

    readonly eventBus: events.EventBus

    constructor(scope: Construct, id: string, props: WebsocketApiStackProps) {
        super(scope, id, props);

        const connect = new lambdaNodejs.NodejsFunction(this, "Connect", {
            handler: "connectionHandler",
            runtime: lambda.Runtime.NODEJS_14_X,
            timeout: cdk
                .Duration
                .seconds(30),
            memorySize: 512,
            entry: "./lambda/connect.ts"
        });

        const eventConsumer = new lambdaNodejs.NodejsFunction(this, "EventConsumer", {
            handler: "connectionHandler",
            runtime: lambda.Runtime.NODEJS_14_X,
            timeout: cdk
                .Duration
                .seconds(30),
            memorySize: 512,
            entry: "./lambda/event-consumer.ts"
        });

        const api = new apigwv2.WebSocketApi(this, "WebsocketApi", {
            apiName: 'CatanSockets',
            
            connectRouteOptions: {
                integration: new WebSocketLambdaIntegration('connectionIntegration', connect),
            },
            disconnectRouteOptions: {
                integration: new WebSocketLambdaIntegration('disconnectIntegration', connect),
            },
            defaultRouteOptions: {
                integration: new WebSocketLambdaIntegration('defaultIntegration', connect),
            }

        })

        const websocketStage = new apigwv2.WebSocketStage(this, 'WebsocketStage', {
            webSocketApi: api,
            stageName: 'ws',
            autoDeploy: true,
        });

        const domainName = new apigwv2.DomainName(this, "Domain", {
            certificate: props.certificate,
            domainName: "ws.petersan.de"
        })
      

        const mapping = new apigwv2.ApiMapping(this, 'WebsocketMapping', {
            api: api,
            domainName: domainName,
            stage: websocketStage
        })

        const table = new dynamodb.Table(this, id, {
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            partitionKey: { name: 'connectionId', type: dynamodb.AttributeType.STRING },
            sortKey: { name: 'subscriptionId', type: dynamodb.AttributeType.STRING },
            timeToLiveAttribute: "ttl",
            pointInTimeRecovery: false,
        });

        table.addGlobalSecondaryIndex({
            indexName: "subscriptionPathIndex", 
            partitionKey: { name: 'subscriptionPath', type: dynamodb.AttributeType.STRING },
        })

        const allowConnectionManagementOnApiGatewayPolicy = new PolicyStatement({
            effect: Effect.ALLOW,
            resources: [`arn:aws:execute-api:${this.region}:${this.account}:${api.apiId}/${websocketStage.stageName}/*`],
            actions: ['execute-api:ManageConnections'],
        });

        connect.addEnvironment('API_GATEWAY_ENDPOINT', websocketStage.callbackUrl)
        connect.addEnvironment('TABLE_NAME', table.tableName)
        connect.addToRolePolicy(allowConnectionManagementOnApiGatewayPolicy);
        table.grantReadWriteData(connect)

        eventConsumer.addEnvironment('API_GATEWAY_ENDPOINT', websocketStage.callbackUrl)
        eventConsumer.addEnvironment('TABLE_NAME', table.tableName)
        eventConsumer.addToRolePolicy(allowConnectionManagementOnApiGatewayPolicy);
        table.grantReadData(eventConsumer)


        this.eventBus = new events.EventBus(this, "EventBus", {
            eventBusName: "catan-events"
        });
        const rule = new events.Rule(this, "catchAllRule", {
            eventPattern: {
                detailType: ['game update'],
            },
            eventBus: this.eventBus
        });


        rule.addTarget(new targets.LambdaFunction(eventConsumer))
    }
}