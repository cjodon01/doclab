# DocsDeploy Deployment Guide

Complete deployment guide for DocsDeploy - a static React documentation site that can be deployed to any modern hosting platform.

## 🏗️ Project Overview

**Architecture**: Static React SPA built with Vite  
**Build Output**: `dist/` folder containing optimized static files  
**Build Command**: `npm run build`  
**Node Version**: 18+ required  
**Deploy Target**: Any static hosting service  

## 🚀 One-Click Deployments

Deploy instantly to popular platforms:

| Platform | Deploy Button | Best For |
|----------|---------------|----------|
| **Netlify** | [![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/yourusername/docsdeploy) | Ease of use, generous free tier |
| **Vercel** | [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/docsdeploy) | Performance, global CDN |
| **Azure** | [Deploy to Azure](https://portal.azure.com/) | Enterprise, Microsoft ecosystem |

## 📋 Platform-Specific Setup

### Netlify

1. **Connect Repository**
   - Go to [Netlify](https://netlify.com)
   - Click "New site from Git"
   - Choose GitHub and select your repository

2. **Build Settings**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node version: 18

3. **Environment Variables** (optional)
   ```
   VITE_GITHUB_OWNER=yourusername
   VITE_GITHUB_REPO=your-docs-repo
   VITE_GITHUB_BRANCH=main
   VITE_DOCS_PATH=docs
   ```

4. **Custom Domain** (optional)
   - Go to Domain settings
   - Add your custom domain
   - Configure DNS records

**Files used:** `netlify.toml`

### Vercel

1. **Import Project**
   - Go to [Vercel](https://vercel.com)
   - Click "Import Project"
   - Connect GitHub and select repository

2. **Configure Project**
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. **Environment Variables**
   - Add in Environment Variables section
   - Set for Production, Preview, and Development

4. **Custom Domain**
   - Go to Project Settings → Domains
   - Add your domain and configure DNS

**Files used:** `vercel.json`

### Azure Static Web Apps

1. **Create Resource**
   - Go to Azure Portal
   - Create "Static Web App" resource
   - Connect to GitHub repository

2. **Build Configuration**
   ```yaml
   app_location: "/"
   api_location: ""
   output_location: "dist"
   ```

3. **Environment Variables**
   - In Static Web App settings
   - Add Configuration → Application settings

4. **Custom Domain**
   - Custom domains → Add
   - Configure DNS with provided values

**Files used:** `staticwebapp.config.json`, `.github/workflows/deploy-azure.yml`

### GitHub Pages

1. **Enable GitHub Actions**
   - Repository Settings → Pages
   - Source: GitHub Actions

2. **Add Secrets** (optional)
   - Settings → Secrets and variables → Actions
   - Add GitHub integration variables

3. **Workflow**
   - Uses `.github/workflows/deploy-gh-pages.yml`
   - Automatically deploys on push to main

4. **Custom Domain**
   - Add `CNAME` file or configure in repository settings

**Files used:** `.github/workflows/deploy-gh-pages.yml`

## 🔧 Environment Variables

All platforms support these optional environment variables for GitHub integration:

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_GITHUB_OWNER` | GitHub username/organization | - |
| `VITE_GITHUB_REPO` | Repository name | - |
| `VITE_GITHUB_BRANCH` | Branch to read from | `main` |
| `VITE_DOCS_PATH` | Path to docs folder | `docs` |

## 🌐 Custom Domains

### DNS Configuration

For most platforms, you'll need to configure these DNS records:

**For root domain (example.com):**
```
A     @     [Platform IP addresses]
AAAA  @     [Platform IPv6 addresses]
```

**For subdomain (docs.example.com):**
```
CNAME docs  [Platform domain]
```

### Platform-Specific Instructions

- **Netlify**: Automatic SSL, supports both apex and subdomains
- **Vercel**: Automatic SSL, easy domain management
- **Azure**: Manual SSL certificate configuration
- **GitHub Pages**: Limited to one custom domain per repository

## 🔒 Security & Performance

### HTTPS
All platforms provide automatic HTTPS with Let's Encrypt certificates.

### Performance Optimization
- Enable Gzip/Brotli compression (usually automatic)
- Configure caching headers for static assets
- Use CDN (built into most platforms)

### Security Headers
Add these headers in platform configuration:

```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Content-Security-Policy: default-src 'self'
```

## 🔄 Continuous Deployment

All configurations include automatic deployment on:
- Push to main branch
- Pull request creation (preview deployments)
- Environment variable changes

### Branch Protection
Consider setting up branch protection rules:
- Require pull request reviews
- Require status checks to pass
- Restrict push to main branch

## 🐛 Troubleshooting

### Common Issues

**Build Failures:**
- Check Node.js version (should be 18+)
- Verify environment variables are set correctly
- Review build logs for dependency issues

**404 Errors:**
- Ensure SPA fallback is configured (`index.html` redirect)
- Check that `dist` folder is being deployed

**GitHub Integration Not Working:**
- Verify environment variables are set
- Check repository permissions
- Ensure docs folder exists in specified branch

### Platform-Specific Issues

**Netlify:**
- Check `netlify.toml` configuration
- Review function logs if using serverless functions

**Vercel:**
- Verify `vercel.json` settings
- Check project configuration in dashboard

**Azure:**
- Review build logs in deployment center
- Check `staticwebapp.config.json` syntax

**GitHub Pages:**
- Ensure GitHub Actions are enabled
- Check workflow permissions and secrets

## 📞 Support

- Check platform documentation
- Review deployment logs
- Open issue in repository
- Community support forums