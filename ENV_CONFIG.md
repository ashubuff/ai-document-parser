# Environment Configuration Guide

## 📁 Configuration File: `.env`

All API keys and endpoints are now stored securely in the `.env` file!

---

## 🎯 Current Configuration

Your `.env` file is located at:
```
/Users/ashutoshbelwal/Documents/vsCode/AIPdfExtrator/.env
```

### What's in the .env file:

```env
# Server Configuration
PORT=3000

# AI Provider Configuration
AI_PROVIDER=azure                    # or 'openai'

# OpenAI Configuration (if using standard OpenAI)
OPENAI_API_KEY=your_openai_api_key_here

# Azure OpenAI Configuration (if using Azure)
AZURE_OPENAI_API_KEY=your_azure_key
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com
AZURE_OPENAI_DEPLOYMENT=gpt-4o
AZURE_OPENAI_API_VERSION=2024-02-15-preview

# Model Configuration
DEFAULT_MODEL=gpt-4o
```

---

## ⚙️ How It Works

### 1. **Server Reads .env File**
When you start the server with `npm start`, it automatically loads all environment variables from the `.env` file.

### 2. **Frontend Fetches Configuration**
When you open `demo.html`, it makes API calls to:
- `GET /api/config` - Gets provider, model, and Azure settings
- `GET /api/key` - Gets the appropriate API key

### 3. **Automatic Provider Selection**
Based on `AI_PROVIDER` setting:
- **`azure`**: Uses Azure OpenAI with your Azure credentials
- **`openai`**: Uses standard OpenAI with your OpenAI API key

---

## 🔧 Quick Setup

### For Azure OpenAI (Recommended):

1. **Edit `.env` file**:
   ```env
   AI_PROVIDER=azure
   AZURE_OPENAI_API_KEY=your_key_here
   AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com
   AZURE_OPENAI_DEPLOYMENT=gpt-4o
   ```

2. **Restart server**:
   ```bash
   npm start
   ```

3. **Open demo page**:
   ```
   http://localhost:3000/demo.html
   ```

4. **Look for confirmation**:
   ```
   ✓ Configuration loaded: Using Azure OpenAI
   ```

### For Standard OpenAI:

1. **Edit `.env` file**:
   ```env
   AI_PROVIDER=openai
   OPENAI_API_KEY=sk-your-key-here
   ```

2. **Restart server** and test!

---

## 📍 Where to Find Your Azure Credentials

### Azure API Key:
1. Go to [Azure Portal](https://portal.azure.com)
2. Open your Azure OpenAI resource
3. Click **Keys and Endpoint** (left menu)
4. Copy **KEY 1**

### Azure Endpoint:
Same location as API Key, copy the **Endpoint** URL.
Example: `https://myapp-openai.openai.azure.com`

### Azure Deployment Name:
1. In your Azure OpenAI resource
2. Click **Model deployments**
3. Copy your deployment name (e.g., `gpt-4o`)

---

## 🔄 Switching Providers

### Switch to Azure OpenAI:
```bash
# Edit .env file
AI_PROVIDER=azure

# Make sure Azure credentials are set
AZURE_OPENAI_API_KEY=...
AZURE_OPENAI_ENDPOINT=...
AZURE_OPENAI_DEPLOYMENT=...

# Restart
npm start
```

### Switch to Standard OpenAI:
```bash
# Edit .env file
AI_PROVIDER=openai

# Make sure OpenAI key is set
OPENAI_API_KEY=sk-...

# Restart
npm start
```

---

## ✅ Testing Configuration

### Test 1: Check API Endpoints
```bash
# Test config endpoint
curl http://localhost:3000/api/config

# Expected response:
{
  "provider": "azure",
  "model": "gpt-4o",
  "azureEndpoint": "https://...",
  "azureDeployment": "gpt-4o",
  "azureApiVersion": "2024-02-15-preview"
}
```

### Test 2: Check API Key
```bash
curl http://localhost:3000/api/key

# Expected response:
{
  "apiKey": "your_key_here",
  "provider": "azure"
}
```

### Test 3: Open Demo Page
1. Go to: `http://localhost:3000/demo.html`
2. Look for status message at top
3. Should say: "✓ Configuration loaded: Using Azure OpenAI"

---

## 🚨 Common Issues

### Issue: "Configuration not loaded"
**Fix**: 
- Make sure server is running: `npm start`
- Refresh the browser page
- Check browser console for errors

### Issue: "Please configure your API key"
**Fix**:
- Edit `.env` file
- Set `AZURE_OPENAI_API_KEY` (for Azure) or `OPENAI_API_KEY` (for OpenAI)
- Restart server

### Issue: "Azure OpenAI endpoint not configured"
**Fix**:
- Edit `.env` file
- Set `AZURE_OPENAI_ENDPOINT` to your Azure resource URL
- Restart server

### Issue: "401 Unauthorized"
**Fix**:
- Check API key is correct
- Make sure no extra spaces in `.env` file
- Verify key hasn't expired

---

## 🔒 Security Notes

### ✅ Good Practices:
- `.env` file is **NOT** committed to git (it's in `.gitignore`)
- API keys stay on the server, not in HTML/JavaScript
- Configuration loaded via secure API endpoints

### ❌ Don't Do This:
- Don't share your `.env` file
- Don't commit `.env` to version control
- Don't hardcode keys in HTML/JavaScript files

---

## 📊 Current Status

Based on your `.env` file:

```json
{
  "provider": "azure",
  "model": "gpt-4o",
  "azureEndpoint": "https://your-resource.openai.azure.com",
  "azureDeployment": "gpt-4o",
  "azureApiVersion": "2024-02-15-preview"
}
```

✅ Server is configured for **Azure OpenAI**
✅ Configuration is loaded from `.env` file
✅ API endpoints are working
✅ Ready to extract deposition data!

---

## 📚 Related Documentation

- **[AZURE_SETUP.md](./AZURE_SETUP.md)** - Complete Azure OpenAI setup guide
- **[README.md](./README.md)** - Full project documentation
- **[QUICKSTART.md](./QUICKSTART.md)** - Quick start guide

---

## 🎯 Next Steps

1. ✅ `.env` file created with your credentials
2. ✅ Server loads configuration automatically
3. ✅ Frontend fetches configuration from server
4. ✅ No hardcoded keys in the code!

**You're all set!** Just edit `.env` and restart the server anytime you need to change configuration. 🚀

