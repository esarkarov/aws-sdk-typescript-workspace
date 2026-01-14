#!/usr/bin/env node
import * as cdk from "aws-cdk-lib/core";
import { LambdaGatewayServiceStack } from "../lib/lambda-gateway-service-stack";
import { SecretsServiceStack } from "../lib/secrets-service-stack";

const app = new cdk.App();
const secretsServiceStack = new SecretsServiceStack(app, "SecretsServiceStack");

const LambdaGatewayServiceService = new LambdaGatewayServiceStack(
  app,
  "LambdaGatewayServiceStack",
  {
    secretsServiceStack,
  }
);

LambdaGatewayServiceService.addDependency(secretsServiceStack);
