#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { CatanStack } from '../lib/catan-stack';
import { BackendApp } from '../lib/backend-stack';
import { FrontendStack } from '../lib/frontend-stack';
import { AuthStack } from '../lib/authentication';
import { APIStack } from '../lib/api';
import { LambdaStack } from '../lib/lambda';
import { DynamoStack } from '../lib/dynamo';
import { WebsocketApiStack } from '../lib/websockets';
import { NewFrontendStack } from '../lib/frontend';
import { ApigwS3CdkStack } from '../lib/copy';
import { Certificate } from 'aws-cdk-lib/aws-certificatemanager';

const app = new cdk.App();
const base = new CatanStack(app, 'CatanStack', {});

new BackendApp(app, "CatanBackendStack", {
  vpc: base.vpc,
  listener: base.listener,
  cluster: base.cluster
})

const dynamo = new DynamoStack(app, "CatanDynamoStack")

const auth = new AuthStack(app, "CatanAuthenticationStack")

const websockets = new WebsocketApiStack(app, "CatanWebSocketApiStack", {
  userPool: auth.userPool
})

const lambda = new LambdaStack(app, "CatanLambdaStack", {
  //table: dynamo.gamesTable,
  eventBus: websockets.eventBus
})

const api = new APIStack(app, "CatanApiStack", {
  userPool: auth.userPool,
  backend: lambda.backend
})

new FrontendStack(app, "CatanFrontendStack", {})

new NewFrontendStack(app, "CatanNewFrontendStack")

new ApigwS3CdkStack(app, "ApigwS3CdkStack")

