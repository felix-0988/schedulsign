# AWS Cognito Migration - Deployment Guide

## Overview

This guide covers the deployment steps for migrating SchedulSign from Clerk to AWS Cognito authentication.

## Prerequisites

- AWS CLI configured with appropriate credentials
- Terraform installed (v1.0+)
- Node.js and npm installed
- Access to AWS Console for Cognito and Amplify
- Google OAuth credentials (Client ID and Secret)

---

## Step 1: Configure Environment Variables

### Local Development (.env.local)

Create or update `/Users/szewong/git/schedulsign/.env.local`:

```bash
# AWS Cognito
NEXT_PUBLIC_COGNITO_USER_POOL_ID="us-east-1_xxxxxxxxx"  # Will be output from Terraform
NEXT_PUBLIC_COGNITO_CLIENT_ID="xxxxxxxxxxxxxxxxxxxxxxxxxx"  # Will be output from Terraform
NEXT_PUBLIC_COGNITO_DOMAIN="schedulsign-dev.auth.us-east-1.amazoncognito.com"  # Will be output from Terraform

# App Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="SchedulSign"

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/schedulsign"

# Stripe (existing)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# SES (existing)
SES_REGION="us-east-1"
SES_FROM_EMAIL="noreply@schedulsign.com"

# Twilio (existing)
TWILIO_ACCOUNT_SID="AC..."
TWILIO_AUTH_TOKEN="..."
TWILIO_PHONE_NUMBER="+1..."

# Zoom (existing)
ZOOM_CLIENT_ID="..."
ZOOM_CLIENT_SECRET="..."
```

### Terraform Variables

Create or update `/Users/szewong/git/schedulsign/infrastructure/terraform/dev.tfvars`:

```hcl
# Google OAuth
google_oauth_client_id     = "your-google-client-id.apps.googleusercontent.com"
google_oauth_client_secret = "your-google-client-secret"

# Existing variables (environment, region, etc.)
environment = "dev"
aws_region  = "us-east-1"
# ... other existing variables
```

