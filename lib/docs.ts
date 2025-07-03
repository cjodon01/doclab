import fs from 'fs';
import path from 'path';
import { createGitHubClient } from './github';

export interface DocsFile {
  name: string;
  path: string;
  type: 'file' | 'dir';
  children?: DocsFile[];
}

export interface DocsConfig {
  source: 'local' | 'github' | 'hybrid';
  path?: string;
  hasLocal: boolean;
  hasGitHub: boolean;
}

class LocalDocsAPI {
  private docsPath: string;

  constructor(docsPath: string = process.env.LOCAL_DOCS_PATH || 'docs') {
    this.docsPath = path.resolve(docsPath);
  }

  getDocsPath(): string {
    return this.docsPath;
  }

  async validateDocsFolder(): Promise<{ valid: boolean; error?: string }> {
    try {
      const stats = await fs.promises.stat(this.docsPath);
      if (!stats.isDirectory()) {
        return { valid: false, error: `Path '${this.docsPath}' exists but is not a directory` };
      }
      return { valid: true };
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        return { 
          valid: false, 
          error: `Local docs folder not found at '${this.docsPath}'` 
        };
      }
      return { 
        valid: false, 
        error: `Error accessing local docs folder: ${error.message}` 
      };
    }
  }

  async buildFileTree(relativePath: string = ''): Promise<DocsFile[]> {
    const fullPath = path.join(this.docsPath, relativePath);
    
    try {
      const entries = await fs.promises.readdir(fullPath, { withFileTypes: true });
      const tree: DocsFile[] = [];

      for (const entry of entries) {
        // Skip hidden files and common non-documentation files
        if (entry.name.startsWith('.') || 
            entry.name === 'node_modules' || 
            entry.name === 'package.json' ||
            entry.name === 'package-lock.json') {
          continue;
        }

        const entryPath = path.join(relativePath, entry.name);
        const node: DocsFile = {
          name: entry.name,
          path: entryPath,
          type: entry.isDirectory() ? 'dir' : 'file'
        };

        if (entry.isDirectory()) {
          try {
            node.children = await this.buildFileTree(entryPath);
          } catch (error) {
            console.warn(`Failed to read directory ${entryPath}:`, error);
            node.children = [];
          }
        }

        tree.push(node);
      }

      // Sort: directories first, then files, both alphabetically
      return tree.sort((a, b) => {
        if (a.type !== b.type) {
          return a.type === 'dir' ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
      });
    } catch (error) {
      console.error('Error reading local docs:', error);
      throw error;
    }
  }

  async fetchFileContent(filePath: string): Promise<string> {
    const fullPath = path.join(this.docsPath, filePath);
    
    try {
      // Security check: ensure the path is within the docs directory
      const resolvedPath = path.resolve(fullPath);
      const resolvedDocsPath = path.resolve(this.docsPath);
      
      if (!resolvedPath.startsWith(resolvedDocsPath)) {
        throw new Error('Access denied: Path outside docs directory');
      }

      const content = await fs.promises.readFile(fullPath, 'utf8');
      return content;
    } catch (error) {
      console.error('Error reading file:', error);
      throw error;
    }
  }
}

export class DocsProvider {
  private localAPI: LocalDocsAPI;
  private githubAPI: any;
  private config: DocsConfig;

  constructor() {
    const localDocsPath = process.env.LOCAL_DOCS_PATH;
    this.localAPI = new LocalDocsAPI(localDocsPath);
    this.githubAPI = createGitHubClient();
    this.config = { source: 'local', hasLocal: false, hasGitHub: false };
  }

