# AWS Lambda Deployment Guide

This guide covers deploying the AI PDF Extractor to AWS Lambda + API Gateway + S3 + CloudFront.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Application                       │
│              (Salesforce, Custom Web App, etc.)             │
│                   Uses docToFields.js                        │
└──────────────────────┬──────────────────────────────────────┘
                       │
           ┌───────────┴───────────┐
           │                       │
           ▼                       ▼
┌──────────────────────┐  ┌───────────────────────┐
│  Lambda + API GW     │  │  CloudFront + S3      │
│  ┌────────────────┐  │  │  ┌─────────────────┐  │
│  │ POST /extract  │  │  │  │  viewer.html    │  │
│  │ POST /extract  │  │  │  │  docToFields.js │  │
│  │      Text      │  │  │  └─────────────────┘  │
│  │ GET /api/config│  │  │                       │
│  │ GET /api/key   │  │  │  CDN for fast         │
│  └────────────────┘  │  │  global delivery      │
└──────────────────────┘  └───────────────────────┘
```

## Prerequisites

1. **AWS Account** with appropriate permissions
2. **AWS CLI** installed and configured
3. **Node.js 20.x** or later
4. **npm** or **yarn**

### Choose Your Deployment Method

You can use either:
- **AWS SAM** (Serverless Application Model) - Recommended
- **Serverless Framework** - Alternative option

---

## Option 1: Deploy with AWS SAM (Recommended)

### 1. Install AWS SAM CLI

```bash
# macOS
brew install aws-sam-cli

# Windows (via Chocolatey)
choco install aws-sam-cli

# Linux
pip install aws-sam-cli
```

### 2. Create .env file

```bash
cp env.example .env
# Edit .env with your API keys
```

### 3. Build the application

```bash
sam build
```

### 4. Deploy to AWS

```bash
# First deployment (guided)
sam deploy --guided

# Follow the prompts:
# - Stack Name: ai-pdf-extractor
# - AWS Region: us-east-1 (or your preferred region)
# - Confirm changes: Y
# - Allow SAM CLI IAM role creation: Y
# - Save arguments to config: Y
```

### 5. Get your endpoints

After deployment, SAM will output:
- **APIEndpoint**: Your Lambda API URL
- **CloudFrontURL**: CDN URL for static files
- **ViewerURL**: Direct URL to viewer.html

### 6. Upload static files to S3

```bash
# Get the bucket name from SAM output
BUCKET_NAME=$(aws cloudformation describe-stacks \
  --stack-name ai-pdf-extractor \
  --query 'Stacks[0].Outputs[?OutputKey==`StaticFilesBucketName`].OutputValue' \
  --output text)

# Upload files
./deploy-static-files.sh $BUCKET_NAME
```

### 7. Update environment variables (optional)

If you want to update API keys later:

```bash
aws lambda update-function-configuration \
  --function-name ai-pdf-extractor-PDFExtractorFunction-xxx \
  --environment Variables="{OPENAI_API_KEY=sk-your-new-key}"
```

---

## Option 2: Deploy with Serverless Framework

### 1. Install Serverless Framework

```bash
npm install -g serverless
```

### 2. Install dependencies

```bash
npm install
npm install --save-dev serverless-offline
```

### 3. Deploy to AWS

```bash
# Deploy to AWS
serverless deploy

# Or deploy to a specific stage/region
serverless deploy --stage prod --region us-west-2
```

### 4. Create S3 bucket for static files

```bash
# Create bucket
aws s3 mb s3://your-pdf-extractor-static-files

# Enable public access
aws s3api put-public-access-block \
  --bucket your-pdf-extractor-static-files \
  --public-access-block-configuration \
  "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false"

# Upload static files
./deploy-static-files.sh your-pdf-extractor-static-files
```

### 5. (Optional) Set up CloudFront

Create a CloudFront distribution pointing to your S3 bucket for better performance and custom domain support.

---

## Configuration

### Environment Variables

Set these in AWS Lambda console or via deployment:

| Variable | Description | Default |
|----------|-------------|---------|
| `AI_PROVIDER` | AI provider: `openai` or `azure` | `openai` |
| `DEFAULT_MODEL` | Default model to use | `gpt-4o` |
| `OPENAI_API_KEY` | OpenAI API key | (required if using OpenAI) |
| `AZURE_OPENAI_API_KEY` | Azure OpenAI API key | (required if using Azure) |
| `AZURE_OPENAI_ENDPOINT` | Azure endpoint URL | (required if using Azure) |
| `AZURE_OPENAI_DEPLOYMENT` | Azure deployment name | (required if using Azure) |
| `AZURE_OPENAI_API_VERSION` | Azure API version | `2024-02-15-preview` |

### Update Environment Variables

**Via AWS Console:**
1. Go to Lambda → Functions → your-function
2. Configuration → Environment variables
3. Edit and save

**Via AWS CLI:**
```bash
aws lambda update-function-configuration \
  --function-name your-function-name \
  --environment Variables="{OPENAI_API_KEY=sk-xxx,DEFAULT_MODEL=gpt-4o}"
