# Deployment

DocsDeploy can be deployed to any static hosting service. Here are step-by-step guides for popular platforms.

## Netlify Deployment

1. **Connect your repository**
   - Go to [Netlify](https://netlify.com)
   - Click "New site from Git"
   - Choose your Git provider and repository

2. **Configure build settings**
   - Build command: `npm run build`
   - Publish directory: `dist`

3. **Set environment variables** (optional)
   - Go to Site settings → Environment variables
   - Add your GitHub configuration variables

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

3. **Environment variables**
   - Add your GitHub configuration in the Environment Variables section

4. **Deploy**
   - Click "Deploy"
   - Access your site via the provided Vercel URL

## Azure App Service

1. **Create App Service**
   - Go to Azure Portal
   - Create a new App Service
   - Choose "Static Web App" or regular "App Service"

2. **Configure deployment**
   - Connect to your GitHub repository
   - Set build configuration:
     ```yaml
     app_location: "/"
     api_location: ""
     output_location: "dist"
     ```

3. **Set environment variables**
   - In App Service settings, add your GitHub configuration

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