#!/bin/bash
set -e

# Deploy Lambda Migration Function
# =================================
# Packages and deploys the migration Lambda to AWS

ENVIRONMENT=${1:-dev}
AWS_PROFILE="scheulsign-${ENVIRONMENT}"

echo "🚀 Deploying Lambda migration function to $ENVIRONMENT..."
echo ""

# Validate environment
if [[ ! "$ENVIRONMENT" =~ ^(dev|qa|prod)$ ]]; then
  echo "❌ Invalid environment: $ENVIRONMENT"
  echo "Usage: $0 [dev|qa|prod]"
  exit 1
fi

# Package Lambda
echo "📦 Step 1/3: Packaging Lambda function..."
./scripts/package-lambda.sh
echo ""

# Apply Terraform
echo "🏗️  Step 2/3: Applying Terraform..."
cd infrastructure/terraform
AWS_PROFILE=$AWS_PROFILE terraform apply \
  -target=aws_lambda_function.migrations \
  -auto-approve
cd ../..
echo ""

# Update function code
echo "📤 Step 3/3: Uploading function code..."
FUNCTION_NAME="schedulsign-migrations-${ENVIRONMENT}"

AWS_PROFILE=$AWS_PROFILE aws lambda update-function-code \
  --function-name "$FUNCTION_NAME" \
  --zip-file fileb://lambda/migrations/function.zip \
  --region us-east-1

echo ""
echo "✅ Lambda function deployed successfully!"
echo ""
echo "Function name: $FUNCTION_NAME"
echo "To invoke: ./scripts/invoke-migration.sh $ENVIRONMENT"
