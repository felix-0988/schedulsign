#!/bin/bash
set -e

# Package Cognito PostConfirmation Lambda
# ========================================
# Creates a deployment package for the Cognito PostConfirmation Lambda

echo "Packaging Cognito PostConfirmation Lambda..."

LAMBDA_DIR="infrastructure/terraform/lambda/cognito-post-confirmation"
ZIP_FILE="$LAMBDA_DIR/function.zip"

# Clean previous build
rm -f "$ZIP_FILE"
rm -rf "$LAMBDA_DIR/node_modules"

# Install production dependencies
echo "Installing dependencies..."
cd "$LAMBDA_DIR"
npm install --omit=dev

# Create deployment package
echo "Creating ZIP package..."
zip -r function.zip index.js node_modules/

# Go back to project root
cd -

# Get file size
SIZE=$(du -h "$ZIP_FILE" | cut -f1)
echo "Lambda package created: $ZIP_FILE ($SIZE)"
