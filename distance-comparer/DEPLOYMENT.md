# Azure Static Web Apps Deployment Guide

## Prerequisites
- Azure account (free tier available)
- GitHub repository (or Azure DevOps)
- Azure CLI (optional, for command-line deployment)

## Option 1: Deploy via Azure Portal (Easiest)

### Step 1: Create Static Web App
1. Go to [Azure Portal](https://portal.azure.com)
2. Click **Create a resource** → Search for **Static Web App**
3. Click **Create**

### Step 2: Configure
Fill in the form:
- **Subscription**: Select your subscription
- **Resource Group**: Create new or use existing
- **Name**: `distance-comparer` (or your preferred name)
- **Plan type**: **Free** (perfect for this app)
- **Region**: Choose closest to your users
- **Deployment source**: **GitHub**

### Step 3: Connect GitHub
1. Click **Sign in with GitHub** and authorize Azure
2. Select:
   - **Organization**: Your GitHub username/org
   - **Repository**: Your repository name
   - **Branch**: `main` (or your default branch)

### Step 4: Build Details
- **Build Presets**: **Custom**
- **App location**: `/` (if package.json is in repo root)
- **Output location**: `dist`
- Leave API location empty

### Step 5: Deploy
1. Click **Review + create**
2. Click **Create**
3. Wait 2-3 minutes for deployment
4. Click **Go to resource** → Copy the URL

**Done!** Every push to `main` will auto-deploy.

---

## Option 2: Deploy via Azure CLI

### Prerequisites
Install Azure CLI: `winget install Microsoft.AzureCLI`

### Steps
```powershell
# Login to Azure
az login

# Create resource group (if needed)
az group create --name distance-comparer-rg --location centralus

# Create static web app with GitHub integration
az staticwebapp create \
  --name distance-comparer \
  --resource-group distance-comparer-rg \
  --source https://github.com/YOUR-USERNAME/YOUR-REPO \
  --location "Central US" \
  --branch main \
  --app-location "/" \
  --output-location "dist" \
  --login-with-github
```

---

## Option 3: Manual Upload (No Git Required)

### Step 1: Build locally
```powershell
npm install
npm run build
```

### Step 2: Install SWA CLI
```powershell
npm install -g @azure/static-web-apps-cli
```

### Step 3: Deploy
```powershell
# Login
az login

# Deploy (follow prompts to create resource)
swa deploy ./dist --deployment-token YOUR_TOKEN
```

---

## GitHub Actions Setup

The workflow file is already created at `.github/workflows/azure-static-web-apps.yml`

### Configure Secret
After creating the Static Web App in Azure:

1. In Azure Portal, go to your Static Web App resource
2. Click **Manage deployment token** → Copy the token
3. In GitHub, go to **Settings** → **Secrets and variables** → **Actions**
4. Click **New repository secret**
5. Name: `AZURE_STATIC_WEB_APPS_API_TOKEN`
6. Paste the token
7. Click **Add secret**

Push to `main` branch to trigger automatic deployment.

---

## Configuration Files

### `staticwebapp.config.json`
This file configures:
- **SPA routing**: All routes redirect to `index.html`
- **Cache headers**: Optimized for static assets
- **MIME types**: Proper font and file handling

### Build Settings
From `package.json`:
- **Build command**: `npm run build` (runs `vue-tsc -b && vite build`)
- **Output directory**: `dist/`
- **Framework**: Vue 3 + Vite

---

## Post-Deployment

### Custom Domain (Optional)
1. In Azure Portal → Your Static Web App → **Custom domains**
2. Click **+ Add**
3. Enter your domain and follow DNS setup instructions

### Environment Variables (If Needed)
1. In Azure Portal → Your Static Web App → **Configuration**
2. Add environment variables as key-value pairs
3. They'll be available during build time

### Monitoring
- **Usage**: Azure Portal → Your Static Web App → **Metrics**
- **Logs**: Azure Portal → Your Static Web App → **Log Stream**

---

## Costs

**Free Tier includes:**
- 100 GB bandwidth/month
- 0.5 GB storage
- Custom domains & SSL
- Global CDN

This is more than enough for most projects. Overages are ~$0.20/GB.

---

## Troubleshooting

### Build fails
- Check build logs in GitHub Actions tab
- Verify `app_location` and `output_location` in workflow file
- Ensure `npm run build` works locally

### 404 errors
- `staticwebapp.config.json` handles SPA routing
- Verify file is in root of `dist/` folder after build

### Assets not loading
- Check CORS settings if loading external resources
- Verify asset paths are relative in your app

---

## Local Development

Run locally before deploying:
```powershell
npm install
npm run dev
```

Preview production build:
```powershell
npm run build
npm run preview
```

Test with SWA CLI:
```powershell
npm install -g @azure/static-web-apps-cli
npm run build
swa start dist
```
