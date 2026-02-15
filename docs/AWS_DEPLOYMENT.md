# AWS Deployment Guide - SchedulSign

Complete guide for deploying SchedulSign to AWS using the Zenith Venture multi-account architecture.

## Prerequisites

### 1. AWS Organization Setup

First, create the SchedulSign OU and accounts in the aws-organization repo:

```bash
# In AWS Organizations Console or via Control Tower:
# 1. Create SchedulSign OU under Root
# 2. Provision accounts via Account Factory:

# Account 1: SchedulSign-Dev
Email: szewong+aws-ss-dev@zenithstudio.io
OU: SchedulSign

# Account 2: SchedulSign-QA
Email: szewong+aws-ss-qa@zenithstudio.io
OU: SchedulSign

# Account 3: SchedulSign-Prod
Email: szewong+aws-ss-prod@zenithstudio.io
OU: SchedulSign
```

**Record the Account IDs** - you'll need these for configuration.

### 2. Required Accounts & Services

External services needed:
- **GitHub** - Repository access token
- **Stripe** - API keys + webhook secret
- **Google Cloud** - OAuth + Calendar API credentials
- **Microsoft Azure** - OAuth credentials for Outlook
- **Twilio** - Account SID + Auth Token
- **Zoom** - API credentials (optional)

### 3. AWS CLI & SSO Setup

See [aws-organization/docs/DEVELOPER-AWS-CLI-SETUP.md](../../aws-organization/docs/DEVELOPER-AWS-CLI-SETUP.md)

```bash
# Configure SSO profiles
aws configure sso --profile schedulsign-dev
aws configure sso --profile schedulsign-qa
aws configure sso --profile schedulsign-prod
```

## Deployment Steps

### Step 1: Deploy Infrastructure to Dev

```bash
cd infrastructure/terraform

# Create terraform.tfvars
cp terraform.tfvars.example terraform.tfvars

# Edit terraform.tfvars
nano terraform.tfvars
```

**terraform.tfvars for Dev:**
```hcl
environment = "dev"
aws_region  = "us-east-1"

github_repository   = "zenithventure/schedulsign"
github_branch       = "main"
github_access_token = "ghp_xxxxxxxxxxxxxxxxxxxxx"  # From GitHub settings

db_instance_class = "db.t4g.micro"  # Free tier
```

**Deploy:**
```bash
# Login to Dev account
aws sso login --profile schedulsign-dev
export AWS_PROFILE=schedulsign-dev

# Initialize Terraform
terraform init

# Review plan
terraform plan

# Deploy infrastructure
terraform apply

# Save outputs
terraform output -raw database_url > .database_url.secret
terraform output -raw amplify_app_id > .amplify_app_id
```

### Step 2: Configure Amplify Environment Variables

The Terraform deployment creates placeholder values. Update them in Amplify Console:

```bash
# Open Amplify Console
aws amplify get-app --app-id $(cat .amplify_app_id)

# Or visit AWS Console → Amplify → schedulsign
```

**Update these variables in Amplify Console:**

1. **NextAuth**
   ```bash
   NEXTAUTH_SECRET=$(openssl rand -base64 32)
   ```
   - Go to Amplify → Environment variables
   - Update `NEXTAUTH_SECRET` with the generated value

2. **Google OAuth** (from Google Cloud Console)
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`

3. **Microsoft OAuth** (from Azure Portal)
   - `MICROSOFT_CLIENT_ID`
   - `MICROSOFT_CLIENT_SECRET`

4. **Stripe** (from Stripe Dashboard)
   - `STRIPE_SECRET_KEY`
   - `STRIPE_PUBLISHABLE_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `STRIPE_PRO_MONTHLY_PRICE_ID`
   - `STRIPE_PRO_YEARLY_PRICE_ID`

5. **AWS SES** (from IAM Console)
   - `AWS_SES_ACCESS_KEY`
   - `AWS_SES_SECRET_KEY`
   - First verify email domain in SES

6. **Twilio** (from Twilio Console)
   - `TWILIO_ACCOUNT_SID`
   - `TWILIO_AUTH_TOKEN`
   - `TWILIO_PHONE_NUMBER`

7. **Zoom** (optional, from Zoom Marketplace)
   - `ZOOM_CLIENT_ID`
   - `ZOOM_CLIENT_SECRET`
   - `ZOOM_ACCOUNT_ID`

**After updating, redeploy:**
```bash
aws amplify start-job \
  --app-id $(cat .amplify_app_id) \
  --branch-name main \
  --job-type RELEASE
```

### Step 3: Run Database Migrations

```bash
# Export DATABASE_URL from Terraform output
export DATABASE_URL=$(terraform output -raw database_url)

# Run migrations
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate

# Verify connection
psql "$DATABASE_URL" -c "SELECT version();"
```

**Note:** If RDS is in private subnet only, you'll need a bastion host or VPN.

### Step 4: Verify Deployment

```bash
# Get app URL
APP_URL=$(terraform output -raw amplify_app_url)
echo "Visit: $APP_URL"

# Check Amplify build status
aws amplify list-jobs \
  --app-id $(cat .amplify_app_id) \
  --branch-name main \
  --max-results 1
```

