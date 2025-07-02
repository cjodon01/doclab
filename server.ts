import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createDocsProvider } from './lib/docs';
import { parseMarkdown } from './lib/markdown';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize docs provider
let docsProvider: any = null;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Initialize docs provider on startup
async function initializeDocsProvider() {
  try {
    docsProvider = createDocsProvider();
    await docsProvider.initialize();
    console.log('Documentation provider initialized successfully');
  } catch (error) {
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
  } catch (error) {
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
  } catch (error) {
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
  } catch (error) {
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

    const html = await parseMarkdown(content);
    res.json({ html });
  } catch (error) {
    console.error('Error parsing markdown:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to parse markdown' 
    });
  }
});

// Serve the main HTML file for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
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