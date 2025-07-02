// docsProvider.ts
import fs from 'fs';
import path from 'path';
import { createGitHubClient } from './github'; // Assuming github.ts is in the same directory

export interface DocsFile {
  name: string;
  path: string;
  type: 'file' | 'dir';
  children?: DocsFile[];
}

export interface DocsConfig {
  source: 'local' | 'github';
  path?: string; // Only relevant for 'local' source
}

/**
 * Handles operations related to local documentation files.
 */
class LocalDocsAPI {
  private docsPath: string;

  /**
   * @param docsPath The relative or absolute path to the local documentation folder.
   * Defaults to 'docs'.
   */
  constructor(docsPath: string = 'docs') {
    this.docsPath = path.resolve(docsPath);
  }

  /**
   * Validates if the configured docsPath exists and is a directory.
   * @returns An object indicating validity and an error message if invalid.
   */
  async validateDocsFolder(): Promise<{ valid: boolean; error?: string }> {
    try {
      const stats = await fs.promises.stat(this.docsPath);
      if (!stats.isDirectory()) {
        return { valid: false, error: `Docs path '${this.docsPath}' exists but is not a directory.` };
      }
      return { valid: true };
    } catch (error: any) {
      // Specifically check for 'ENOENT' error (Entry Not Found)
      if (error.code === 'ENOENT') {
        return { valid: false, error: `Local docs folder not found at '${this.docsPath}'.` };
      }
      // For other errors (e.g., permissions), return the error message.
      return { 
        valid: false, 
        error: error.message || 'Unknown error during local docs validation.' 
      };
    }
  }

  /**
   * Recursively builds a file tree of the local documentation folder.
   * Skips hidden files and common non-documentation directories/files.
   * @param relativePath The current relative path within the docs folder.
   * @returns A promise that resolves to an array of DocsFile objects.
   */
  async buildFileTree(relativePath: string = ''): Promise<DocsFile[]> {
    const fullPath = path.join(this.docsPath, relativePath);
    
    try {
      const entries = await fs.promises.readdir(fullPath, { withFileTypes: true });
      const tree: DocsFile[] = [];

      for (const entry of entries) {
        // Skip hidden files and common non-documentation files/folders
        if (entry.name.startsWith('.') || 
            entry.name === 'node_modules' || 
            entry.name === 'package.json' ||
            entry.name === 'package-lock.json' ||
            entry.name === 'yarn.lock') {
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
            console.warn(`Failed to read directory ${entryPath} during tree build:`, error);
            node.children = []; // Ensure children is an empty array on error
          }
        }

        tree.push(node);
      }

      // Sort: directories first, then files, both alphabetically by name
      return tree.sort((a, b) => {
        if (a.type !== b.type) {
          return a.type === 'dir' ? -1 : 1; // Directories come before files
        }
        return a.name.localeCompare(b.name); // Alphabetical sort
      });
    } catch (error) {
      console.error(`Error reading local docs from path '${fullPath}':`, error);
      throw error; // Re-throw to indicate failure to the caller
    }
  }

  /**
   * Fetches the content of a specific file from the local docs folder.
   * Includes a security check to prevent path traversal.
   * @param filePath The relative path to the file within the docs folder.
   * @returns A promise that resolves to the file content as a string.
   */
  async fetchFileContent(filePath: string): Promise<string> {
    const fullPath = path.join(this.docsPath, filePath);
    
    try {
      // Security check: ensure the resolved path is within the docs directory
      const resolvedPath = path.resolve(fullPath);
      const resolvedDocsPath = path.resolve(this.docsPath);
      
      if (!resolvedPath.startsWith(resolvedDocsPath)) {
        throw new Error(`Access denied: File path '${filePath}' resolves outside the docs directory.`);
      }

      const content = await fs.promises.readFile(fullPath, 'utf8');
      return content;
    } catch (error) {
      console.error(`Error reading local file '${fullPath}':`, error);
      throw error; // Re-throw to indicate failure to the caller
    }
  }
}

/**
 * Provides a unified interface for accessing documentation,
 * falling back to GitHub if local documentation is not found or invalid.
 */
export class DocsProvider {
  private localAPI: LocalDocsAPI;
  private githubAPI: any; // Type this more specifically if you define GitHubClient interface
  private config: DocsConfig;

