# Deploying DocsDeploy to Vercel

Vercel provides excellent hosting for static React applications with automatic deployments and global CDN.

## Prerequisites

- Vercel account (free tier available)
- DocsDeploy project in a Git repository (GitHub, GitLab, or Bitbucket)
- Node.js 18+ installed locally

## Deployment Methods

### Method 1: One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/cjodon01/doclab.git)

### Method 2: Manual Deployment

#### Step 1: Connect Repository

1. **Sign in to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign in with your Git provider

2. **Import Project**
   - Click "New Project"
   - Select "Import Git Repository"
   - Choose your DocsDeploy repository

#### Step 2: Configure Project

Vercel will automatically detect the Vite framework and configure most settings:

```
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

#### Step 3: Environment Variables (Optional)

For GitHub integration, add these environment variables:

```
VITE_GITHUB_OWNER=your-username
VITE_GITHUB_REPO=your-repo-name
VITE_GITHUB_BRANCH=main
VITE_GITHUB_DOCS_PATH=docs
VITE_GITHUB_TOKEN=your-token (only for private repos)
```

#### Step 4: Deploy

1. Click "Deploy"
2. Vercel will build and deploy your site
3. You'll get a URL like `your-project.vercel.app`

## Custom Domain Setup

### Add Custom Domain

1. **In Project Dashboard**
   - Go to Project Settings → Domains
   - Click "Add"
   - Enter your domain (e.g., `docs.yourdomain.com`)

2. **Configure DNS**
   
   **Option A: Vercel Nameservers (Recommended)**
   - Change your domain's nameservers to Vercel's
   - Vercel will manage all DNS records
   
   **Option B: CNAME Record**
   ```
   Type: CNAME
   Name: docs (or www)
   Value: cname.vercel-dns.com
   ```

3. **SSL Certificate**
   - Vercel automatically provides SSL certificates
   - HTTPS is enabled by default

## Advanced Configuration

### Environment Variables by Environment

Set different variables for different environments:

- **Production**: Used for main branch deployments
- **Preview**: Used for pull request deployments
- **Development**: Used for local development

### Custom Build Configuration

Create `vercel.json` for advanced configuration:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Performance Optimization

1. **Edge Network**
   - Vercel automatically uses their global CDN
   - Static assets are cached at edge locations

2. **Compression**
   - Gzip/Brotli compression is automatic
   - No configuration needed

3. **Image Optimization**
   - Use Vercel's Image component for optimized images
   - Automatic format conversion (WebP, AVIF)

## Branch and Preview Deployments

### Automatic Previews

- **Production**: Deploys from main/master branch
- **Preview**: Creates preview URLs for pull requests
- **Branch**: Deploy any branch for testing

### Custom Branch Deployment

```json
{
  "git": {
    "deploymentEnabled": {
      "main": true,
      "staging": true
    }
  }
}
```

## Analytics and Monitoring

### Vercel Analytics

1. **Enable Analytics**
   - Go to Project Settings → Analytics
   - Enable Web Analytics
   - View page views, visitors, and performance metrics

2. **Core Web Vitals**
   - Monitor LCP, FID, and CLS
   - Get insights on performance improvements

### Custom Analytics

Add Google Analytics or other tracking:

```html
<!-- In index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

## Security Headers

Add security headers via `vercel.json`:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    }
  ]
}
```

## Continuous Deployment

### Automatic Deployments

Vercel automatically deploys when you:
- Push to main branch (production deployment)
- Create pull requests (preview deployment)
- Push to any connected branch

### GitHub Integration

1. **Repository Access**
   - Vercel needs read access to your repository
   - Automatically detects changes and deploys

2. **Status Checks**
   - Deployment status appears in GitHub pull requests
   - Failed builds prevent merging (optional)

## Troubleshooting

### Common Issues

1. **Build Failures**
   ```bash
   # Check build logs in Vercel dashboard
   # Verify Node.js version (should be 18+)
   # Ensure all dependencies are in package.json
   ```

2. **Environment Variable Issues**
   ```bash
   # Variables must be prefixed with VITE_
   # Check that variables are set in correct environment
   # Verify variable names match exactly
   ```

3. **Routing Issues**
   ```bash
   # Ensure vercel.json includes SPA rewrite rules
   # Check that all routes redirect to /index.html
   ```

### Debug Commands

```bash
# Install Vercel CLI
npm install -g vercel

# Test build locally
vercel dev

# Deploy manually
vercel --prod

# Check deployment logs
vercel logs [deployment-url]
```

## Cost Optimization

### Free Tier Limits
- 100GB bandwidth per month
- Unlimited static deployments
- 100 serverless function executions per day

### Tips to Stay Within Limits
- Optimize images and assets
- Use appropriate caching headers
- Monitor usage in Vercel dashboard
- Consider upgrading for production apps

## Migration from Other Platforms

### From Netlify
1. Export environment variables
2. Update build commands if needed
3. Import project to Vercel
4. Update DNS to point to Vercel

### From GitHub Pages
1. Keep existing repository
2. Connect to Vercel
3. Configure build settings
4. Update custom domain DNS

Your DocsDeploy documentation site is now live on Vercel with automatic deployments, global CDN, and enterprise-grade performance!
