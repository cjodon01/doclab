export interface GitHubFile {
  name: string;
  path: string;
  type: 'file' | 'dir';
  download_url?: string;
  sha: string;
}

export interface TreeNode {
  name: string;
  path: string;
  type: 'file' | 'dir';
  children?: TreeNode[];
  download_url?: string;
}

export interface GitHubConfig {
  owner: string;
  repo: string;
  docsPath: string;
  token?: string;
}

class GitHubAPI {
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

  async fetchContents(path: string = ''): Promise<GitHubFile[]> {
    const fullPath = path ? `${this.config.docsPath}/${path}` : this.config.docsPath;
    const url = `https://api.github.com/repos/${this.config.owner}/${this.config.repo}/contents/${fullPath}`;

    try {
      const response = await fetch(url, {
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        if (response.status === 404) {
          if (path === '') {
            throw new Error(`Repository '${this.config.owner}/${this.config.repo}' or documentation folder '${this.config.docsPath}' not found. Please verify your GitHub repository settings.`);
          } else {
            throw new Error(`Documentation folder '${fullPath}' not found in repository`);
          }
        }
        if (response.status === 403) {
          throw new Error(`Access denied to repository '${this.config.owner}/${this.config.repo}'. If this is a private repository, please ensure you have set a valid GitHub token.`);
        }
        if (response.status === 401) {
          throw new Error(`Authentication failed. Please check your GitHub token if accessing a private repository.`);
        }
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}. Please check your repository configuration.`);
      }

      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        throw new Error(`Network error: Unable to connect to GitHub API. Please check your internet connection and verify that the repository '${this.config.owner}/${this.config.repo}' exists and is accessible.`);
      }
      console.error('Error fetching GitHub contents:', error);
      throw error;
    }
  }

  async fetchFileContent(downloadUrl: string): Promise<string> {
    try {
      const response = await fetch(downloadUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.status} ${response.statusText}`);
      }
      return await response.text();
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        throw new Error('Network error: Unable to fetch file content. Please check your internet connection.');
      }
      console.error('Error fetching file content:', error);
      throw error;
    }
  }

  async buildFileTree(path: string = ''): Promise<TreeNode[]> {
    const contents = await this.fetchContents(path);
    const tree: TreeNode[] = [];

    for (const item of contents) {
      const node: TreeNode = {
        name: item.name,
        path: item.path.replace(`${this.config.docsPath}/`, ''),
        type: item.type,
        download_url: item.download_url,
      };

      if (item.type === 'dir') {
        try {
          node.children = await this.buildFileTree(node.path);
        } catch (error) {
          console.warn(`Failed to fetch contents of directory ${node.path}:`, error);
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
  }

  // Method to validate repository access
  async validateRepository(): Promise<{ valid: boolean; error?: string }> {
    try {
      const url = `https://api.github.com/repos/${this.config.owner}/${this.config.repo}`;
      const response = await fetch(url, {
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        if (response.status === 404) {
          return {
            valid: false,
            error: `Repository '${this.config.owner}/${this.config.repo}' not found. Please verify the repository owner and name.`
          };
        }
        if (response.status === 403) {
          return {
            valid: false,
            error: `Access denied to repository '${this.config.owner}/${this.config.repo}'. If this is a private repository, please ensure you have set a valid GitHub token.`
          };
        }
        return {
          valid: false,
          error: `GitHub API error: ${response.status} ${response.statusText}`
        };
      }

      return { valid: true };
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        return {
          valid: false,
          error: 'Network error: Unable to connect to GitHub API. Please check your internet connection.'
        };
      }
      return {
        valid: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
}

export function createGitHubClient(): GitHubAPI | null {
  const owner = process.env.NEXT_PUBLIC_GITHUB_REPO_OWNER;
  const repo = process.env.NEXT_PUBLIC_GITHUB_REPO_NAME;
  const docsPath = process.env.NEXT_PUBLIC_GITHUB_DOCS_PATH || 'docs';
  const token = process.env.NEXT_PUBLIC_GITHUB_TOKEN;

  if (!owner || !repo) {
    console.error('GitHub configuration missing. Please set NEXT_PUBLIC_GITHUB_REPO_OWNER and NEXT_PUBLIC_GITHUB_REPO_NAME in your environment variables.');
    return null;
  }

  return new GitHubAPI({ owner, repo, docsPath, token });
}

export function getGitHubEditUrl(filePath: string): string {
  const owner = process.env.NEXT_PUBLIC_GITHUB_REPO_OWNER;
  const repo = process.env.NEXT_PUBLIC_GITHUB_REPO_NAME;
  const docsPath = process.env.NEXT_PUBLIC_GITHUB_DOCS_PATH || 'docs';
  
  if (!owner || !repo) return '';
  
  return `https://github.com/${owner}/${repo}/edit/main/${docsPath}/${filePath}`;
}