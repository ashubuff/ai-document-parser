# Render.com Deployment Guide

This guide will help you deploy your AI PDF Extractor application to Render.com.

## ✅ Pre-Deployment Checklist

Your application is **already configured** for Render deployment:
- ✅ Uses `process.env.PORT` (Render sets this automatically)
- ✅ Has `npm start` script defined
- ✅ All dependencies in `package.json`
- ✅ Environment variables properly configured
- ✅ `.gitignore` excludes sensitive files

**No code changes needed!**

## 🚀 Deployment Methods

### Method 1: Deploy with render.yaml (Recommended)

This is the easiest method as the `render.yaml` file is already configured.

#### Step 1: Push to GitHub
```bash
# Initialize git if not already done
git init
git add .
git commit -m "Initial commit"

# Push to GitHub
git remote add origin https://github.com/yourusername/ai-pdf-extractor.git
git branch -M main
git push -u origin main
```

#### Step 2: Connect to Render
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Blueprint"**
3. Connect your GitHub repository
4. Render will automatically detect `render.yaml`
5. Click **"Apply"**

#### Step 3: Configure Environment Variables
Render will prompt you to set these variables:
- `AI_PROVIDER` - Set to `openai` or `azure`
- `OPENAI_API_KEY` - Your OpenAI API key (if using OpenAI)
- `AZURE_OPENAI_API_KEY` - Your Azure API key (if using Azure)
- `AZURE_OPENAI_ENDPOINT` - Your Azure endpoint (if using Azure)
- `AZURE_OPENAI_DEPLOYMENT` - Your deployment name (if using Azure)

#### Step 4: Deploy
Click **"Create Web Service"** and Render will:
- Install dependencies
- Start your application
- Provide a live URL (e.g., `https://ai-pdf-extractor.onrender.com`)

---

### Method 2: Manual Setup via Dashboard

If you prefer not to use the YAML file:

#### Step 1: Create New Web Service
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository

#### Step 2: Configure Service
Fill in these details:
- **Name**: `ai-pdf-extractor`
- **Region**: Choose closest to your users
- **Branch**: `main` (or your default branch)
- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`

#### Step 3: Add Environment Variables
Click **"Advanced"** → **"Add Environment Variable"** for each:

**For OpenAI:**
```
AI_PROVIDER=openai
OPENAI_API_KEY=your_openai_api_key_here
DEFAULT_MODEL=gpt-4o
```

**For Azure OpenAI:**
```
AI_PROVIDER=azure
AZURE_OPENAI_API_KEY=your_azure_api_key_here
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com
AZURE_OPENAI_DEPLOYMENT=gpt-4o
AZURE_OPENAI_API_VERSION=2024-02-15-preview
DEFAULT_MODEL=gpt-4o
```

#### Step 4: Deploy
Click **"Create Web Service"** and wait for deployment to complete.

---

## 🔧 Post-Deployment Configuration

### Access Your Application
Once deployed, Render provides a URL like:
```
https://ai-pdf-extractor.onrender.com
```

### Test the Deployment
1. Visit your Render URL
2. Navigate to `/demo.html`:
   ```
   https://ai-pdf-extractor.onrender.com/demo.html
   ```
3. Upload a PDF and test extraction

### Update Your Client Configuration
If you're using this server from other applications, update the `url` in your `DocsToFields` configuration:

```javascript
const docsToFields = new DocsToFields({
    authKey: 'your-api-key',
    url: 'https://ai-pdf-extractor.onrender.com',
    viewerUrl: 'https://ai-pdf-extractor.onrender.com/viewer',
    model: 'openai_gpt-4o'
});
```

---

## 🔄 Updating Your Deployment

### Automatic Deployments
Render automatically deploys when you push to your connected branch:

```bash
# Make changes
git add .
git commit -m "Update feature"
git push origin main

