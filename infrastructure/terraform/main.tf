# SchedulSign AWS Infrastructure
# ==============================
# Deploys Next.js app to AWS Amplify with RDS PostgreSQL
#
# Key principle: Account = Environment
# - Same resource names in all accounts
# - Deploy this in Dev/QA/Prod accounts separately

terraform {
  required_version = ">= 1.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # S3 backend - bucket name passed at init time via -backend-config
  # Usage: terraform init -backend-config="bucket=scheulsign-terraform-state-252967153935"
  backend "s3" {
    key    = "scheulsign-app/terraform.tfstate"
    region = "us-east-1"
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "SchedulSign"
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}

# Variables
variable "environment" {
  description = "Environment name (dev, qa, prod)"
  type        = string
}

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "github_repository" {
  description = "GitHub repository (owner/repo)"
  type        = string
  default     = "felix-0988/schedulsign"
}

variable "github_branch" {
  description = "GitHub branch to deploy"
  type        = string
  default     = "main"
}

variable "github_access_token" {
  description = "GitHub personal access token for Amplify"
  type        = string
  sensitive   = true
}

variable "domain_name" {
  description = "Custom domain name (optional)"
  type        = string
  default     = null
}

variable "db_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t4g.micro" # Free tier eligible
}

# Data sources
data "aws_caller_identity" "current" {}
data "aws_availability_zones" "available" {
  state = "available"
}

# Locals
locals {
  app_name    = "schedulsign"
  db_name     = "schedulsign"
  db_username = "schedulsign_admin"
}
