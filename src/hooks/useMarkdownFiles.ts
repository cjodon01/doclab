import { useState, useEffect } from 'react';

export interface MarkdownFile {
  name: string;
  path: string;
  content: string;
  isDirectory: boolean;
  children?: MarkdownFile[];
}

interface GitHubConfig {
  owner: string;
  repo: string;
  branch: string;
  docsPath: string;
}

export const useMarkdownFiles = () => {
  const [files, setFiles] = useState<MarkdownFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<'local' | 'github'>('local');

  const githubConfig: GitHubConfig = {
    owner: import.meta.env.VITE_GITHUB_OWNER || '',
    repo: import.meta.env.VITE_GITHUB_REPO || '',
    branch: import.meta.env.VITE_GITHUB_BRANCH || 'main',
    docsPath: import.meta.env.VITE_DOCS_PATH || 'docs'
  };

  const fetchFromGitHub = async (): Promise<MarkdownFile[]> => {
    if (!githubConfig.owner || !githubConfig.repo) {
      throw new Error('GitHub configuration missing. Set VITE_GITHUB_OWNER and VITE_GITHUB_REPO environment variables.');
    }

    const response = await fetch(
      `https://api.github.com/repos/${githubConfig.owner}/${githubConfig.repo}/contents/${githubConfig.docsPath}?ref=${githubConfig.branch}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch from GitHub: ${response.statusText}`);
    }

    const contents = await response.json();
    const processedFiles: MarkdownFile[] = [];

    for (const item of contents) {
      if (item.type === 'file' && item.name.endsWith('.md')) {
        const fileResponse = await fetch(item.download_url);
        const content = await fileResponse.text();
        
        processedFiles.push({
          name: item.name.replace('.md', ''),
          path: item.path,
          content,
          isDirectory: false
        });
      } else if (item.type === 'dir') {
        // For now, we'll just mark directories - could be expanded later
        processedFiles.push({
          name: item.name,
          path: item.path,
          content: '',
          isDirectory: true,
          children: []
        });
      }
    }

    return processedFiles;
  };

  const loadLocalFiles = async (): Promise<MarkdownFile[]> => {
    // This would typically require a build-time process to gather local files
    // For now, we'll return some default structure
    const defaultFiles = [
      {
        name: 'Getting Started',
        path: 'getting-started.md',
        content: `# Getting Started

Welcome to DocsDeploy! This is a simple documentation deployment tool.

## Quick Setup

1. Fork or clone this repository
2. Add your markdown files to the \`docs\` folder
3. Deploy to your preferred platform (Netlify, Vercel, Azure, etc.)

## Configuration

Set these environment variables for GitHub integration:

- \`VITE_GITHUB_OWNER\`: Your GitHub username/organization
- \`VITE_GITHUB_REPO\`: Repository name
- \`VITE_GITHUB_BRANCH\`: Branch to read from (default: main)
- \`VITE_DOCS_PATH\`: Path to docs folder (default: docs)

## Features

- Automatic navigation generation
- Markdown rendering
- GitHub integration fallback
- Mobile responsive
- Easy deployment`,
        isDirectory: false
      },
      {
        name: 'README',
        path: 'README.md',
        content: `# DocsDeploy

A plug-and-play documentation deployment solution.

## Features

- Read markdown files from local \`docs\` folder
- Fallback to GitHub repository integration
- Automatic navigation tree generation
- Clean, responsive design
- Easy deployment to any platform

## Deployment

This app can be deployed to:
- Netlify
- Vercel
- Azure App Service
- GitHub Pages
- Any static hosting service`,
        isDirectory: false
      }
    ];

    return defaultFiles;
  };

  useEffect(() => {
    const loadFiles = async () => {
      try {
        setLoading(true);
        setError(null);

        // Try local files first, then fall back to GitHub
        try {
          const localFiles = await loadLocalFiles();
          setFiles(localFiles);
          setSource('local');
        } catch (localError) {
          console.log('Local files not found, trying GitHub...');
          const githubFiles = await fetchFromGitHub();
          setFiles(githubFiles);
          setSource('github');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load documentation');
        // Set default content on error
        const fallbackFiles = await loadLocalFiles();
        setFiles(fallbackFiles);
        setSource('local');
      } finally {
        setLoading(false);
      }
    };

    loadFiles();
  }, []);

  return { files, loading, error, source };
};