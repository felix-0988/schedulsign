/**
 * Cognito CustomEmailSender Lambda Trigger
 * =========================================
 *
 * Handles Cognito email sending via cross-account SES. Cognito sends a
 * KMS-encrypted code; this Lambda decrypts it, assumes a cross-account
 * IAM role in the shared account (346871995105), and sends branded HTML
 * email via SES using hello@zenithstudio.io.
 *
 * Trigger sources:
 * - CustomEmailSender_ForgotPassword
 * - CustomEmailSender_SignUp
 * - CustomEmailSender_ResendCode
 * - CustomEmailSender_UpdateUserAttribute
 * - CustomEmailSender_VerifyUserAttribute
 * - CustomEmailSender_AdminCreateUser
 */

const { buildClient, CommitmentPolicy } = require('@aws-crypto/client-node');
const { STSClient, AssumeRoleCommand } = require('@aws-sdk/client-sts');
const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');

const ENVIRONMENT = process.env.ENVIRONMENT || 'dev';
const KMS_KEY_ARN = process.env.KMS_KEY_ARN || '';
const SES_ROLE_ARN = process.env.SES_ROLE_ARN || '';
const SES_REGION = process.env.SES_REGION || 'us-east-1';
const FROM_EMAIL = process.env.FROM_EMAIL || 'SchedulSign <hello@zenithstudio.io>';

const stsClient = new STSClient({ region: 'us-east-1' });

// AWS Encryption SDK client for decrypting Cognito's encrypted codes
const { decrypt } = buildClient(CommitmentPolicy.REQUIRE_ENCRYPT_ALLOW_DECRYPT);

// ---------------------------------------------------------------------------
// HTML Email Templates
// ---------------------------------------------------------------------------

const VERIFICATION_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your SchedulSign Account</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f9fafb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f9fafb;">
        <tr>
            <td style="padding: 40px 20px;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
                    <tr>
                        <td style="padding: 40px; border-bottom: 3px solid #2563eb; border-radius: 8px 8px 0 0;">
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                <tr>
                                    <td align="center">
                                        <h1 style="margin: 0; font-size: 28px; font-weight: 700;">
                                            <span style="color: #2563eb;">Schedul</span><span style="color: #111827;">Sign</span>
                                        </h1>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 40px;">
                            <h2 style="margin: 0 0 16px 0; font-size: 24px; font-weight: 600; color: #111827;">
                                Verify your email
                            </h2>
                            <p style="margin: 0 0 24px 0; font-size: 16px; color: #4b5563; line-height: 1.6;">
                                Thanks for signing up for SchedulSign! Use the verification code below to confirm your email address.
                            </p>
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 0 0 24px 0;">
                                <tr>
                                    <td style="background-color: #eff6ff; border-radius: 8px; padding: 24px; border: 2px dashed #93c5fd;">
                                        <p style="margin: 0 0 8px 0; font-size: 14px; color: #4b5563; text-align: center;">
                                            Your verification code:
                                        </p>
                                        <p style="margin: 0; font-family: 'Courier New', monospace; font-size: 32px; font-weight: 700; color: #2563eb; text-align: center; letter-spacing: 4px;">
                                            {code}
                                        </p>
                                    </td>
                                </tr>
                            </table>
                            <p style="margin: 0; font-size: 14px; color: #6b7280; line-height: 1.6;">
                                This code will expire in 24 hours. If you didn't create a SchedulSign account, you can safely ignore this email.
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 24px 40px; background-color: #f9fafb; border-radius: 0 0 8px 8px; border-top: 1px solid #e5e7eb;">
                            <p style="margin: 0; font-size: 12px; color: #9ca3af; text-align: center;">
                                &copy; 2026 SchedulSign. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;

