# Deployment Guide

Learn how to deploy your DocsDeploy documentation site to various platforms.

## Vercel (Recommended)

Vercel provides the easiest deployment experience for Next.js applications.

### Steps:

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Connect to Vercel**
   - Visit [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Configure environment variables
   - Deploy!

3. **Environment Variables**
   Add these in your Vercel dashboard:
   ```
   GITHUB_REPO_OWNER=your-username
   GITHUB_REPO_NAME=your-repo
   GITHUB_DOCS_PATH=docs
   GITHUB_TOKEN=your-token
   ```

## Netlify

Deploy as a static site to Netlify.

### Steps:

1. **Build the site**
   ```bash
   npm run build
   ```

2. **Deploy to Netlify**
   - Drag and drop the `out` folder to Netlify
   - Or connect your GitHub repository
   - Configure build settings:
     - Build command: `npm run build`
     - Publish directory: `out`

## Docker

Deploy using Docker containers.

### Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

### Build and Run

```bash
docker build -t docsdeploy .
docker run -p 3000:3000 docsdeploy
```

## Static Hosting

Deploy to any static hosting provider.

### Build Static Site

```bash
npm run build
```

The `out` directory contains your static site files.

### Hosting Options

- **GitHub Pages**: Push the `out` folder to `gh-pages` branch
- **AWS S3**: Upload files to S3 bucket with static hosting
- **Firebase Hosting**: Use Firebase CLI to deploy
- **Surge.sh**: Simple command-line deployment

## Environment Configuration

For production deployments, ensure you have:

- ✅ GitHub repository configured
- ✅ Environment variables set
- ✅ Build process working
- ✅ Domain configured (optional)

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check Node.js version (18+ recommended)
   - Verify all dependencies are installed
   - Check environment variables

2. **GitHub API Errors**
   - Verify repository exists and is accessible
   - Check GitHub token permissions
   - Ensure docs folder exists in repository

3. **Styling Issues**
   - Clear browser cache
   - Check CSS build process
   - Verify Tailwind configuration

Need help? Check our troubleshooting guide or open an issue!