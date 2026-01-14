import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import crypto from "crypto";
import { fetchSecret } from "../utils/fetchSecret";

export const homeRoute = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => {
  console.log("Home Route Event:", event.requestContext.requestId);

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "Welcome to the API!",
    }),
  };
};

export const createProfileRoute = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => {
  try {
    const body = JSON.parse(event.body || "{}");

    if (!body.username) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "Username is required",
        }),
      };
    }

    console.log("Creating profile for:", body.username);

    return {
      statusCode: 201,
      body: JSON.stringify({
        message: "Profile created successfully",
        username: body.username,
      }),
    };
  } catch (error) {
    console.error("Profile creation error:", error);
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "Invalid request body",
      }),
    };
  }
};

export const welcomeRoute = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => {
  const username = process.env.USERNAME || "Guest";

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: `Welcome ${username}!`,
    }),
  };
};

export const loginRoute = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => {
  try {
    const body = JSON.parse(event.body || "{}");

    if (!body.username) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "Username is required",
        }),
      };
    }

    if (!process.env.SECRET_ID) {
      throw new Error("SECRET_ID environment variable not set");
    }

    const secretValue = await fetchSecret(process.env.SECRET_ID);
    const { encryptionKey } = JSON.parse(secretValue);

    if (!encryptionKey) {
      throw new Error("Encryption key not found in secret");
    }

    const hashedUsername = crypto
      .createHmac("sha256", encryptionKey)
      .update(body.username)
      .digest("hex");

    return {
      statusCode: 200,
      body: JSON.stringify({
        username: hashedUsername,
      }),
    };
  } catch (error) {
    console.error("Login error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Authentication failed",
      }),
    };
  }
};
