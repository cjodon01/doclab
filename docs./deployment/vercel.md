# Deploying DocsDeploy to Vercel

Vercel provides an excellent platform for deploying modern web applications with automatic deployments, serverless functions, and global CDN distribution.

## Prerequisites

- Vercel account (free tier available)
- DocsDeploy project in a Git repository (GitHub, GitLab, or Bitbucket)
- Node.js 18+ installed locally

## Deployment Options

DocsDeploy can be deployed to Vercel in two ways:

1. **Static Site with Local Docs** (Recommended for simplicity)
2. **Serverless Functions with GitHub Integration** (Full dynamic functionality)

## Option 1: Static Site Deployment (Recommended)

This approach pre-builds your documentation into static files that Vercel can serve with optimal performance.

### Step 1: Prepare Your Project

1. **Create Local Docs Folder**
   ```bash
   # In your DocsDeploy project root
   mkdir -p docs
   
   # Add your markdown files
   # Example structure:
   # docs/
   # ├── README.md
   # ├── getting-started.md
   # ├── api/
   # │   ├── authentication.md
   # │   └── endpoints.md
   # └── guides/
   #     └── deployment.md
   ```

2. **Create Static Build Script**
   
   Create `scripts/build-static.js`:
   ```javascript
   const fs = require('fs');
   const path = require('path');
   const { parseMarkdown, formatFileName, extractTitle } = require('../dist/lib/markdown');
   
   async function buildStatic() {
     console.log('Building static documentation site...');
     
     const docsDir = path.join(__dirname, '../docs');
     const outputDir = path.join(__dirname, '../out');
     
     // Clean and create output directory
     if (fs.existsSync(outputDir)) {
       fs.rmSync(outputDir, { recursive: true });
     }
     fs.mkdirSync(outputDir, { recursive: true });
     
     // Copy public assets
     const publicDir = path.join(__dirname, '../public');
     if (fs.existsSync(publicDir)) {
       fs.cpSync(publicDir, outputDir, { recursive: true });
     }
     
     // Build documentation
     if (fs.existsSync(docsDir)) {
       await buildDocumentation(docsDir, outputDir);
     } else {
       console.warn('No docs directory found, creating empty site');
       await createEmptySite(outputDir);
     }
     
     console.log('Static site built successfully in ./out directory');
   }
   
   async function buildDocumentation(docsDir, outputDir) {
     const files = await getMarkdownFiles(docsDir);
     const navigation = buildNavigationTree(files);
     
     // Create main index.html with navigation
     await createIndexPage(outputDir, navigation, files);
     
     // Create individual pages for each markdown file
     for (const file of files) {
       await createDocPage(outputDir, file, navigation);
     }
   }
   
   async function getMarkdownFiles(dir, basePath = '') {
     const files = [];
     const entries = fs.readdirSync(dir, { withFileTypes: true });
     
     for (const entry of entries) {
       if (entry.name.startsWith('.')) continue;
       
       const fullPath = path.join(dir, entry.name);
       const relativePath = path.join(basePath, entry.name);
       
       if (entry.isDirectory()) {
         const subFiles = await getMarkdownFiles(fullPath, relativePath);
         files.push(...subFiles);
       } else if (entry.name.match(/\.(md|mdx)$/i)) {
         const content = fs.readFileSync(fullPath, 'utf8');
         files.push({
           name: entry.name,
           path: relativePath,
           content,
           title: extractTitle(content) || formatFileName(entry.name)
         });
       }
     }
     
     return files;
   }
   
   function buildNavigationTree(files) {
     const tree = {};
     
     files.forEach(file => {
       const parts = file.path.split(path.sep);
       let current = tree;
       
       parts.forEach((part, index) => {
         if (index === parts.length - 1) {
           // This is the file
           current[part] = file;
         } else {
           // This is a directory
           if (!current[part]) {
             current[part] = {};
           }
           current = current[part];
         }
       });
     });
     
     return tree;
   }
   
   async function createIndexPage(outputDir, navigation, files) {
     const template = fs.readFileSync(path.join(__dirname, '../public/index.html'), 'utf8');
     
     // Replace the app content with static navigation and first file
     const firstFile = files[0];
     const firstFileHtml = firstFile ? await parseMarkdown(firstFile.content) : '<p>No documentation found</p>';
     
     const navigationHtml = renderNavigation(navigation);
     
     const html = template
       .replace('<div id="sidebar-content" class="sidebar-content">', 
         `<div id="sidebar-content" class="sidebar-content">${navigationHtml}`)
       .replace('<main id="main-content" class="main-content">', 
         `<main id="main-content" class="main-content">
           <div class="content-header">
             <h1>${firstFile ? firstFile.title : 'Documentation'}</h1>
           </div>
           <div class="markdown-content">${firstFileHtml}</div>`);
     
     fs.writeFileSync(path.join(outputDir, 'index.html'), html);
   }
   
   function renderNavigation(tree, level = 0) {
     let html = '';
     
     Object.entries(tree).forEach(([key, value]) => {
       const paddingLeft = level * 16 + 12;
       
       if (typeof value === 'object' && value.content) {
         // This is a file
         const slug = value.path.replace(/\.(md|mdx)$/i, '').replace(/[^a-zA-Z0-9]/g, '-');
         html += `
           <div class="tree-item">
             <a href="/${slug}.html" class="tree-button file-button" style="padding-left: ${paddingLeft}px">
               <span class="tree-icon">📄</span>
               <span class="tree-name">${value.title}</span>
             </a>
           </div>
         `;
       } else {
         // This is a directory
         html += `
           <div class="tree-item">
             <div class="tree-button dir-button" style="padding-left: ${paddingLeft}px">
               <span class="tree-icon">📁</span>
               <span class="tree-name">${formatFileName(key)}</span>
             </div>
             <div class="tree-children">
               ${renderNavigation(value, level + 1)}
             </div>
           </div>
         `;
       }
     });
     
     return html;
   }
   
   async function createDocPage(outputDir, file, navigation) {
     const template = fs.readFileSync(path.join(__dirname, '../public/index.html'), 'utf8');
     const html = await parseMarkdown(file.content);
     const navigationHtml = renderNavigation(navigation);
     
     const pageHtml = template
       .replace('<div id="sidebar-content" class="sidebar-content">', 
         `<div id="sidebar-content" class="sidebar-content">${navigationHtml}`)
       .replace('<main id="main-content" class="main-content">', 
         `<main id="main-content" class="main-content">
           <div class="content-header">
             <h1>${file.title}</h1>
           </div>
           <div class="markdown-content">${html}</div>`);
     
     const slug = file.path.replace(/\.(md|mdx)$/i, '').replace(/[^a-zA-Z0-9]/g, '-');
     fs.writeFileSync(path.join(outputDir, `${slug}.html`), pageHtml);
   }
   
   buildStatic().catch(console.error);
   ```

