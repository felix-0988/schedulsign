# Email Sender Lambda
# ===================
# Dedicated Lambda for sending emails via cross-account SES role assumption.
# Amplify Hosting SSR doesn't provide IAM credentials at runtime,
# so we use a separate Lambda with its own execution role.

resource "random_password" "email_api_key" {
  length  = 32
  special = false
}

# IAM Role for the email sender Lambda
resource "aws_iam_role" "email_sender" {
  name_prefix = "${local.app_name}-email-sender-"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = {
        Service = "lambda.amazonaws.com"
      }
      Action = "sts:AssumeRole"
    }]
  })
}

# Basic Lambda execution (CloudWatch Logs)
resource "aws_iam_role_policy_attachment" "email_sender_basic" {
  role       = aws_iam_role.email_sender.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# Allow assuming the cross-account SES sending role
resource "aws_iam_role_policy" "email_sender_sts" {
  name = "assume-ses-sending-role"
  role = aws_iam_role.email_sender.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = "sts:AssumeRole"
      Resource = "arn:aws:iam::346871995105:role/OrganizationSESSendingRole"
    }]
  })
}

# Package the Lambda code
data "archive_file" "email_sender" {
  type        = "zip"
  source_dir  = "${path.module}/lambda/email-sender"
  output_path = "${path.module}/lambda/email-sender.zip"
}

# Lambda function
resource "aws_lambda_function" "email_sender" {
  function_name    = "${local.app_name}-email-sender"
  role             = aws_iam_role.email_sender.arn
  handler          = "index.handler"
  runtime          = "nodejs22.x"
  timeout          = 30
  memory_size      = 128
  filename         = data.archive_file.email_sender.output_path
  source_code_hash = data.archive_file.email_sender.output_base64sha256

  environment {
    variables = {
      SES_ROLE_ARN = "arn:aws:iam::346871995105:role/OrganizationSESSendingRole"
      SES_REGION   = var.aws_region
      EMAIL_FROM   = "hello@zenithstudio.io"
      APP_NAME     = "SchedulSign"
      API_KEY      = random_password.email_api_key.result
    }
  }
}

# Function URL (public HTTPS endpoint, secured by API key)
resource "aws_lambda_function_url" "email_sender" {
  function_name      = aws_lambda_function.email_sender.function_name
  authorization_type = "NONE"
}

# Output the function URL and API key
output "email_sender_url" {
  description = "Email sender Lambda function URL"
  value       = aws_lambda_function_url.email_sender.function_url
}

output "email_sender_api_key" {
  description = "API key for the email sender Lambda"
  value       = random_password.email_api_key.result
  sensitive   = true
}
