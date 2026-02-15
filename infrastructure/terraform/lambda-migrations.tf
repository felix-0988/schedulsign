# =============================================================================
# Database Migration Lambda Function
# =============================================================================
# Secure, VPC-enabled Lambda function for running Prisma migrations.
#
# Security Features:
# - Runs in private subnets (VPC isolation)
# - Retrieves DB credentials from Secrets Manager (encrypted)
# - Least privilege IAM permissions
# - CloudWatch logging for audit trail
# - SNS notifications for migration events
# - KMS encryption for environment variables

# SNS Topic for migration notifications
resource "aws_sns_topic" "migration_notifications" {
  name              = "schedulsign-migration-notifications-${var.environment}"
  kms_master_key_id = "alias/aws/sns"

  tags = {
    Name = "schedulsign-migration-notifications"
  }
}

# SNS Topic subscription (email)
resource "aws_sns_topic_subscription" "migration_email" {
  topic_arn = aws_sns_topic.migration_notifications.arn
  protocol  = "email"
  endpoint  = var.notification_email != null ? var.notification_email : "devops@zenithstudio.io"
}

# Lambda IAM Role
resource "aws_iam_role" "migration_lambda" {
  name = "schedulsign-migration-lambda-${var.environment}"

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

  tags = {
    Name = "schedulsign-migration-lambda"
  }
}

# Lambda IAM Policy - Secrets Manager access
resource "aws_iam_role_policy" "migration_lambda_secrets" {
  name = "secrets-manager-access"
  role = aws_iam_role.migration_lambda.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "ReadDatabaseSecret"
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue"
        ]
        Resource = [
          aws_secretsmanager_secret.db_password.arn
        ]
      }
    ]
  })
}

# Lambda IAM Policy - SNS publishing
resource "aws_iam_role_policy" "migration_lambda_sns" {
  name = "sns-publish"
  role = aws_iam_role.migration_lambda.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "PublishMigrationNotifications"
        Effect = "Allow"
        Action = [
          "sns:Publish"
        ]
        Resource = [
          aws_sns_topic.migration_notifications.arn
        ]
      }
    ]
  })
}

# Lambda IAM Policy - VPC access
resource "aws_iam_role_policy_attachment" "migration_lambda_vpc" {
  role       = aws_iam_role.migration_lambda.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"
}

# Lambda IAM Policy - CloudWatch Logs
resource "aws_iam_role_policy" "migration_lambda_logs" {
  name = "cloudwatch-logs"
  role = aws_iam_role.migration_lambda.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "WriteLogs"
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = [
          "arn:aws:logs:${var.aws_region}:${data.aws_caller_identity.current.account_id}:log-group:/aws/lambda/schedulsign-migrations-${var.environment}*"
        ]
      }
    ]
  })
}

# Security Group for Lambda (allows outbound to RDS)
resource "aws_security_group" "migration_lambda" {
  name        = "schedulsign-migration-lambda-${var.environment}"
  description = "Security group for migration Lambda function"
  vpc_id      = aws_vpc.main.id

  # Outbound to RDS
  egress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.rds.id]
    description     = "PostgreSQL to RDS"
  }

  # Outbound HTTPS for AWS API calls (Secrets Manager, SNS)
  egress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "HTTPS for AWS APIs"
  }

  tags = {
    Name = "schedulsign-migration-lambda"
  }
}

# Update RDS security group to allow Lambda
resource "aws_security_group_rule" "rds_from_lambda" {
  type                     = "ingress"
  from_port                = 5432
  to_port                  = 5432
  protocol                 = "tcp"
  security_group_id        = aws_security_group.rds.id
  source_security_group_id = aws_security_group.migration_lambda.id
  description              = "PostgreSQL from migration Lambda"
}

# Lambda Function
resource "aws_lambda_function" "migrations" {
  function_name = "schedulsign-migrations-${var.environment}"
  role          = aws_iam_role.migration_lambda.arn
  handler       = "index.handler"
  runtime       = "nodejs20.x"
  timeout       = 300 # 5 minutes
  memory_size   = 512

  # Placeholder - actual code deployed via deployment script
  filename         = "${path.module}/../../lambda/migrations/function.zip"
  source_code_hash = fileexists("${path.module}/../../lambda/migrations/function.zip") ? filebase64sha256("${path.module}/../../lambda/migrations/function.zip") : null

  vpc_config {
    subnet_ids         = aws_subnet.private[*].id
    security_group_ids = [aws_security_group.migration_lambda.id]
  }

  environment {
    variables = {
      ENVIRONMENT    = var.environment
      DB_SECRET_ARN  = aws_secretsmanager_secret.db_password.arn
      SNS_TOPIC_ARN  = aws_sns_topic.migration_notifications.arn
      NODE_ENV       = "production"
      NODE_OPTIONS   = "--enable-source-maps"
    }
  }

  depends_on = [
    aws_iam_role_policy.migration_lambda_secrets,
    aws_iam_role_policy.migration_lambda_sns,
    aws_iam_role_policy.migration_lambda_logs,
    aws_iam_role_policy_attachment.migration_lambda_vpc
  ]

  tags = {
    Name = "schedulsign-migrations"
  }
}

# CloudWatch Log Group
resource "aws_cloudwatch_log_group" "migration_lambda" {
  name              = "/aws/lambda/${aws_lambda_function.migrations.function_name}"
  retention_in_days = var.environment == "prod" ? 90 : 14
  kms_key_id        = null # Use AWS managed key

  tags = {
    Name = "schedulsign-migration-logs"
  }
}

# Lambda Invoke Permission for GitHub Actions (via OIDC role)
resource "aws_lambda_permission" "github_actions" {
  statement_id  = "AllowGitHubActionsInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.migrations.function_name
  principal     = data.aws_caller_identity.current.account_id

  # This allows any IAM role in the account to invoke
  # The GitHubActionsDeployRole will need lambda:InvokeFunction permission
}

# Output the Lambda ARN and name
output "migration_lambda_arn" {
  description = "ARN of the migration Lambda function"
  value       = aws_lambda_function.migrations.arn
}

output "migration_lambda_name" {
  description = "Name of the migration Lambda function"
  value       = aws_lambda_function.migrations.function_name
}

output "migration_sns_topic_arn" {
  description = "ARN of the migration notification SNS topic"
  value       = aws_sns_topic.migration_notifications.arn
}