```

---

## Using in Your Application

### 1. Include the library

```html
<!-- From your CloudFront CDN -->
<script src="https://your-cloudfront-domain/docToFields.js"></script>
```

### 2. Initialize with your endpoints

```javascript
const dtf = new DocsToFields({
    authKey: 'sk-your-openai-key',
    url: 'https://your-api-gateway-url.execute-api.us-east-1.amazonaws.com',
    viewerUrl: 'https://your-cloudfront-domain/viewer.html',
    model: 'openai_gpt-4o'
});

// Add fields
dtf.addField({ name: 'InvoiceNumber', description: 'Invoice number' });
dtf.addField({ name: 'TotalAmount', description: 'Total amount' });

// Extract from PDF
await dtf.fileExtractText(pdfFile);
const results = await dtf.getFields();

console.log(results);
```

---

## Salesforce Integration

### Option 1: Lightning Web Component (LWC)

```javascript
// pdfExtractor.js
import { LightningElement, track } from 'lwc';
import { loadScript } from 'lightning/platformResourceLoader';

export default class PdfExtractor extends LightningElement {
    @track extractedData = {};
    
    async connectedCallback() {
        // Load library from static resource or CDN
        await loadScript(this, 'https://your-cloudfront-domain/docToFields.js');
        this.initExtractor();
    }
    
    initExtractor() {
        this.dtf = new DocsToFields({
            authKey: 'sk-xxx',  // Or retrieve from Custom Settings
            url: 'https://your-api-gateway-url.amazonaws.com',
            viewerUrl: 'https://your-cloudfront-domain/viewer.html',
            model: 'openai_gpt-4o',
            viewerCallback: (result) => {
                this.extractedData = result.fields;
                this.handleExtractedData(result.fields);
            }
        });
        
        // Configure fields
        this.dtf.addField({ name: 'InvoiceNumber', description: 'Invoice number' });
        // ... more fields
    }
    
    handleFileChange(event) {
        const file = event.target.files[0];
        this.extractFromPdf(file);
    }
    
    async extractFromPdf(file) {
        await this.dtf.fileExtractText(file);
        await this.dtf.getFields();
        // Results will come via viewerCallback
    }
    
    handleExtractedData(fields) {
        // Update Salesforce records
        // Call Apex methods to save data
        console.log('Extracted fields:', fields);
    }
}
```

### Option 2: Visualforce Page

```html
<apex:page>
    <script src="https://your-cloudfront-domain/docToFields.js"></script>
    <script>
        const dtf = new DocsToFields({
            authKey: '{!$Setup.OpenAI_Settings__c.API_Key__c}',
            url: 'https://your-api-gateway-url.amazonaws.com',
            viewerUrl: 'https://your-cloudfront-domain/viewer.html',
            viewerCallback: function(result) {
                console.log('Extracted:', result.fields);
                // Save to Salesforce via Apex
            }
        });
    </script>
</apex:page>
```

---

## Cost Estimation

### AWS Costs (Monthly)

**Lambda:**
- Free tier: 1M requests, 400K GB-seconds
- After free tier: ~$0.20 per 1M requests
- Memory: $0.0000166667 per GB-second

**API Gateway:**
- Free tier: 1M requests
- After free tier: $1.00 per 1M requests

**S3:**
- Storage: $0.023 per GB
- Requests: $0.0004 per 1K GET requests

**CloudFront:**
- Data transfer: $0.085 per GB (first 10 TB)

**Example (10K extractions/month):**
- Lambda: ~$2
- API Gateway: $0.10
- S3: $0.50
- CloudFront: $1
- **Total: ~$3.60/month**

### OpenAI Costs

- GPT-4o: $0.005/1K input tokens, $0.015/1K output tokens
- Average extraction: ~$0.05-0.15 per document
- 10K documents: ~$500-1,500/month

**Total estimated cost: ~$504-1,504/month for 10K extractions**

---

## Monitoring

### CloudWatch Logs

```bash
# View logs
aws logs tail /aws/lambda/ai-pdf-extractor-PDFExtractorFunction --follow

