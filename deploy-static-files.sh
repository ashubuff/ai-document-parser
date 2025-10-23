#!/bin/bash
# Deploy static files to S3 bucket
# Usage: ./deploy-static-files.sh <bucket-name>

set -e

BUCKET_NAME=$1

if [ -z "$BUCKET_NAME" ]; then
  echo "Error: Bucket name required"
  echo "Usage: ./deploy-static-files.sh <bucket-name>"
  exit 1
fi

echo "📦 Deploying static files to S3 bucket: $BUCKET_NAME"

# Upload viewer.html
echo "Uploading viewer.html..."
aws s3 cp viewer.html s3://$BUCKET_NAME/viewer.html \
  --content-type "text/html" \
  --cache-control "max-age=300"

# Upload docToFields.js
echo "Uploading docToFields.js..."
aws s3 cp docToFields.js s3://$BUCKET_NAME/docToFields.js \
  --content-type "application/javascript" \
  --cache-control "max-age=86400"

echo "✅ Static files deployed successfully!"
echo ""
echo "URLs:"
echo "  Viewer: https://$BUCKET_NAME.s3.amazonaws.com/viewer.html"
echo "  Library: https://$BUCKET_NAME.s3.amazonaws.com/docToFields.js"
echo ""
echo "If using CloudFront, URLs will be:"
echo "  Viewer: https://<cloudfront-domain>/viewer.html"
echo "  Library: https://<cloudfront-domain>/docToFields.js"


