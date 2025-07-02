# Deploying DocsDeploy to Netlify

Netlify provides an excellent platform for deploying static sites and serverless functions with automatic deployments from Git repositories.

## Prerequisites

- Netlify account (free tier available)
- DocsDeploy project in a Git repository (GitHub, GitLab, or Bitbucket)
- Node.js 18+ installed locally

## Deployment Options

DocsDeploy can be deployed to Netlify in two ways:

1. **Static Site with Local Docs** (Recommended for Netlify)
2. **Serverless Functions with GitHub Integration**

## Option 1: Static Site Deployment (Recommended)

This approach builds your documentation into a static site that Netlify can serve directly.

### Step 1: Prepare Your Project

1. **Create Local Docs Folder**
   ```bash
   # In your DocsDeploy project root
   mkdir -p docs
   
   # Copy your markdown files to the docs folder
   # Example structure:
   # docs/
   # ├── README.md
   # ├── getting-started.md
   # └── api/
   #     └── endpoints.md
   ```

2. **Update Build Configuration**
   
   Create or update `package.json`:
   ```json
   {
     "scripts": {
       "build": "npm run build:static",
       "build:static": "node scripts/build-static.js",
       "dev": "ts-node server.ts"
     }
   }
   ```

3. **Create Static Build Script**
   
   Create `scripts/build-static.js`:
   ```javascript
   const fs = require('fs');
   const path = require('path');
   const { parseMarkdown, formatFileName } = require('../dist/lib/markdown');
   
   async function buildStatic() {
     const docsDir = path.join(__dirname, '../docs');
     const outputDir = path.join(__dirname, '../dist/static');
     
     // Ensure output directory exists
     if (!fs.existsSync(outputDir)) {
       fs.mkdirSync(outputDir, { recursive: true });
     }
     
     // Copy public assets
     const publicDir = path.join(__dirname, '../public');
     if (fs.existsSync(publicDir)) {
       fs.cpSync(publicDir, outputDir, { recursive: true });
     }
     
     // Build documentation pages
     await buildDocs(docsDir, outputDir);
     
     console.log('Static site built successfully!');
   }
   
   async function buildDocs(docsDir, outputDir) {
     if (!fs.existsSync(docsDir)) {
       console.warn('No docs directory found, creating empty site');
       return;
     }
     
     const files = await getMarkdownFiles(docsDir);
     const navigation = await buildNavigation(files);
     
     // Generate index page with navigation
     await generateIndexPage(outputDir, navigation, files);
     
     // Generate individual pages
     for (const file of files) {
       await generatePage(outputDir, file, navigation);
     }
   }
   
   // Add helper functions here...
   
   buildStatic().catch(console.error);
   ```

### Step 2: Configure Netlify Deployment

1. **Create netlify.toml**
   
   Create `netlify.toml` in your project root:
   ```toml
   [build]
     publish = "dist/static"
     command = "npm run build"
   
   [build.environment]
     NODE_VERSION = "18"
   
   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   
   [context.production.environment]
     NODE_ENV = "production"
   
   [context.deploy-preview.environment]
     NODE_ENV = "development"
   ```

### Step 3: Deploy to Netlify

#### Using Netlify Web Interface