3. **Update package.json**
   ```json
   {
     "scripts": {
       "build": "npm run compile && npm run build:static",
       "build:static": "node scripts/build-static.js",
       "compile": "rm -rf dist && tsc && cp -r public dist/",
       "dev": "ts-node server.ts",
       "export": "npm run build"
     }
   }
   ```

### Step 2: Configure Vercel

1. **Create vercel.json**
   
   Create `vercel.json` in your project root:
   ```json
   {
     "version": 2,
     "buildCommand": "npm run build",
     "outputDirectory": "out",
     "installCommand": "npm install",
     "framework": null,
     "rewrites": [
       {
         "source": "/(.*)",
         "destination": "/index.html"
       }
     ],
     "headers": [
       {
         "source": "/js/(.*)",
         "headers": [
           {
             "key": "Cache-Control",
             "value": "public, max-age=31536000, immutable"
           }
         ]
       },
       {
         "source": "/css/(.*)",
         "headers": [
           {
             "key": "Cache-Control",
             "value": "public, max-age=31536000, immutable"
           }
         ]
       }
     ]
   }
   ```

### Step 3: Deploy to Vercel

#### Using Vercel Web Interface

1. **Connect Repository**
   - Go to [vercel.com](https://vercel.com) and sign in
   - Click "New Project"
   - Import your Git repository

2. **Configure Project**
   ```
   Framework Preset: Other
   Build Command: npm run build
   Output Directory: out
   Install Command: npm install
   ```

3. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy your site
   - You'll get a URL like `your-project.vercel.app`

#### Using Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   # Login to Vercel
   vercel login
   
   # Deploy (first time)
   vercel
   
   # Deploy to production
   vercel --prod
   ```

## Option 2: Serverless Functions Deployment

This approach uses Vercel's serverless functions for dynamic GitHub integration.

### Step 1: Configure for Serverless

1. **Update vercel.json**
   ```json
   {
     "version": 2,
     "buildCommand": "npm run build:vercel",
     "outputDirectory": "public",
     "installCommand": "npm install",
     "functions": {
       "api/**/*.js": {
         "runtime": "nodejs18.x"
       }
     },
     "rewrites": [
       {
         "source": "/api/(.*)",
         "destination": "/api/$1"
       },
       {
         "source": "/(.*)",
         "destination": "/index.html"
       }
     ]
   }
   ```

2. **Create API Functions**
   
   Create `api/docs/tree.js`:
   ```javascript
   const { createDocsProvider } = require('../../dist/lib/docs');
   
   export default async function handler(req, res) {
     // Enable CORS
     res.setHeader('Access-Control-Allow-Origin', '*');
     res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
     res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
   
     if (req.method === 'OPTIONS') {
       res.status(200).end();
       return;
     }
   
     try {
       const docsProvider = createDocsProvider();
       await docsProvider.initialize();
       const tree = await docsProvider.buildFileTree();
       
       res.status(200).json({ tree });
     } catch (error) {
       console.error('Error fetching docs tree:', error);
       res.status(500).json({ error: error.message });
     }
   }
   ```

   Create `api/docs/file.js`:
   ```javascript
   const { createDocsProvider } = require('../../dist/lib/docs');
   
   export default async function handler(req, res) {
     res.setHeader('Access-Control-Allow-Origin', '*');
     res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
     res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
   
     if (req.method === 'OPTIONS') {
       res.status(200).end();
       return;
     }
   
     const { path: filePath } = req.query;
   
     if (!filePath) {
       return res.status(400).json({ error: 'File path is required' });
     }
   
     try {
       const docsProvider = createDocsProvider();
       await docsProvider.initialize();
       const content = await docsProvider.fetchFileContent(filePath);
       
       res.status(200).json({ content });
     } catch (error) {
       console.error('Error fetching file:', error);
       res.status(500).json({ error: error.message });
     }
   }
   ```

3. **Update Build Script**
   
   Add to `package.json`:
   ```json
   {
     "scripts": {
       "build:vercel": "npm run compile"
     }
   }
   ```

### Step 2: Configure Environment Variables

1. **In Vercel Dashboard**
   - Go to your project settings
   - Click "Environment Variables"
   - Add the following variables for all environments:

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

1. **In Vercel Dashboard**
   - Go to your project settings
   - Click "Domains"
   - Add your custom domain (e.g., `docs.yourdomain.com`)

2. **Configure DNS**
   
   **Option A: Vercel DNS (Recommended)**
   - Point your domain's nameservers to Vercel
   - Vercel will manage all DNS records
   
   **Option B: External DNS**
   - Add CNAME record: `docs.yourdomain.com` → `cname.vercel-dns.com`
   - Or add A record pointing to Vercel's IP addresses

3. **SSL Certificate**
   - Vercel automatically provides SSL certificates
   - Certificates are renewed automatically

### DNS Configuration Examples

**Cloudflare:**
```
Type: CNAME
Name: docs
Content: cname.vercel-dns.com
Proxy status: DNS only (gray cloud)
```

**AWS Route 53:**
```
Record name: docs.yourdomain.com
Record type: CNAME
Value: cname.vercel-dns.com
```

**Namecheap:**
```
Host: docs
Type: CNAME Record
Value: cname.vercel-dns.com
```

## Step 4: Advanced Configuration

### Preview Deployments

Configure different environments:

```json
{
  "github": {
    "enabled": true,
    "autoAlias": false
  },
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "out"
      }
    }
  ],
  "env": {
    "NODE_ENV": "production"
  },
  "build": {
    "env": {
      "NODE_ENV": "production"
    }
  }
}
```

### Edge Functions

For advanced caching and performance:

Create `middleware.js`:
```javascript
import { NextResponse } from 'next/server';

