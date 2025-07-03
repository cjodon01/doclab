# Getting Started with DocsDeploy

Welcome to DocsDeploy! This guide will help you get your documentation site up and running quickly.

## What is DocsDeploy?

DocsDeploy is a flexible documentation platform that can read from:
- **Local docs folder** (primary source when available)
- **GitHub repository** (fallback or standalone source)
- **Hybrid mode** (local with GitHub fallback)

## Quick Setup

### 1. Local Documentation (Recommended)

Create a `docs` folder in your project with markdown files:

```
docs/
├── README.md
├── getting-started.md
├── api/
│   └── endpoints.md
└── guides/
    └── deployment.md
```

### 2. GitHub Integration (Optional)

For GitHub integration, set these environment variables:

```bash
GITHUB_REPO_OWNER=your-username
GITHUB_REPO_NAME=your-repo
GITHUB_DOCS_PATH=docs
GITHUB_TOKEN=your-token  # Only for private repos
```

### 3. Hybrid Mode (Best of Both)

When both local docs and GitHub are configured:
- **Primary**: Local docs folder
- **Fallback**: GitHub repository
- **Automatic switching** if local becomes unavailable

## Features

- 📁 **Flexible Sources**: Local, GitHub, or hybrid
- 🎨 **Beautiful Design**: Clean, professional interface
- 📱 **Responsive**: Works on all devices
- ⚡ **Fast Loading**: Optimized performance
- 🔒 **Secure**: Support for private repositories
- 🚀 **Easy Deploy**: Multiple deployment options

## Deployment

DocsDeploy works great on:
- **Netlify** (with serverless functions)
- **Vercel** (with API routes)
- **Azure** (App Service or Static Web Apps)
- **Any static host** (with local docs only)

## Next Steps

1. Add your markdown files to the `docs` folder
2. Configure GitHub integration (optional)
3. Deploy to your preferred platform
4. Enjoy your beautiful documentation site!

For detailed deployment guides, see the deployment section in the sidebar.