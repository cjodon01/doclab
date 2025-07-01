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
          throw new Error(`Documentation folder '${this.config.docsPath}' not found in repository`);
        }
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
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
        throw new Error(`Failed to fetch file: ${response.status} ${response.statusText}`);
      }
      return await response.text();
    } catch (error) {
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