1. **Connect Repository**
   - Go to [netlify.com](https://netlify.com) and sign in
   - Click "New site from Git"
   - Choose your Git provider (GitHub, GitLab, Bitbucket)
   - Select your DocsDeploy repository

2. **Configure Build Settings**
   ```
   Build command: npm run build
   Publish directory: dist/static
   ```

3. **Deploy**
   - Click "Deploy site"
   - Netlify will automatically build and deploy your site
   - You'll get a random subdomain like `amazing-site-123456.netlify.app`

#### Using Netlify CLI

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login and Deploy**
   ```bash
   # Login to Netlify
   netlify login
   
   # Initialize site
   netlify init
   
   # Build and deploy
   netlify build
   netlify deploy --prod
   ```

## Option 2: Serverless Functions Deployment

This approach uses Netlify Functions to serve your documentation dynamically.

### Step 1: Configure for Serverless

1. **Update netlify.toml**
   ```toml
   [build]
     publish = "public"
     command = "npm run build:netlify"
     functions = "netlify/functions"
   
   [build.environment]
     NODE_VERSION = "18"
   
   [[redirects]]
     from = "/api/*"
     to = "/.netlify/functions/:splat"
     status = 200
   
   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

2. **Create Netlify Functions**
   
   Create `netlify/functions/docs-tree.js`:
   ```javascript
   const { createDocsProvider } = require('../../dist/lib/docs');
   
   exports.handler = async (event, context) => {
     try {
       const docsProvider = createDocsProvider();
       await docsProvider.initialize();
       const tree = await docsProvider.buildFileTree();
       
       return {
         statusCode: 200,
         headers: {
           'Content-Type': 'application/json',
           'Access-Control-Allow-Origin': '*',
         },
         body: JSON.stringify({ tree }),
       };
     } catch (error) {
       return {
         statusCode: 500,
         body: JSON.stringify({ error: error.message }),
       };
     }
   };
   ```

3. **Add Build Script**
   
   Update `package.json`:
   ```json
   {
     "scripts": {
       "build:netlify": "npm run build && cp -r public/* ."
     }
   }
   ```

### Step 2: Configure Environment Variables

1. **In Netlify Dashboard**
   - Go to Site settings → Environment variables
   - Add the following variables:

   ```
   GITHUB_REPO_OWNER=your-github-username
   GITHUB_REPO_NAME=your-repository-name
   GITHUB_DOCS_PATH=docs
   GITHUB_TOKEN=ghp_your_github_token_here
   ```

2. **For Local Development**
   
   Create `.env.local`:
   ```bash
   GITHUB_REPO_OWNER=your-github-username
   GITHUB_REPO_NAME=your-repository-name
   GITHUB_DOCS_PATH=docs
   GITHUB_TOKEN=ghp_your_github_token_here
   ```

## Step 3: Custom Domain Configuration

### Add Custom Domain

1. **In Netlify Dashboard**
   - Go to Site settings → Domain management
   - Click "Add custom domain"
   - Enter your domain (e.g., `docs.yourdomain.com`)

2. **Configure DNS**
   
   **Option A: Netlify DNS (Recommended)**
   - Change your domain's nameservers to Netlify's
   - Netlify will manage all DNS records
   
   **Option B: External DNS**
   - Add CNAME record: `docs.yourdomain.com` → `your-site.netlify.app`
   - Or add A record pointing to Netlify's load balancer IP

3. **Enable HTTPS**
   - Netlify automatically provides SSL certificates
   - Force HTTPS in Site settings → HTTPS

### DNS Configuration Examples

**Cloudflare:**
```
Type: CNAME
Name: docs
Content: your-site.netlify.app
Proxy status: Proxied (orange cloud)
```

**AWS Route 53:**
```
Record name: docs.yourdomain.com
Record type: CNAME
Value: your-site.netlify.app
```

**Google Domains:**
```
Host name: docs
Type: CNAME
Data: your-site.netlify.app
```

## Step 4: Advanced Configuration

### Branch Deploys

Configure different branches for different environments:

```toml
# netlify.toml
[context.production]
  command = "npm run build"
  
[context.staging]
  command = "npm run build:staging"
  
[context.deploy-preview]
  command = "npm run build:preview"
```

### Form Handling (for feedback)

Add a feedback form to your documentation:

```html
<!-- In your documentation template -->
<form name="feedback" method="POST" data-netlify="true">
  <input type="hidden" name="form-name" value="feedback" />
  <input type="text" name="page" placeholder="Page URL" />
  <textarea name="feedback" placeholder="Your feedback"></textarea>
  <button type="submit">Send Feedback</button>
</form>
```

### Analytics Integration

Add analytics to `netlify.toml`:

```toml
[build.environment]
  GOOGLE_ANALYTICS_ID = "GA_MEASUREMENT_ID"
```

## Step 5: Automated Deployments

### GitHub Integration

1. **Automatic Deployments**
   - Netlify automatically deploys when you push to your main branch
   - Deploy previews are created for pull requests

2. **Deploy Hooks**
   
   Create webhook for external triggers:
   ```bash
   # Get deploy hook URL from Netlify dashboard
   curl -X POST -d {} https://api.netlify.com/build_hooks/YOUR_HOOK_ID
   ```

### GitHub Actions Integration

Create `.github/workflows/netlify-deploy.yml`:

```yaml
name: Netlify Deploy

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

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
    
    - name: Build
      run: npm run build
      env:
        GITHUB_REPO_OWNER: ${{ secrets.GITHUB_REPO_OWNER }}
        GITHUB_REPO_NAME: ${{ secrets.GITHUB_REPO_NAME }}
        GITHUB_DOCS_PATH: ${{ secrets.GITHUB_DOCS_PATH }}
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    
    - name: Deploy to Netlify
      uses: nwtgck/actions-netlify@v2.0
      with:
        publish-dir: './dist/static'
        production-branch: main
        github-token: ${{ secrets.GITHUB_TOKEN }}
        deploy-message: "Deploy from GitHub Actions"
      env:
        NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
        NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

## Security Best Practices

### 1. Environment Variables

- Store sensitive values in Netlify's environment variables
- Use different variables for different deploy contexts
- Never commit secrets to your repository

### 2. Access Control

```toml
# netlify.toml - Password protect staging
[context.staging]
  command = "npm run build:staging"
  
[[context.staging.headers]]
  for = "/*"
  [context.staging.headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
```

### 3. Content Security Policy

```toml
[[headers]]
  for = "/*"
  [headers.values]
    Content-Security-Policy = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'"
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
```

## Performance Optimization

### 1. Build Optimization

```toml
[build]
  command = "npm run build"
  
[build.processing]
  skip_processing = false
  
[build.processing.css]
  bundle = true
  minify = true
  
[build.processing.js]
  bundle = true
  minify = true
  
[build.processing.html]
  pretty_urls = true
```

### 2. Caching Headers

```toml
[[headers]]
  for = "/js/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000"
    
[[headers]]
  for = "/css/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000"
```

## Monitoring and Analytics

### 1. Netlify Analytics

Enable in your Netlify dashboard:
- Site overview → Analytics
- View page views, unique visitors, and top pages

### 2. Custom Analytics

Add Google Analytics or other tracking:

```html
<!-- In your HTML template -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check build logs in Netlify dashboard
   - Verify Node.js version compatibility
   - Ensure all dependencies are in package.json

2. **Function Timeouts**
   - Netlify functions have a 10-second timeout on free tier
   - Optimize GitHub API calls
   - Consider caching strategies

3. **Environment Variable Issues**
   - Variables are only available during build time
   - Use different variables for different contexts
   - Check variable names match exactly

### Debug Commands

```bash
# Test build locally
netlify dev

# Check function logs
netlify functions:list
netlify functions:invoke function-name

# Deploy with debug info
netlify deploy --debug
```

## Cost Considerations

### Free Tier Limits
- 100GB bandwidth per month
- 300 build minutes per month
- 125,000 function invocations per month

### Optimization Tips
- Use static generation when possible
- Implement caching for GitHub API calls
- Optimize images and assets
- Monitor usage in Netlify dashboard

Your DocsDeploy documentation site is now live on Netlify with automatic deployments, custom domain, and enterprise-grade performance!