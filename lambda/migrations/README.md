# Database Migration Lambda Function

Secure, VPC-enabled Lambda function for running Prisma database migrations.

## Security Features

✅ **Network Isolation**
- Runs in private VPC subnets
- RDS remains private (not internet-accessible)
- Security group controls access

✅ **Credential Management**
- Database password stored in AWS Secrets Manager (encrypted)
- Retrieved at runtime via IAM role
- Never hardcoded or logged

✅ **Access Control**
- Least privilege IAM permissions
- Only authorized roles can invoke Lambda
- CloudWatch audit logs for all executions

✅ **Notifications**
- SNS notifications on success/failure
- Email alerts to DevOps team
- Comprehensive logging

## Architecture

```
┌─────────────────┐
│  GitHub Actions │
│  or AWS Console │
└────────┬────────┘
         │ invoke
         ▼
┌────────────────────────────┐
│  Lambda Function (in VPC)  │
│  1. Get DB creds from SM   │
│  2. Generate Prisma Client │
│  3. Run migrations         │
│  4. Send SNS notification  │
└────────┬───────────────────┘
         │
         ▼
┌────────────────────────────┐
│  RDS PostgreSQL (private)  │
│  - Only accessible from    │
│    within VPC              │
└────────────────────────────┘
```

## Usage

### 1. Package Lambda

```bash
./scripts/package-lambda.sh
```

### 2. Deploy Lambda

```bash
# Deploy to dev
./scripts/deploy-lambda.sh dev

# Deploy to qa
./scripts/deploy-lambda.sh qa

# Deploy to prod
./scripts/deploy-lambda.sh prod
```

### 3. Run Migrations

```bash
# Run in dev
./scripts/invoke-migration.sh dev

# Run in qa
./scripts/invoke-migration.sh qa

# Run in prod (requires approval)
./scripts/invoke-migration.sh prod
```

### 4. Via AWS Console

1. Go to [Lambda Console](https://console.aws.amazon.com/lambda)
2. Select `schedulsign-migrations-dev`
3. Click "Test" tab
4. Create test event (empty JSON: `{}`)
5. Click "Test"

### 5. Via GitHub Actions

The migration workflow automatically invokes Lambda:

```bash
gh workflow run deploy-migrations.yml -f environment=dev
```

## Monitoring

### CloudWatch Logs

View migration logs:
```bash
aws logs tail /aws/lambda/schedulsign-migrations-dev --follow --profile scheulsign-dev
```

### Email Notifications

You'll receive an email notification after each migration:
- ✅ Success: "✓ Database Migration Successful (dev)"
- ❌ Failure: "✗ Database Migration Failed (dev)"

### Metrics

View Lambda metrics:
1. Go to [CloudWatch Console](https://console.aws.amazon.com/cloudwatch)
2. Navigate to Metrics → Lambda
3. Filter by `schedulsign-migrations-dev`

## IAM Permissions

The Lambda has minimal permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "secretsmanager:GetSecretValue",
      "Resource": "arn:aws:secretsmanager:*:*:secret:schedulsign-db-*"
    },
    {
      "Effect": "Allow",
      "Action": "sns:Publish",
      "Resource": "arn:aws:sns:*:*:schedulsign-migration-notifications-*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "arn:aws:logs:*:*:log-group:/aws/lambda/schedulsign-migrations-*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "ec2:CreateNetworkInterface",
        "ec2:DescribeNetworkInterfaces",
        "ec2:DeleteNetworkInterface"
      ],
      "Resource": "*"
    }
  ]
}
```

## Troubleshooting

### Migration fails with "Can't reach database"

**Cause:** Lambda can't connect to RDS

**Fix:**
1. Check security group allows Lambda → RDS on port 5432
2. Verify Lambda is in correct VPC/subnets
3. Check RDS is running

```bash
AWS_PROFILE=scheulsign-dev aws rds describe-db-instances \
  --db-instance-identifier schedulsign \
  --query 'DBInstances[0].DBInstanceStatus'
```

### Migration fails with "P1017: Server has closed the connection"

**Cause:** Database is restarting or unavailable

**Fix:** Wait a few minutes and retry

### No email notification received

**Cause:** SNS subscription not confirmed

**Fix:**
1. Check email inbox for SNS subscription confirmation
2. Click "Confirm subscription" link
3. Verify subscription status:

```bash
AWS_PROFILE=scheulsign-dev aws sns list-subscriptions-by-topic \
  --topic-arn $(terraform output -raw migration_sns_topic_arn)
```

### Lambda timeout (5 minutes)

**Cause:** Migration taking too long

**Fix:**
1. Increase Lambda timeout in `lambda-migrations.tf`
2. Or split migrations into smaller batches

## Security Best Practices

✅ **Implemented:**
- [x] VPC isolation
- [x] Secrets Manager for credentials
- [x] Least privilege IAM
- [x] CloudWatch logging
- [x] SNS notifications
- [x] Security group restrictions

🔒 **Additional hardening (optional):**
- [ ] VPC Endpoints (eliminate internet traffic)
- [ ] KMS encryption for environment variables
- [ ] Lambda function URLs with IAM auth
- [ ] AWS WAF for API Gateway (if exposing via API)

## Cost Estimate

**Dev environment:**
- Lambda: ~$0.20/month (100 invocations)
- Secrets Manager: $0.40/month (1 secret)
- SNS: $0.00/month (< 1000 notifications)
- CloudWatch Logs: ~$0.50/month (1 GB)
- **Total: ~$1.10/month**

## Files

```
lambda/migrations/
├── index.js           # Lambda handler
├── package.json       # Dependencies
├── function.zip       # Deployment package (generated)
└── README.md          # This file

scripts/
├── package-lambda.sh  # Build deployment package
├── deploy-lambda.sh   # Deploy to AWS
└── invoke-migration.sh # Trigger migration

infrastructure/terraform/
└── lambda-migrations.tf # Lambda infrastructure
```
