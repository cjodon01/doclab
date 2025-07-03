# DocsDeploy

A plug-and-play documentation deployment solution that transforms your markdown files into beautiful, navigable documentation websites.

## 🚀 Quick Start

1. **Fork or clone this repository**
   ```bash
   git clone <your-repo-url>
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
├── docs/                     # Your documentation files go here
│   ├── getting-started.md
│   ├── deployment.md
│   └── README.md
├── src/
│   ├── components/
│   │   ├── DocsNavigation.tsx
│   │   ├── MarkdownRenderer.tsx
│   │   └── RefreshButton.tsx
│   ├── hooks/
│   │   └── useMarkdownFiles.ts
│   ├── pages/
│   │   └── Index.tsx
│   └── lib/
├── deployment/               # Deployment configurations
│   ├── netlify.toml
│   ├── vercel.json
│   └── azure-static-web-apps.yml
├── .github/
│   └── workflows/
│       ├── deploy-gh-pages.yml
│       └── deploy-azure.yml
└── package.json
```

## 🌐 Deployment Options

### Netlify
- **One-click deploy**: [![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/yourusername/docsdeploy)
- **Manual**: Push to GitHub and connect in Netlify dashboard
- **Config**: Uses `deployment/netlify.toml`

### Vercel
- **One-click deploy**: [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/docsdeploy)
- **Manual**: Import project from GitHub
- **Config**: Uses `vercel.json`

### Azure Static Web Apps
- **Manual**: Create Static Web App in Azure Portal
- **Config**: Uses `deployment/azure-static-web-apps.yml`

### GitHub Pages
- **Automatic**: Enable GitHub Actions in `.github/workflows/deploy-gh-pages.yml`
- **Manual**: Enable Pages in repository settings

## ⚙️ Configuration

### Environment Variables (Optional)

For GitHub integration fallback when local docs aren't available:

```bash
VITE_GITHUB_OWNER=yourusername      # GitHub username/organization
VITE_GITHUB_REPO=your-docs-repo     # Repository name
VITE_GITHUB_BRANCH=main             # Branch to read from
VITE_DOCS_PATH=docs                 # Path to docs folder
```

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

### GitHub Integration
- Automatic fallback to GitHub when local files unavailable
- Supports private repositories with authentication
- Configurable branch and folder paths

### Navigation
- Auto-generated from folder structure
- Expandable/collapsible sections
- Active page highlighting
- Mobile-responsive sidebar

### Performance
- Built with Vite for fast development and builds
- Lazy loading for large documentation sets
- Optimized markdown parsing and rendering

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - feel free to use for personal or commercial projects.

## 🆘 Support

- Check the [deployment guide](docs/deployment.md)
- Open an issue for bugs or feature requests
- Join our community discussions

---

**Ready to deploy your documentation?** Choose your preferred platform above and get started in minutes!