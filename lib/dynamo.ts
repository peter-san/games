import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as path from "path";

export class DynamoStack extends cdk.Stack {

    public readonly table: dynamodb.Table
    public readonly gamesTable: dynamodb.Table

    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        this.table = new dynamodb.Table(this, id, {
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
            sortKey: { name: 'createdAt', type: dynamodb.AttributeType.NUMBER },
            pointInTimeRecovery: false,
            tableName: "temp-table"
        });

        this.gamesTable = new dynamodb.Table(this, "GamesTable", {
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            partitionKey: { name: 'gameId', type: dynamodb.AttributeType.NUMBER },

            pointInTimeRecovery: false,
            tableName: "games"
        });
    }
}
