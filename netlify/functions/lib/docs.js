"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
    validateDocsFolder() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const stats = yield fs_1.default.promises.stat(this.docsPath);
                if (!stats.isDirectory()) {
                    return { valid: false, error: `Path '${this.docsPath}' exists but is not a directory` };
                }
                return { valid: true };
            }
            catch (error) {
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
        });
    }
    buildFileTree() {
        return __awaiter(this, arguments, void 0, function* (relativePath = '') {
            const fullPath = path_1.default.join(this.docsPath, relativePath);
            try {
                const entries = yield fs_1.default.promises.readdir(fullPath, { withFileTypes: true });
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
                            node.children = yield this.buildFileTree(entryPath);
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
        });
    }
    fetchFileContent(filePath) {
        return __awaiter(this, void 0, void 0, function* () {
            const fullPath = path_1.default.join(this.docsPath, filePath);
            try {
                // Security check: ensure the path is within the docs directory
                const resolvedPath = path_1.default.resolve(fullPath);
                const resolvedDocsPath = path_1.default.resolve(this.docsPath);
                if (!resolvedPath.startsWith(resolvedDocsPath)) {
                    throw new Error('Access denied: Path outside docs directory');
                }
                const content = yield fs_1.default.promises.readFile(fullPath, 'utf8');
                return content;
            }
            catch (error) {
                console.error('Error reading file:', error);
                throw error;
            }
        });
    }
}
class DocsProvider {
    constructor() {
        this.localAPI = new LocalDocsAPI();
        this.githubAPI = (0, github_1.createGitHubClient)();
        this.config = { source: 'local', hasLocal: false, hasGitHub: false };
    }
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('🔍 Initializing DocsProvider...');
            // Check both local and GitHub availability
            console.log('📁 Checking for local docs folder...');
            const localValidation = yield this.localAPI.validateDocsFolder();
            console.log('🔍 Checking GitHub configuration...');
            let githubValidation = { valid: false, error: 'GitHub not configured' };
            if (this.githubAPI) {
                console.log(`📍 Repository: ${process.env.GITHUB_REPO_OWNER}/${process.env.GITHUB_REPO_NAME}`);
                console.log(`📂 Docs path: ${process.env.GITHUB_DOCS_PATH || 'docs'}`);
                console.log(`🔑 Token provided: ${process.env.GITHUB_TOKEN ? 'Yes' : 'No'}`);
                try {
                    githubValidation = yield this.githubAPI.validateRepository();
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
            // Determine configuration based on what's available
            const hasLocal = localValidation.valid;
            const hasGitHub = githubValidation.valid;
            if (hasLocal && hasGitHub) {
                console.log('✅ Both local docs and GitHub are available. Using hybrid mode with local priority.');
                this.config = { source: 'hybrid', path: 'docs', hasLocal: true, hasGitHub: true };
            }
            else if (hasLocal) {
                console.log('✅ Local docs folder found and validated. Using local source.');
                console.log(`ℹ️ GitHub unavailable: ${githubValidation.error}`);
                this.config = { source: 'local', path: 'docs', hasLocal: true, hasGitHub: false };
            }
            else if (hasGitHub) {
                console.log('✅ GitHub repository validated successfully. Using GitHub source.');
                console.log(`ℹ️ Local docs unavailable: ${localValidation.error}`);
                this.config = { source: 'github', hasLocal: false, hasGitHub: true };
            }
            else {
                console.error('❌ No valid documentation source found.');
                console.error(`Local docs failed: ${localValidation.error}`);
                console.error(`GitHub failed: ${githubValidation.error}`);
                throw new Error(`No valid documentation source found. Local docs: ${localValidation.error}. GitHub: ${githubValidation.error}. Please ensure you have either a local "docs" folder or valid GitHub configuration.`);
            }
            return this.config;
        });
    }
    buildFileTree() {
        return __awaiter(this, void 0, void 0, function* () {
            // Try local first if available
            if (this.config.hasLocal) {
                try {
                    console.log('📁 Building file tree from local docs...');
                    return yield this.localAPI.buildFileTree();
                }
                catch (error) {
                    console.warn('⚠️ Local docs failed, trying GitHub fallback...', error.message);
                    // If local fails and we have GitHub, try GitHub
                    if (this.config.hasGitHub && this.githubAPI) {
                        try {
                            console.log('🔄 Switching to GitHub source...');
                            const githubTree = yield this.githubAPI.buildFileTree();
                            return githubTree.map((node) => ({
                                name: node.name,
                                path: node.path,
                                type: node.type,
                                children: node.children
                            }));
                        }
                        catch (githubError) {
                            console.error('❌ GitHub fallback also failed:', githubError);
                        }
                    }
                    throw error;
                }
            }
            // Use GitHub if local not available
            if (this.config.hasGitHub && this.githubAPI) {
                console.log('📁 Building file tree from GitHub...');
                const githubTree = yield this.githubAPI.buildFileTree();
                return githubTree.map((node) => ({
                    name: node.name,
                    path: node.path,
                    type: node.type,
                    children: node.children
                }));
            }
            throw new Error('No documentation source available');
        });
    }
    fetchFileContent(filePath) {
        return __awaiter(this, void 0, void 0, function* () {
            // Try local first if available
            if (this.config.hasLocal) {
                try {
                    console.log(`📄 Fetching file from local docs: ${filePath}`);
                    return yield this.localAPI.fetchFileContent(filePath);
                }
                catch (error) {
                    console.warn(`⚠️ Local file fetch failed, trying GitHub fallback...`, error.message);
                    // If local fails and we have GitHub, try GitHub
                    if (this.config.hasGitHub && this.githubAPI) {
                        try {
                            console.log(`🔄 Fetching file from GitHub: ${filePath}`);
                            return yield this.githubAPI.fetchFileContent(filePath);
                        }
                        catch (githubError) {
                            console.error('❌ GitHub fallback also failed:', githubError);
                        }
                    }
                    throw error;
                }
            }
            // Use GitHub if local not available
            if (this.config.hasGitHub && this.githubAPI) {
                console.log(`📄 Fetching file from GitHub: ${filePath}`);
                return yield this.githubAPI.fetchFileContent(filePath);
            }
            throw new Error('No documentation source available');
        });
    }
    getSourceInfo() {
        if (this.config.source === 'hybrid') {
            return {
                source: 'Hybrid',
                description: 'Local docs with GitHub fallback'
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
