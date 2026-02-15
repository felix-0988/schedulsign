#!/bin/bash
set -e

# Invoke Lambda Migration Function
# =================================
# Manually triggers database migrations via Lambda

ENVIRONMENT=${1:-dev}
AWS_PROFILE="scheulsign-${ENVIRONMENT}"
FUNCTION_NAME="schedulsign-migrations-${ENVIRONMENT}"

echo "🚀 Invoking migration Lambda for $ENVIRONMENT environment..."
echo ""

# Validate environment
if [[ ! "$ENVIRONMENT" =~ ^(dev|qa|prod)$ ]]; then
  echo "❌ Invalid environment: $ENVIRONMENT"
  echo "Usage: $0 [dev|qa|prod]"
  exit 1
fi

# Invoke Lambda
echo "📡 Triggering migration..."
RESPONSE=$(AWS_PROFILE=$AWS_PROFILE aws lambda invoke \
  --function-name "$FUNCTION_NAME" \
  --region us-east-1 \
  --log-type Tail \
  --payload '{}' \
  /dev/stdout 2>&1)

# Parse response
STATUS_CODE=$(echo "$RESPONSE" | grep -o '"StatusCode": [0-9]*' | grep -o '[0-9]*' || echo "unknown")
LOG_RESULT=$(echo "$RESPONSE" | grep -o '"LogResult": "[^"]*"' | sed 's/"LogResult": "//' | sed 's/"$//' | base64 -d 2>/dev/null || echo "")

echo ""
echo "==================================================="
echo "Migration Result"
echo "==================================================="

if [ "$STATUS_CODE" == "200" ]; then
  echo "✅ Status: SUCCESS"
else
  echo "❌ Status: FAILED (Status Code: $STATUS_CODE)"
fi

echo ""
echo "Lambda Logs:"
echo "---------------------------------------------------"
echo "$LOG_RESULT"
echo "---------------------------------------------------"
echo ""

# Show CloudWatch Logs link
ACCOUNT_ID=$(AWS_PROFILE=$AWS_PROFILE aws sts get-caller-identity --query Account --output text)
LOG_GROUP="/aws/lambda/$FUNCTION_NAME"
ENCODED_LOG_GROUP=$(printf %s "$LOG_GROUP" | jq -sRr @uri)

echo "📊 View full logs:"
echo "https://console.aws.amazon.com/cloudwatch/home?region=us-east-1#logsV2:log-groups/log-group/$ENCODED_LOG_GROUP"
echo ""

# Check if SNS notification was sent
echo "📧 Check your email for migration notification"
echo ""

if [ "$STATUS_CODE" == "200" ]; then
  exit 0
else
  exit 1
fi