# Render will automatically deploy
```

### Manual Deployments
1. Go to your service in Render Dashboard
2. Click **"Manual Deploy"** → **"Deploy latest commit"**

---

## 🌍 Environment Variables Management

### View/Edit Variables
1. Go to your service in Render Dashboard
2. Click **"Environment"** tab
3. Add, edit, or delete variables
4. Click **"Save Changes"**

**Note:** Changing environment variables triggers a new deployment.

### Secure Variables
All environment variables in Render are:
- ✅ Encrypted at rest
- ✅ Not visible in logs
- ✅ Not included in builds
- ✅ Securely injected at runtime

---

## 📊 Monitoring & Logs

### View Logs
1. Go to your service in Render Dashboard
2. Click **"Logs"** tab
3. View real-time application logs

### Monitor Performance
- **Events** tab: Deployment history
- **Metrics** tab: CPU, memory, request metrics
- **Shell** tab: Access to service shell

---

## 💰 Pricing & Plans

### Free Tier
- ✅ 750 hours/month free compute
- ✅ Automatic sleep after 15 min inactivity
- ✅ Slower cold starts
- ⚠️ Sleeps when inactive (wakes on request)

**Perfect for:** Development, testing, demos

### Paid Plans (Starter: $7/month)
- ✅ No sleeping
- ✅ Faster cold starts
- ✅ More resources
- ✅ Custom domains

**Perfect for:** Production applications

---

## 🚨 Troubleshooting

### Issue: Build Failed
**Check:**
- All dependencies in `package.json`
- Node version compatibility
- Build logs for specific errors

**Fix:**
```bash
# Test locally first
npm install
npm start
```

### Issue: Application Crashes
**Check:**
- Environment variables are set correctly
- Logs tab for error messages
- API keys are valid

**Fix:**
1. Verify environment variables
2. Check logs for stack traces
3. Test API endpoints manually

### Issue: Cold Starts (Free Tier)
**Why:** Free tier services sleep after 15 minutes of inactivity

**Solutions:**
1. Upgrade to paid plan ($7/month)
2. Use a service like [UptimeRobot](https://uptimerobot.com/) to ping your app
3. Accept the ~30 second wake-up time

### Issue: CORS Errors
Your app already has CORS enabled. If you still see errors:
1. Check that requests use your Render URL
2. Verify CORS middleware in `server.js`
3. Check browser console for specific errors

---

## 🔒 Security Best Practices

### ✅ Do This:
- Store API keys in Render environment variables
- Use HTTPS (Render provides this automatically)
- Keep dependencies updated
- Monitor logs for suspicious activity

### ❌ Don't Do This:
- Don't commit `.env` file to Git
- Don't hardcode API keys in code
- Don't expose internal endpoints publicly

---

## 🎯 Quick Reference

### Service URLs
```
Production: https://your-service-name.onrender.com
Demo Page:  https://your-service-name.onrender.com/demo.html
Viewer:     https://your-service-name.onrender.com/viewer
API Config: https://your-service-name.onrender.com/api/config
```

### Important Commands
```bash
# Local testing
npm install
npm start

# Git deployment
git add .
git commit -m "message"
git push origin main
```

### Required Environment Variables
**Minimum (for OpenAI):**
- `AI_PROVIDER=openai`
- `OPENAI_API_KEY=your_key`

**Minimum (for Azure):**
- `AI_PROVIDER=azure`
- `AZURE_OPENAI_API_KEY=your_key`
- `AZURE_OPENAI_ENDPOINT=your_endpoint`
- `AZURE_OPENAI_DEPLOYMENT=your_deployment`

---

## 📚 Additional Resources

- [Render Documentation](https://render.com/docs)
- [Node.js on Render](https://render.com/docs/deploy-node-express-app)
- [Environment Variables](https://render.com/docs/environment-variables)
- [Custom Domains](https://render.com/docs/custom-domains)

---

## ✨ Success Checklist

Before going live:
- [ ] Application deploys successfully
- [ ] Environment variables configured
- [ ] Demo page loads correctly
- [ ] PDF upload works
- [ ] AI extraction functions properly
- [ ] Viewer window opens
- [ ] No errors in logs
- [ ] SSL certificate active (automatic)

---

## 🆘 Need Help?

### Render Support
- [Render Community](https://community.render.com/)
- [Render Status](https://status.render.com/)
- [Support Email](mailto:support@render.com)

### Application Issues
Check your application logs:
1. Render Dashboard → Your Service → Logs
2. Look for error messages
3. Check environment variable configuration

---

## 🎉 You're Ready!

Your application is fully configured for Render deployment. Just follow the steps above and you'll have your AI PDF Extractor live in minutes!

**Deployment Summary:**
1. ✅ Push code to GitHub
2. ✅ Connect repository to Render
3. ✅ Set environment variables
4. ✅ Deploy and test
5. ✅ Share your URL!

Happy deploying! 🚀

