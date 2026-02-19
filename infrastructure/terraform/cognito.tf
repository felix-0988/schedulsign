# AWS Cognito User Pool
# =====================
# Authentication infrastructure for SchedulSign using Amazon Cognito.
# Includes User Pool, App Client, Domain, Google Identity Provider,
# and a PostConfirmation Lambda trigger to sync users to the database.

# =============================================================================
# Cognito User Pool
# =============================================================================

resource "aws_cognito_user_pool" "main" {
  name = "${local.app_name}-${var.environment}"

  # Username configuration - use email as username
  username_attributes      = ["email"]
  auto_verified_attributes = ["email"]

  # Username case insensitivity
  username_configuration {
    case_sensitive = false
  }

  # Password policy
  password_policy {
    minimum_length                   = 8
    require_lowercase                = true
    require_uppercase                = true
    require_numbers                  = true
    require_symbols                  = false
    temporary_password_validity_days = 7
  }

  # Email verification
  verification_message_template {
    default_email_option = "CONFIRM_WITH_CODE"
    email_subject        = "SchedulSign - Verify your email"
    email_message        = "Your verification code is {####}"
  }

  # Schema attributes
  schema {
    name                     = "email"
    attribute_data_type      = "String"
    required                 = true
    mutable                  = true
    developer_only_attribute = false

    string_attribute_constraints {
      min_length = 1
      max_length = 256
    }
  }

  schema {
    name                     = "name"
    attribute_data_type      = "String"
    required                 = false
    mutable                  = true
    developer_only_attribute = false

    string_attribute_constraints {
      min_length = 0
      max_length = 256
    }
  }

  # Account recovery
  account_recovery_setting {
    recovery_mechanism {
      name     = "verified_email"
      priority = 1
    }
  }

  # Lambda triggers
  lambda_config {
    post_confirmation = aws_lambda_function.cognito_post_confirmation.arn

    custom_email_sender {
      lambda_arn     = aws_lambda_function.cognito_custom_email_sender.arn
      lambda_version = "V1_0"
    }

    kms_key_id = aws_kms_key.cognito_email.arn
  }

  # Deletion protection for prod
  deletion_protection = var.environment == "prod" ? "ACTIVE" : "INACTIVE"

  tags = {
    Name = "${local.app_name}-user-pool"
  }
}

# =============================================================================
# Cognito User Pool Domain
# =============================================================================

resource "aws_cognito_user_pool_domain" "main" {
  domain       = "${local.app_name}-${var.environment}"
  user_pool_id = aws_cognito_user_pool.main.id
}

# =============================================================================
# Google Identity Provider
# =============================================================================

resource "aws_cognito_identity_provider" "google" {
  user_pool_id  = aws_cognito_user_pool.main.id
  provider_name = "Google"
  provider_type = "Google"

  provider_details = {
    client_id                     = var.google_oauth_client_id
    client_secret                 = var.google_oauth_client_secret
    authorize_scopes              = "openid email profile"
    attributes_url                = "https://people.googleapis.com/v1/people/me?personFields="
    attributes_url_add_attributes = "true"
    authorize_url                 = "https://accounts.google.com/o/oauth2/v2/auth"
    oidc_issuer                   = "https://accounts.google.com"
    token_request_method          = "POST"
    token_url                     = "https://www.googleapis.com/oauth2/v4/token"
  }

  attribute_mapping = {
    email    = "email"
    name     = "name"
    picture  = "picture"
    username = "sub"
  }
}

# =============================================================================
# Cognito User Pool Client
# =============================================================================

