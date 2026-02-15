#!/bin/bash
set -e

# Deploy Database Migrations to AWS RDS
# =====================================

echo "🚀 Deploying database migrations to AWS RDS..."
echo ""

# Set DATABASE_URL with URL-encoded password
export DATABASE_URL="postgresql://schedulsign_admin:Q%5Bwt15uitiqnoT5i%23WGLDJo!yL_xR6W9@schedulsign.cwtyg804suth.us-east-1.rds.amazonaws.com:5432/schedulsign"

echo "✓ Database URL configured"
echo "  Host: schedulsign.cwtyg804suth.us-east-1.rds.amazonaws.com"
echo "  Database: schedulsign"
echo ""

echo "📦 Running Prisma migrations..."
npx prisma migrate deploy

echo ""
echo "✅ Migration deployment complete!"
echo ""
echo "Next steps:"
echo "  1. Generate Prisma client: npx prisma generate"
echo "  2. Verify connection: npx prisma db push"
echo "  3. Configure Amplify secrets in AWS Console"
