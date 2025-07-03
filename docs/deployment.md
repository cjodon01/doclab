# Deployment

DocsDeploy is a static React application that can be deployed to any static hosting service. Here are step-by-step guides for popular platforms.

## Quick Deploy

### One-Click Deployments
- **Netlify**: [![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/yourusername/docsdeploy)
- **Vercel**: [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/docsdeploy)

## Netlify Deployment

1. **Connect your repository**
   - Go to [Netlify](https://netlify.com)
   - Click "New site from Git"
   - Choose your Git provider and repository

2. **Configure build settings**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node version: 18

3. **Set environment variables** (optional for GitHub integration)
   ```
   VITE_GITHUB_OWNER=your-username
   VITE_GITHUB_REPO=your-repo-name
   VITE_GITHUB_BRANCH=main
   VITE_GITHUB_DOCS_PATH=docs
   VITE_GITHUB_TOKEN=your-token (only for private repos)
   ```

4. **Deploy**
   - Click "Deploy site"
   - Your site will be available at a Netlify URL

## Vercel Deployment

1. **Import your project**
   - Go to [Vercel](https://vercel.com)
   - Click "Import Project"
   - Select your repository

2. **Configure project**
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. **Environment variables** (optional for GitHub integration)
   - Add your GitHub configuration in the Environment Variables section
   - Use the same variables as listed above for Netlify

4. **Deploy**
   - Click "Deploy"
   - Access your site via the provided Vercel URL

## Azure Static Web Apps

1. **Create Static Web App**
   - Go to Azure Portal
   - Create a new "Static Web App" resource
   - Connect to your GitHub repository

2. **Configure deployment**
   - App location: `/`
   - Build location: `dist`
   - Build command: `npm run build`

3. **Set environment variables** (optional for GitHub integration)
   - In Static Web App settings → Configuration
   - Add the same GitHub variables as above

4. **Deploy**
   - Azure will automatically build and deploy from your repository

## GitHub Pages

1. **Enable GitHub Pages**
   - Go to your repository settings
   - Scroll to "Pages" section
   - Select "GitHub Actions" as source

2. **Create workflow file**
   Create `.github/workflows/deploy.yml`:
   ```yaml
   name: Deploy to GitHub Pages
   
   on:
     push:
       branches: [ main ]
   
   jobs:
     build-and-deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v2
         
         - name: Setup Node.js
           uses: actions/setup-node@v2
           with:
             node-version: '18'
             
         - name: Install dependencies
           run: npm install
           
         - name: Build
           run: npm run build
           
         - name: Deploy
           uses: peaceiris/actions-gh-pages@v3
           with:
             github_token: ${{ secrets.GITHUB_TOKEN }}
             publish_dir: ./dist
   ```

3. **Set environment variables**
   - Go to repository Settings → Secrets and variables → Actions
   - Add your GitHub configuration as secrets

## Custom Domain Setup

After deployment, you can set up a custom domain:

1. **Purchase a domain** from any domain registrar
2. **Configure DNS** to point to your hosting service
3. **Update hosting settings** to use your custom domain
4. **Enable HTTPS** (usually automatic on modern platforms)

## Automatic Updates

All platforms support automatic redeployment when you push changes to your repository, ensuring your documentation stays up-to-date.