resource "aws_cognito_user_pool_client" "main" {
  name         = "${local.app_name}-app"
  user_pool_id = aws_cognito_user_pool.main.id

  # OAuth flows
  allowed_oauth_flows                  = ["code"]
  allowed_oauth_flows_user_pool_client = true
  allowed_oauth_scopes                 = ["openid", "email", "profile"]

  # Supported identity providers
  supported_identity_providers = ["COGNITO", "Google"]

  # Callback URLs
  callback_urls = compact([
    var.domain_name != null ? "https://${var.domain_name}" : null,
    var.domain_name != null ? "https://${var.domain_name}/api/auth/callback" : null,
    "https://main.${aws_amplify_app.main.default_domain}",
    "https://main.${aws_amplify_app.main.default_domain}/api/auth/callback",
    "http://localhost:3000",
    "http://localhost:3000/api/auth/callback",
  ])

  logout_urls = compact([
    var.domain_name != null ? "https://${var.domain_name}" : null,
    "https://main.${aws_amplify_app.main.default_domain}",
    "http://localhost:3000",
  ])

  # Token validity
  access_token_validity  = 1   # hours
  id_token_validity      = 1   # hours
  refresh_token_validity = 30  # days

  token_validity_units {
    access_token  = "hours"
    id_token      = "hours"
    refresh_token = "days"
  }

  # Security settings
  generate_secret                      = false # Public client for SPA/SSR
  prevent_user_existence_errors        = "ENABLED"
  enable_token_revocation              = true
  enable_propagate_additional_user_context_data = false

  # Explicit auth flows
  explicit_auth_flows = [
    "ALLOW_USER_SRP_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH",
  ]

  depends_on = [aws_cognito_identity_provider.google]
}

# =============================================================================
# PostConfirmation Lambda Function
# =============================================================================

# IAM Role for PostConfirmation Lambda
resource "aws_iam_role" "cognito_post_confirmation" {
  name = "${local.app_name}-cognito-post-confirm-${var.environment}"

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
    Name = "${local.app_name}-cognito-post-confirmation"
  }
}

# IAM Policy - CloudWatch Logs
resource "aws_iam_role_policy" "cognito_post_confirmation_logs" {
  name = "cloudwatch-logs"
  role = aws_iam_role.cognito_post_confirmation.id

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
          "arn:aws:logs:${var.aws_region}:${data.aws_caller_identity.current.account_id}:log-group:/aws/lambda/${local.app_name}-cognito-post-confirm-${var.environment}*"
        ]
      }
    ]
  })
}

# IAM Policy - VPC access (to reach RDS)
resource "aws_iam_role_policy_attachment" "cognito_post_confirmation_vpc" {
  role       = aws_iam_role.cognito_post_confirmation.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"
}

# IAM Policy - Secrets Manager access (to get DB credentials)
resource "aws_iam_role_policy" "cognito_post_confirmation_secrets" {
  name = "secrets-manager-access"
  role = aws_iam_role.cognito_post_confirmation.id

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

# Security Group for PostConfirmation Lambda
resource "aws_security_group" "cognito_post_confirmation" {
  name        = "${local.app_name}-cognito-post-confirm-${var.environment}"
  description = "Security group for Cognito PostConfirmation Lambda"
  vpc_id      = aws_vpc.main.id

  # Outbound to RDS
  egress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.rds.id]
    description     = "PostgreSQL to RDS"
  }

  # Outbound HTTPS for AWS API calls (Secrets Manager)
  egress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "HTTPS for AWS APIs"
  }

  tags = {
    Name = "${local.app_name}-cognito-post-confirm"
  }
}

# Allow RDS ingress from PostConfirmation Lambda
resource "aws_security_group_rule" "rds_from_cognito_lambda" {
  type                     = "ingress"
  from_port                = 5432
  to_port                  = 5432
  protocol                 = "tcp"
  security_group_id        = aws_security_group.rds.id
  source_security_group_id = aws_security_group.cognito_post_confirmation.id
  description              = "PostgreSQL from Cognito PostConfirmation Lambda"
}

