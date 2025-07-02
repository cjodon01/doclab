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
  source: 'local' | 'github';
  path?: string;
}

class LocalDocsAPI {
  private docsPath: string;

  constructor(docsPath: string = 'docs') {
    this.docsPath = path.resolve(docsPath);
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
    this.localAPI = new LocalDocsAPI();
    this.githubAPI = createGitHubClient();
    this.config = { source: 'local' };
  }

  async initialize(): Promise<DocsConfig> {
    console.log('🔍 Initializing DocsProvider...');
    
    // First, try to use local docs
    console.log('📁 Checking for local docs folder...');
    const localValidation = await this.localAPI.validateDocsFolder();
    
    if (localValidation.valid) {
      console.log('✅ Local docs folder found and validated. Using local source.');
      this.config = { source: 'local', path: 'docs' };
      return this.config;
    } else {
      console.log(`❌ Local docs validation failed: ${localValidation.error}`);
      console.log('🔄 Attempting GitHub fallback...');
    }

    // If local docs not available, try GitHub
    if (!this.githubAPI) {
      const missingVars = [];
      if (!process.env.GITHUB_REPO_OWNER) missingVars.push('GITHUB_REPO_OWNER');
      if (!process.env.GITHUB_REPO_NAME) missingVars.push('GITHUB_REPO_NAME');
      
      console.error(`❌ GitHub client not initialized. Missing environment variables: ${missingVars.join(', ')}`);
      
      throw new Error(`No valid documentation source found. Local docs failed: ${localValidation.error}. GitHub unavailable: Missing required environment variables (${missingVars.join(', ')}). Please ensure you have either a local "docs" folder or valid GitHub configuration.`);
    }

    console.log('🔍 Validating GitHub repository access...');
    console.log(`📍 Repository: ${process.env.GITHUB_REPO_OWNER}/${process.env.GITHUB_REPO_NAME}`);
    console.log(`📂 Docs path: ${process.env.GITHUB_DOCS_PATH || 'docs'}`);
    console.log(`🔑 Token provided: ${process.env.GITHUB_TOKEN ? 'Yes' : 'No'}`);
    
    try {
      const githubValidation = await this.githubAPI.validateRepository();
      if (githubValidation.valid) {
        console.log('✅ GitHub repository validated successfully. Using GitHub source.');
        this.config = { source: 'github' };
        return this.config;
      } else {
        console.error(`❌ GitHub repository validation failed: ${githubValidation.error}`);
        
        throw new Error(`No valid documentation source found. Local docs failed: ${localValidation.error}. GitHub validation failed: ${githubValidation.error}. Please ensure you have either a local "docs" folder or valid GitHub configuration with proper access permissions.`);
      }
    } catch (error: any) {
      console.error('❌ Error during GitHub validation:', error);
      
      throw new Error(`No valid documentation source found. Local docs failed: ${localValidation.error}. GitHub error: ${error.message}. Please ensure you have either a local "docs" folder or valid GitHub configuration.`);
    }
  }

  async buildFileTree(): Promise<DocsFile[]> {
    if (this.config.source === 'local') {
      return await this.localAPI.buildFileTree();
    } else {
      const githubTree = await this.githubAPI.buildFileTree();
      // Convert GitHub tree format to our format
      return githubTree.map((node: any) => ({
        name: node.name,
        path: node.path,
        type: node.type,
        children: node.children
      }));
    }
  }

  async fetchFileContent(filePath: string): Promise<string> {
    if (this.config.source === 'local') {
      return await this.localAPI.fetchFileContent(filePath);
    } else {
      return await this.githubAPI.fetchFileContent(filePath);
    }
  }

  getSourceInfo(): { source: string; description: string } {
    if (this.config.source === 'local') {
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