export function middleware(request) {
  // Add security headers
  const response = NextResponse.next();
  
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  return response;
}

export const config = {
  matcher: '/((?!api|_next/static|_next/image|favicon.ico).*)',
};
```

### Analytics Integration

Add Vercel Analytics:

```bash
npm install @vercel/analytics
```

Update your HTML template:
```html
<script>
  window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
</script>
<script defer src="/_vercel/insights/script.js"></script>
```

## Step 5: Automated Deployments

### GitHub Integration

1. **Automatic Deployments**
   - Vercel automatically deploys when you push to your main branch
   - Preview deployments are created for pull requests

2. **Deploy Hooks**
   
   Create webhook for external triggers:
   ```bash
   curl -X POST https://api.vercel.com/v1/integrations/deploy/your-hook-id
   ```

### GitHub Actions Integration

Create `.github/workflows/vercel-deploy.yml`:

```yaml
name: Vercel Deploy

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
    
    - name: Install Vercel CLI
      run: npm install --global vercel@latest
    
    - name: Pull Vercel Environment Information
      run: vercel pull --yes --environment=production --token=${{ secrets.VERCEL_TOKEN }}
    
    - name: Build Project Artifacts
      run: vercel build --prod --token=${{ secrets.VERCEL_TOKEN }}
      env:
        GITHUB_REPO_OWNER: ${{ secrets.GITHUB_REPO_OWNER }}
        GITHUB_REPO_NAME: ${{ secrets.GITHUB_REPO_NAME }}
        GITHUB_DOCS_PATH: ${{ secrets.GITHUB_DOCS_PATH }}
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    
    - name: Deploy Project Artifacts to Vercel
      run: vercel deploy --prebuilt --prod --token=${{ secrets.VERCEL_TOKEN }}
