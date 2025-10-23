# Azure OpenAI Setup Guide

This guide will help you configure the project to use Azure OpenAI instead of standard OpenAI.

## 🔑 Why Azure OpenAI?

- **No Rate Limits**: Avoid quota exceeded errors
- **Enterprise Ready**: Better for production workloads
- **Data Privacy**: Keep your data in your Azure region
- **Cost Control**: Better billing management

---

## 📋 Prerequisites

1. Azure subscription
2. Access to Azure OpenAI Service
3. A deployed GPT model in Azure

---

## 🚀 Step-by-Step Setup

### Step 1: Create Azure OpenAI Resource

1. Go to [Azure Portal](https://portal.azure.com)
2. Click **Create a resource**
3. Search for **Azure OpenAI**
4. Click **Create**
5. Fill in:
   - **Subscription**: Your Azure subscription
   - **Resource group**: Create new or use existing
   - **Region**: Choose your region
   - **Name**: Your resource name (e.g., `myapp-openai`)
   - **Pricing tier**: Select appropriate tier

### Step 2: Deploy a Model

1. Go to your Azure OpenAI resource
2. Click **Model deployments** → **Create new deployment**
3. Select a model:
   - **GPT-4o** (Recommended) - Best performance
   - **GPT-4 Turbo** - Good balance
   - **GPT-3.5 Turbo** - Faster, cheaper
4. Give it a **Deployment name** (e.g., `gpt-4o`)
5. Click **Create**

### Step 3: Get Your Credentials

1. In your Azure OpenAI resource, go to **Keys and Endpoint**
2. Copy:
   - **KEY 1** (or KEY 2)
   - **Endpoint** URL
3. Note your **Deployment name** from Step 2

---

## ⚙️ Configuration

### Edit the `.env` file:

```env
# Server Configuration
PORT=3000

# AI Provider Configuration
AI_PROVIDER=azure

# Azure OpenAI Configuration
AZURE_OPENAI_API_KEY=your_key_here
AZURE_OPENAI_ENDPOINT=https://your-resource-name.openai.azure.com
AZURE_OPENAI_DEPLOYMENT=gpt-4o
AZURE_OPENAI_API_VERSION=2024-02-15-preview

# Model Configuration
DEFAULT_MODEL=gpt-4o
```

### Configuration Breakdown:

| Variable | Description | Example |
|----------|-------------|---------|
| `AI_PROVIDER` | Set to `azure` for Azure OpenAI | `azure` |
| `AZURE_OPENAI_API_KEY` | Your Azure OpenAI API key | `44f6a269-7be7-43f9...` |
| `AZURE_OPENAI_ENDPOINT` | Your resource endpoint URL | `https://myapp-openai.openai.azure.com` |
| `AZURE_OPENAI_DEPLOYMENT` | Your deployment name | `gpt-4o` |
| `AZURE_OPENAI_API_VERSION` | API version (leave as is) | `2024-02-15-preview` |

---

## 🔄 Switching Between OpenAI and Azure

To switch back to standard OpenAI, just change in `.env`:

```env
AI_PROVIDER=openai
OPENAI_API_KEY=sk-your-openai-key-here
```

The application will automatically detect the provider and use the correct configuration!

---

## 🧪 Testing Your Configuration

1. **Start the server**:
   ```bash
   npm start
   ```

2. **Open the demo page**:
   ```
   http://localhost:3000/demo.html
   ```

3. **Check the status message**:
   - ✅ "Configuration loaded: Using Azure OpenAI" - Success!
   - ❌ Error message - Check your .env configuration

4. **Upload a PDF and test extraction**

---

## 🐛 Troubleshooting

### Error: "Configuration not loaded"
**Solution**: Make sure the server is running and refresh the page.

### Error: "Azure OpenAI endpoint not configured"
**Solution**: Check that `AZURE_OPENAI_ENDPOINT` is set in `.env`

### Error: "401 Unauthorized"
**Solution**: 
- Verify your API key is correct
- Check it hasn't expired
- Make sure you copied the full key

### Error: "404 Not Found"
**Solution**:
- Verify your endpoint URL is correct
- Check your deployment name matches exactly
- Ensure the model is deployed and running

### Error: "Resource not found"
**Solution**:
- Make sure your Azure OpenAI resource is active
- Check you're using the correct endpoint URL
- Verify the deployment exists

---

## 💰 Cost Comparison

### Standard OpenAI Pricing (as of 2024):
- GPT-4o: $0.005/1K input, $0.015/1K output tokens
- GPT-4 Turbo: $0.01/1K input, $0.03/1K output tokens

### Azure OpenAI Pricing:
- Similar pricing but with:
  - No rate limits (based on your quota)
  - Better cost control
  - Enterprise SLA
  - Regional data residency

---

## 📊 Example .env Configurations

### For Azure OpenAI (Recommended):
```env
AI_PROVIDER=azure
AZURE_OPENAI_API_KEY=44f6a269-7be7-43f9-a8c5-39f57ff151c5
AZURE_OPENAI_ENDPOINT=https://mycompany-openai.openai.azure.com
AZURE_OPENAI_DEPLOYMENT=gpt-4o
AZURE_OPENAI_API_VERSION=2024-02-15-preview
DEFAULT_MODEL=gpt-4o
```

### For Standard OpenAI:
```env
AI_PROVIDER=openai
OPENAI_API_KEY=sk-proj-...
DEFAULT_MODEL=gpt-4o
```

---

## 🔒 Security Best Practices

1. **Never commit `.env` file**
   - It's already in `.gitignore`
   - Keep your keys secret!

2. **Rotate keys regularly**
   - Azure Portal → Your Resource → Keys and Endpoint → Regenerate

3. **Use separate keys for dev/prod**
   - Create separate Azure resources for each environment

4. **Monitor usage**
   - Azure Portal → Cost Management
   - Set up budget alerts

---

## 📚 Additional Resources

- [Azure OpenAI Documentation](https://learn.microsoft.com/en-us/azure/ai-services/openai/)
- [Azure OpenAI Quickstart](https://learn.microsoft.com/en-us/azure/ai-services/openai/quickstart)
- [Azure Pricing Calculator](https://azure.microsoft.com/en-us/pricing/calculator/)
- [OpenAI Models Documentation](https://platform.openai.com/docs/models)

---

## ✅ Verification Checklist

Before going to production:

- [ ] Azure OpenAI resource created
- [ ] Model deployed (GPT-4o recommended)
- [ ] `.env` file configured with correct values
- [ ] API key is valid and active
- [ ] Tested with sample PDF document
- [ ] Error handling tested
- [ ] Cost monitoring set up in Azure
- [ ] Budget alerts configured

---

## 🎯 Next Steps

1. ✅ Configure `.env` with your Azure credentials
2. ✅ Restart the server: `npm start`
3. ✅ Test with demo page: `http://localhost:3000/demo.html`
4. ✅ Upload a deposition document
5. ✅ Verify extraction works correctly
6. ✅ Monitor costs in Azure Portal

**Your Azure OpenAI integration is ready!** 🚀

