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
                return { valid: false, error: `Path '${this.docsPath}' exists but is not a directory` };
            }
            return { valid: true };
        }
        catch (error) {
            if (error.code === 'ENOENT') {
                return {
                    valid: false,
                    error: `Local docs folder not found at '${this.docsPath}' (this is expected in serverless environments)`
                };
            }
            return {
                valid: false,
                error: `Error accessing local docs folder: ${error.message}`
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
        this.config = { source: 'github', hasLocal: false, hasGitHub: false };
    }
    
    async initialize() {
        console.log('🔍 Initializing DocsProvider in serverless environment...');
        
        // In serverless environments like Netlify, prioritize GitHub
        console.log('🔍 Checking GitHub configuration...');
        let githubValidation = { valid: false, error: 'GitHub not configured' };
        
        if (this.githubAPI) {
            console.log(`📍 Repository: ${process.env.GITHUB_REPO_OWNER}/${process.env.GITHUB_REPO_NAME}`);
            console.log(`📂 Docs path: ${process.env.GITHUB_DOCS_PATH || 'docs'}`);
            console.log(`🔑 Token provided: ${process.env.GITHUB_TOKEN ? 'Yes' : 'No'}`);
            
            try {
                githubValidation = await this.githubAPI.validateRepository();
            }
            catch (error) {
                githubValidation = { valid: false, error: error.message };
            }
        }
        else {
            const missingVars = [];
            if (!process.env.GITHUB_REPO_OWNER)
                missingVars.push('GITHUB_REPO_OWNER');
            if (!process.env.GITHUB_REPO_NAME)
                missingVars.push('GITHUB_REPO_NAME');
            githubValidation = {
                valid: false,
                error: `Missing environment variables: ${missingVars.join(', ')}`
            };
        }
        
        // Check local docs (will likely fail in serverless, but we try)
        console.log('📁 Checking for local docs folder...');
        const localValidation = await this.localAPI.validateDocsFolder();
        
        // Determine configuration based on what's available
        const hasLocal = localValidation.valid;
        const hasGitHub = githubValidation.valid;
        
        if (hasGitHub) {
            console.log('✅ GitHub repository validated successfully. Using GitHub source.');
            if (hasLocal) {
                console.log('ℹ️ Local docs also available, but prioritizing GitHub in serverless environment.');
                this.config = { source: 'hybrid', hasLocal: true, hasGitHub: true };
            } else {
                console.log(`ℹ️ Local docs unavailable: ${localValidation.error}`);
                this.config = { source: 'github', hasLocal: false, hasGitHub: true };
            }
        }
        else if (hasLocal) {
            console.log('✅ Local docs folder found and validated. Using local source.');
            console.log(`ℹ️ GitHub unavailable: ${githubValidation.error}`);
            this.config = { source: 'local', hasLocal: true, hasGitHub: false };
        }
        else {
            console.error('❌ No valid documentation source found.');
            console.error(`Local docs failed: ${localValidation.error}`);
            console.error(`GitHub failed: ${githubValidation.error}`);
            
            throw new Error(`No valid documentation source found. In serverless environments like Netlify, you need to configure GitHub integration. GitHub error: ${githubValidation.error}. Please set GITHUB_REPO_OWNER, GITHUB_REPO_NAME, and optionally GITHUB_TOKEN in your Netlify environment variables.`);
        }
        
        return this.config;
    }
    
    async buildFileTree() {
        // In serverless environments, prioritize GitHub
        if (this.config.hasGitHub && this.githubAPI) {
            try {
                console.log('📁 Building file tree from GitHub...');
                const githubTree = await this.githubAPI.buildFileTree();
                return githubTree.map((node) => ({
                    name: node.name,
                    path: node.path,
                    type: node.type,
                    children: node.children
                }));
            }
            catch (error) {
                console.error('❌ GitHub tree build failed:', error);
                
                // Try local as fallback only if available
                if (this.config.hasLocal) {
                    console.log('🔄 Trying local docs as fallback...');
                    try {
                        return await this.localAPI.buildFileTree();
                    }
                    catch (localError) {
                        console.error('❌ Local fallback also failed:', localError);
                    }
                }
                throw error;
            }
        }
        
        // Use local if GitHub not available
        if (this.config.hasLocal) {
            console.log('📁 Building file tree from local docs...');
            return await this.localAPI.buildFileTree();
        }
        
        throw new Error('No documentation source available');
    }
    
    async fetchFileContent(filePath) {
        // In serverless environments, prioritize GitHub
        if (this.config.hasGitHub && this.githubAPI) {
            try {
                console.log(`📄 Fetching file from GitHub: ${filePath}`);
                return await this.githubAPI.fetchFileContent(filePath);
            }
            catch (error) {
                console.error(`❌ GitHub file fetch failed:`, error);
                
                // Try local as fallback only if available
                if (this.config.hasLocal) {
                    console.log(`🔄 Trying local docs as fallback for: ${filePath}`);
                    try {
                        return await this.localAPI.fetchFileContent(filePath);
                    }
                    catch (localError) {
                        console.error('❌ Local fallback also failed:', localError);
                    }
                }
                throw error;
            }
        }
        
        // Use local if GitHub not available
        if (this.config.hasLocal) {
            console.log(`📄 Fetching file from local docs: ${filePath}`);
            return await this.localAPI.fetchFileContent(filePath);
        }
        
        throw new Error('No documentation source available');
    }
    
    getSourceInfo() {
        if (this.config.source === 'hybrid') {
            return {
                source: 'Hybrid',
                description: 'GitHub with local fallback (serverless mode)'
            };
        }
        else if (this.config.source === 'local') {
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