const PASSWORD_RESET_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your SchedulSign Password</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f9fafb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f9fafb;">
        <tr>
            <td style="padding: 40px 20px;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
                    <tr>
                        <td style="padding: 40px; border-bottom: 3px solid #2563eb; border-radius: 8px 8px 0 0;">
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                <tr>
                                    <td align="center">
                                        <h1 style="margin: 0; font-size: 28px; font-weight: 700;">
                                            <span style="color: #2563eb;">Schedul</span><span style="color: #111827;">Sign</span>
                                        </h1>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 40px;">
                            <h2 style="margin: 0 0 16px 0; font-size: 24px; font-weight: 600; color: #111827;">
                                Reset your password
                            </h2>
                            <p style="margin: 0 0 24px 0; font-size: 16px; color: #4b5563; line-height: 1.6;">
                                We received a request to reset your SchedulSign password. Use the verification code below to complete the process.
                            </p>
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 0 0 24px 0;">
                                <tr>
                                    <td style="background-color: #eff6ff; border-radius: 8px; padding: 24px; border: 2px dashed #93c5fd;">
                                        <p style="margin: 0 0 8px 0; font-size: 14px; color: #4b5563; text-align: center;">
                                            Your verification code:
                                        </p>
                                        <p style="margin: 0; font-family: 'Courier New', monospace; font-size: 32px; font-weight: 700; color: #2563eb; text-align: center; letter-spacing: 4px;">
                                            {code}
                                        </p>
                                    </td>
                                </tr>
                            </table>
                            <p style="margin: 0 0 16px 0; font-size: 16px; color: #4b5563; line-height: 1.6;">
                                This code will expire in 1 hour.
                            </p>
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 24px 0 0 0;">
                                <tr>
                                    <td style="padding: 16px; background-color: #fefce8; border-radius: 8px; border-left: 4px solid #eab308;">
                                        <p style="margin: 0; font-size: 14px; color: #4b5563; line-height: 1.6;">
                                            If you didn't request a password reset, please ignore this email or contact support if you have concerns about your account security.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 24px 40px; background-color: #f9fafb; border-radius: 0 0 8px 8px; border-top: 1px solid #e5e7eb;">
                            <p style="margin: 0; font-size: 12px; color: #9ca3af; text-align: center;">
                                &copy; 2026 SchedulSign. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Decrypt the KMS-encrypted code from Cognito using AWS Encryption SDK.
 */
async function decryptCode(encryptedCode) {
  const { KmsKeyringNode } = require('@aws-crypto/kms-keyring-node');
  const keyring = new KmsKeyringNode({ keyIds: [KMS_KEY_ARN] });
  const { plaintext } = await decrypt(keyring, Buffer.from(encryptedCode, 'base64'));
  return plaintext.toString('utf-8');
}

/**
 * Assume cross-account role and return an SES client.
 */
async function getSesClient() {
  const command = new AssumeRoleCommand({
    RoleArn: SES_ROLE_ARN,
    RoleSessionName: 'schedulsign-cognito-email-sender',
  });
  const { Credentials } = await stsClient.send(command);

  return new SESClient({
    region: SES_REGION,
    credentials: {
      accessKeyId: Credentials.AccessKeyId,
      secretAccessKey: Credentials.SecretAccessKey,
      sessionToken: Credentials.SessionToken,
    },
  });
}

/**
 * Send an email via SES.
 */
async function sendEmail(sesClient, toAddress, subject, htmlBody) {
  const command = new SendEmailCommand({
    Source: FROM_EMAIL,
    Destination: { ToAddresses: [toAddress] },
    Message: {
      Subject: { Data: subject, Charset: 'UTF-8' },
      Body: { Html: { Data: htmlBody, Charset: 'UTF-8' } },
    },
  });
  await sesClient.send(command);
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

exports.handler = async (event) => {
  const triggerSource = event.triggerSource || '';
  console.log(`CustomEmailSender trigger: ${triggerSource}, env: ${ENVIRONMENT}`);

  const request = event.request || {};
  const codeParam = request.code || '';
  const userAttributes = request.userAttributes || {};
  const email = userAttributes.email || '';

  if (!codeParam) {
    console.warn('No encrypted code in event, skipping');
    return event;
  }

  if (!email) {
    console.warn('No email address found in userAttributes, skipping');
    return event;
  }

  // Decrypt the code
  let code;
  try {
    code = await decryptCode(codeParam);
  } catch (err) {
    console.error('Failed to decrypt code:', err.message);
    return event;
  }

  // Build the email based on trigger source
  let subject;
  let htmlBody;

  switch (triggerSource) {
    case 'CustomEmailSender_ForgotPassword':
      subject = 'Reset your SchedulSign password';
      htmlBody = PASSWORD_RESET_TEMPLATE.replace('{code}', code);
      break;

    case 'CustomEmailSender_SignUp':
    case 'CustomEmailSender_ResendCode':
    case 'CustomEmailSender_UpdateUserAttribute':
    case 'CustomEmailSender_VerifyUserAttribute':
      subject = 'Verify your SchedulSign account';
      htmlBody = VERIFICATION_TEMPLATE.replace('{code}', code);
      break;

    case 'CustomEmailSender_AdminCreateUser':
      subject = 'Welcome to SchedulSign - Your account is ready';
      htmlBody = VERIFICATION_TEMPLATE.replace('{code}', code);
      break;

    default:
      console.warn(`Unhandled trigger source: ${triggerSource}`);
      return event;
  }

  // Send via cross-account SES
  try {
    const sesClient = await getSesClient();
    await sendEmail(sesClient, email, subject, htmlBody);
    console.log(`Email sent to ${email} for trigger ${triggerSource}`);
  } catch (err) {
    console.error(`Failed to send email to ${email}:`, err.message);
  }

  return event;
};
