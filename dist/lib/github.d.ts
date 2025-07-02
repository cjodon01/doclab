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
declare class GitHubAPI {
    private config;
    constructor(config: GitHubConfig);
    private getHeaders;
    private makeRequest;
    fetchContents(path?: string): Promise<GitHubFile[]>;
    fetchFileContent(filePath: string): Promise<string>;
    buildFileTree(path?: string): Promise<TreeNode[]>;
    validateRepository(): Promise<{
        valid: boolean;
        error?: string;
    }>;
}
export declare function createGitHubClient(): GitHubAPI | null;
export {};
//# sourceMappingURL=github.d.ts.map