# Lambda Function
resource "aws_lambda_function" "cognito_post_confirmation" {
  function_name = "${local.app_name}-cognito-post-confirm-${var.environment}"
  role          = aws_iam_role.cognito_post_confirmation.arn
  handler       = "index.handler"
  runtime       = "nodejs20.x"
  timeout       = 30
  memory_size   = 256

  # Code package
  filename         = "${path.module}/lambda/cognito-post-confirmation/function.zip"
  source_code_hash = fileexists("${path.module}/lambda/cognito-post-confirmation/function.zip") ? filebase64sha256("${path.module}/lambda/cognito-post-confirmation/function.zip") : null

  vpc_config {
    subnet_ids         = aws_subnet.private[*].id
    security_group_ids = [aws_security_group.cognito_post_confirmation.id]
  }

  environment {
    variables = {
      ENVIRONMENT   = var.environment
      DB_SECRET_ARN = aws_secretsmanager_secret.db_password.arn
      NODE_ENV      = "production"
    }
  }

  depends_on = [
    aws_iam_role_policy.cognito_post_confirmation_logs,
    aws_iam_role_policy.cognito_post_confirmation_secrets,
    aws_iam_role_policy_attachment.cognito_post_confirmation_vpc
  ]

  tags = {
    Name = "${local.app_name}-cognito-post-confirmation"
  }
}

# CloudWatch Log Group for PostConfirmation Lambda
resource "aws_cloudwatch_log_group" "cognito_post_confirmation" {
  name              = "/aws/lambda/${aws_lambda_function.cognito_post_confirmation.function_name}"
  retention_in_days = var.environment == "prod" ? 90 : 14

  tags = {
    Name = "${local.app_name}-cognito-post-confirm-logs"
  }
}

# Allow Cognito to invoke the Lambda
resource "aws_lambda_permission" "cognito_post_confirmation" {
  statement_id  = "AllowCognitoInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.cognito_post_confirmation.function_name
  principal     = "cognito-idp.amazonaws.com"
  source_arn    = aws_cognito_user_pool.main.arn
}

# =============================================================================
# KMS Key for Cognito CustomEmailSender
# =============================================================================
# Cognito's CustomEmailSender Lambda trigger requires a KMS key to encrypt
# the verification code payload. The Lambda decrypts it before sending email.

resource "aws_kms_key" "cognito_email" {
  description = "KMS key for Cognito CustomEmailSender code encryption"

  policy = jsonencode({
    Version = "2012-10-17"
    Id      = "cognito-email-key"
    Statement = [
      {
        Sid    = "EnableRootAccount"
        Effect = "Allow"
        Principal = {
          AWS = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:root"
        }
        Action   = "kms:*"
        Resource = "*"
      },
      {
        Sid    = "AllowCognitoService"
        Effect = "Allow"
        Principal = {
          Service = "cognito-idp.amazonaws.com"
        }
        Action = [
          "kms:Encrypt",
          "kms:GenerateDataKey",
          "kms:CreateGrant",
          "kms:DescribeKey"
        ]
        Resource = "*"
      },
      {
        Sid    = "AllowGrantsForAWSResources"
        Effect = "Allow"
        Principal = {
          AWS = "*"
        }
        Action   = "kms:CreateGrant"
        Resource = "*"
        Condition = {
          Bool = {
            "kms:GrantIsForAWSResource" = "true"
          }
          StringEquals = {
            "aws:PrincipalAccount" = data.aws_caller_identity.current.account_id
          }
        }
      }
    ]
  })

  tags = {
    Name = "${local.app_name}-cognito-email-key"
  }
}

resource "aws_kms_alias" "cognito_email" {
  name          = "alias/${local.app_name}-${var.environment}-cognito-email"
  target_key_id = aws_kms_key.cognito_email.key_id
}

# =============================================================================
# CustomEmailSender Lambda Function
# =============================================================================
# Decrypts KMS-encrypted codes from Cognito and sends branded HTML emails
# via cross-account SES (OrganizationSESSendingRole in shared account).

# IAM Role for CustomEmailSender Lambda
resource "aws_iam_role" "cognito_custom_email_sender" {
  name = "${local.app_name}-cognito-email-sender-${var.environment}"

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
    Name = "${local.app_name}-cognito-email-sender"
  }
}

