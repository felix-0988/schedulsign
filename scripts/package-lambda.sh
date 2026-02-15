#!/bin/bash
set -e

# Package Lambda Migration Function
# ==================================
# Creates a deployment package for the migration Lambda with all dependencies

echo "📦 Packaging Lambda migration function..."

# Configuration
LAMBDA_DIR="lambda/migrations"
BUILD_DIR="$LAMBDA_DIR/build"
ZIP_FILE="$LAMBDA_DIR/function.zip"

# Clean previous build
echo "🧹 Cleaning previous build..."
rm -rf "$BUILD_DIR"
rm -f "$ZIP_FILE"
mkdir -p "$BUILD_DIR"

# Copy Lambda code
echo "📋 Copying Lambda code..."
cp "$LAMBDA_DIR/index.js" "$BUILD_DIR/"
cp "$LAMBDA_DIR/package.json" "$BUILD_DIR/"

# Copy Prisma schema and migrations
echo "📋 Copying Prisma schema and migrations..."
cp -r prisma "$BUILD_DIR/"

# Install production dependencies
echo "📥 Installing dependencies..."
cd "$BUILD_DIR"
npm install --production --no-optional

# Generate Prisma Client with all binary targets
echo "🔧 Generating Prisma Client..."
npx prisma generate

# Download Linux binary for Lambda
echo "🔄 Downloading Prisma schema-engine for Lambda..."
# Extract commit hash from version string (format: 5.22.0-44.HASH)
ENGINE_VERSION=$(node -p "require('./node_modules/@prisma/engines-version/package.json').version")
ENGINE_HASH=$(echo "$ENGINE_VERSION" | sed 's/.*\.//')
echo "Engine version: $ENGINE_VERSION"
echo "Engine commit hash: $ENGINE_HASH"

curl -L -o /tmp/schema-engine-linux.gz \
  "https://binaries.prisma.sh/all_commits/${ENGINE_HASH}/rhel-openssl-3.0.x/schema-engine.gz"

gunzip -f /tmp/schema-engine-linux.gz
mv /tmp/schema-engine-linux node_modules/@prisma/engines/schema-engine-rhel-openssl-3.0.x
chmod +x node_modules/@prisma/engines/schema-engine-rhel-openssl-3.0.x

echo "✓ Downloaded Linux schema-engine binary"
ls -lh node_modules/@prisma/engines/schema-engine-rhel-openssl-3.0.x

# Create deployment package (we're already in BUILD_DIR from npm install above)
echo "🗜️  Creating ZIP package..."
zip -r ../function.zip . -x "*.git*" -x "*node_modules/.cache*"

# Go back to project root
cd ../..

# Cleanup
rm -rf "$BUILD_DIR"

# Get file size
SIZE=$(du -h "$ZIP_FILE" | cut -f1)

echo "✅ Lambda package created: $ZIP_FILE ($SIZE)"
echo ""
echo "Next steps:"
echo "  1. Apply Terraform to create/update Lambda function"
echo "  2. Use scripts/invoke-migration.sh to test"
