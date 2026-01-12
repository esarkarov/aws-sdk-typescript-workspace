import * as cdk from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import { S3BucketServiceStack } from "../lib/s3-bucket-service-stack";

describe("S3BucketServiceStack", () => {
  let app: cdk.App;
  let stack: S3BucketServiceStack;
  let template: Template;

  beforeEach(() => {
    app = new cdk.App();
    stack = new S3BucketServiceStack(app, "TestStack");
    template = Template.fromStack(stack);
  });

  test("creates two S3 buckets", () => {
    template.resourceCountIs("AWS::S3::Bucket", 2);
  });

  test("primary bucket is created", () => {
    const buckets = template.findResources("AWS::S3::Bucket");
    expect(Object.keys(buckets).length).toBeGreaterThanOrEqual(1);
  });

  test("website bucket has public access enabled", () => {
    template.hasResourceProperties("AWS::S3::Bucket", {
      PublicAccessBlockConfiguration: {
        BlockPublicAcls: false,
        BlockPublicPolicy: false,
        IgnorePublicAcls: false,
        RestrictPublicBuckets: false,
      },
      WebsiteConfiguration: {
        IndexDocument: "index.html",
      },
    });
  });

  test("creates three CloudFormation outputs", () => {
    const outputs = template.findOutputs("*");
    expect(Object.keys(outputs)).toHaveLength(3);
  });

  test("outputs contain bucket names and website URL", () => {
    template.hasOutput("PrimaryBucketName", {
      Description: "The name of the primary bucket",
    });

    template.hasOutput("WebsiteBucketName", {
      Description: "The name of the website bucket",
    });

    template.hasOutput("WebsiteUrl", {
      Description: "The website URL",
    });
  });
});
