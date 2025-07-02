# Deploying DocsDeploy to Azure App Service

Azure App Service provides a fully managed platform for hosting web applications with built-in scaling, security, and DevOps capabilities.

## Prerequisites

- Azure account with an active subscription
- Azure CLI installed locally (optional but recommended)
- DocsDeploy project ready for deployment
- Git repository (GitHub, Azure DevOps, or Bitbucket)

## Step 1: Create Azure App Service

### Using Azure Portal

1. **Navigate to Azure Portal**
   - Go to [portal.azure.com](https://portal.azure.com)
   - Sign in with your Azure account

2. **Create App Service**
   - Click "Create a resource"
   - Search for "App Service"
   - Click "Create"

3. **Configure App Service**
   ```
   Subscription: [Your subscription]
   Resource Group: [Create new or select existing]
   Name: docsdeploy-[unique-suffix]
   Publish: Code
   Runtime stack: Node 18 LTS
   Operating System: Linux
   Region: [Choose closest to your users]
   ```

4. **Choose Pricing Plan**
   - For development: F1 (Free)
   - For production: B1 (Basic) or higher
   - Click "Review + create"

### Using Azure CLI

```bash
# Login to Azure
az login

# Create resource group
az group create --name docsdeploy-rg --location eastus

# Create App Service plan
az appservice plan create \
  --name docsdeploy-plan \
  --resource-group docsdeploy-rg \
  --sku B1 \
  --is-linux

# Create App Service
az webapp create \
  --name docsdeploy-[unique-suffix] \
  --resource-group docsdeploy-rg \
  --plan docsdeploy-plan \
  --runtime "NODE|18-lts"
```

## Step 2: Configure Environment Variables

### Using Azure Portal

1. **Navigate to App Service**
   - Go to your App Service in Azure Portal
   - Click "Configuration" in the left menu
   - Click "Application settings"

2. **Add Environment Variables**
   Click "New application setting" for each variable:

   ```
   Name: GITHUB_REPO_OWNER
   Value: your-github-username
   
   Name: GITHUB_REPO_NAME
   Value: your-repository-name
   
   Name: GITHUB_DOCS_PATH
   Value: docs
   
   Name: GITHUB_TOKEN
   Value: ghp_your_github_token_here
   
   Name: PORT
   Value: 8080
   
   Name: NODE_ENV
   Value: production
   ```

3. **Save Configuration**
   - Click "Save" at the top
   - Click "Continue" to restart the app

### Using Azure CLI

```bash
# Set application settings
az webapp config appsettings set \
  --name docsdeploy-[unique-suffix] \
  --resource-group docsdeploy-rg \
  --settings \
    GITHUB_REPO_OWNER="your-github-username" \
    GITHUB_REPO_NAME="your-repository-name" \
    GITHUB_DOCS_PATH="docs" \
    GITHUB_TOKEN="ghp_your_github_token_here" \
    PORT="8080" \
    NODE_ENV="production"
```

## Step 3: Prepare Your Application

### Update package.json

Ensure your `package.json` has the correct start script:

```json
{
  "scripts": {
    "start": "node dist/server.js",
    "build": "rm -rf dist && tsc && cp -r public dist/",
    "postinstall": "npm run build"
  },
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=8.0.0"
  }
}
```

### Create .deployment file

Create a `.deployment` file in your project root:

```ini
[config]
command = deploy.sh
```

### Create deploy.sh script

Create a `deploy.sh` file in your project root:

```bash
#!/bin/bash

# Exit on any error
set -e

echo "Starting deployment..."

# Install dependencies
echo "Installing dependencies..."
npm install --production=false

# Build the application
echo "Building application..."
npm run build

# Install production dependencies only
echo "Installing production dependencies..."
rm -rf node_modules
npm install --production

echo "Deployment completed successfully!"
```

Make it executable:
```bash
chmod +x deploy.sh
```

## Step 4: Set Up Deployment

### Option A: GitHub Actions Deployment

Create `.github/workflows/deploy-azure-app-service.yml`:

```yaml
name: Deploy to Azure App Service

on:
  push:
    branches: [ main ]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build application
      run: npm run build
    
    - name: Deploy to Azure App Service
      uses: azure/webapps-deploy@v2
      with:
        app-name: docsdeploy-[unique-suffix]
        publish-profile: ${{ secrets.AZURE_WEBAPP_PUBLISH_PROFILE }}
        package: .
```

### Get Publish Profile

1. **Download Publish Profile**
   - In Azure Portal, go to your App Service
   - Click "Get publish profile" in the toolbar
   - Save the downloaded file

2. **Add to GitHub Secrets**
   - In your GitHub repository, go to Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `AZURE_WEBAPP_PUBLISH_PROFILE`
   - Value: Paste the entire content of the publish profile file

### Option B: Azure DevOps Deployment

1. **Create Azure DevOps Project**
   - Go to [dev.azure.com](https://dev.azure.com)
   - Create a new project

2. **Create Build Pipeline**
   Create `azure-pipelines.yml`:

```yaml
trigger:
- main

pool:
  vmImage: 'ubuntu-latest'

variables:
  azureSubscription: 'your-service-connection'
  webAppName: 'docsdeploy-[unique-suffix]'

stages:
- stage: Build
  displayName: Build stage
  jobs:
  - job: Build
    displayName: Build
    steps:
    - task: NodeTool@0
      inputs:
        versionSpec: '18.x'
      displayName: 'Install Node.js'

    - script: |
        npm install
        npm run build
      displayName: 'npm install and build'

    - task: ArchiveFiles@2
      displayName: 'Archive files'
      inputs:
        rootFolderOrFile: '$(System.DefaultWorkingDirectory)'
        includeRootFolder: false
        archiveType: zip
        archiveFile: $(Build.ArtifactStagingDirectory)/$(Build.BuildId).zip
        replaceExistingArchive: true

    - upload: $(Build.ArtifactStagingDirectory)/$(Build.BuildId).zip
      artifact: drop

- stage: Deploy
  displayName: Deploy stage
  dependsOn: Build
  condition: succeeded()
  jobs:
  - deployment: Deploy
    displayName: Deploy
    environment: 'production'
    strategy:
      runOnce:
        deploy:
          steps:
          - task: AzureWebApp@1
            displayName: 'Azure Web App Deploy'
            inputs:
              azureSubscription: $(azureSubscription)
              appType: 'webAppLinux'
              appName: $(webAppName)
              package: $(Pipeline.Workspace)/drop/$(Build.BuildId).zip
```

### Option C: Direct Git Deployment

1. **Enable Git Deployment**
   ```bash
   # Configure deployment source
   az webapp deployment source config \
     --name docsdeploy-[unique-suffix] \
     --resource-group docsdeploy-rg \
     --repo-url https://github.com/your-username/your-repo \
     --branch main \
     --manual-integration
   ```

2. **Set Up Deployment Credentials**
   ```bash
   # Set deployment credentials
   az webapp deployment user set \
     --user-name your-deployment-username \
     --password your-secure-password
   ```

## Step 5: Configure Custom Domain (Optional)

### Add Custom Domain

1. **In Azure Portal**
   - Go to your App Service
   - Click "Custom domains" in the left menu
   - Click "Add custom domain"

2. **Configure DNS**
   - Add CNAME record: `docs.yourdomain.com` → `docsdeploy-[unique-suffix].azurewebsites.net`
   - Or add A record pointing to App Service IP

3. **Enable HTTPS**
   - After domain verification, click "Add binding"
   - Select "SNI SSL" and choose/create certificate
   - Azure can provide free managed certificates

### Using Azure CLI

```bash
# Add custom domain
az webapp config hostname add \
  --webapp-name docsdeploy-[unique-suffix] \
  --resource-group docsdeploy-rg \
  --hostname docs.yourdomain.com

# Create managed certificate
az webapp config ssl create \
  --resource-group docsdeploy-rg \
  --name docsdeploy-[unique-suffix] \
  --hostname docs.yourdomain.com

# Bind certificate
az webapp config ssl bind \
  --resource-group docsdeploy-rg \
  --name docsdeploy-[unique-suffix] \
  --certificate-thumbprint [certificate-thumbprint] \
  --ssl-type SNI
```

## Step 6: Configure Scaling and Performance

### Auto-scaling

1. **Enable Auto-scaling**
   ```bash
   # Create auto-scale setting
   az monitor autoscale create \
     --resource-group docsdeploy-rg \
     --resource docsdeploy-[unique-suffix] \
     --resource-type Microsoft.Web/sites \
     --name docsdeploy-autoscale \
     --min-count 1 \
     --max-count 3 \
     --count 1
   ```

2. **Add Scale Rules**
   ```bash
   # Scale out when CPU > 70%
   az monitor autoscale rule create \
     --resource-group docsdeploy-rg \
     --autoscale-name docsdeploy-autoscale \
     --condition "Percentage CPU > 70 avg 5m" \
     --scale out 1

   # Scale in when CPU < 30%
   az monitor autoscale rule create \
     --resource-group docsdeploy-rg \
     --autoscale-name docsdeploy-autoscale \
     --condition "Percentage CPU < 30 avg 5m" \
     --scale in 1
   ```

### Application Insights

1. **Enable Application Insights**
   ```bash
   # Create Application Insights
   az extension add --name application-insights
   az monitor app-insights component create \
     --app docsdeploy-insights \
     --location eastus \
     --resource-group docsdeploy-rg

   # Link to App Service
   az webapp config appsettings set \
     --name docsdeploy-[unique-suffix] \
     --resource-group docsdeploy-rg \
     --settings APPINSIGHTS_INSTRUMENTATIONKEY="[instrumentation-key]"
   ```

## Security Best Practices

### 1. Environment Variables Security

- Store sensitive values in Azure Key Vault
- Use managed identities for Azure resource access
- Rotate GitHub tokens regularly

### 2. Network Security

```bash
# Restrict access to specific IPs (optional)
az webapp config access-restriction add \
  --resource-group docsdeploy-rg \
  --name docsdeploy-[unique-suffix] \
  --rule-name "Office IP" \
  --action Allow \
  --ip-address 203.0.113.0/24 \
  --priority 100
```

### 3. HTTPS Enforcement

```bash
# Force HTTPS
az webapp update \
  --resource-group docsdeploy-rg \
  --name docsdeploy-[unique-suffix] \
  --https-only true
```

## Monitoring and Logging

### 1. Enable Diagnostic Logging

```bash
# Enable application logging
az webapp log config \
  --name docsdeploy-[unique-suffix] \
  --resource-group docsdeploy-rg \
  --application-logging filesystem \
  --level information

# Enable web server logging
az webapp log config \
  --name docsdeploy-[unique-suffix] \
  --resource-group docsdeploy-rg \
  --web-server-logging filesystem
```

### 2. View Logs

```bash
# Stream logs
az webapp log tail \
  --name docsdeploy-[unique-suffix] \
  --resource-group docsdeploy-rg

# Download logs
az webapp log download \
  --name docsdeploy-[unique-suffix] \
  --resource-group docsdeploy-rg \
  --log-file logs.zip
```

## Troubleshooting

### Common Issues

1. **Application Won't Start**
   - Check application logs in Azure Portal
   - Verify Node.js version compatibility
   - Ensure all environment variables are set

2. **Build Failures**
   - Check deployment logs
   - Verify package.json scripts
   - Ensure all dependencies are listed

3. **GitHub API Issues**
   - Verify GitHub token permissions
   - Check rate limiting
   - Ensure repository and docs path are correct

### Debugging Commands

```bash
# Check app status
az webapp show \
  --name docsdeploy-[unique-suffix] \
  --resource-group docsdeploy-rg \
  --query state

# Restart app
az webapp restart \
  --name docsdeploy-[unique-suffix] \
  --resource-group docsdeploy-rg

# SSH into container (Linux apps)
az webapp ssh \
  --name docsdeploy-[unique-suffix] \
  --resource-group docsdeploy-rg
```

## Cost Optimization

1. **Choose Appropriate Tier**
   - Use F1 (Free) for development
   - Use B1 (Basic) for small production sites
   - Scale up only when needed

2. **Monitor Usage**
   - Set up billing alerts
   - Review Azure Advisor recommendations
   - Use Azure Cost Management

Your DocsDeploy application is now running on Azure App Service with enterprise-grade security, scaling, and monitoring capabilities!