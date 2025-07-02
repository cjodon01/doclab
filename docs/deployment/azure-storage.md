# Deploying DocsDeploy to Azure Storage Static Website

Azure Storage Static Website hosting provides a cost-effective way to host your DocsDeploy documentation site with global CDN distribution.

## Prerequisites

- Azure account with an active subscription
- Azure CLI installed locally (optional but recommended)
- DocsDeploy project built and ready for deployment

## Step 1: Create Azure Storage Account

### Using Azure Portal

1. **Navigate to Azure Portal**
   - Go to [portal.azure.com](https://portal.azure.com)
   - Sign in with your Azure account

2. **Create Storage Account**
   - Click "Create a resource"
   - Search for "Storage account"
   - Click "Create"

3. **Configure Storage Account**
   ```
   Subscription: [Your subscription]
   Resource Group: [Create new or select existing]
   Storage Account Name: docsdeploy[unique-suffix]
   Region: [Choose closest to your users]
   Performance: Standard
   Redundancy: LRS (Locally Redundant Storage)
   ```

4. **Review and Create**
   - Click "Review + create"
   - Click "Create" after validation passes

### Using Azure CLI

```bash
# Login to Azure
az login

# Create resource group
az group create --name docsdeploy-rg --location eastus

# Create storage account
az storage account create \
  --name docsdeploy[unique-suffix] \
  --resource-group docsdeploy-rg \
  --location eastus \
  --sku Standard_LRS \
  --kind StorageV2
```

## Step 2: Enable Static Website Hosting

### Using Azure Portal

1. **Navigate to Storage Account**
   - Go to your newly created storage account
   - In the left menu, find "Data management"
   - Click "Static website"

2. **Enable Static Website**
   - Toggle "Static website" to "Enabled"
   - Set Index document name: `index.html`
   - Set Error document path: `index.html` (for SPA routing)
   - Click "Save"

3. **Note the Endpoints**
   - Copy the "Primary endpoint" URL
   - This will be your live documentation URL

### Using Azure CLI

```bash
# Enable static website hosting
az storage blob service-properties update \
  --account-name docsdeploy[unique-suffix] \
  --static-website \
  --404-document index.html \
  --index-document index.html
```

## Step 3: Build Your DocsDeploy Project

1. **Prepare for Static Deployment**
   ```bash
   # In your DocsDeploy project directory
   npm run build
   ```

2. **Verify Build Output**
   - Check that the `dist` folder contains:
     - `public/` directory with static assets
     - `index.html` file
     - `js/` and `css/` directories

## Step 4: Configure Environment Variables

Since Azure Storage Static Website doesn't support server-side environment variables, you'll need to use a local docs folder or configure the client-side build.

### Option A: Use Local Docs (Recommended)

1. **Create docs folder in your project**
   ```bash
   mkdir docs
   # Add your markdown files to the docs folder
   ```

2. **Build with local docs**
   ```bash
   npm run build
   ```

### Option B: Build-time GitHub Configuration

1. **Set environment variables during build**
   ```bash
   # Set GitHub configuration
   export GITHUB_REPO_OWNER=your-username
   export GITHUB_REPO_NAME=your-repo
   export GITHUB_DOCS_PATH=docs
   export GITHUB_TOKEN=your-token  # Only for private repos
   
   # Build the project
   npm run build
   ```

## Step 5: Deploy to Azure Storage

### Using Azure Portal

1. **Navigate to Storage Account**
   - Go to your storage account
   - Click "Storage browser" in the left menu
   - Click "Blob containers"
   - Click on the "$web" container

2. **Upload Files**
   - Click "Upload"
   - Select all files from your `dist/public` directory
   - Ensure "Overwrite if files already exist" is checked
   - Click "Upload"

### Using Azure CLI

```bash
# Upload all files to the $web container
az storage blob upload-batch \
  --account-name docsdeploy[unique-suffix] \
  --destination '$web' \
  --source dist/public \
  --overwrite
```

### Using Azure Storage Explorer

1. **Download Azure Storage Explorer**
   - Download from [azure.microsoft.com/features/storage-explorer](https://azure.microsoft.com/features/storage-explorer/)

2. **Connect to Your Storage Account**
   - Open Azure Storage Explorer
   - Sign in with your Azure account
   - Navigate to your storage account

3. **Upload Files**
   - Expand your storage account
   - Right-click on "Blob Containers"
   - Click on "$web" container
   - Click "Upload" → "Upload Files"
   - Select all files from `dist/public`

## Step 6: Configure Custom Domain (Optional)

### Using Azure CDN

1. **Create Azure CDN Profile**
   ```bash
   az cdn profile create \
     --name docsdeploy-cdn \
     --resource-group docsdeploy-rg \
     --sku Standard_Microsoft
   ```

2. **Create CDN Endpoint**
   ```bash
   az cdn endpoint create \
     --name docsdeploy-endpoint \
     --profile-name docsdeploy-cdn \
     --resource-group docsdeploy-rg \
     --origin docsdeploy[unique-suffix].z13.web.core.windows.net \
     --origin-host-header docsdeploy[unique-suffix].z13.web.core.windows.net
   ```

3. **Configure Custom Domain**
   - Add CNAME record in your DNS: `docs.yourdomain.com` → `docsdeploy-endpoint.azureedge.net`
   - In Azure Portal, add custom domain to your CDN endpoint
   - Enable HTTPS with Azure-managed certificate

## Step 7: Set Up Automated Deployment

### Using GitHub Actions

Create `.github/workflows/deploy-azure.yml`:

```yaml
name: Deploy to Azure Storage

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
    
    - name: Build project
      run: npm run build
      env:
        GITHUB_REPO_OWNER: ${{ secrets.GITHUB_REPO_OWNER }}
        GITHUB_REPO_NAME: ${{ secrets.GITHUB_REPO_NAME }}
        GITHUB_DOCS_PATH: ${{ secrets.GITHUB_DOCS_PATH }}
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    
    - name: Deploy to Azure Storage
      uses: azure/CLI@v1
      with:
        azcliversion: 2.30.0
        inlineScript: |
          az storage blob upload-batch \
            --account-name ${{ secrets.AZURE_STORAGE_ACCOUNT }} \
            --destination '$web' \
            --source dist/public \
            --overwrite \
            --auth-mode key \
            --account-key ${{ secrets.AZURE_STORAGE_KEY }}
```

### Required GitHub Secrets

In your GitHub repository settings, add these secrets:

```
AZURE_STORAGE_ACCOUNT=docsdeploy[unique-suffix]
AZURE_STORAGE_KEY=[your-storage-account-key]
GITHUB_REPO_OWNER=[your-github-username]
GITHUB_REPO_NAME=[your-repo-name]
GITHUB_DOCS_PATH=docs
GITHUB_TOKEN=[your-github-token]  # Only for private repos
```

## Security Best Practices

1. **Storage Account Access**
   - Use Azure RBAC for access control
   - Rotate storage account keys regularly
   - Consider using Azure AD authentication

2. **Content Security**
   - Enable Azure Storage firewall if needed
   - Use HTTPS-only access
   - Implement proper CORS policies

3. **Secrets Management**
   - Store sensitive values in GitHub Secrets
   - Use Azure Key Vault for production secrets
   - Never commit credentials to your repository

## Monitoring and Maintenance

1. **Enable Monitoring**
   - Set up Azure Monitor alerts
   - Monitor storage account metrics
   - Track CDN performance

2. **Cost Optimization**
   - Monitor storage costs
   - Set up billing alerts
   - Use appropriate storage tier

3. **Backup Strategy**
   - Enable soft delete for blobs
   - Consider geo-redundant storage for critical docs
   - Implement version control for documentation

## Troubleshooting

### Common Issues

1. **404 Errors**
   - Ensure error document is set to `index.html`
   - Verify all files are uploaded to `$web` container

2. **CORS Issues**
   - Configure CORS settings in storage account
   - Allow appropriate origins and methods

3. **Build Failures**
   - Check environment variables are set correctly
   - Verify GitHub token has appropriate permissions
   - Ensure docs folder exists and contains markdown files

### Getting Help

- Azure Storage documentation: [docs.microsoft.com/azure/storage](https://docs.microsoft.com/azure/storage)
- Azure CLI reference: [docs.microsoft.com/cli/azure](https://docs.microsoft.com/cli/azure)
- GitHub Actions documentation: [docs.github.com/actions](https://docs.github.com/actions)

Your DocsDeploy documentation site is now live on Azure Storage! The static website hosting provides excellent performance and global availability for your documentation.