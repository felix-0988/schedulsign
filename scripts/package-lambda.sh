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

# Generate Prisma Client
echo "🔧 Generating Prisma Client..."
npx prisma generate

# Create deployment package
echo "🗜️  Creating ZIP package..."
cd ..
zip -r function.zip build/* -x "*.git*" -x "*node_modules/.cache*"

# Move to final location
mv function.zip ../..
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