# IAM Policy - CloudWatch Logs
resource "aws_iam_role_policy" "cognito_custom_email_sender_logs" {
  name = "cloudwatch-logs"
  role = aws_iam_role.cognito_custom_email_sender.id

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
          "arn:aws:logs:${var.aws_region}:${data.aws_caller_identity.current.account_id}:log-group:/aws/lambda/${local.app_name}-cognito-email-sender-${var.environment}*"
        ]
      }
    ]
  })
}

# IAM Policy - KMS Decrypt (to decrypt Cognito's encrypted codes)
resource "aws_iam_role_policy" "cognito_custom_email_sender_kms" {
  name = "kms-decrypt"
  role = aws_iam_role.cognito_custom_email_sender.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "DecryptCognitoCode"
        Effect = "Allow"
        Action = [
          "kms:Decrypt"
        ]
        Resource = [
          aws_kms_key.cognito_email.arn
        ]
      }
    ]
  })
}

# IAM Policy - STS AssumeRole (to assume cross-account SES sending role)
resource "aws_iam_role_policy" "cognito_custom_email_sender_sts" {
  name = "assume-ses-role"
  role = aws_iam_role.cognito_custom_email_sender.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AssumeSESSendingRole"
        Effect = "Allow"
        Action = [
          "sts:AssumeRole"
        ]
        Resource = [
          var.ses_sending_role_arn
        ]
      }
    ]
  })
}

# Lambda Function
resource "aws_lambda_function" "cognito_custom_email_sender" {
  function_name = "${local.app_name}-cognito-email-sender-${var.environment}"
  role          = aws_iam_role.cognito_custom_email_sender.arn
  handler       = "index.handler"
  runtime       = "nodejs20.x"
  timeout       = 30
  memory_size   = 256

  # Code package
  filename         = "${path.module}/lambda/cognito-custom-email-sender/function.zip"
  source_code_hash = fileexists("${path.module}/lambda/cognito-custom-email-sender/function.zip") ? filebase64sha256("${path.module}/lambda/cognito-custom-email-sender/function.zip") : null

  environment {
    variables = {
      ENVIRONMENT  = var.environment
      KMS_KEY_ARN  = aws_kms_key.cognito_email.arn
      SES_ROLE_ARN = var.ses_sending_role_arn
      SES_REGION   = "us-east-1"
      FROM_EMAIL   = var.ses_from_email
    }
  }

  depends_on = [
    aws_iam_role_policy.cognito_custom_email_sender_logs,
    aws_iam_role_policy.cognito_custom_email_sender_kms,
    aws_iam_role_policy.cognito_custom_email_sender_sts
  ]

  tags = {
    Name = "${local.app_name}-cognito-email-sender"
  }
}

# CloudWatch Log Group for CustomEmailSender Lambda
resource "aws_cloudwatch_log_group" "cognito_custom_email_sender" {
  name              = "/aws/lambda/${aws_lambda_function.cognito_custom_email_sender.function_name}"
  retention_in_days = var.environment == "prod" ? 90 : 14

  tags = {
    Name = "${local.app_name}-cognito-email-sender-logs"
  }
}

# Allow Cognito to invoke the CustomEmailSender Lambda
resource "aws_lambda_permission" "cognito_custom_email_sender" {
  statement_id  = "AllowCognitoInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.cognito_custom_email_sender.function_name
  principal     = "cognito-idp.amazonaws.com"
  source_arn    = aws_cognito_user_pool.main.arn
}

# =============================================================================
# Outputs
# =============================================================================

output "cognito_user_pool_id" {
  description = "Cognito User Pool ID"
  value       = aws_cognito_user_pool.main.id
}

output "cognito_user_pool_client_id" {
  description = "Cognito User Pool Client ID"
  value       = aws_cognito_user_pool_client.main.id
}

output "cognito_domain" {
  description = "Cognito hosted UI domain"
  value       = "https://${aws_cognito_user_pool_domain.main.domain}.auth.${var.aws_region}.amazoncognito.com"
}

output "cognito_issuer" {
  description = "Cognito OIDC issuer URL"
  value       = "https://cognito-idp.${var.aws_region}.amazonaws.com/${aws_cognito_user_pool.main.id}"
}
