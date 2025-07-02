import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createGitHubClient } from './lib/github';
import { parseMarkdown } from './lib/markdown';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// API Routes
app.get('/api/github/tree', async (req, res) => {
  try {
    const githubClient = createGitHubClient();
    if (!githubClient) {
      return res.status(500).json({ 
        error: 'GitHub configuration is missing. Please check your environment variables.' 
      });
    }

    // Validate repository access
    const validation = await githubClient.validateRepository();
    if (!validation.valid) {
      return res.status(400).json({ 
        error: validation.error || 'Repository validation failed' 
      });
    }

    const tree = await githubClient.buildFileTree();
    res.json({ tree });
  } catch (error) {
    console.error('Error fetching file tree:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to load documentation' 
    });
  }
});

app.get('/api/github/file', async (req, res) => {
  try {
    const { path: filePath } = req.query;
    
    if (!filePath || typeof filePath !== 'string') {
      return res.status(400).json({ error: 'File path is required' });
    }

    const githubClient = createGitHubClient();
    if (!githubClient) {
      return res.status(500).json({ 
        error: 'GitHub configuration is missing' 
      });
    }

    const content = await githubClient.fetchFileContent(filePath);
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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});