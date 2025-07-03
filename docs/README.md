# DocsDeploy Documentation

Welcome to DocsDeploy! This documentation demonstrates the hybrid approach - these files exist locally in the `docs` folder, with GitHub as a fallback option.

## Hybrid Documentation System

DocsDeploy supports multiple documentation sources:

### 🏠 Local Documentation
- Files stored in the `docs` folder
- Fastest access and loading
- Works offline during development
- Primary source when available

### 🌐 GitHub Integration  
- Fetches from your GitHub repository
- Automatic updates when you push changes
- Works with private repositories
- Fallback when local docs unavailable

### 🔄 Hybrid Mode
- **Best of both worlds**
- Local docs as primary source
- GitHub as automatic fallback
- Seamless switching between sources

## Current Configuration

This instance is running in **hybrid mode**, which means:

1. **Primary**: Reading from local `docs` folder
2. **Fallback**: GitHub repository (if configured)
3. **Automatic**: Switches sources as needed

## File Structure

```
docs/
├── README.md              # This file
├── getting-started.md     # Quick start guide
└── deployment/           # Deployment guides
    ├── netlify.md
    ├── vercel.md
    ├── azure-storage.md
    └── azure-app-service.md
```

## Benefits of Hybrid Approach

### For Development
- ✅ Fast local access
- ✅ Offline capability
- ✅ Immediate updates
- ✅ No API rate limits

### For Production
- ✅ Reliable fallback
- ✅ Remote updates possible
- ✅ Team collaboration
- ✅ Version control integration

### For Deployment
- ✅ Works on any platform
- ✅ Reduced external dependencies
- ✅ Better performance
- ✅ Increased reliability

## Getting Started

1. **Add local docs**: Create markdown files in the `docs` folder
2. **Configure GitHub** (optional): Set environment variables for remote access
3. **Deploy**: Choose your preferred hosting platform
4. **Enjoy**: Your documentation is live with automatic fallback!

## Environment Variables

For GitHub integration, configure these variables:

```bash
# Required for GitHub integration
GITHUB_REPO_OWNER=your-username
GITHUB_REPO_NAME=your-repository
GITHUB_DOCS_PATH=docs

# Optional for private repositories
GITHUB_TOKEN=your-personal-access-token
```

## Deployment Platforms

Choose from our detailed deployment guides:

- **[Netlify](deployment/netlify.md)** - Serverless functions with automatic deployments
- **[Vercel](deployment/vercel.md)** - Optimized for performance and developer experience  
- **[Azure Storage](deployment/azure-storage.md)** - Cost-effective static hosting
- **[Azure App Service](deployment/azure-app-service.md)** - Full-featured web application hosting

Each platform guide includes specific instructions for both local and GitHub-based documentation.

---

**Ready to get started?** Check out the [Getting Started](getting-started.md) guide!