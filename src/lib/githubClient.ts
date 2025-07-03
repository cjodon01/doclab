interface GitHubConfig {
  owner: string;
  repo: string;
  branch: string;
  docsPath: string;
  token?: string;
}

interface GitHubFileItem {
  name: string;
  path: string;
  type: 'file' | 'dir';
  download_url?: string;
  content?: string;
  encoding?: string;
}

export class GitHubAPI {
  private config: GitHubConfig;

  constructor(config: GitHubConfig) {
    this.config = config;
  }

  private getHeaders() {
    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'DocsDeploy/1.0',
    };

    if (this.config.token) {
      headers['Authorization'] = `token ${this.config.token}`;
    }

    return headers;
  }

  private async makeRequest(url: string): Promise<any> {
    console.log('GitHub API Request:', url);
    
    const response = await fetch(url, {
      headers: this.getHeaders()
    });

    if (!response.ok) {
      let errorMessage = '';
      const responseText = await response.text();
      console.error('GitHub API Error Details:', {
        status: response.status,
        statusText: response.statusText,
        url,
        responseBody: responseText
      });
      
      if (response.status === 404) {
        errorMessage = `Repository '${this.config.owner}/${this.config.repo}' or path not found. Please verify: 1) Repository exists and is accessible 2) Path '${this.config.docsPath}' exists in the repository 3) Branch '${this.config.branch}' exists`;
      } else if (response.status === 403) {
        errorMessage = `Access denied to repository '${this.config.owner}/${this.config.repo}'. If this is a private repository, please ensure you have set a valid GitHub token with proper permissions.`;
      } else if (response.status === 401) {
        errorMessage = `Authentication failed. Please check your GitHub token if accessing a private repository.`;
      } else {
        errorMessage = `GitHub API error: ${response.status} ${response.statusText}. Response: ${responseText}`;
      }
      
      throw new Error(errorMessage);
    }

    const responseText = await response.text();
    return JSON.parse(responseText);
  }

  async fetchContents(path: string = ''): Promise<GitHubFileItem[]> {
    const fullPath = path ? `${this.config.docsPath}/${path}` : this.config.docsPath;
    const url = `https://api.github.com/repos/${this.config.owner}/${this.config.repo}/contents/${fullPath}?ref=${this.config.branch}`;
    
    try {
      const data = await this.makeRequest(url);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching GitHub contents:', error);
      throw error;
    }
  }

  async fetchFileContent(downloadUrl: string): Promise<string> {
    try {
      const response = await fetch(downloadUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch file content: ${response.statusText}`);
      }
      return response.text();
    } catch (error) {
      console.error('Error fetching file content:', error);
      throw error;
    }
  }

  async buildFileTree(path: string = ''): Promise<any[]> {
    const contents = await this.fetchContents(path);
    const tree = [];

    for (const item of contents) {
      const relativePath = item.path.replace(`${this.config.docsPath}/`, '').replace(/^\//, '');
      
      if (item.type === 'file' && item.name.endsWith('.md')) {
        // Fetch file content
        const content = await this.fetchFileContent(item.download_url!);
        
        tree.push({
          name: item.name.replace('.md', ''),
          path: relativePath,
          content,
          isDirectory: false
        });
      } else if (item.type === 'dir') {
        try {
          const children = await this.buildFileTree(relativePath);
          tree.push({
            name: item.name,
            path: relativePath,
            content: '',
            isDirectory: true,
            children
          });
        } catch (error) {
          console.warn(`Failed to fetch contents of directory ${relativePath}:`, error);
          tree.push({
            name: item.name,
            path: relativePath,
            content: '',
            isDirectory: true,
            children: []
          });
        }
      }
    }

    // Sort: directories first, then files, both alphabetically
    return tree.sort((a, b) => {
      if (a.isDirectory !== b.isDirectory) {
        return a.isDirectory ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });
  }

  async validateRepository(): Promise<{ valid: boolean; error?: string }> {
    try {
      const url = `https://api.github.com/repos/${this.config.owner}/${this.config.repo}`;
      await this.makeRequest(url);
      return { valid: true };
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
}

function validateGitHubConfig(owner: string, repo: string, branch: string, docsPath: string): void {
  // Input validation to prevent injection attacks
  const githubNamePattern = /^[a-zA-Z0-9._-]+$/;
  const pathPattern = /^[a-zA-Z0-9._/-]+$/;
  
  if (!githubNamePattern.test(owner)) {
    throw new Error('Invalid GitHub owner format');
  }
  if (!githubNamePattern.test(repo)) {
    throw new Error('Invalid GitHub repository format');
  }
  if (!githubNamePattern.test(branch)) {
    throw new Error('Invalid GitHub branch format');
  }
  if (!pathPattern.test(docsPath)) {
    throw new Error('Invalid docs path format');
  }
}

export function createGitHubClient(): GitHubAPI | null {
  // Debug logging for Azure environment variables
  console.log('=== ENVIRONMENT VARIABLES DEBUG ===');
  console.log('All import.meta.env:', import.meta.env);
  console.log('Node ENV:', import.meta.env.NODE_ENV);
  console.log('Mode:', import.meta.env.MODE);
  console.log('Available keys:', Object.keys(import.meta.env));
  
  const owner = import.meta.env.VITE_GITHUB_OWNER;
  const repo = import.meta.env.VITE_GITHUB_REPO;
  const branch = import.meta.env.VITE_GITHUB_BRANCH || 'main';
  const docsPath = import.meta.env.VITE_GITHUB_DOCS_PATH || 'docs';
  const token = import.meta.env.VITE_GITHUB_TOKEN;

  console.log('Raw GitHub Config Values:', {
    owner: owner || 'MISSING',
    repo: repo || 'MISSING', 
    branch: branch || 'DEFAULT_main',
    docsPath: docsPath || 'DEFAULT_docs',
    token: token ? 'PRESENT' : 'MISSING'
  });

  if (!owner || !repo) {
    console.error('❌ GitHub configuration missing:', {
      owner: !!owner,
      repo: !!repo,
      availableEnvKeys: Object.keys(import.meta.env).filter(key => key.startsWith('VITE_'))
    });
    console.log('GitHub configuration missing. Set VITE_GITHUB_OWNER and VITE_GITHUB_REPO environment variables.');
    return null;
  }

  try {
    validateGitHubConfig(owner, repo, branch, docsPath);
    console.log('✅ GitHub config validation passed');
  } catch (error) {
    console.error('❌ Invalid GitHub configuration:', error);
    return null;
  }

  console.log('✅ GitHub Config Created:', { owner, repo, branch, docsPath, token: token ? '***' : 'none' });

  return new GitHubAPI({ owner, repo, branch, docsPath, token });
}