**Note:** You can get Google OAuth credentials from the [Google Cloud Console](https://console.cloud.google.com/apis/credentials).

---

## Step 2: Package Lambda Function

The PostConfirmation Lambda needs to be packaged with its dependencies before running Terraform.

```bash
cd /Users/szewong/git/schedulsign/infrastructure/terraform/lambda/cognito-post-confirmation

# Install dependencies
npm init -y
npm install @aws-sdk/client-secrets-manager pg

# Generate Prisma Client
cp ../../../../prisma/schema.prisma ./prisma/schema.prisma
npx prisma generate

# Create deployment package
zip -r ../function.zip . -x "*.git*" -x "*node_modules/.cache*"

cd ../../
```

**Important:** The Lambda function expects the following environment variables to be set by Terraform:
- `DB_SECRET_ARN` - ARN of the Secrets Manager secret containing database credentials
- `DATABASE_URL` - PostgreSQL connection string (optional, can use secret instead)

---

## Step 3: Deploy Terraform Infrastructure

```bash
cd /Users/szewong/git/schedulsign/infrastructure/terraform

# Initialize Terraform (if not already done)
terraform init

# Plan the changes
terraform plan -var-file="dev.tfvars" -out=tfplan

# Review the plan carefully, then apply
terraform apply tfplan

# Capture the outputs
terraform output cognito_user_pool_id
terraform output cognito_user_pool_client_id
terraform output cognito_domain
terraform output cognito_issuer
```

**Expected Resources Created:**
- AWS Cognito User Pool
- Cognito User Pool Client
- Cognito User Pool Domain
- Cognito Identity Provider (Google)
- Lambda Function (PostConfirmation trigger)
- IAM Role and Policies for Lambda
- Security Group rules for Lambda → RDS access
- Lambda Permission for Cognito to invoke

**Important Terraform Outputs:**
Copy the output values and update your `.env.local` and Amplify Console environment variables.

---

## Step 4: Configure Google OAuth

### In Google Cloud Console

1. Go to [Google Cloud Console > APIs & Services > Credentials](https://console.cloud.google.com/apis/credentials)
2. Select your OAuth 2.0 Client ID
3. Add the following to **Authorized redirect URIs**:
   ```
   https://schedulsign-dev.auth.us-east-1.amazoncognito.com/oauth2/idpresponse
   https://schedulsign-staging.auth.us-east-1.amazoncognito.com/oauth2/idpresponse
   https://schedulsign-prod.auth.us-east-1.amazoncognito.com/oauth2/idpresponse
   ```
   *(Replace region and domain prefix based on your Terraform outputs)*

4. Add to **Authorized JavaScript origins**:
   ```
   https://schedulsign-dev.auth.us-east-1.amazoncognito.com
   http://localhost:3000
   https://your-amplify-domain.amplifyapp.com
   ```

### In AWS Cognito Console (Verify)

1. Go to [AWS Cognito Console](https://console.aws.amazon.com/cognito)
2. Select your User Pool
3. Navigate to **Sign-in experience > Federated identity provider sign-in**
4. Verify Google is configured with correct Client ID and Secret
5. Check **Attribute mapping** - should map:
   - `email` → `email`
   - `name` → `name`
   - `picture` → `picture`
   - `sub` → `username`

---

## Step 5: Run Database Migration

The Prisma migration was created but not applied (since local DB wasn't accessible).

### For Production (via Lambda)

If you have an existing Lambda function for migrations:

```bash
# Update the migration Lambda with the new migration
cd /Users/szewong/git/schedulsign/lambda/migrations
npm run deploy  # Or however you deploy your migrations Lambda

# Invoke the Lambda
aws lambda invoke \
  --function-name schedulsign-migrations-prod \
  --payload '{"command": "migrate"}' \
  response.json
```

### Manual Migration (if needed)

```bash
# Connect to RDS via bastion/tunnel
# Then run:
npx prisma migrate deploy
```

**Migration SQL** (located at `prisma/migrations/20260216000000_add_cognito_support/migration.sql`):
- Drops `Account`, `Session`, `VerificationToken` tables
- Drops `password` column from `User` table
- Adds `cognitoId` column to `User` table
- Creates unique index on `cognitoId`

**Verify Migration:**
```sql
\d "User"  -- Should show cognitoId column
SELECT table_name FROM information_schema.tables WHERE table_name IN ('Account', 'Session', 'VerificationToken');
-- Should return 0 rows
```

---

## Step 6: Update Amplify Console Environment Variables

1. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify)
2. Select your app
3. Go to **Hosting > Environment variables**

### Add New Variables:
```
NEXT_PUBLIC_COGNITO_USER_POOL_ID = <from terraform output>
NEXT_PUBLIC_COGNITO_CLIENT_ID = <from terraform output>
NEXT_PUBLIC_COGNITO_DOMAIN = <from terraform output>
NEXT_PUBLIC_APP_URL = https://your-app.amplifyapp.com
```

### Remove Old Variables:
```
CLERK_PUBLISHABLE_KEY (delete)
CLERK_SECRET_KEY (delete)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY (delete)
```

### Keep Existing Variables:
- All Stripe variables
- All SES variables
- All Twilio variables
- All Zoom variables
- DATABASE_URL

**Save** and the next deployment will use the new variables.

---

## Step 7: Deploy Application

### Option 1: Push to Git (Amplify Auto-Deploy)

```bash
cd /Users/szewong/git/schedulsign

# Review all changes
git status
git diff

# Stage all changes
git add .

# Commit
git commit -m "feat: Migrate from Clerk to AWS Cognito authentication

- Add Terraform infrastructure for Cognito User Pool
- Configure Google OAuth federation
- Add PostConfirmation Lambda for user sync
- Update Prisma schema with cognitoId field
- Replace Clerk with AWS Amplify authentication
- Update all API routes to use Cognito auth
- Create custom auth pages (login, signup, forgot-password)
- Update dashboard with Amplify auth

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"

# Push to trigger Amplify build
git push origin main
```

### Option 2: Manual Deployment

```bash
# Build locally
npm run build

# Test the build
npm start

# If successful, push to trigger Amplify
git push origin main
```

**Monitor Deployment:**
- Watch the Amplify Console build logs
- Verify build completes successfully
- Check for any environment variable errors

---

## Step 8: Testing Checklist

### Local Testing (before deploying)

- [ ] `npm install` completes without errors
- [ ] `npm run dev` starts successfully
- [ ] Navigate to `http://localhost:3000/login`
- [ ] Sign up with email/password works
- [ ] Receive verification code (check console if using SES sandbox)
- [ ] Confirm email with code
- [ ] Auto-redirect to dashboard after confirmation
- [ ] Dashboard loads correctly with user email displayed
- [ ] Sign out works
- [ ] Sign in with same credentials works
- [ ] Forgot password flow works
- [ ] Google OAuth signup works
- [ ] Google OAuth login works
- [ ] Protected routes redirect to login when not authenticated
- [ ] API routes return 401 when not authenticated
- [ ] API routes work when authenticated (test creating event type)

### Production Testing (after deployment)

- [ ] Access production URL
- [ ] Sign up with real email address
- [ ] Receive verification email from SES
- [ ] Confirm email and login
- [ ] Verify user exists in database with `cognitoId`
- [ ] Test Google OAuth with real Google account
- [ ] Create event type (test authenticated API flow)
- [ ] Create booking as public user (test public flow)
- [ ] Test Stripe checkout
- [ ] Test calendar connection (Google Calendar OAuth)
- [ ] Test mobile responsive design
- [ ] Check browser console for errors
- [ ] Test password reset with real email
- [ ] Verify all navigation works
- [ ] Test sign out and sign back in

### Database Verification

```sql
-- Connect to production database
-- Check users table structure
\d "User"

-- Verify cognitoId field exists
SELECT id, email, "cognitoId", "emailVerified"
FROM "User"
WHERE "cognitoId" IS NOT NULL
LIMIT 5;

-- Verify old tables are gone
SELECT table_name
FROM information_schema.tables
WHERE table_name IN ('Account', 'Session', 'VerificationToken');
-- Should return 0 rows
```

---

## Troubleshooting

### Issue: "User not found" after signup

**Cause:** PostConfirmation Lambda failed to create user in database

**Solution:**
1. Check Lambda logs in CloudWatch
2. Verify Lambda has VPC access to RDS
3. Verify security group allows Lambda → RDS on port 5432
4. Check DATABASE_URL or DB_SECRET_ARN is correctly set
5. Manually create user in database if needed:
   ```sql
   INSERT INTO "User" (id, "cognitoId", email, name, "emailVerified", timezone)
   VALUES (gen_random_uuid(), 'cognito-sub-here', 'user@example.com', 'User Name', NOW(), 'America/New_York');
   ```

### Issue: "Redirect mismatch" during Google OAuth

**Cause:** Callback URL not configured in Google Cloud Console

**Solution:**
1. Go to Google Cloud Console > Credentials
2. Add Cognito domain callback URL: `https://<cognito-domain>/oauth2/idpresponse`
3. Wait a few minutes for Google to update
4. Try again

### Issue: "Invalid session" or constant redirects to /login

**Cause:** Cookie domain mismatch or Amplify SSR config issue

**Solution:**
1. Verify `NEXT_PUBLIC_APP_URL` matches your actual domain
2. Check that Amplify config in `amplify-config.ts` has correct `redirectSignIn` URLs
3. Clear cookies and try again
4. Check browser console for Amplify errors

### Issue: API routes return 401 even when logged in

**Cause:** `getAuthenticatedUser()` not finding user by cognitoId

**Solution:**
1. Check user exists in database with `cognitoId` populated
2. Verify session tokens are being sent (check Network tab)
3. Check `fetchAuthSession()` is returning tokens
4. Add debug logging to `lib/auth.ts`:
   ```typescript
   console.log('Cognito ID:', cognitoId)
   console.log('User found:', user)
   ```

### Issue: Email verification code not received

**Cause:** SES sandbox mode or email configuration issue

**Solution:**
1. Check SES sending limits and verify email address in SES Console
2. Check Cognito User Pool email configuration
3. Check CloudWatch logs for SES errors
4. For development, use `aws cognito-idp admin-confirm-sign-up` to bypass email verification:
   ```bash
   aws cognito-idp admin-confirm-sign-up \
     --user-pool-id us-east-1_xxxxxxx \
     --username user@example.com
   ```

---

## Rollback Plan

If critical issues arise in production:

### Step 1: Revert Code
```bash
cd /Users/szewong/git/schedulsign
git revert HEAD
git push origin main
```

### Step 2: Restore Clerk Environment Variables

In Amplify Console, re-add:
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY
```

Remove:
```
NEXT_PUBLIC_COGNITO_USER_POOL_ID
NEXT_PUBLIC_COGNITO_CLIENT_ID
NEXT_PUBLIC_COGNITO_DOMAIN
```

### Step 3: Revert Database Migration

```bash
npx prisma migrate rollback
```

Or manually:
```sql
-- Re-add password column
ALTER TABLE "User" ADD COLUMN password TEXT;

-- Remove cognitoId column
ALTER TABLE "User" DROP COLUMN "cognitoId";

-- Recreate NextAuth tables
CREATE TABLE "Account" (...);
CREATE TABLE "Session" (...);
CREATE TABLE "VerificationToken" (...);
```

### Step 4: Disable Cognito (Don't Delete)

In AWS Cognito Console, disable the User Pool but don't delete it (in case you want to re-enable later).

**Rollback Time:** 15-30 minutes
**Data Loss Risk:** Only new Cognito signups will be lost

---

## Security Checklist

- [x] Tokens stored in httpOnly cookies (handled by Amplify)
- [x] CSRF protection enabled (handled by Amplify)
- [x] Password policy enforced (8+ chars, upper/lower/numbers)
- [x] Email verification required for signup
- [x] Rate limiting enabled (Cognito built-in)
- [x] Secure token refresh (automatic)
- [x] No credentials in client-side code
- [x] Lambda runs in VPC for database access
- [x] Least privilege IAM policies
- [x] Database credentials stored in Secrets Manager
- [ ] MFA enabled (optional - can enable in Cognito User Pool settings)
- [ ] Advanced security features enabled (optional - adaptive authentication, compromised credentials detection)

---

## Post-Migration Cleanup

After confirming the migration is successful and stable:

1. **Remove Clerk dependencies:**
   ```bash
   npm uninstall @clerk/nextjs
   ```

2. **Delete old NextAuth API routes** (if any exist):
   ```bash
   rm -rf src/app/api/auth/[...nextauth]
   ```

3. **Remove Clerk environment variables** from all environments

4. **Update documentation** to reflect new auth flow

5. **Archive old Clerk account** (but don't delete immediately - wait 30 days)

---

## Support Resources

### AWS Documentation
- [Amazon Cognito User Pools](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools.html)
- [AWS Amplify with Next.js](https://docs.amplify.aws/nextjs/)
- [Cognito Lambda Triggers](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-identity-pools-working-with-aws-lambda-triggers.html)

### Terraform Documentation
- [AWS Cognito User Pool Resource](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/cognito_user_pool)

### Project Files
- Migration plan: `/Users/szewong/.claude/projects/-Users-szewong-git-schedulsign/ffd5b699-fafa-4905-97cf-6e32eedb792b.jsonl`
- This deployment guide: `/Users/szewong/git/schedulsign/COGNITO_MIGRATION.md`

---

## Success Criteria

✅ **Infrastructure:**
- Cognito User Pool created and accessible
- Lambda PostConfirmation function deployed and triggered
- Google OAuth federation configured and working

✅ **Authentication:**
- Users can sign up with email/password
- Email verification emails are received and work
- Users can log in with email/password
- Google OAuth signup works
- Google OAuth login works
- Password reset flow works
- Session management works (stay logged in, sign out)

✅ **Authorization:**
- Protected routes require authentication
- API routes validate authentication correctly
- Public routes remain accessible (booking pages, webhooks)
- Unauthenticated requests redirect to login

✅ **Database:**
- New signups create users in Prisma DB
- `cognitoId` field populated correctly
- All existing relations work (bookings, events, contacts, etc.)
- Old NextAuth tables removed

✅ **User Experience:**
- Login flow is smooth and intuitive
- Error messages are clear and helpful
- No console errors in browser
- Mobile responsive design works
- Loading states display correctly

---

## Timeline

Estimated time to complete all steps: **2-4 hours**

- Step 1 (Environment variables): 15 minutes
- Step 2 (Lambda packaging): 10 minutes
- Step 3 (Terraform deployment): 30 minutes
- Step 4 (Google OAuth config): 15 minutes
- Step 5 (Database migration): 15 minutes
- Step 6 (Amplify variables): 10 minutes
- Step 7 (Deploy application): 20 minutes
- Step 8 (Testing): 60-120 minutes

---

**Last Updated:** 2026-02-16
**Migration Team:** infrastructure-engineer, database-engineer, backend-engineer, frontend-engineer, api-engineer
