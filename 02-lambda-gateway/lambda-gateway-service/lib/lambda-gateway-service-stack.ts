import * as cdk from "aws-cdk-lib";
import * as apigateway from "aws-cdk-lib/aws-apigatewayv2";
import * as integrations from "aws-cdk-lib/aws-apigatewayv2-integrations";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import * as path from "path";
import { SecretsServiceStack } from "./secrets-service-stack";

export class LambdaGatewayServiceStack extends cdk.Stack {
  constructor(
    scope: Construct,
    id: string,
    props: cdk.StackProps & { secretsServiceStack: SecretsServiceStack }
  ) {
    super(scope, id, props);

    // Lambda Functions
    const homeLambda = this.createLambda("HomeHandler", "homeRoute");
    const profileLambda = this.createLambda(
      "ProfileHandler",
      "createProfileRoute"
    );
    const welcomeLambda = this.createLambda("WelcomeHandler", "welcomeRoute", {
      USERNAME: "SOMEONE_USERNAME",
    });
    const loginLambda = this.createLambda("LoginHandler", "loginRoute", {
      SECRET_ID: props.secretsServiceStack.secret.secretName,
    });

    // Grant login lambda access to secrets
    props.secretsServiceStack.secret.grantRead(loginLambda);

    // HTTP API Gateway
    const httpApi = new apigateway.HttpApi(this, "HttpApi", {
      apiName: `${this.stackName}-api`,
      description: "HTTP API Gateway",
      corsPreflight: {
        allowOrigins: ["*"],
        allowMethods: [apigateway.CorsHttpMethod.ANY],
        allowHeaders: ["*"],
      },
    });

    // Routes
    this.addRoute(httpApi, "/", "GET", homeLambda);
    this.addRoute(httpApi, "/profile", "POST", profileLambda);
    this.addRoute(httpApi, "/welcome", "GET", welcomeLambda);
    this.addRoute(httpApi, "/login", "POST", loginLambda);

    // Outputs
    new cdk.CfnOutput(this, "ApiUrl", {
      value: httpApi.url ?? "",
      description: "HTTP API Gateway URL",
    });
  }

  private createLambda(
    id: string,
    handler: string,
    environment?: { [key: string]: string }
  ): NodejsFunction {
    return new NodejsFunction(this, id, {
      runtime: lambda.Runtime.NODEJS_22_X,
      entry: path.join(__dirname, "../src/lambda/handler.ts"),
      handler,
      functionName: `${this.stackName}-${handler.toLowerCase()}`,
      environment,
    });
  }

  private addRoute(
    api: apigateway.HttpApi,
    path: string,
    method: string,
    lambdaFn: NodejsFunction
  ): void {
    const httpMethod =
      method === "GET" ? apigateway.HttpMethod.GET : apigateway.HttpMethod.POST;

    api.addRoutes({
      path,
      methods: [httpMethod],
      integration: new integrations.HttpLambdaIntegration(
        `${lambdaFn.node.id}Integration`,
        lambdaFn
      ),
    });
  }
}


