"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocsProvider = void 0;
exports.createDocsProvider = createDocsProvider;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const github_1 = require("./github");
class LocalDocsAPI {
    constructor(docsPath = 'docs') {
        this.docsPath = path_1.default.resolve(docsPath);
    }
    async validateDocsFolder() {
        try {
            const stats = await fs_1.default.promises.stat(this.docsPath);
            if (!stats.isDirectory()) {
                return { valid: false, error: 'Docs path is not a directory' };
            }
            return { valid: true };
        }
        catch (error) {
            return {
                valid: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    async buildFileTree(relativePath = '') {
        const fullPath = path_1.default.join(this.docsPath, relativePath);
        try {
            const entries = await fs_1.default.promises.readdir(fullPath, { withFileTypes: true });
            const tree = [];
            for (const entry of entries) {
                // Skip hidden files and common non-documentation files
                if (entry.name.startsWith('.') ||
                    entry.name === 'node_modules' ||
                    entry.name === 'package.json' ||
                    entry.name === 'package-lock.json') {
                    continue;
                }
                const entryPath = path_1.default.join(relativePath, entry.name);
                const node = {
                    name: entry.name,
                    path: entryPath,
                    type: entry.isDirectory() ? 'dir' : 'file'
                };
                if (entry.isDirectory()) {
                    try {
                        node.children = await this.buildFileTree(entryPath);
                    }
                    catch (error) {
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
        }
        catch (error) {
            console.error('Error reading local docs:', error);
            throw error;
        }
    }
    async fetchFileContent(filePath) {
        const fullPath = path_1.default.join(this.docsPath, filePath);
        try {
            // Security check: ensure the path is within the docs directory
            const resolvedPath = path_1.default.resolve(fullPath);
            const resolvedDocsPath = path_1.default.resolve(this.docsPath);
            if (!resolvedPath.startsWith(resolvedDocsPath)) {
                throw new Error('Access denied: Path outside docs directory');
            }
            const content = await fs_1.default.promises.readFile(fullPath, 'utf8');
            return content;
        }
        catch (error) {
            console.error('Error reading file:', error);
            throw error;
        }
    }
}
class DocsProvider {
    constructor() {
        this.localAPI = new LocalDocsAPI();
        this.githubAPI = (0, github_1.createGitHubClient)();
        this.config = { source: 'local' };
    }
    async initialize() {
        // First, try to use local docs
        const localValidation = await this.localAPI.validateDocsFolder();
        if (localValidation.valid) {
            console.log('Using local docs folder');
            this.config = { source: 'local', path: 'docs' };
            return this.config;
        }
        // If local docs not available, try GitHub
        if (this.githubAPI) {
            const githubValidation = await this.githubAPI.validateRepository();
            if (githubValidation.valid) {
                console.log('Using GitHub docs repository');
                this.config = { source: 'github' };
                return this.config;
            }
        }
        throw new Error('No valid documentation source found. Please ensure you have either a local "docs" folder or valid GitHub configuration.');
    }
    async buildFileTree() {
        if (this.config.source === 'local') {
            return await this.localAPI.buildFileTree();
        }
        else {
            const githubTree = await this.githubAPI.buildFileTree();
            // Convert GitHub tree format to our format
            return githubTree.map((node) => ({
                name: node.name,
                path: node.path,
                type: node.type,
                children: node.children
            }));
        }
    }
    async fetchFileContent(filePath) {
        if (this.config.source === 'local') {
            return await this.localAPI.fetchFileContent(filePath);
        }
        else {
            return await this.githubAPI.fetchFileContent(filePath);
        }
    }
    getSourceInfo() {
        if (this.config.source === 'local') {
            return {
                source: 'Local',
                description: 'Reading from local docs folder'
            };
        }
        else {
            return {
                source: 'GitHub',
                description: `Reading from ${process.env.GITHUB_REPO_OWNER}/${process.env.GITHUB_REPO_NAME}`
            };
        }
    }
}
exports.DocsProvider = DocsProvider;
function createDocsProvider() {
    return new DocsProvider();
}
//# sourceMappingURL=docs.js.map