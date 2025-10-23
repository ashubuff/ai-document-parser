# Lambda Deployment - Quick Start

## TL;DR - Deploy in 5 Minutes

### Prerequisites
```bash
# Install AWS SAM CLI
brew install aws-sam-cli  # macOS
# or download from: https://aws.amazon.com/serverless/sam/

# Configure AWS credentials
aws configure
```

### Deploy Now

```bash
# 1. Build
npm run lambda:build

# 2. Deploy (first time)
npm run lambda:deploy

# Follow prompts:
# - Stack Name: ai-pdf-extractor
# - Region: us-east-1
# - Confirm: Y
# - Save config: Y

# 3. Get your endpoints
aws cloudformation describe-stacks \
  --stack-name ai-pdf-extractor \
  --query 'Stacks[0].Outputs' \
  --output table

# 4. Upload static files
BUCKET=$(aws cloudformation describe-stacks \
  --stack-name ai-pdf-extractor \
  --query 'Stacks[0].Outputs[?OutputKey==`StaticFilesBucketName`].OutputValue' \
  --output text)

npm run deploy:static $BUCKET
```

### That's It! 🎉

You now have:
- ✅ Lambda function handling API requests
- ✅ API Gateway endpoints
- ✅ S3 bucket with static files
- ✅ CloudFront CDN for global delivery

---

## Your Endpoints

After deployment, you'll get these URLs:

| Endpoint | Purpose | Example |
|----------|---------|---------|
| **APIEndpoint** | Lambda API base URL | `https://abc123.execute-api.us-east-1.amazonaws.com` |
| **ViewerURL** | Viewer page | `https://d123abc.cloudfront.net/viewer.html` |
| **CloudFrontURL** | Static files CDN | `https://d123abc.cloudfront.net` |

---

## Update .env for Lambda (Optional)

If you want Lambda to use server-side API keys:

```bash
aws lambda update-function-configuration \
  --function-name ai-pdf-extractor-PDFExtractorFunction-XXX \
  --environment Variables="{OPENAI_API_KEY=sk-your-key,DEFAULT_MODEL=gpt-4o}"
```

Or update in AWS Console:
1. Go to Lambda → Functions → your function
2. Configuration → Environment variables
3. Edit and save

---

## Use in Your Application

### In Salesforce

```javascript
// Lightning Web Component or Visualforce
const dtf = new DocsToFields({
    authKey: 'sk-your-openai-key',
    url: 'https://abc123.execute-api.us-east-1.amazonaws.com',
    viewerUrl: 'https://d123abc.cloudfront.net/viewer.html',
    model: 'openai_gpt-4o'
});

dtf.addField({ name: 'InvoiceNumber', description: 'Invoice number' });
await dtf.fileExtractText(pdfFile);
const results = await dtf.getFields();
```

### In Any Web App

```html
<script src="https://d123abc.cloudfront.net/docToFields.js"></script>
<script>
    const dtf = new DocsToFields({
        authKey: 'sk-xxx',
        url: 'https://abc123.execute-api.us-east-1.amazonaws.com',
        viewerUrl: 'https://d123abc.cloudfront.net/viewer.html',
        model: 'openai_gpt-4o'
    });
</script>
```

---

## Common Commands

### View Logs
```bash
npm run lambda:logs
# or
aws logs tail /aws/lambda/ai-pdf-extractor-PDFExtractorFunction --follow
```

### Update Code
```bash
npm run lambda:deploy:fast
```

### Update Static Files
```bash
npm run deploy:static $BUCKET_NAME
```

### Delete Everything
```bash
sam delete
```

---

## Costs

**Example: 10,000 extractions/month**

AWS Infrastructure:
- Lambda: ~$2
- API Gateway: $0.10
- S3 + CloudFront: $1.50
- **AWS Total: ~$3.60/month**

OpenAI API:
- GPT-4o: ~$0.05-0.15 per document
- **OpenAI Total: ~$500-1,500/month**

**Total: ~$504-1,504/month**

---

## Troubleshooting

### Cold Start (first request is slow)
- Normal behavior, subsequent requests are fast
- Or enable Provisioned Concurrency (costs more)

### CORS Errors
Update allowed origins in `template.yaml`:
```yaml
AllowOrigins:
  - 'https://your-salesforce-domain.lightning.force.com'
```

### Timeout
Increase in `template.yaml`:
```yaml
Timeout: 300  # 5 minutes
```

---

## Next Steps

1. ✅ Deploy (done!)
2. ✅ Test with sample PDF
3. ✅ Integrate into your app
4. Configure production CORS
5. Set up monitoring alarms
6. Add custom domain (optional)

---

## Full Documentation

See [LAMBDA_DEPLOYMENT.md](./LAMBDA_DEPLOYMENT.md) for complete guide including:
- Salesforce integration examples
- Security best practices
- Monitoring setup
- Production configuration
- Troubleshooting

---

## Alternative: Serverless Framework

If you prefer Serverless Framework:

```bash
# Install
npm install -g serverless

# Deploy
npm run serverless:deploy

# Remove
npm run serverless:remove
```

---

## Support

**Issues?**
1. Check CloudWatch Logs: `npm run lambda:logs`
2. Test API: `curl https://your-api-url/api/config`
3. Review [LAMBDA_DEPLOYMENT.md](./LAMBDA_DEPLOYMENT.md)

**Working?** 🎉
- Start building your integration!
- Check out the demo files for examples


