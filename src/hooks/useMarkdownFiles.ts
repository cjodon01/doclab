import { useState, useEffect } from 'react';
import { createGitHubClient } from '@/lib/githubClient';

export interface MarkdownFile {
  name: string;
  path: string;
  content: string;
  isDirectory: boolean;
  children?: MarkdownFile[];
}

export const useMarkdownFiles = () => {
  const [files, setFiles] = useState<MarkdownFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<'local' | 'github'>('local');

  const fetchFromGitHub = async (): Promise<MarkdownFile[]> => {
    const githubClient = createGitHubClient();
    
    if (!githubClient) {
      throw new Error('GitHub configuration missing. Set VITE_GITHUB_OWNER and VITE_GITHUB_REPO environment variables.');
    }

    // Validate repository access first
    const validation = await githubClient.validateRepository();
    if (!validation.valid) {
      throw new Error(validation.error || 'Repository validation failed');
    }

    // Build the file tree with proper nested directory support
    return await githubClient.buildFileTree();
  };

  const loadLocalFiles = async (): Promise<MarkdownFile[]> => {
    // Import all markdown files from the docs directory
    const modules = import.meta.glob('/docs/**/*.md', { as: 'raw', eager: true });
    
    // Build a tree structure from the file paths
    const fileTree: { [key: string]: MarkdownFile } = {};
    const rootFiles: MarkdownFile[] = [];
    
    // First, create all files and directories
    Object.entries(modules).forEach(([path, content]) => {
      const relativePath = path.replace('/docs/', '').replace(/^\//, '');
      const pathParts = relativePath.split('/');
      const fileName = pathParts[pathParts.length - 1].replace('.md', '');
      
      // Create file entry
      const file: MarkdownFile = {
        name: fileName,
        path: relativePath,
        content: content as string,
        isDirectory: false
      };
      
      if (pathParts.length === 1) {
        // Root level file
        rootFiles.push(file);
      } else {
        // File in subdirectory - ensure all parent directories exist
        let currentPath = '';
        let currentLevel = rootFiles;
        
        for (let i = 0; i < pathParts.length - 1; i++) {
          const dirName = pathParts[i];
          currentPath = currentPath ? `${currentPath}/${dirName}` : dirName;
          
          let dir = currentLevel.find(item => item.name === dirName && item.isDirectory);
          if (!dir) {
            dir = {
              name: dirName,
              path: currentPath,
              content: '',
              isDirectory: true,
              children: []
            };
            currentLevel.push(dir);
          }
          currentLevel = dir.children!;
        }
        
        // Add the file to its parent directory
        currentLevel.push(file);
      }
    });
    
    return rootFiles.length > 0 ? rootFiles : [];
  };

  useEffect(() => {
    const loadFiles = async () => {
      try {
        setLoading(true);
        setError(null);

        // Try GitHub first if config is available, then fall back to local
        console.log('🔍 Starting documentation load process...');
        const githubClient = createGitHubClient();
        if (githubClient) {
          try {
            console.log('📡 Attempting to fetch from GitHub...');
            const githubFiles = await fetchFromGitHub();
            setFiles(githubFiles);
            setSource('github');
            console.log('✅ Successfully loaded from GitHub:', githubFiles.length, 'items');
          } catch (githubError) {
            console.error('❌ GitHub fetch failed:', githubError);
            console.log('🔄 Falling back to local files...');
            const localFiles = await loadLocalFiles();
            setFiles(localFiles);
            setSource('local');
            console.log('📁 Using local files:', localFiles.length, 'items');
          }
        } else {
          // No GitHub config, use local files
          console.log('📁 No GitHub config found, using local files...');
          const localFiles = await loadLocalFiles();
          setFiles(localFiles);
          setSource('local');
          console.log('📁 Loaded local files:', localFiles.length, 'items');
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