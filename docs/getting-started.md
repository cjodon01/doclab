# Getting Started

Welcome to your documentation site! This guide will help you get up and running quickly.

## Installation

To get started with DocsDeploy:

1. **Clone the repository**
   ```bash
   git clone <your-repo>
   cd docsdeploy
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

## Configuration

DocsDeploy can work with both local files and GitHub repositories.

### Local Documentation

Simply add your Markdown files to the `docs` folder. The application will automatically:
- Generate navigation from your folder structure
- Render your Markdown content
- Provide a clean, searchable interface

### GitHub Integration

To connect to a GitHub repository, set these environment variables:

```env
GITHUB_REPO_OWNER=your-username
GITHUB_REPO_NAME=your-repo
GITHUB_DOCS_PATH=docs
GITHUB_TOKEN=your-token (optional, for private repos)
```

## Writing Documentation

DocsDeploy supports full GitHub Flavored Markdown, including:

- **Headers** and text formatting
- `Code blocks` with syntax highlighting
- Lists and tables
- Links and images
- And much more!

### Code Example

```javascript
function hello(name) {
  console.log(`Hello, ${name}!`);
}

hello('DocsDeploy');
```

## Next Steps

- Explore the sample documentation
- Add your own content
- Customize the styling
- Deploy to your favorite platform

Happy writing! ✨