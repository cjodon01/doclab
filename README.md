# DocsDeploy

A modern, plug-and-play documentation deployment solution that transforms your markdown files into beautiful, navigable documentation websites. Built with React, Vite, and Tailwind CSS.

![DocsDeploy](https://img.shields.io/badge/React-18.3.1-blue)
![DocsDeploy](https://img.shields.io/badge/Vite-5.x-purple)
![DocsDeploy](https://img.shields.io/badge/Tailwind-3.x-teal)
![DocsDeploy](https://img.shields.io/badge/License-MIT-green)

## ✨ Features

- 📁 **Hybrid Documentation Sources**: Local files + GitHub integration
- 🎨 **Beautiful UI**: Modern design with dark/light mode support
- 📱 **Fully Responsive**: Mobile-first design approach
- ⚡ **Lightning Fast**: Built with Vite for optimal performance
- 🔍 **Auto Navigation**: Automatically generates navigation from folder structure
- 🌐 **Multiple Deployment Options**: Deploy to Netlify, Vercel, Azure, or GitHub Pages
- 🔒 **Private Repo Support**: Works with private GitHub repositories
- 🚀 **Zero Configuration**: Works out of the box

## 🚀 Quick Start

1. **Fork or clone this repository**
   ```bash
   git clone https://github.com/yourusername/docsdeploy.git
   cd docsdeploy
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Add your documentation**
   - Create `.md` files in the `docs/` folder
   - Organize in subdirectories as needed
   - Navigation auto-generates from folder structure

4. **Run locally**
   ```bash
   npm run dev
   ```

5. **Deploy** (see deployment options below)

## 📁 Project Structure

```
docsdeploy/
├── docs/                          # Your documentation files go here
│   ├── README.md                  # Main documentation landing page
│   ├── getting-started.md         # Quick start guide
│   ├── deployment.md              # Deployment instructions
│   └── deployment/                # Platform-specific guides
│       ├── netlify.md
│       ├── vercel.md
│       ├── azure-static-web-apps.md
│       └── azure-app-service.md
├── src/
│   ├── components/
│   │   ├── DocsNavigation.tsx     # Sidebar navigation
│   │   ├── MarkdownRenderer.tsx   # Content rendering with syntax highlighting
│   │   └── RefreshButton.tsx      # Refresh functionality
│   ├── hooks/
│   │   └── useMarkdownFiles.ts    # Custom hook for loading docs
│   ├── lib/
│   │   ├── githubClient.ts        # GitHub API integration
│   │   └── utils.ts               # Utility functions
│   ├── pages/
│   │   ├── Index.tsx              # Main documentation page
│   │   └── NotFound.tsx           # 404 page
│   └── index.css                  # Global styles and design tokens
├── .github/
│   └── workflows/
│       ├── deploy-gh-pages.yml    # GitHub Pages deployment
│       └── deploy-azure.yml       # Azure deployment
├── netlify.toml                   # Netlify configuration
├── vercel.json                    # Vercel configuration
├── staticwebapp.config.json       # Azure Static Web Apps configuration
└── package.json
```

## 🌐 Deployment Options

DocsDeploy is a **static React application** that can be deployed to any static hosting platform. All builds output to the `dist/` folder using Vite.

### 🚀 One-Click Deployments

| Platform | Deploy Button | Best For |
|----------|---------------|----------|
| **Netlify** | [![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/yourusername/docsdeploy) | Ease of use, great free tier |
| **Vercel** | [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/docsdeploy) | Performance, DX, global CDN |
| **Azure** | [Deploy to Azure](https://portal.azure.com/) | Enterprise, Microsoft ecosystem |

### 📋 Build Configuration

All platforms use these standard settings:
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Node Version**: 18+
- **Framework**: Vite (React)

### 📖 Detailed Guides

For platform-specific instructions, see our detailed deployment guides:
- [Netlify Deployment](docs/deployment/netlify.md)
- [Vercel Deployment](docs/deployment/vercel.md) 
- [Azure Static Web Apps](docs/deployment/azure-static-web-apps.md)
- [GitHub Pages](docs/deployment.md#github-pages)

## ⚙️ Configuration

### Hybrid Documentation System

DocsDeploy supports multiple documentation sources:

- **🏠 Local First**: Reads from `docs/` folder (fastest, works offline)
- **🌐 GitHub Fallback**: Fetches from GitHub repository when local unavailable
- **🔄 Automatic Switching**: Seamlessly switches between sources as needed

### Environment Variables (Optional)

For GitHub integration, add these environment variables to your hosting platform:

```bash
VITE_GITHUB_OWNER=yourusername      # GitHub username/organization  
VITE_GITHUB_REPO=your-docs-repo     # Repository name
VITE_GITHUB_BRANCH=main             # Branch to read from (default: main)
VITE_GITHUB_DOCS_PATH=docs          # Path to docs folder (default: docs)
VITE_GITHUB_TOKEN=your-token        # Only required for private repositories
```

> **Note**: All environment variables must be prefixed with `VITE_` for client-side access.

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📝 Writing Documentation

### File Organization
- Create `.md` files in the `docs/` folder
- Use descriptive filenames (e.g., `getting-started.md`)
- Organize in subdirectories for complex documentation
- The navigation automatically follows your folder structure

### Markdown Features
- GitHub Flavored Markdown support
- Syntax highlighting for code blocks
- Tables, lists, links, and images
- Math expressions (via extensions)

### Example Structure
```
docs/
├── README.md                 # Overview/landing page
├── getting-started.md        # Quick start guide
├── api/
│   ├── authentication.md
│   └── endpoints.md
├── guides/
│   ├── installation.md
│   └── configuration.md
└── deployment.md            # Deployment instructions
```

## 🎨 Customization

### Styling
- Edit `src/index.css` for global styles
- Modify `tailwind.config.ts` for theme customization
- Update design tokens in CSS variables

### Components
- `DocsNavigation.tsx` - Sidebar navigation
- `MarkdownRenderer.tsx` - Content rendering
- `RefreshButton.tsx` - Refresh functionality

## 🔧 Advanced Features

### 🔀 Hybrid Documentation System
- **Primary Source**: Local `docs/` folder for fastest access
- **Automatic Fallback**: GitHub repository when local unavailable  
- **Private Repository Support**: Works with private repos using GitHub tokens
- **Configurable Paths**: Custom branch and folder configurations

### 🧭 Smart Navigation
- **Auto-Generated**: Navigation tree from folder structure
- **Expandable Sections**: Collapsible folders and subfolders
- **Active Highlighting**: Current page and section indicators
- **Mobile Responsive**: Touch-friendly sidebar with smooth animations
- **Search Ready**: Prepared for future search functionality

### ⚡ Performance Optimized
- **Vite Build System**: Lightning-fast development and production builds
- **Code Splitting**: Automatic chunking for optimal loading
- **Markdown Caching**: Intelligent caching of parsed content
- **Lazy Loading**: Content loaded on-demand for large documentation sets
- **CDN Ready**: Optimized for global content delivery networks

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Fork the repository** and clone it locally
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes** and test thoroughly
4. **Follow the coding standards**: Use TypeScript, format with Prettier
5. **Update documentation** if needed
6. **Submit a pull request** with a clear description

### Development Setup

```bash
# Clone your fork
git clone https://github.com/yourusername/docsdeploy.git
cd docsdeploy

# Install dependencies
npm install

# Start development server
npm run dev

# Run linting
npm run lint

# Build for production
npm run build
```

## 📄 License

MIT License - feel free to use for personal or commercial projects. See [LICENSE](LICENSE) for details.

## 🆘 Support & Community

- 📖 **Documentation**: Check our [comprehensive guides](docs/)
- 🐛 **Bug Reports**: [Open an issue](https://github.com/yourusername/docsdeploy/issues)
- 💡 **Feature Requests**: [Request a feature](https://github.com/yourusername/docsdeploy/issues)
- 💬 **Discussions**: [Join the conversation](https://github.com/yourusername/docsdeploy/discussions)

## 🚀 Related Projects

- [Vite](https://vitejs.dev/) - Next generation frontend tooling
- [React](https://reactjs.org/) - The library for web and native user interfaces
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Marked](https://marked.js.org/) - Markdown parser and compiler

---

**Ready to deploy your documentation?** Choose your preferred platform above and get started in minutes! 🎉