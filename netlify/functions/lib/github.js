"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createGitHubClient = createGitHubClient;
const https_1 = __importDefault(require("https"));
const url_1 = require("url");
class GitHubAPI {
    constructor(config) {
        this.config = config;
    }
    getHeaders() {
        const headers = {
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'DocsDeploy/1.0',
        };
        if (this.config.token) {
            headers['Authorization'] = `token ${this.config.token}`;
        }
        return headers;
    }
    async makeRequest(url) {
        return new Promise((resolve, reject) => {
            const parsedUrl = new url_1.URL(url);
            const options = {
                hostname: parsedUrl.hostname,
                port: parsedUrl.port || 443,
                path: parsedUrl.pathname + parsedUrl.search,
                method: 'GET',
                headers: this.getHeaders()
            };
            const req = https_1.default.request(options, (res) => {
                let data = '';
                res.on('data', (chunk) => {
                    data += chunk;
                });
                res.on('end', () => {
                    try {
                        const jsonData = JSON.parse(data);
                        if (res.statusCode && res.statusCode >= 400) {
                            const error = new Error();
                            if (res.statusCode === 404) {
                                error.message = `Repository '${this.config.owner}/${this.config.repo}' or documentation folder not found. Please verify your GitHub repository settings.`;
                            }
                            else if (res.statusCode === 403) {
                                error.message = `Access denied to repository '${this.config.owner}/${this.config.repo}'. If this is a private repository, please ensure you have set a valid GitHub token.`;
                            }
                            else if (res.statusCode === 401) {
                                error.message = `Authentication failed. Please check your GitHub token if accessing a private repository.`;
                            }
                            else {
                                error.message = `GitHub API error: ${res.statusCode} ${res.statusMessage}. Please check your repository configuration.`;
                            }
                            reject(error);
                            return;
                        }
                        resolve(jsonData);
                    }
                    catch (parseError) {
                        reject(new Error(`Failed to parse JSON response: ${parseError}`));
                    }
                });
            });
            req.on('error', (error) => {
                reject(new Error(`Network error: Unable to connect to GitHub API. ${error.message}`));
            });
            req.end();
        });
    }
    async fetchContents(path = '') {
        const fullPath = path ? `${this.config.docsPath}/${path}` : this.config.docsPath;
        const url = `https://api.github.com/repos/${this.config.owner}/${this.config.repo}/contents/${fullPath}`;
        try {
            const data = await this.makeRequest(url);
            return Array.isArray(data) ? data : [];
        }
        catch (error) {
            console.error('Error fetching GitHub contents:', error);
            throw error;
        }
    }
    async fetchFileContent(filePath) {
        const fullPath = `${this.config.docsPath}/${filePath}`;
        const url = `https://api.github.com/repos/${this.config.owner}/${this.config.repo}/contents/${fullPath}`;
        try {
            const data = await this.makeRequest(url);
            // GitHub API returns file content as base64 encoded
            if (data.content && data.encoding === 'base64') {
                return Buffer.from(data.content.replace(/\n/g, ''), 'base64').toString('utf8');
            }
            else {
                throw new Error(`Unexpected file content format for '${filePath}'`);
            }
        }
        catch (error) {
            console.error('Error fetching file content:', error);
            throw error;
        }
    }
    async buildFileTree(path = '') {
        const contents = await this.fetchContents(path);
        const tree = [];
        for (const item of contents) {
            const node = {
                name: item.name,
                path: item.path.replace(`${this.config.docsPath}/`, ''),
                type: item.type,
                download_url: item.download_url,
            };
            if (item.type === 'dir') {
                try {
                    node.children = await this.buildFileTree(node.path);
                }
                catch (error) {
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
    async validateRepository() {
        try {
            const url = `https://api.github.com/repos/${this.config.owner}/${this.config.repo}`;
            await this.makeRequest(url);
            return { valid: true };
        }
        catch (error) {
            return {
                valid: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }
}
function createGitHubClient() {
    const owner = process.env.GITHUB_REPO_OWNER;
    const repo = process.env.GITHUB_REPO_NAME;
    const docsPath = process.env.GITHUB_DOCS_PATH || 'docs';
    const token = process.env.GITHUB_TOKEN;
    if (!owner || !repo) {
        console.error('GitHub configuration missing. Please set GITHUB_REPO_OWNER and GITHUB_REPO_NAME in your environment variables.');
        return null;
    }
    return new GitHubAPI({ owner, repo, docsPath, token });
}
