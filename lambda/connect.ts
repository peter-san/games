
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
// eslint-disable-next-line import/no-unresolved
import { APIGatewayEvent } from 'aws-lambda';

const AWS = require('aws-sdk');

// const AWSXRay = require('aws-xray-sdk-core');
// const AWS = AWSXRay.captureAWS(require('aws-sdk'));

const dynamoDbClient: DocumentClient = new AWS.DynamoDB.DocumentClient({
    apiVersion: '2012-08-10',
    region: process.env.AWS_REGION,
});

const gatewayClient = new AWS.ApiGatewayManagementApi({
    apiVersion: '2018-11-29',
    endpoint: process.env.API_GATEWAY_ENDPOINT,
});

const TableName = process.env.TABLE_NAME!

export async function connectionHandler(event: APIGatewayEvent): Promise<any> {
    const { eventType, connectionId } = event.requestContext;

    if (eventType === 'CONNECT') {
        console.log(`connect: ${connectionId}`)
        return { statusCode: 200, body: 'Connected' };
    }

    const parts = event.body?.split('\n') ?? ['dummy']

    if (eventType === 'DISCONNECT') {
        await markUnsubscribed(connectionId!!)

        return { statusCode: 200, body: 'Disconnected' };
    }


    console.log(`$default event: ${JSON.stringify(event)}`)

    switch (parts[0]) {
        case 'CONNECT': await send(connectionId!!, 'CONNECTED\nversion:1.2\n\n\u0000'); break
        case 'SUBSCRIBE': await saveSubscription(connectionId!!, parts); break
        case 'UNSUBSCRIBE': await removeSubscription(connectionId!!, parts); break
    }

    return { statusCode: 200, body: 'Ok' };
}

async function markUnsubscribed(connectionId: string) {

    console.log(`disconnect ${connectionId}`)

    const data = await dynamoDbClient.query({
        TableName: process.env.TABLE_NAME!,  
        KeyConditionExpression: "connectionId = :sid",
        ExpressionAttributeValues: {":sid":connectionId},
        ProjectionExpression: 'subscriptionId',
    }).promise()

    if (data.Items && data.Count && data.Count > 0) {

        const items = data.Items!!.map(item => {
            return {
                DeleteRequest: {
                    Key: {
                        'connectionId': connectionId,
                        'subscriptionId': item['subscriptionId'],
                    }
                }
            }
        })

        const request:DocumentClient.BatchWriteItemInput = {RequestItems: {}}
        request.RequestItems[TableName] = items

        const res = await dynamoDbClient.batchWrite( request).promise()
        

        //     if (res.) {
        //         console.log('Batch delete unsuccessful ...');
        //         console.log(err1, err1.stack); // an error occurred
        //     } else {
        //         console.log('Batch delete successful ...');
        //         console.log(data1); // successful response
        //     }
        // })
    }

    
}


function send(connectionId: string, message: string) {
    return gatewayClient.postToConnection({
        ConnectionId: connectionId,
        Data: message
    }).promise()
}

function saveSubscription(connectionId: string, parts: string[]) {
    const subscriptionId = parts[1].split(':')[1]
    const path = parts[2].split(':')[1]
    const oneHourFromNow = Math.round(Date.now() / 1000 + 3600);
    return dynamoDbClient.put({
        TableName: process.env.TABLE_NAME!,
        Item: {
            connectionId,
            subscriptionPath: path,
            subscriptionId: subscriptionId,
            ttl: oneHourFromNow,
        },
    }).promise();
}

function removeSubscription(connectionId: string, parts: string[]) {
    const subscriptionId = parts[1].split(':')[1]
    return dynamoDbClient.delete({
        TableName: process.env.TABLE_NAME!,
        Key: { connectionId, subscriptionId },
    }).promise();
}


