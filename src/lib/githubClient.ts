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
      
      if (response.status === 404) {
        errorMessage = `Repository '${this.config.owner}/${this.config.repo}' or documentation folder '${this.config.docsPath}' not found. Please verify your GitHub repository settings.`;
      } else if (response.status === 403) {
        errorMessage = `Access denied to repository '${this.config.owner}/${this.config.repo}'. If this is a private repository, please ensure you have set a valid GitHub token.`;
      } else if (response.status === 401) {
        errorMessage = `Authentication failed. Please check your GitHub token if accessing a private repository.`;
      } else {
        errorMessage = `GitHub API error: ${response.status} ${response.statusText}. Please check your repository configuration.`;
      }
      
      throw new Error(errorMessage);
    }

    return response.json();
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

export function createGitHubClient(): GitHubAPI | null {
  const owner = import.meta.env.VITE_GITHUB_OWNER;
  const repo = import.meta.env.VITE_GITHUB_REPO;
  const branch = import.meta.env.VITE_GITHUB_BRANCH || 'main';
  const docsPath = import.meta.env.VITE_GITHUB_DOCS_PATH || 'docs';
  const token = import.meta.env.VITE_GITHUB_TOKEN;

  if (!owner || !repo) {
    console.log('GitHub configuration missing. Set VITE_GITHUB_OWNER and VITE_GITHUB_REPO environment variables.');
    return null;
  }

  console.log('GitHub Config:', { owner, repo, branch, docsPath, token: token ? '***' : 'none' });

  return new GitHubAPI({ owner, repo, branch, docsPath, token });
}