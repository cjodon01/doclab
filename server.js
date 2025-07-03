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
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
const docs_1 = require("./lib/docs");
const markdown_1 = require("./lib/markdown");
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// Initialize docs provider
let docsProvider = null;
// Middleware
app.use(express_1.default.json());
app.use(express_1.default.static('public'));
// Initialize docs provider on startup
function initializeDocsProvider() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            docsProvider = (0, docs_1.createDocsProvider)();
            yield docsProvider.initialize();
            console.log('Documentation provider initialized successfully');
        }
        catch (error) {
            console.error('Failed to initialize docs provider:', error);
            // Re-throw the error to prevent server from starting with invalid configuration
            throw error;
        }
    });
}
// API Routes
app.get('/api/docs/info', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!docsProvider) {
            return res.status(500).json({
                error: 'Documentation provider not initialized'
            });
        }
        const sourceInfo = docsProvider.getSourceInfo();
        res.json(sourceInfo);
    }
    catch (error) {
        console.error('Error getting docs info:', error);
        res.status(500).json({
            error: error instanceof Error ? error.message : 'Failed to get docs info'
        });
    }
}));
app.get('/api/docs/tree', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!docsProvider) {
            return res.status(500).json({
                error: 'Documentation provider not initialized. Please check your configuration.'
            });
        }
        const tree = yield docsProvider.buildFileTree();
        res.json({ tree });
    }
    catch (error) {
        console.error('Error fetching file tree:', error);
        res.status(500).json({
            error: error instanceof Error ? error.message : 'Failed to load documentation'
        });
    }
}));
app.get('/api/docs/file', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { path: filePath } = req.query;
        if (!filePath || typeof filePath !== 'string') {
            return res.status(400).json({ error: 'File path is required' });
        }
        if (!docsProvider) {
            return res.status(500).json({
                error: 'Documentation provider not initialized'
            });
        }
        const content = yield docsProvider.fetchFileContent(filePath);
        res.json({ content });
    }
    catch (error) {
        console.error('Error fetching file:', error);
        res.status(500).json({
            error: error instanceof Error ? error.message : 'Failed to load file'
        });
    }
}));
app.post('/api/markdown/parse', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { content } = req.body;
        if (!content || typeof content !== 'string') {
            return res.status(400).json({ error: 'Content is required' });
        }
        const html = yield (0, markdown_1.parseMarkdown)(content);
        res.json({ html });
    }
    catch (error) {
        console.error('Error parsing markdown:', error);
        res.status(500).json({
            error: error instanceof Error ? error.message : 'Failed to parse markdown'
        });
    }
}));
// Serve the main HTML file for all other routes
app.get('*', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, 'public', 'index.html'));
});
// Initialize and start server
initializeDocsProvider().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}).catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
});
