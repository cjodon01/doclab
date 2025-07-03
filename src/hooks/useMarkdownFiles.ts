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
    // Import all markdown files from the docs directory
    const modules = import.meta.glob('/docs/**/*.md', { as: 'raw', eager: true });
    const files: MarkdownFile[] = [];
    
    Object.entries(modules).forEach(([path, content]) => {
      const fileName = path.split('/').pop()?.replace('.md', '') || '';
      const filePath = path.replace('/docs/', '');
      
      files.push({
        name: fileName,
        path: filePath,
        content: content as string,
        isDirectory: false
      });
    });
    
    return files.length > 0 ? files : [];
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