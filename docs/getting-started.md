# Getting Started

Welcome to DocsDeploy! This is a simple documentation deployment tool that automatically reads markdown files and creates a beautiful documentation site.

## Quick Setup

1. **Fork or clone this repository**
   ```bash
   git clone <your-repo-url>
   cd docsdeploy
   ```

2. **Add your markdown files to the `docs` folder**
   - Create `.md` files in the `docs` directory
   - Organize them in subdirectories as needed
   - The navigation will automatically reflect your folder structure

3. **Deploy to your preferred platform**
   - **Netlify**: Connect your GitHub repo and deploy
   - **Vercel**: Import your project and deploy
   - **Azure App Service**: Use GitHub Actions or manual deployment
   - **GitHub Pages**: Enable GitHub Pages in your repo settings

## Configuration

### Environment Variables

For GitHub integration fallback, set these environment variables:

- `VITE_GITHUB_OWNER`: Your GitHub username/organization
- `VITE_GITHUB_REPO`: Repository name  
- `VITE_GITHUB_BRANCH`: Branch to read from (default: main)
- `VITE_DOCS_PATH`: Path to docs folder (default: docs)

### Example `.env` file
```
VITE_GITHUB_OWNER=yourusername
VITE_GITHUB_REPO=your-docs-repo
VITE_GITHUB_BRANCH=main
VITE_DOCS_PATH=docs
```

## Features

- 📁 **Automatic navigation generation** from folder structure
- 📝 **Markdown rendering** with syntax highlighting
- 🔄 **GitHub integration fallback** when local files aren't available
- 📱 **Mobile responsive** design
- 🚀 **Easy deployment** to any static hosting service
- 🎨 **Clean, professional** documentation theme

## File Structure

```
your-repo/
├── docs/
│   ├── getting-started.md
│   ├── api/
│   │   ├── authentication.md
│   │   └── endpoints.md
│   └── guides/
│       ├── installation.md
│       └── configuration.md
├── src/
│   └── ... (DocsDeploy source code)
└── package.json
```

The navigation tree will automatically follow your `docs` folder structure.