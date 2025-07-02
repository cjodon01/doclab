"use strict";
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
async function initializeDocsProvider() {
    try {
        docsProvider = (0, docs_1.createDocsProvider)();
        await docsProvider.initialize();
        console.log('Documentation provider initialized successfully');
    }
    catch (error) {
        console.error('Failed to initialize docs provider:', error);
    }
}
// API Routes
app.get('/api/docs/info', async (req, res) => {
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
});
app.get('/api/docs/tree', async (req, res) => {
    try {
        if (!docsProvider) {
            return res.status(500).json({
                error: 'Documentation provider not initialized. Please check your configuration.'
            });
        }
        const tree = await docsProvider.buildFileTree();
        res.json({ tree });
    }
    catch (error) {
        console.error('Error fetching file tree:', error);
        res.status(500).json({
            error: error instanceof Error ? error.message : 'Failed to load documentation'
        });
    }
});
app.get('/api/docs/file', async (req, res) => {
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
        const content = await docsProvider.fetchFileContent(filePath);
        res.json({ content });
    }
    catch (error) {
        console.error('Error fetching file:', error);
        res.status(500).json({
            error: error instanceof Error ? error.message : 'Failed to load file'
        });
    }
});
app.post('/api/markdown/parse', async (req, res) => {
    try {
        const { content } = req.body;
        if (!content || typeof content !== 'string') {
            return res.status(400).json({ error: 'Content is required' });
        }
        const html = await (0, markdown_1.parseMarkdown)(content);
        res.json({ html });
    }
    catch (error) {
        console.error('Error parsing markdown:', error);
        res.status(500).json({
            error: error instanceof Error ? error.message : 'Failed to parse markdown'
        });
    }
});
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
//# sourceMappingURL=server.js.map