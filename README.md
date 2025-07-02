# DocsDeploy 📚

A beautiful, production-ready documentation website that automatically reads from your GitHub repository's `docs` folder and presents it as a clean, navigable documentation site.

![DocsDeploy Preview](https://images.pexels.com/photos/1181472/pexels-photo-1181472.jpeg?auto=compress&cs=tinysrgb&w=1200&h=600&fit=crop)

## ✨ Features

- **Live GitHub Integration**: Fetches documentation directly from your GitHub repository
- **Auto-Generated Navigation**: Creates a sidebar based on your folder structure
- **Beautiful Design**: Clean, professional interface with excellent typography
- **Markdown Support**: Full GitHub Flavored Markdown with syntax highlighting
- **Responsive**: Works perfectly on desktop, tablet, and mobile
- **Private Repo Support**: Optional GitHub token for private repositories
- **Zero Configuration**: Just set environment variables and deploy
- **Edit Links**: Direct links to edit files on GitHub

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <your-docsdeploy-repo>
cd docsdeploy
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env.local` and update with your repository details:

```bash
cp .env.example .env.local
```

```env
# Required: Your GitHub repository details
GITHUB_REPO_OWNER=your-github-username
GITHUB_REPO_NAME=your-repo-name
GITHUB_DOCS_PATH=docs

# Optional: For private repositories
GITHUB_TOKEN=ghp_your_token_here

# Optional: Site customization
SITE_NAME=My Documentation
SITE_DESCRIPTION=Documentation for my project
```

### 3. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to see your documentation site!

## 📁 Repository Structure

Your GitHub repository should have a `docs` folder (or whatever you specify in `GITHUB_DOCS_PATH`) with Markdown files:

```
your-repo/
├── docs/
│   ├── README.md
│   ├── getting-started.md
│   ├── api/
│   │   ├── authentication.md
│   │   └── endpoints.md
│   └── guides/
│       ├── installation.md
│       └── configuration.md
└── ...
```

## 🔧 Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GITHUB_REPO_OWNER` | ✅ | GitHub username or organization |
| `GITHUB_REPO_NAME` | ✅ | Repository name |
| `GITHUB_DOCS_PATH` | ✅ | Path to docs folder (usually `docs`) |
| `GITHUB_TOKEN` | ❌ | GitHub personal access token (required for private repos) |
| `SITE_NAME` | ❌ | Site title (default: "DocsDeploy") |
| `SITE_DESCRIPTION` | ❌ | Site description for SEO |

### GitHub Token Setup

For private repositories, you'll need a GitHub Personal Access Token:

1. Go to [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Select the `repo` scope for private repositories
4. Copy the token and add it to your `.env.local` file

## 🎨 Customization

### Styling

DocsDeploy uses Tailwind CSS and is fully customizable. Key files:

- `app/globals.css` - Global styles and CSS variables
- `tailwind.config.ts` - Tailwind configuration
- `components/` - Individual UI components

### Content

DocsDeploy automatically:
- Generates navigation from your folder structure
- Renders GitHub Flavored Markdown
- Adds syntax highlighting for code blocks
- Creates edit links back to GitHub
- Extracts page titles from H1 headings

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to [Vercel](https://vercel.com)
3. Add your environment variables in the Vercel dashboard
4. Deploy!

### Netlify

1. Build the static site:
   ```bash
   npm run build
   ```
2. Deploy the `out` folder to Netlify
3. Set environment variables in Netlify dashboard

### Other Platforms

DocsDeploy exports as a static site and can be deployed anywhere:

```bash
npm run build
```

The static files will be in the `out` directory.

## 🛠 Development

### Tech Stack

- **Framework**: Next.js 13+ with App Router
- **Styling**: Tailwind CSS + shadcn/ui
- **Markdown**: remark + rehype with syntax highlighting
- **Icons**: Lucide React
- **TypeScript**: Full type safety

### Project Structure

```
docsdeploy/
├── app/                    # Next.js app directory
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── ErrorBoundary.tsx # Error handling
│   ├── MarkdownRenderer.tsx
│   ├── Navbar.tsx
│   └── Sidebar.tsx
├── lib/                  # Utilities
│   ├── github.ts         # GitHub API integration
│   ├── markdown.ts       # Markdown processing
│   └── utils.ts          # General utilities
└── ...
```

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

MIT License - feel free to use this for your own projects!

## 🤝 Support

- **Issues**: [GitHub Issues](https://github.com/your-username/docsdeploy/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/docsdeploy/discussions)

---

Made with ❤️ for the developer community. Share your documentation beautifully!