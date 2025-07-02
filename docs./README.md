# DocsDeploy Documentation

Welcome to DocsDeploy! This documentation will help you get started with deploying and customizing your documentation site.

## What is DocsDeploy?

DocsDeploy is a beautiful, production-ready documentation website that automatically reads from your GitHub repository's `docs` folder or local documentation files and presents them as a clean, navigable documentation site.

## Key Features

- **📁 Flexible Source**: Works with local `docs` folder or GitHub repositories
- **🎨 Beautiful Design**: Clean, professional interface with excellent typography
- **📱 Responsive**: Works perfectly on desktop, tablet, and mobile
- **⚡ Fast**: Optimized for performance with static generation options
- **🔒 Secure**: Support for private repositories with GitHub tokens
- **🚀 Easy Deploy**: Multiple deployment options with detailed guides

## Quick Start

1. **Clone the project**
   ```bash
   git clone <your-docsdeploy-repo>
   cd docsdeploy
   npm install
   ```

2. **Add your documentation**
   ```bash
   mkdir docs
   # Add your .md files to the docs folder
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Visit** `http://localhost:3000` to see your documentation!

## Documentation Structure

Your documentation should be organized in a `docs` folder with Markdown files:

```
docs/
├── README.md                 # Main documentation page
├── getting-started.md        # Getting started guide
├── deployment/              # Deployment guides
│   ├── azure-storage.md
│   ├── azure-app-service.md
│   ├── netlify.md
│   └── vercel.md
└── api/                     # API documentation
    ├── authentication.md
    └── endpoints.md
```

## Configuration Options

DocsDeploy automatically detects and uses:

1. **Local docs folder** (if present) - highest priority
2. **GitHub repository** (if configured) - fallback option

### Environment Variables

For GitHub integration, set these environment variables:

```bash
GITHUB_REPO_OWNER=your-github-username
GITHUB_REPO_NAME=your-repository-name
GITHUB_DOCS_PATH=docs
GITHUB_TOKEN=ghp_your_token_here  # For private repos only
```

## Deployment Guides

Choose your preferred deployment platform:

- **[Azure Storage](deployment/azure-storage.md)** - Cost-effective static hosting
- **[Azure App Service](deployment/azure-app-service.md)** - Full-featured web app hosting
- **[Netlify](deployment/netlify.md)** - Modern static site hosting with serverless functions
- **[Vercel](deployment/vercel.md)** - Optimized for performance and developer experience

## Markdown Features

DocsDeploy supports GitHub Flavored Markdown with:

- **Headers** with automatic navigation
- **Code blocks** with syntax highlighting
- **Tables** with clean styling
- **Lists** and nested content
- **Links** and images
- **Blockquotes** for callouts

### Code Example

```javascript
// Example JavaScript code
function greetUser(name) {
  return `Hello, ${name}! Welcome to DocsDeploy.`;
}

console.log(greetUser('Developer'));
```

### Table Example

| Feature | Local Docs | GitHub Integration |
|---------|------------|-------------------|
| Setup Time | ⚡ Instant | 🔧 5 minutes |
| Private Repos | ✅ Yes | ✅ Yes (with token) |
| Auto Updates | ❌ Manual | ✅ Automatic |
| Offline Access | ✅ Yes | ❌ No |

## Customization

### Styling

The default theme provides a clean, professional look. You can customize:

- Colors and typography in the CSS files
- Layout and spacing
- Navigation structure
- Brand elements

### Content Organization

- Use clear, descriptive file names
- Organize related content in folders
- Start each document with a clear H1 heading
- Use consistent formatting throughout

## Best Practices

### Writing Documentation

1. **Start with an overview** - Help users understand what they're looking at
2. **Use clear headings** - Create a logical hierarchy
3. **Include examples** - Show, don't just tell
4. **Keep it updated** - Regular maintenance keeps docs valuable
5. **Test your instructions** - Ensure they actually work

### File Organization

1. **Group related content** - Use folders for logical sections
2. **Use descriptive names** - Make file purposes clear
3. **Create an index** - Help users find what they need
4. **Link between pages** - Create a connected experience

### Performance

1. **Optimize images** - Use appropriate sizes and formats
2. **Keep files focused** - Break up very long documents
3. **Use static generation** - When possible, for faster loading
4. **Monitor usage** - Understand how your docs are being used

## Troubleshooting

### Common Issues

**Documentation not loading?**
- Check that your `docs` folder exists and contains `.md` files
- Verify GitHub configuration if using remote docs
- Check the browser console for error messages

**Styling looks broken?**
- Ensure all CSS files are properly loaded
- Check for JavaScript errors in the console
- Verify the build process completed successfully

**GitHub integration not working?**
- Verify your GitHub token has the correct permissions
- Check that the repository and docs path are correct
- Ensure the repository is accessible with your token

### Getting Help

- Check the deployment guides for platform-specific issues
- Review the browser console for error messages
- Verify your configuration matches the examples
- Test with a simple setup first, then add complexity

## Contributing

We welcome contributions to make DocsDeploy even better! Whether it's:

- 🐛 Bug fixes
- ✨ New features
- 📚 Documentation improvements
- 🎨 Design enhancements

Feel free to open issues and pull requests.

## License

DocsDeploy is open source and available under the MIT License. Use it for your projects, modify it as needed, and share your improvements with the community!

---

**Ready to deploy your documentation?** Choose a deployment platform from the guides above and get your docs live in minutes!