Visit the URL and verify:
- ✅ Landing page loads
- ✅ Signup/login works
- ✅ Google OAuth works
- ✅ Can create event types
- ✅ Booking flow works
- ✅ Email notifications sent

### Step 5: Deploy to QA

Repeat Steps 1-4 for QA account:

```bash
# Switch to QA account
export AWS_PROFILE=schedulsign-qa

# Update terraform.tfvars
environment = "qa"
github_branch = "main"
db_instance_class = "db.t4g.small"

# Deploy
terraform apply
```

### Step 6: Deploy to Prod

For production:

```bash
# Switch to Prod account
export AWS_PROFILE=schedulsign-prod

# Update terraform.tfvars
environment = "prod"
github_branch = "main"
domain_name = "app.schedulsign.com"  # Your custom domain
db_instance_class = "db.t4g.medium"

# Deploy
terraform apply
```

**Additional Prod Steps:**

1. **SSL Certificate**
   ```bash
   # Create ACM certificate in us-east-1
   aws acm request-certificate \
     --domain-name app.schedulsign.com \
     --validation-method DNS \
     --region us-east-1

   # Follow DNS validation steps
   ```

2. **Route 53 DNS**
   - Amplify will provide CNAME records
   - Add to your DNS provider or Route 53

3. **Stripe Webhook**
   ```bash
   # Configure Stripe webhook to point to prod domain
   # https://app.schedulsign.com/api/stripe/webhook
   ```

4. **SES Production Access**
   - Move SES out of sandbox mode
   - Request sending limit increase if needed

5. **Enable Monitoring**
   ```bash
   # CloudWatch alarms for RDS
   # Amplify monitoring (automatic)
   # Set up SNS topics for alerts
   ```

## CI/CD with GitHub Actions

Amplify automatically builds on git push, but you can also use GitHub Actions:

```bash
# Push to main → Auto-deploy to Dev
git push origin main

# Tag for QA deployment
git tag v1.0.0-qa
git push origin v1.0.0-qa

# Tag for Prod deployment (requires approval)
git tag v1.0.0
git push origin v1.0.0
```

## Database Migrations

**Dev/QA:** Run migrations automatically on deploy
```bash
# Add to Amplify build settings → preBuild phase:
npx prisma migrate deploy
```

**Prod:** Run migrations manually with approval
```bash
# Connect via bastion/VPN
export DATABASE_URL="postgresql://..."
npx prisma migrate deploy
```

## Monitoring & Logs

### Amplify Logs
```bash
# Build logs
aws amplify list-jobs --app-id <app-id> --branch-name main

# Runtime logs
# Go to Amplify Console → Monitoring → Logs
```

### RDS Logs
```bash
# CloudWatch Logs
aws logs tail /aws/rds/instance/schedulsign/postgresql --follow

# Performance Insights
# Go to RDS Console → Performance Insights
```

### Application Logs
```bash
# Next.js server logs in CloudWatch (via Amplify)
# Go to Amplify → Monitoring → Logs
```

## Troubleshooting

### Build Failures

**Prisma Client Generation:**
```bash
# Error: @prisma/client not found
# Fix: Add to amplify.yml preBuild:
npx prisma generate
```

**Database Connection:**
```bash
# Error: Can't reach database server
# Fix: Check VPC security groups allow Amplify → RDS
# Amplify needs NAT Gateway to reach private RDS
```

### Runtime Errors

**NextAuth Secret:**
```bash
# Error: NEXTAUTH_SECRET missing
# Fix: Update in Amplify environment variables
```

**Database Migrations:**
```bash
# Error: Prisma schema mismatch
# Fix: Run migrations
npx prisma migrate deploy
```

## Costs Breakdown

**Dev Environment:**
- Amplify: ~$10/mo (build + hosting)
- RDS db.t4g.micro: ~$15/mo
- NAT Gateway (2 AZs): ~$65/mo
- **Total: ~$90/mo**

**QA Environment:**
- Similar to Dev: ~$100/mo

**Prod Environment:**
- Amplify: ~$30-50/mo
- RDS db.t4g.medium: ~$60/mo
- NAT Gateway: ~$65/mo
- Route 53: ~$0.50/mo
- ACM: Free
- **Total: ~$155-175/mo**

**Total for all environments: ~$350-370/mo**

## Cleanup

To destroy infrastructure (dev/qa only):

```bash
cd infrastructure/terraform
terraform destroy

# Note: Prod has deletion protection enabled
# To destroy prod, first disable in terraform.tfvars:
# deletion_protection = false
```

## Next Steps

1. ✅ Deploy to Dev - Test all features
2. ✅ Deploy to QA - Run integration tests
3. ✅ Deploy to Prod - Go live!
4. 🔄 Set up monitoring & alerts
5. 🔄 Configure backup policies
6. 🔄 Set up WAF for security
7. 🔄 Enable AWS Shield (DDoS protection)
8. 🔄 Set up CloudFront (optional, for better caching)

## Support

For issues:
- **Infrastructure**: Check aws-organization repo
- **Application**: Check this repo's issues
- **AWS Support**: Enterprise support plan recommended for prod
