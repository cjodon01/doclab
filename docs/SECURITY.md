# Security Policy

## Supported Versions

This project follows semantic versioning. Security updates are provided for the latest version.

| Version | Supported          |
| ------- | ------------------ |
| Latest  | :white_check_mark: |

## Security Features

### HTML Sanitization
- All markdown content is sanitized using DOMPurify to prevent XSS attacks
- Only safe HTML tags and attributes are allowed in rendered content

### Environment Variable Security
- GitHub tokens and sensitive data should never be committed to the repository
- Use platform-specific environment variable configuration
- The `.env` file is excluded from version control

### Security Headers
All deployment configurations include security headers:
- `X-Frame-Options: DENY` - Prevents clickjacking
- `X-Content-Type-Options: nosniff` - Prevents MIME type sniffing
- `X-XSS-Protection: 1; mode=block` - Enables XSS protection
- `Referrer-Policy: strict-origin-when-cross-origin` - Controls referrer information
- `Content-Security-Policy` - Restricts resource loading

### Input Validation
- GitHub configuration parameters are validated to prevent injection attacks
- Only alphanumeric characters, dots, hyphens, and underscores are allowed

## Reporting a Vulnerability

If you discover a security vulnerability, please:

1. **Do NOT** open a public issue
2. Send an email to the project maintainers
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

We will respond within 48 hours and provide updates on the fix timeline.

## Security Best Practices

### For Users
1. **Never commit tokens**: Always use environment variables for GitHub tokens
2. **Use HTTPS**: Ensure your deployment uses HTTPS
3. **Regular updates**: Keep dependencies updated
4. **Monitor access**: Review who has access to your repositories

### For Contributors
1. **Sanitize inputs**: Always validate and sanitize user inputs
2. **Follow secure coding**: Use established security patterns
3. **Dependencies**: Keep third-party packages updated
4. **Code review**: All security-related changes require review

## Secure Deployment

### Environment Variables
Set these securely in your hosting platform:
```bash
VITE_GITHUB_OWNER=your-username
VITE_GITHUB_REPO=your-repo
VITE_GITHUB_BRANCH=main
VITE_GITHUB_DOCS_PATH=docs
VITE_GITHUB_TOKEN=your-secure-token  # Only for private repos
```

### GitHub Token Security
1. Generate tokens with minimal required permissions
2. Use Fine-grained Personal Access Tokens when possible
3. Set appropriate expiration dates
4. Revoke tokens when no longer needed
5. Never share or commit tokens to repositories

### Platform-Specific Security
- **Netlify**: Security headers configured in `netlify.toml`
- **Vercel**: Security headers configured in `vercel.json`
- **Azure**: Security headers configured in `staticwebapp.config.json`

All configurations include proper CSP, XSS protection, and other security measures.