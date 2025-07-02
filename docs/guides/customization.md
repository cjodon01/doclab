# Customization Guide

Learn how to customize your DocsDeploy site to match your brand and requirements.

## Styling

DocsDeploy uses Tailwind CSS for styling, making it easy to customize the appearance.

### Colors

Update the color scheme by modifying `tailwind.config.ts`:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          900: '#1e3a8a',
        },
        // Add your custom colors
      }
    }
  }
}
```

### Typography

Customize fonts and typography:

```css
/* In globals.css */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

body {
  font-family: 'Inter', sans-serif;
}
```

### Layout

Modify the layout components:
- `components/Navbar.tsx` - Top navigation
- `components/Sidebar.tsx` - Documentation navigation
- `app/layout.tsx` - Root layout

## Configuration

### Site Information

Update site metadata in `app/layout.tsx`:

```typescript
export const metadata = {
  title: 'Your Documentation Site',
  description: 'Comprehensive documentation for your project',
  // Add more metadata
}
```

### Navigation

Customize the navigation structure by modifying how files are processed in `lib/docs.ts`.

### GitHub Integration

Configure GitHub settings in your environment:

```env
GITHUB_REPO_OWNER=your-org
GITHUB_REPO_NAME=your-repo
GITHUB_DOCS_PATH=documentation
GITHUB_BRANCH=main
```

## Content Customization

### Markdown Processing

Extend markdown processing in `lib/markdown.ts`:

```typescript
// Add custom remark/rehype plugins
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'

// Configure your markdown processor
```

### Custom Components

Add custom React components for enhanced content:

```typescript
// components/CustomCallout.tsx
export function Callout({ type, children }) {
  return (
    <div className={`callout callout-${type}`}>
      {children}
    </div>
  )
}
```

### File Organization

Organize your documentation:

```
docs/
├── README.md              # Homepage
├── quick-start.md         # Getting started
├── api/                   # API documentation
├── guides/               # How-to guides
├── reference/            # Reference materials
└── examples/             # Code examples
```

## Advanced Customization

### Custom Themes

Create theme variants:

```css
/* Light theme (default) */
:root {
  --bg-primary: #ffffff;
  --text-primary: #1f2937;
}

/* Dark theme */
[data-theme="dark"] {
  --bg-primary: #1f2937;
  --text-primary: #f9fafb;
}
```

### Search Integration

Add search functionality:

```typescript
// Integrate with Algolia, Fuse.js, or other search providers
import { InstantSearch } from 'react-instantsearch-hooks-web'
```

### Analytics

Add analytics tracking:

```typescript
// Google Analytics, Plausible, or other analytics
import { Analytics } from '@vercel/analytics/react'
```

## Deployment Customization

### Build Configuration

Customize the build process in `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // Add your customizations
}
```

### Environment-Specific Settings

Configure different settings for different environments:

```typescript
const config = {
  development: {
    apiUrl: 'http://localhost:3000',
  },
  production: {
    apiUrl: 'https://your-domain.com',
  }
}
```

## Best Practices

1. **Keep it Simple**: Start with small customizations
2. **Test Changes**: Always test in development first
3. **Version Control**: Commit changes incrementally
4. **Documentation**: Document your customizations
5. **Performance**: Monitor build times and bundle size

## Examples

Check out these customization examples:
- Custom color schemes
- Brand integration
- Advanced layouts
- Interactive components

Need inspiration? Browse our showcase of customized DocsDeploy sites!