  constructor() {
    this.localAPI = new LocalDocsAPI();
    // Attempt to create GitHub client immediately. It will return null if env vars are missing.
    this.githubAPI = createGitHubClient(); 
    this.config = { source: 'local' }; // Default, will be updated by initialize()
  }

  /**
   * Initializes the DocsProvider by attempting to validate local docs first,
   * then falling back to GitHub if local docs are not valid.
   * @returns A promise that resolves to the determined DocsConfig.
   * @throws An error if no valid documentation source can be found.
   */
  async initialize(): Promise<DocsConfig> {
    console.log('Initializing DocsProvider...');

    // 1. Try to use local docs
    const localValidation = await this.localAPI.validateDocsFolder();
    
    if (localValidation.valid) {
      console.log('Successfully validated local docs folder. Using local source.');
      this.config = { source: 'local', path: 'docs' };
      return this.config;
    } else {
      console.warn(`Local docs validation failed: ${localValidation.error}. Attempting GitHub fallback...`);
    }

    // 2. If local docs not valid, try GitHub (only if client was created)
    if (this.githubAPI) { // Check if createGitHubClient returned a valid client
      const githubValidation = await this.githubAPI.validateRepository();
      if (githubValidation.valid) {
        console.log('Successfully validated GitHub repository. Using GitHub source.');
        this.config = { source: 'github' };
        return this.config;
      } else {
        console.error(`GitHub repository validation failed: ${githubValidation.error || 'Unknown GitHub validation error'}.`);
      }
    } else {
      console.warn('GitHub client not initialized (missing environment variables?). Cannot use GitHub as source.');
    }

    // 3. If neither source is valid, throw an error
    throw new Error('No valid documentation source found. Please ensure you have either a local "docs" folder or valid GitHub configuration (GITHUB_TOKEN, GITHUB_REPO_OWNER, GITHUB_REPO_NAME).');
  }

  /**
   * Builds the file tree from the currently configured documentation source.
   * @returns A promise that resolves to an array of DocsFile objects.
   * @throws An error if the source is not configured or the API is not initialized.
   */
  async buildFileTree(): Promise<DocsFile[]> {
    if (this.config.source === 'local') {
      return await this.localAPI.buildFileTree();
    } else if (this.config.source === 'github') {
      if (!this.githubAPI) {
        throw new Error('GitHub API is not initialized but GitHub source was configured. This should not happen after successful initialization.');
      }
      // Assuming GitHub API's buildFileTree returns a compatible structure
      return await this.githubAPI.buildFileTree();
    }
    throw new Error('Docs source not configured. Call initialize() first.');
  }

  /**
   * Fetches the content of a specific file from the currently configured documentation source.
   * @param filePath The relative path to the file.
   * @returns A promise that resolves to the file content as a string.
   * @throws An error if the source is not configured or the API is not initialized.
   */
  async fetchFileContent(filePath: string): Promise<string> {
    if (this.config.source === 'local') {
      return await this.localAPI.fetchFileContent(filePath);
    } else if (this.config.source === 'github') {
      if (!this.githubAPI) {
        throw new Error('GitHub API is not initialized but GitHub source was configured. This should not happen after successful initialization.');
      }
      return await this.githubAPI.fetchFileContent(filePath);
    }
    throw new Error('Docs source not configured. Call initialize() first.');
  }

  /**
   * Returns information about the currently active documentation source.
   * @returns An object with source name and description.
   */
  getSourceInfo(): { source: string; description: string } {
    if (this.config.source === 'local') {
      // Accessing private property for demonstration, normally expose via getter if needed.
      return {
        source: 'Local',
        description: `Reading from local docs folder at '${this.localAPI['docsPath']}'`
      };
    } else if (this.config.source === 'github') {
      const owner = process.env.GITHUB_REPO_OWNER || 'N/A';
      const repo = process.env.GITHUB_REPO_NAME || 'N/A';
      return {
        source: 'GitHub',
        description: `Reading from GitHub repository: ${owner}/${repo}`
      };
    }
    return {
      source: 'None',
      description: 'No documentation source configured.'
    };
  }
}

/**
 * Factory function to create a new DocsProvider instance.
 */
export function createDocsProvider(): DocsProvider {
  return new DocsProvider();
}