```

## Security Best Practices

### 1. Environment Variables

- Store sensitive values in Vercel's environment variables
- Use different variables for different environments
- Never commit secrets to your repository

### 2. Security Headers

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
        },
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'"
        }
      ]
    }
  ]
}
```

### 3. Function Security

```javascript
// In your API functions
export default async function handler(req, res) {
  // Rate limiting
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  
  // Input validation
  if (!req.query.path || typeof req.query.path !== 'string') {
    return res.status(400).json({ error: 'Invalid path parameter' });
  }
  
  // Your function logic here
}
```

## Performance Optimization

### 1. Build Optimization

```json
{
  "build": {
    "env": {
      "NODE_ENV": "production",
      "NEXT_TELEMETRY_DISABLED": "1"
    }
  },
  "functions": {
    "app/api/**/*.js": {
      "maxDuration": 10
    }
  }
}
```

### 2. Caching Strategy

```json
{
  "headers": [
    {
      "source": "/api/docs/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "s-maxage=300, stale-while-revalidate=600"
        }
      ]
    }
  ]
}
```

### 3. Image Optimization

If you have images in your docs:

```json
{
  "images": {
    "domains": ["images.pexels.com", "your-domain.com"],
    "formats": ["image/webp", "image/avif"]
  }
}
```

## Monitoring and Analytics

### 1. Vercel Analytics

Enable in your Vercel dashboard:
- Go to your project
- Click "Analytics" tab
- View performance metrics and user insights

### 2. Function Logs

Monitor serverless function performance:
- View function logs in Vercel dashboard
- Set up alerts for errors
- Monitor execution time and memory usage

### 3. Custom Monitoring

Add custom monitoring:

```javascript
// In your API functions
export default async function handler(req, res) {
  const start = Date.now();
  
  try {
    // Your function logic
    const result = await processRequest(req);
    
    // Log success metrics
    console.log(`Request processed in ${Date.now() - start}ms`);
    
    return res.status(200).json(result);
  } catch (error) {
    // Log error metrics
    console.error(`Request failed after ${Date.now() - start}ms:`, error);
    
    return res.status(500).json({ error: error.message });
  }
}
```

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check build logs in Vercel dashboard
   - Verify Node.js version compatibility
   - Ensure all dependencies are in package.json

2. **Function Timeouts**
   - Vercel functions have a 10-second timeout on Hobby plan
   - Optimize GitHub API calls
   - Implement caching strategies

3. **Environment Variable Issues**
   - Variables must be set in Vercel dashboard
   - Check variable names match exactly
   - Redeploy after changing variables

### Debug Commands

```bash
# Test build locally
vercel dev

# Check function logs
vercel logs

# Deploy with debug info
vercel --debug
```

## Cost Considerations

### Free Tier Limits (Hobby Plan)
- 100GB bandwidth per month
- 100 serverless function invocations per day
- 6,000 build minutes per month

### Pro Plan Benefits
- 1TB bandwidth per month
- 1,000 serverless function invocations per day
- Custom domains with SSL
- Advanced analytics

### Optimization Tips
- Use static generation when possible
- Implement efficient caching
- Monitor usage in Vercel dashboard
- Optimize function execution time

Your DocsDeploy documentation site is now live on Vercel with automatic deployments, serverless functions, and global CDN distribution!