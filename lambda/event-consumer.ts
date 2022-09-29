
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { EventBridgeEvent } from 'aws-lambda';


import AWS = require('aws-sdk');

const dynamoDbClient: DocumentClient = new AWS.DynamoDB.DocumentClient({
    apiVersion: '2012-08-10',
    region: process.env.AWS_REGION,
});

const gatewayClient = new AWS.ApiGatewayManagementApi({
    apiVersion: '2018-11-29',
    endpoint: process.env.API_GATEWAY_ENDPOINT,
});


type Event = {
    path: string,
    content: string
}

type Subscription = {
    subscriptionId: string,
    connectionId: string
}

async function getConnections(path: string): Promise<Subscription[]> {
    const response = await dynamoDbClient.query({
        TableName: process.env.TABLE_NAME!,
        IndexName: 'subscriptionPathIndex',
        KeyConditionExpression: 'subscriptionPath = :c',
        ExpressionAttributeValues: {':c': path},
        ProjectionExpression: 'connectionId, subscriptionId',
    }).promise();

    return response.Items?.map((c: any) => {
        return {
            connectionId: c.connectionId,
            subscriptionId: c.subscriptionId
        }
    }) ?? [];
}

export async function connectionHandler(event: EventBridgeEvent<string, Event>): Promise<any> {
    const { path, content } = event.detail;

    console.log('Triggered by ', event);

    const connections = await getConnections(path);

    console.log('found for ', path, connections)

    const postToConnectionPromises = connections.map((subscription: Subscription) =>
        gatewayClient.postToConnection({
            ConnectionId: subscription.connectionId,
            Data: `MESSAGE\ndestination:${path}\nsubscription:${subscription.subscriptionId}\n\n${JSON.stringify(content)}\u0000`
        }).promise());

    await Promise.race(postToConnectionPromises);

    return { statusCode: 200, body: 'Ok' };
}
