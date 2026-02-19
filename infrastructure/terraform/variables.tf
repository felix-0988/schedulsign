# Cognito Variables
# =================

variable "google_oauth_client_id" {
  description = "Google OAuth Client ID for Cognito federated identity"
  type        = string
  sensitive   = true
}

variable "google_oauth_client_secret" {
  description = "Google OAuth Client Secret for Cognito federated identity"
  type        = string
  sensitive   = true
}

variable "ses_sending_role_arn" {
  description = "ARN of the cross-account IAM role in the shared account for SES sending"
  type        = string
  default     = "arn:aws:iam::346871995105:role/OrganizationSESSendingRole"
}

variable "ses_from_email" {
  description = "From address for Cognito emails via CustomEmailSender"
  type        = string
  default     = "SchedulSign <hello@zenithstudio.io>"
}
