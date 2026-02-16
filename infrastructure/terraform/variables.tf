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