# Get error logs
aws logs filter-pattern /aws/lambda/ai-pdf-extractor-PDFExtractorFunction --filter-pattern "ERROR"
```

### CloudWatch Metrics

- Lambda Invocations
- Lambda Duration
- Lambda Errors
- API Gateway 4XX/5XX errors

### Set up Alarms

```bash
# Create alarm for Lambda errors
aws cloudwatch put-metric-alarm \
  --alarm-name pdf-extractor-errors \
  --alarm-description "Alert on Lambda errors" \
  --metric-name Errors \
  --namespace AWS/Lambda \
  --statistic Sum \
  --period 300 \
  --threshold 10 \
  --comparison-operator GreaterThanThreshold
```

---

## Troubleshooting

### Cold Start Issues

**Problem:** First request is slow (5-10 seconds)

**Solutions:**
1. Enable **Provisioned Concurrency** (keeps Lambda warm)
   ```bash
   aws lambda put-provisioned-concurrency-config \
     --function-name your-function \
     --provisioned-concurrent-executions 1
   ```

2. Or accept cold starts (they're rare with regular traffic)

### Timeout Errors

**Problem:** Lambda times out during extraction

**Solutions:**
1. Increase timeout (default: 300s / 5 min is usually enough)
2. Increase memory (more memory = faster processing)

### CORS Errors

**Problem:** Browser blocks requests from Salesforce

**Solutions:**
1. Update API Gateway CORS settings to allow your Salesforce domain
2. Update `serverless.yml` or `template.yaml` with specific origins:
   ```yaml
   allowedOrigins:
     - https://your-org.lightning.force.com
   ```

### Large PDF Files

**Problem:** Lambda payload limit (6MB for sync requests)

**Solutions:**
1. Use S3 upload for large files
2. Split into chunks
3. Use Step Functions for long-running tasks

---

## Security Best Practices

### 1. API Key Management

**Don't expose API keys in client code!**

Options:
- Store in AWS Secrets Manager
- Use API Gateway API Keys
- Implement custom authentication

### 2. CORS Configuration

In production, restrict origins:

```yaml
allowedOrigins:
  - https://your-domain.com
  - https://your-org.lightning.force.com
```

### 3. Rate Limiting

Add API Gateway usage plans:

```bash
aws apigateway create-usage-plan \
  --name pdf-extractor-plan \
  --throttle burstLimit=100,rateLimit=50
```

### 4. Encryption

- Enable S3 encryption
- Use HTTPS only
- Encrypt environment variables

---

## Updating the Application

### Update Lambda Code

**SAM:**
```bash
sam build
sam deploy
```

**Serverless:**
```bash
serverless deploy
```

### Update Static Files

```bash
./deploy-static-files.sh <bucket-name>
```

### Rollback

**SAM:**
```bash
aws cloudformation delete-stack --stack-name ai-pdf-extractor
# Then redeploy previous version
```

**Serverless:**
```bash
serverless rollback --timestamp TIMESTAMP
```

---

## Clean Up / Delete Resources

### SAM

```bash
sam delete
```

### Serverless

```bash
serverless remove
```

### Manual Cleanup

```bash
# Delete S3 bucket and contents
aws s3 rb s3://your-bucket-name --force

# Delete CloudFormation stack
aws cloudformation delete-stack --stack-name ai-pdf-extractor
```

---

## Next Steps

1. ✅ Deploy to AWS
2. ✅ Test with sample PDF
3. ✅ Integrate into Salesforce
4. ✅ Set up monitoring
5. ✅ Configure production CORS
6. ✅ Set up custom domain (optional)
7. ✅ Enable API authentication

---

## Support

For issues:
1. Check CloudWatch Logs
2. Review API Gateway metrics
3. Test endpoints with Postman/curl
4. Check CORS configuration

---

## Additional Resources

- [AWS SAM Documentation](https://docs.aws.amazon.com/serverless-application-model/)
- [Serverless Framework Docs](https://www.serverless.com/framework/docs)
- [API Gateway CORS](https://docs.aws.amazon.com/apigateway/latest/developerguide/how-to-cors.html)
- [Lambda Best Practices](https://docs.aws.amazon.com/lambda/latest/dg/best-practices.html)


