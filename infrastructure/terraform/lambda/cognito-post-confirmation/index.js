/**
 * Cognito PostConfirmation Lambda Trigger
 * ========================================
 *
 * Triggered after a user confirms their account in Cognito (email verification
 * or social sign-in). Syncs the user to the PostgreSQL database via direct SQL
 * so the application can associate Cognito users with app data.
 *
 * This Lambda runs in the VPC to reach RDS and retrieves DB credentials
 * from Secrets Manager.
 */

const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager');
const { Client } = require('pg');

const DB_SECRET_ARN = process.env.DB_SECRET_ARN;
const ENVIRONMENT = process.env.ENVIRONMENT || 'dev';

const secretsManager = new SecretsManagerClient({ region: 'us-east-1' });

// Cache DB credentials across warm invocations
let cachedDbConfig = null;

/**
 * Retrieve database connection config from Secrets Manager.
 */
async function getDbConfig() {
  if (cachedDbConfig) {
    return cachedDbConfig;
  }

  const response = await secretsManager.send(
    new GetSecretValueCommand({ SecretId: DB_SECRET_ARN })
  );

  const secret = JSON.parse(response.SecretString);
  cachedDbConfig = {
    host: secret.host,
    port: secret.port,
    database: secret.dbname,
    user: secret.username,
    password: secret.password,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000,
  };

  return cachedDbConfig;
}

/**
 * Upsert the user in the database.
 *
 * If the user already exists (matched by email), update their cognitoId.
 * Otherwise insert a new row.
 */
async function upsertUser(client, { cognitoId, email, name, picture }) {
  const now = new Date().toISOString();

  // Use an upsert: insert if no matching email, otherwise update cognitoId
  const query = `
    INSERT INTO "User" (id, "cognitoId", email, name, image, "emailVerified", "createdAt", "updatedAt")
    VALUES (gen_random_uuid()::text, $1, $2, $3, $4, NOW(), $5, $5)
    ON CONFLICT (email) DO UPDATE SET
      "cognitoId" = EXCLUDED."cognitoId",
      name = COALESCE(NULLIF(EXCLUDED.name, ''), "User".name),
      image = COALESCE(EXCLUDED.image, "User".image),
      "emailVerified" = COALESCE("User"."emailVerified", NOW()),
      "updatedAt" = $5
    RETURNING id, "cognitoId", email;
  `;

  const result = await client.query(query, [cognitoId, email, name, picture, now]);
  return result.rows[0];
}

/**
 * Lambda handler - Cognito PostConfirmation trigger.
 *
 * Event shape: https://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-lambda-post-confirmation.html
 */
exports.handler = async (event, context) => {
  console.log('PostConfirmation trigger invoked');
  console.log('TriggerSource:', event.triggerSource);
  console.log('UserPoolId:', event.userPoolId);
  console.log('Username:', event.userName);

  // Only handle user confirmation triggers
  if (
    event.triggerSource !== 'PostConfirmation_ConfirmSignUp' &&
    event.triggerSource !== 'PostConfirmation_ConfirmForgotPassword'
  ) {
    console.log('Skipping trigger source:', event.triggerSource);
    return event;
  }

  const userAttributes = event.request.userAttributes;
  const cognitoId = userAttributes.sub;
  const email = userAttributes.email;
  const name = userAttributes.name || null;
  const picture = userAttributes.picture || null;

  if (!email) {
    console.error('No email found in user attributes');
    return event;
  }

  let client;
  try {
    const dbConfig = await getDbConfig();
    client = new Client(dbConfig);
    await client.connect();

    const user = await upsertUser(client, { cognitoId, email, name, picture });
    console.log('User synced to database:', JSON.stringify(user));
  } catch (error) {
    console.error('Failed to sync user to database:', error.message);
    // Do not throw - we don't want to block the user from signing in.
    // The user record will be created on their first API call as a fallback.
  } finally {
    if (client) {
      await client.end().catch(() => {});
    }
  }

  return event;
};
