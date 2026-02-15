/**
 * Database Migration Lambda Function
 * ===================================
 *
 * Runs Prisma migrations against RDS PostgreSQL from within VPC.
 *
 * Security Features:
 * - Retrieves DB credentials from Secrets Manager (encrypted)
 * - Runs in VPC (private subnet access to RDS)
 * - Minimal IAM permissions (least privilege)
 * - Comprehensive logging to CloudWatch
 * - SNS notification on completion/failure
 */

const { execSync } = require('child_process');
const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager');
const { SNSClient, PublishCommand } = require('@aws-sdk/client-sns');

// Environment variables
const SECRETS_ARN = process.env.DB_SECRET_ARN;
const SNS_TOPIC_ARN = process.env.SNS_TOPIC_ARN;
const ENVIRONMENT = process.env.ENVIRONMENT || 'dev';

const secretsManager = new SecretsManagerClient({ region: 'us-east-1' });
const sns = new SNSClient({ region: 'us-east-1' });

/**
 * Retrieves database credentials from AWS Secrets Manager
 */
async function getDatabaseUrl() {
  console.log('Retrieving database credentials from Secrets Manager...');

  try {
    const response = await secretsManager.send(
      new GetSecretValueCommand({ SecretId: SECRETS_ARN })
    );

    const secret = JSON.parse(response.SecretString);

    // URL-encode the password to handle special characters
    const password = encodeURIComponent(secret.password);
    const databaseUrl = `postgresql://${secret.username}:${password}@${secret.host}:${secret.port}/${secret.dbname}`;

    console.log('✓ Database credentials retrieved successfully');
    console.log(`  Host: ${secret.host}`);
    console.log(`  Database: ${secret.dbname}`);

    return databaseUrl;
  } catch (error) {
    console.error('✗ Failed to retrieve database credentials:', error);
    throw new Error('Failed to retrieve database credentials from Secrets Manager');
  }
}

/**
 * Runs Prisma migrations
 */
async function runMigrations(databaseUrl) {
  console.log('Running Prisma migrations...');

  try {
    // Set DATABASE_URL environment variable
    process.env.DATABASE_URL = databaseUrl;

    // Generate Prisma Client
    console.log('Generating Prisma Client...');
    execSync('npx prisma generate', {
      stdio: 'inherit',
      env: { ...process.env, DATABASE_URL: databaseUrl }
    });

    // Deploy migrations
    console.log('Deploying migrations...');
    const output = execSync('npx prisma migrate deploy', {
      encoding: 'utf-8',
      env: { ...process.env, DATABASE_URL: databaseUrl }
    });

    console.log(output);
    console.log('✓ Migrations completed successfully');

    return { success: true, output };
  } catch (error) {
    console.error('✗ Migration failed:', error.message);
    throw error;
  }
}

/**
 * Sends SNS notification about migration result
 */
async function sendNotification(success, message, details = {}) {
  if (!SNS_TOPIC_ARN) {
    console.log('SNS topic not configured, skipping notification');
    return;
  }

  const subject = success
    ? `✓ Database Migration Successful (${ENVIRONMENT})`
    : `✗ Database Migration Failed (${ENVIRONMENT})`;

  const body = `
Environment: ${ENVIRONMENT}
Status: ${success ? 'SUCCESS' : 'FAILURE'}
Timestamp: ${new Date().toISOString()}

${message}

${details.output ? `\nOutput:\n${details.output}` : ''}
${details.error ? `\nError:\n${details.error}` : ''}
  `.trim();

  try {
    await sns.send(new PublishCommand({
      TopicArn: SNS_TOPIC_ARN,
      Subject: subject,
      Message: body
    }));
    console.log('✓ Notification sent');
  } catch (error) {
    console.error('✗ Failed to send notification:', error);
    // Don't throw - notification failure shouldn't fail the migration
  }
}

/**
 * Lambda handler
 */
exports.handler = async (event, context) => {
  console.log('=================================================');
  console.log('Database Migration Lambda');
  console.log('=================================================');
  console.log('Environment:', ENVIRONMENT);
  console.log('Event:', JSON.stringify(event, null, 2));
  console.log('Context:', JSON.stringify(context, null, 2));
  console.log('=================================================');

  try {
    // Get database URL from Secrets Manager
    const databaseUrl = await getDatabaseUrl();

    // Run migrations
    const result = await runMigrations(databaseUrl);

    // Send success notification
    await sendNotification(true, 'Database migrations completed successfully', {
      output: result.output
    });

    console.log('=================================================');
    console.log('Migration completed successfully');
    console.log('=================================================');

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: 'Migrations completed successfully',
        environment: ENVIRONMENT,
        timestamp: new Date().toISOString()
      })
    };

  } catch (error) {
    console.error('=================================================');
    console.error('Migration failed:', error);
    console.error('=================================================');

    // Send failure notification
    await sendNotification(false, 'Database migration failed', {
      error: error.message,
      stack: error.stack
    });

    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: error.message,
        environment: ENVIRONMENT,
        timestamp: new Date().toISOString()
      })
    };
  }
};
