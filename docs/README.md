# DocsDeploy

A plug-and-play documentation deployment solution that transforms your markdown files into a beautiful, navigable documentation website.

## Overview

DocsDeploy automatically reads markdown files from your `docs` folder and generates a professional documentation site with:

- **Automatic navigation** based on your folder structure
- **Beautiful markdown rendering** with syntax highlighting
- **GitHub integration** as a fallback source
- **Responsive design** that works on all devices
- **Easy deployment** to any static hosting platform

## Key Features

### 🗂️ Automatic File Discovery
- Scans your `docs` folder for markdown files
- Generates navigation tree based on folder structure
- Supports nested directories and organization

### 📝 Rich Markdown Support
- Full GitHub Flavored Markdown support
- Syntax highlighting for code blocks
- Tables, lists, links, and images
- Clean, readable typography

### 🔄 GitHub Integration
- Fallback to GitHub repository when local files aren't available
- Configurable via environment variables
- Supports private repositories with proper authentication

### 🎨 Professional Design
- Clean, modern interface inspired by popular documentation sites
- Syntax-highlighted code blocks
- Responsive layout for mobile and desktop
- Intuitive navigation with expandable sections

### 🚀 Deploy Anywhere
- Works with any static hosting service
- No server-side requirements
- Built with Vite for fast, optimized builds

## Quick Start

1. **Fork this repository**
2. **Add your markdown files** to the `docs` folder
3. **Deploy** to your preferred platform (Netlify, Vercel, Azure, etc.)
4. **Configure** GitHub integration if needed

## Use Cases

- **API Documentation**: Document your REST APIs, GraphQL schemas, or SDKs
- **Project Documentation**: User guides, developer docs, and tutorials
- **Knowledge Bases**: Internal documentation and wikis
- **Product Documentation**: Feature guides and help documentation
- **Open Source Projects**: README extensions and contributor guides

## Technical Details

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: Tailwind CSS with custom documentation theme
- **Markdown**: Marked.js for reliable markdown parsing
- **Routing**: React Router for SPA navigation

## Environment Configuration

```bash
# GitHub Integration (optional)
VITE_GITHUB_OWNER=your-username
VITE_GITHUB_REPO=your-repository
VITE_GITHUB_BRANCH=main
VITE_DOCS_PATH=docs
```

## File Structure

```
your-project/
├── docs/                 # Your documentation files
│   ├── getting-started.md
│   ├── api/
│   │   └── reference.md
│   └── guides/
│       └── tutorial.md
├── src/                  # DocsDeploy source code
├── public/               # Static assets
└── package.json
```

## Contributing

DocsDeploy is open source and welcomes contributions. Feel free to:

- Report bugs and request features
- Improve documentation
- Submit pull requests
- Share your deployed documentation sites

## License

MIT License - feel free to use this for personal or commercial projects.