

import * as cognito from "aws-cdk-lib/aws-cognito";
import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { UserPoolUser } from "./auth/UserPoolUser";
import { Duration } from "aws-cdk-lib";

export class AuthStack extends cdk.Stack {
    public readonly userPool: cognito.UserPool;
    public readonly client: cognito.UserPoolClient;

    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const userPool = new cognito.UserPool(this, "UserPool", {
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            mfa: cognito.Mfa.OFF,
            userPoolName: "CatanUsers",
            

            passwordPolicy: {
                minLength: 6,
                requireDigits: false,
                requireLowercase: false,
                requireUppercase: false,
                requireSymbols: false,
                tempPasswordValidity: Duration.days(365)
            }
            
        });

        const client = userPool.addClient("WebClient", {
            userPoolClientName: "webClient",
            idTokenValidity: cdk.Duration.days(1),
            accessTokenValidity: cdk.Duration.days(1),
            authFlows: {
                userPassword: true,
                userSrp: true,
                custom: true,
            }
        });

        this.userPool = userPool;
        this.client = client;

        new UserPoolUser(this, 'User1', {
            userPool: this.userPool,
            username: '1',
            password: 'password1',
        });

        new UserPoolUser(this, 'User2', {
            userPool: this.userPool,
            username: '2',
            password: 'password2',
        });
        
        new UserPoolUser(this, 'User3', {
            userPool: this.userPool,
            username: '3',
            password: 'password3',
        });

        new UserPoolUser(this, 'User4', {
            userPool: this.userPool,
            username: '4',
            password: 'password4',
        });


        new cdk.CfnOutput(this, "CognitoUserPoolId", {
            value: userPool.userPoolId,
            description: "userPoolId required for frontend settings",
        });
        new cdk.CfnOutput(this, "CognitoUserPoolWebClientId", {
            value: client.userPoolClientId,
            description: "clientId required for frontend settings",
        });

    }
}