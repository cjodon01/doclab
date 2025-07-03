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
        this.config = { source: 'local' };
    }
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('🔍 Initializing DocsProvider...');
            // First, try to use local docs
            console.log('📁 Checking for local docs folder...');
            const localValidation = yield this.localAPI.validateDocsFolder();
            if (localValidation.valid) {
                console.log('✅ Local docs folder found and validated. Using local source.');
                this.config = { source: 'local', path: 'docs' };
                return this.config;
            }
            else {
                console.log(`❌ Local docs validation failed: ${localValidation.error}`);
                console.log('🔄 Attempting GitHub fallback...');
            }
            // If local docs not available, try GitHub
            if (!this.githubAPI) {
                const missingVars = [];
                if (!process.env.GITHUB_REPO_OWNER)
                    missingVars.push('GITHUB_REPO_OWNER');
                if (!process.env.GITHUB_REPO_NAME)
                    missingVars.push('GITHUB_REPO_NAME');
                console.error(`❌ GitHub client not initialized. Missing environment variables: ${missingVars.join(', ')}`);
                throw new Error(`No valid documentation source found. Local docs failed: ${localValidation.error}. GitHub unavailable: Missing required environment variables (${missingVars.join(', ')}). Please ensure you have either a local "docs" folder or valid GitHub configuration.`);
            }
            console.log('🔍 Validating GitHub repository access...');
            console.log(`📍 Repository: ${process.env.GITHUB_REPO_OWNER}/${process.env.GITHUB_REPO_NAME}`);
            console.log(`📂 Docs path: ${process.env.GITHUB_DOCS_PATH || 'docs'}`);
            console.log(`🔑 Token provided: ${process.env.GITHUB_TOKEN ? 'Yes' : 'No'}`);
            try {
                const githubValidation = yield this.githubAPI.validateRepository();
                if (githubValidation.valid) {
                    console.log('✅ GitHub repository validated successfully. Using GitHub source.');
                    this.config = { source: 'github' };
                    return this.config;
                }
                else {
                    console.error(`❌ GitHub repository validation failed: ${githubValidation.error}`);
                    throw new Error(`No valid documentation source found. Local docs failed: ${localValidation.error}. GitHub validation failed: ${githubValidation.error}. Please ensure you have either a local "docs" folder or valid GitHub configuration with proper access permissions.`);
                }
            }
            catch (error) {
                console.error('❌ Error during GitHub validation:', error);
                throw new Error(`No valid documentation source found. Local docs failed: ${localValidation.error}. GitHub error: ${error.message}. Please ensure you have either a local "docs" folder or valid GitHub configuration.`);
            }
        });
    }
    buildFileTree() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.config.source === 'local') {
                try {
                    return yield this.localAPI.buildFileTree();
                }
                catch (error) {
                    // If ENOENT error occurs, try to fallback to GitHub
                    if (error.code === 'ENOENT' && this.githubAPI) {
                        console.log('🔄 Local docs became unavailable, attempting GitHub fallback...');
                        try {
                            const githubValidation = yield this.githubAPI.validateRepository();
                            if (githubValidation.valid) {
                                console.log('✅ Successfully switched to GitHub source.');
                                this.config = { source: 'github' };
                                const githubTree = yield this.githubAPI.buildFileTree();
                                // Convert GitHub tree format to our format
                                return githubTree.map((node) => ({
                                    name: node.name,
                                    path: node.path,
                                    type: node.type,
                                    children: node.children
                                }));
                            }
                        }
                        catch (githubError) {
                            console.error('❌ GitHub fallback failed:', githubError);
                        }
                    }
                    throw error;
                }
            }
            else {
                const githubTree = yield this.githubAPI.buildFileTree();
                // Convert GitHub tree format to our format
                return githubTree.map((node) => ({
                    name: node.name,
                    path: node.path,
                    type: node.type,
                    children: node.children
                }));
            }
        });
    }
    fetchFileContent(filePath) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.config.source === 'local') {
                try {
                    return yield this.localAPI.fetchFileContent(filePath);
                }
                catch (error) {
                    // If ENOENT error occurs, try to fallback to GitHub
                    if (error.code === 'ENOENT' && this.githubAPI) {
                        console.log('🔄 Local docs became unavailable, attempting GitHub fallback...');
                        try {
                            const githubValidation = yield this.githubAPI.validateRepository();
                            if (githubValidation.valid) {
                                console.log('✅ Successfully switched to GitHub source.');
                                this.config = { source: 'github' };
                                return yield this.githubAPI.fetchFileContent(filePath);
                            }
                        }
                        catch (githubError) {
                            console.error('❌ GitHub fallback failed:', githubError);
                        }
                    }
                    throw error;
                }
            }
            else {
                return yield this.githubAPI.fetchFileContent(filePath);
            }
        });
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
