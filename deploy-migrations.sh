#!/bin/bash
set -e

# Deploy Database Migrations to AWS RDS
# =====================================
# Fetches DB credentials from AWS Secrets Manager and runs Prisma migrations.
# Requires AWS CLI configured with appropriate profile/credentials.

ENVIRONMENT=${1:-dev}
AWS_PROFILE="scheulsign-${ENVIRONMENT}"
SECRET_NAME="schedulsign-db-password-${ENVIRONMENT}"
REGION="us-east-1"

echo "Deploying database migrations to AWS RDS ($ENVIRONMENT)..."
echo ""

# Validate environment
if [[ ! "$ENVIRONMENT" =~ ^(dev|qa|prod)$ ]]; then
  echo "Invalid environment: $ENVIRONMENT"
  echo "Usage: $0 [dev|qa|prod]"
  exit 1
fi

# Fetch DB credentials from Secrets Manager
echo "Fetching database credentials from Secrets Manager..."
SECRET_JSON=$(AWS_PROFILE=$AWS_PROFILE aws secretsmanager get-secret-value \
  --secret-id "$SECRET_NAME" \
  --region "$REGION" \
  --query SecretString \
  --output text 2>/dev/null) || {
  # Fallback: try listing secrets with prefix match
  SECRET_ARN=$(AWS_PROFILE=$AWS_PROFILE aws secretsmanager list-secrets \
    --region "$REGION" \
    --filter Key=name,Values=schedulsign-db-password \
    --query 'SecretList[0].ARN' \
    --output text)
  SECRET_JSON=$(AWS_PROFILE=$AWS_PROFILE aws secretsmanager get-secret-value \
    --secret-id "$SECRET_ARN" \
    --region "$REGION" \
    --query SecretString \
    --output text)
}

DB_HOST=$(echo "$SECRET_JSON" | python3 -c "import sys,json; print(json.load(sys.stdin)['host'])")
DB_PORT=$(echo "$SECRET_JSON" | python3 -c "import sys,json; print(json.load(sys.stdin)['port'])")
DB_NAME=$(echo "$SECRET_JSON" | python3 -c "import sys,json; print(json.load(sys.stdin)['dbname'])")
DB_USER=$(echo "$SECRET_JSON" | python3 -c "import sys,json; print(json.load(sys.stdin)['username'])")
DB_PASS=$(echo "$SECRET_JSON" | python3 -c "import sys,json; print(json.load(sys.stdin)['password'])")

# URL-encode the password
DB_PASS_ENCODED=$(python3 -c "import urllib.parse; print(urllib.parse.quote('$DB_PASS', safe=''))" 2>/dev/null || echo "$DB_PASS")

export DATABASE_URL="postgresql://${DB_USER}:${DB_PASS_ENCODED}@${DB_HOST}:${DB_PORT}/${DB_NAME}"

echo "Database URL configured"
echo "  Host: $DB_HOST"
echo "  Database: $DB_NAME"
echo ""

echo "Running Prisma migrations..."
npx prisma migrate deploy

echo ""
echo "Migration deployment complete!"
