"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocsProvider = void 0;
exports.createDocsProvider = createDocsProvider;
const github_1 = require("./github");

// Simplified DocsProvider for Netlify serverless environment
class DocsProvider {
    constructor() {
        this.githubAPI = (0, github_1.createGitHubClient)();
        this.config = { source: 'github', hasLocal: false, hasGitHub: false };
    }
    
    async initialize() {
        console.log('🔍 Initializing DocsProvider in Netlify serverless environment...');
        
        // In Netlify serverless, we only use GitHub
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
        
        if (githubValidation.valid) {
            console.log('✅ GitHub repository validated successfully. Using GitHub source.');
            this.config = { source: 'github', hasLocal: false, hasGitHub: true };
        }
        else {
            console.error('❌ GitHub validation failed:', githubValidation.error);
            throw new Error(`GitHub configuration required for Netlify deployment. Error: ${githubValidation.error}. Please set GITHUB_REPO_OWNER and GITHUB_REPO_NAME in your Netlify environment variables.`);
        }
        
        return this.config;
    }
    
    async buildFileTree() {
        if (!this.config.hasGitHub || !this.githubAPI) {
            throw new Error('GitHub not configured');
        }
        
        console.log('📁 Building file tree from GitHub...');
        const githubTree = await this.githubAPI.buildFileTree();
        return githubTree.map((node) => ({
            name: node.name,
            path: node.path,
            type: node.type,
            children: node.children
        }));
    }
    
    async fetchFileContent(filePath) {
        if (!this.config.hasGitHub || !this.githubAPI) {
            throw new Error('GitHub not configured');
        }
        
        console.log(`📄 Fetching file from GitHub: ${filePath}`);
        return await this.githubAPI.fetchFileContent(filePath);
    }
    
    getSourceInfo() {
        return {
            source: 'GitHub',
            description: `Reading from ${process.env.GITHUB_REPO_OWNER}/${process.env.GITHUB_REPO_NAME} (Netlify)`
        };
    }
}

exports.DocsProvider = DocsProvider;

function createDocsProvider() {
    return new DocsProvider();
}