  async initialize(): Promise<DocsConfig> {
    console.log('🔍 Initializing DocsProvider...');
    
    // Check both local and GitHub availability
    console.log('📁 Checking for local docs folder...');
    const localValidation = await this.localAPI.validateDocsFolder();
    
    console.log('🔍 Checking GitHub configuration...');
    let githubValidation = { valid: false, error: 'GitHub not configured' };
    
    if (this.githubAPI) {
      console.log(`📍 Repository: ${process.env.GITHUB_REPO_OWNER}/${process.env.GITHUB_REPO_NAME}`);
      console.log(`📂 Docs path: ${process.env.GITHUB_DOCS_PATH || 'docs'}`);
      console.log(`🔑 Token provided: ${process.env.GITHUB_TOKEN ? 'Yes' : 'No'}`);
      
      try {
        githubValidation = await this.githubAPI.validateRepository();
      } catch (error: any) {
        githubValidation = { valid: false, error: error.message };
      }
    } else {
      const missingVars = [];
      if (!process.env.GITHUB_REPO_OWNER) missingVars.push('GITHUB_REPO_OWNER');
      if (!process.env.GITHUB_REPO_NAME) missingVars.push('GITHUB_REPO_NAME');
      githubValidation = { 
        valid: false, 
        error: `Missing environment variables: ${missingVars.join(', ')}` 
      };
    }

    // Determine configuration based on what's available
    const hasLocal = localValidation.valid;
    const hasGitHub = githubValidation.valid;

    const docsPath = this.localAPI.getDocsPath();

    if (hasLocal && hasGitHub) {
      console.log('✅ Both local docs and GitHub are available. Using hybrid mode with local priority.');
      this.config = { source: 'hybrid', path: docsPath, hasLocal: true, hasGitHub: true };
    } else if (hasLocal) {
      console.log('✅ Local docs folder found and validated. Using local source.');
      console.log(`ℹ️ GitHub unavailable: ${githubValidation.error}`);
      this.config = { source: 'local', path: docsPath, hasLocal: true, hasGitHub: false };
    } else if (hasGitHub) {
      console.log('✅ GitHub repository validated successfully. Using GitHub source.');
      console.log(`ℹ️ Local docs unavailable: ${localValidation.error}`);
      this.config = { source: 'github', hasLocal: false, hasGitHub: true };
    } else {
      console.error('❌ No valid documentation source found.');
      console.error(`Local docs failed: ${localValidation.error}`);
      console.error(`GitHub failed: ${githubValidation.error}`);
      
      throw new Error(`No valid documentation source found. Local docs: ${localValidation.error}. GitHub: ${githubValidation.error}. Please ensure you have either a local "docs" folder or valid GitHub configuration.`);
    }

    return this.config;
  }

  async buildFileTree(): Promise<DocsFile[]> {
    // Try local first if available
    if (this.config.hasLocal) {
      try {
        console.log('📁 Building file tree from local docs...');
        return await this.localAPI.buildFileTree();
      } catch (error: any) {
        console.warn('⚠️ Local docs failed, trying GitHub fallback...', error.message);
        
        // If local fails and we have GitHub, try GitHub
        if (this.config.hasGitHub && this.githubAPI) {
          try {
            console.log('🔄 Switching to GitHub source...');
            const githubTree = await this.githubAPI.buildFileTree();
            return githubTree.map((node: any) => ({
              name: node.name,
              path: node.path,
              type: node.type,
              children: node.children
            }));
          } catch (githubError) {
            console.error('❌ GitHub fallback also failed:', githubError);
          }
        }
        throw error;
      }
    }
    
    // Use GitHub if local not available
    if (this.config.hasGitHub && this.githubAPI) {
      console.log('📁 Building file tree from GitHub...');
      const githubTree = await this.githubAPI.buildFileTree();
      return githubTree.map((node: any) => ({
        name: node.name,
        path: node.path,
        type: node.type,
        children: node.children
      }));
    }

    throw new Error('No documentation source available');
  }

  async fetchFileContent(filePath: string): Promise<string> {
    // Try local first if available
    if (this.config.hasLocal) {
      try {
        console.log(`📄 Fetching file from local docs: ${filePath}`);
        return await this.localAPI.fetchFileContent(filePath);
      } catch (error: any) {
        console.warn(`⚠️ Local file fetch failed, trying GitHub fallback...`, error.message);
        
        // If local fails and we have GitHub, try GitHub
        if (this.config.hasGitHub && this.githubAPI) {
          try {
            console.log(`🔄 Fetching file from GitHub: ${filePath}`);
            return await this.githubAPI.fetchFileContent(filePath);
          } catch (githubError) {
            console.error('❌ GitHub fallback also failed:', githubError);
          }
        }
        throw error;
      }
    }
    
    // Use GitHub if local not available
    if (this.config.hasGitHub && this.githubAPI) {
      console.log(`📄 Fetching file from GitHub: ${filePath}`);
      return await this.githubAPI.fetchFileContent(filePath);
    }

    throw new Error('No documentation source available');
  }

  getSourceInfo(): { source: string; description: string } {
    if (this.config.source === 'hybrid') {
      return {
        source: 'Hybrid',
        description: 'Local docs with GitHub fallback'
      };
    } else if (this.config.source === 'local') {
      return {
        source: 'Local',
        description: 'Reading from local docs folder'
      };
    } else {
      return {
        source: 'GitHub',
        description: `Reading from ${process.env.GITHUB_REPO_OWNER}/${process.env.GITHUB_REPO_NAME}`
      };
    }
  }
}

export function createDocsProvider(): DocsProvider {
  return new DocsProvider();
}