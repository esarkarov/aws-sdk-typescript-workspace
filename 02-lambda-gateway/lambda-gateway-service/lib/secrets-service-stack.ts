import * as cdk from "aws-cdk-lib";
import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";
import { Construct } from "constructs";

export class SecretsServiceStack extends cdk.Stack {
  public readonly secret: secretsmanager.Secret;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.secret = new secretsmanager.Secret(this, "AppSecret", {
      secretName: `${this.stackName}-app-secret`,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    new cdk.CfnOutput(this, "SecretArn", {
      value: this.secret.secretArn,
      description: "ARN of the application secret",
    });
  }
}
