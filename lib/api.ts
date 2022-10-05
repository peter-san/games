import * as cdk from "aws-cdk-lib";
import * as cognito from "aws-cdk-lib/aws-cognito";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as lambdaNodejs from "aws-cdk-lib/aws-lambda-nodejs";
import {Construct} from "constructs";
import * as agw from "aws-cdk-lib/aws-apigateway";
import { RestApi } from 'aws-cdk-lib/aws-apigateway';
import {ICertificate} from 'aws-cdk-lib/aws-certificatemanager';
import * as path from "path";

interface APIStackProps extends cdk.StackProps {
    userPool: cognito.UserPool;
    //certificate: ICertificate
    backend: lambda.Function;
}

export class APIStack extends cdk.Stack {

    readonly api: RestApi

    constructor(scope : Construct, id : string, props : APIStackProps) {
        super(scope, id, props);

        const authorizer = new agw.CognitoUserPoolsAuthorizer(this, "Authorizer", {
            cognitoUserPools: [props.userPool]
        });

        // Definition of API Gateway
        this.api = new agw.RestApi(this, "api", {
            deployOptions: {
                stageName: "v0"
            },
            defaultCorsPreflightOptions: {
                allowOrigins: ["http://localhost:3000"],
                allowMethods: agw.Cors.ALL_METHODS
            },

            // domainName: {
            //     domainName: `games.petersan.de`,
            //     certificate: props.certificate,
            //     endpointType: agw.EndpointType.REGIONAL,
            //     basePath: "api"
            // }
        });

        const authorized = {
            authorizer: authorizer,
            authorizationType: agw.AuthorizationType.COGNITO,
            //authorizationScopes: ['OpenID']
        }

        const integration = new agw.LambdaIntegration(props.backend)

        const catan = this.api.root.addResource("games").addResource("catan");
        catan.addMethod("GET", integration);
        catan.addMethod("POST", integration, authorized)
        catan.addMethod("PUT", integration, authorized)

        const single = catan.addResource("{id}")

        single.addMethod("GET", integration, authorized);
        single.addMethod("DELETE", integration, authorized)
        single.addResource("players").addMethod("PUT", integration, authorized)


        const post = (resource: agw.Resource, path : string) =>  resource.addResource(path).addMethod("POST", integration, authorized)

        post(single, "roll")
        post(single, "close-move")
        post(single, "towns")
        post(single, "cities")
        post(single, "streets")
        post(single, "robber")

        post(single, "market")
        const exchange = single.addResource("exchange")
        exchange.addMethod("POST", integration, authorized)
        exchange.addResource("{requestId}").addMethod("PUT", integration, authorized)


        const cards = single.addResource("cards")
        cards.addMethod("POST", integration, authorized)
        post(cards, "knight")
        post(cards, "monopole")
        post(cards, "invention")
        post(cards, "roads")
        post(cards, "victory")


        // Definition of lambda function
        const timeFunction = new lambdaNodejs.NodejsFunction(this, "getTime", {
            handler: "handler",
            runtime: lambda.Runtime.NODEJS_14_X,
            timeout: cdk
                .Duration
                .seconds(30),
            memorySize: 512,
            entry: "./lambda/time.ts"
        });
        // GET: /time
        const userinfo = this.api.root.addResource("time");
        userinfo.addMethod("GET", new agw.LambdaIntegration(timeFunction), authorized);
    }
}