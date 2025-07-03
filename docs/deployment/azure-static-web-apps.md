# Deploying DocsDeploy to Azure Static Web Apps

Azure Static Web Apps provides a streamlined hosting solution for static web applications with built-in CI/CD from GitHub.

## Prerequisites

- Azure account (free tier available)
- DocsDeploy project in a GitHub repository
- Node.js 18+ installed locally

## Deployment Steps

### Step 1: Create Static Web App

1. **Sign in to Azure Portal**
   - Go to [portal.azure.com](https://portal.azure.com)
   - Sign in with your Azure account

2. **Create Resource**
   - Click "Create a resource"
   - Search for "Static Web App"
   - Click "Create"

3. **Configure Basics**
   ```
   Subscription: Your Azure subscription
   Resource Group: Create new or use existing
   Name: your-docsdeploy-app
   Plan type: Free (for development) or Standard (for production)
   Region: Choose closest to your users
   ```

4. **Configure Deployment**
   ```
   Source: GitHub
   Organization: Your GitHub username/organization
   Repository: Your DocsDeploy repository
   Branch: main
   Build Presets: Custom
   App location: /
   Output location: dist
   ```

### Step 2: Configure Build

Azure will automatically create a GitHub Actions workflow file:

```yaml
# .github/workflows/azure-static-web-apps-[random].yml
name: Azure Static Web Apps CI/CD

on:
  push:
    branches:
      - main
  pull_request:
    types: [opened, synchronize, reopened, closed]
    branches:
      - main

jobs:
  build_and_deploy_job:
    if: github.event_name == 'push' || (github.event_name == 'pull_request' && github.event.action != 'closed')
    runs-on: ubuntu-latest
    name: Build and Deploy Job
    steps:
      - uses: actions/checkout@v3
        with:
          submodules: true
      
      - name: Build And Deploy
        id: builddeploy
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          repo_token: ${{ secrets.GITHUB_TOKEN }}
          action: "upload"
          app_location: "/"
          output_location: "dist"
          app_build_command: "npm run build"

  close_pull_request_job:
    if: github.event_name == 'pull_request' && github.event.action == 'closed'
    runs-on: ubuntu-latest
    name: Close Pull Request Job
    steps:
      - name: Close Pull Request
        id: closepullrequest
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          action: "close"
```

### Step 3: Configure Environment Variables (Optional)

For GitHub integration, add environment variables in Azure:

1. **In Azure Portal**
   - Go to your Static Web App resource
   - Click "Configuration" in the left menu
   - Click "Application settings"
   - Add the following variables:

```
VITE_GITHUB_OWNER=your-username
VITE_GITHUB_REPO=your-repo-name
VITE_GITHUB_BRANCH=main
VITE_GITHUB_DOCS_PATH=docs
VITE_GITHUB_TOKEN=your-token (only for private repos)
```

### Step 4: Custom Domain Setup

#### Add Custom Domain

1. **In Azure Portal**
   - Go to your Static Web App
   - Click "Custom domains" in the left menu
   - Click "Add"
   - Enter your domain (e.g., `docs.yourdomain.com`)

2. **Configure DNS**
   
   **CNAME Record** (for subdomains):
   ```
   Type: CNAME
   Name: docs
   Value: your-app-name.azurestaticapps.net
   ```
   
   **ALIAS/ANAME Record** (for apex domains):
   ```
   Type: ALIAS or ANAME
   Name: @
   Value: your-app-name.azurestaticapps.net
   ```

3. **SSL Certificate**
   - Azure automatically provides free SSL certificates
   - HTTPS is enforced by default

## Advanced Configuration

### Static Web App Configuration

Create `staticwebapp.config.json` in your project root:

```json
{
  "routes": [
    {
      "route": "/*",
      "serve": "/index.html",
      "statusCode": 200
    }
  ],
  "navigationFallback": {
    "rewrite": "/index.html",
    "exclude": ["/images/*.{png,jpg,gif}", "/css/*", "/js/*"]
  },
  "responseOverrides": {
    "404": {
      "rewrite": "/index.html",
      "statusCode": 200
    }
  },
  "globalHeaders": {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "strict-origin-when-cross-origin"
  }
}
```

### Environment-Specific Configuration

Set different configurations for different environments:

```json
{
  "routes": [
    {
      "route": "/*",
      "serve": "/index.html",
      "statusCode": 200
    }
  ],
  "environmentVariables": {
    "NODE_ENV": "production"
  }
}
```

## Authentication and Authorization

### Built-in Authentication

Azure Static Web Apps provides built-in authentication:

```json
{
  "auth": {
    "identityProviders": {
      "azureActiveDirectory": {
        "userDetailsClaim": "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name",
        "registration": {
          "openIdIssuer": "https://login.microsoftonline.com/your-tenant-id/v2.0",
          "clientIdSettingName": "AZURE_CLIENT_ID",
          "clientSecretSettingName": "AZURE_CLIENT_SECRET"
        }
      }
    }
  },
  "routes": [
    {
      "route": "/admin/*",
      "allowedRoles": ["authenticated"]
    }
  ]
}
```

## Monitoring and Analytics

### Application Insights

1. **Enable Application Insights**
   - In Azure Portal, go to your Static Web App
   - Click "Application Insights" in monitoring section
   - Click "Enable Application Insights"

2. **Custom Telemetry**
   ```javascript
   import { ApplicationInsights } from '@microsoft/applicationinsights-web';

   const appInsights = new ApplicationInsights({
     config: {
       instrumentationKey: 'your-instrumentation-key'
     }
   });

   appInsights.loadAppInsights();
   appInsights.trackPageView();
   ```

### Custom Analytics

Add analytics tracking to your application:

```html
<!-- In index.html -->
<script>
  // Application Insights
  !function(T,l,y){/* Application Insights snippet */}
</script>
```

## Performance Optimization

### Caching Strategy

```json
{
  "routes": [
    {
      "route": "/js/*",
      "headers": {
        "Cache-Control": "public, max-age=31536000, immutable"
      }
    },
    {
      "route": "/css/*",
      "headers": {
        "Cache-Control": "public, max-age=31536000, immutable"
      }
    }
  ]
}
```

### Content Compression

Azure Static Web Apps automatically:
- Compresses responses with Gzip/Brotli
- Serves from global CDN
- Provides HTTP/2 support

## Staging Environments

### Pull Request Environments

Azure automatically creates staging environments for pull requests:

1. **Automatic Creation**
   - Each PR gets a unique staging URL
   - Format: `https://[environment-name].[app-name].azurestaticapps.net`

2. **Environment Variables**
   ```json
   {
     "environmentVariables": {
       "VITE_ENVIRONMENT": "staging",
       "VITE_API_URL": "https://staging-api.yourdomain.com"
     }
   }
   ```

## Security Best Practices

### Content Security Policy

```json
{
  "globalHeaders": {
    "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;"
  }
}
```

### Security Headers

```json
{
  "globalHeaders": {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
    "Referrer-Policy": "strict-origin-when-cross-origin"
  }
}
```

## Troubleshooting

### Common Issues

1. **Build Failures**
   ```bash
   # Check GitHub Actions logs
   # Verify Node.js version in workflow
   # Ensure package.json includes all dependencies
   ```

2. **Routing Issues**
   ```bash
   # Check staticwebapp.config.json
   # Ensure fallback routes are configured
   # Verify SPA routing setup
   ```

3. **Environment Variables**
   ```bash
   # Variables must be prefixed with VITE_
   # Check Azure Portal configuration
   # Verify variables are available during build
   ```

### Debug Steps

1. **Check Deployment Logs**
   - Go to GitHub Actions tab in your repository
   - Review build and deployment logs

2. **Test Locally**
   ```bash
   # Install Azure Static Web Apps CLI
   npm install -g @azure/static-web-apps-cli

   # Test locally
   swa start dist --run "npm run build"
   ```

3. **Validate Configuration**
   ```bash
   # Validate staticwebapp.config.json
   swa validate staticwebapp.config.json
   ```

## Cost Management

### Free Tier Includes
- 100 GB bandwidth per month
- Custom domains and SSL certificates
- Global CDN
- Staging environments

### Cost Optimization
- Monitor bandwidth usage in Azure Portal
- Optimize images and static assets
- Use appropriate caching strategies
- Consider Azure CDN for high-traffic sites

Your DocsDeploy documentation site is now live on Azure Static Web Apps with automatic deployments, global distribution, and enterprise-grade security!