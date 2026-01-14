import {
  GetSecretValueCommand,
  SecretsManagerClient,
} from "@aws-sdk/client-secrets-manager";

const secretsClient = new SecretsManagerClient({});

export const fetchSecret = async (secretId: string): Promise<string> => {
  try {
    const command = new GetSecretValueCommand({ SecretId: secretId });
    const response = await secretsClient.send(command);

    if (!response.SecretString) {
      throw new Error("Secret value is empty");
    }

    return response.SecretString;
  } catch (error) {
    console.error("Failed to fetch secret:", error);
    throw new Error("Failed to fetch secret");
  }
};
