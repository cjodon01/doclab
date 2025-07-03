class DocApp {
  constructor() {
    this.state = {
      tree: [],
      selectedFile: null,
      isLoading: false,
      error: null,
      currentPath: null,
      sourceInfo: null
    };
    
    this.isInitialized = false;
    this.loadingTimeout = null;
    
    this.init();
  }

  async init() {
    if (this.isInitialized) return;
    
    try {
      this.bindEvents();
      this.render();
      await this.loadSourceInfo();
      await this.loadFileTree();
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize app:', error);
      this.setState({ error: error.message, isLoading: false });
    }
  }

  setState(newState) {
    // Prevent unnecessary re-renders
    const hasChanges = Object.keys(newState).some(key => 
      JSON.stringify(this.state[key]) !== JSON.stringify(newState[key])
    );
    
    if (!hasChanges) return;
    
    this.state = { ...this.state, ...newState };
    this.render();
  }

  bindEvents() {
    // Refresh button
    const refreshBtn = document.getElementById('refresh-btn');
    if (refreshBtn) {
      refreshBtn.onclick = (e) => {
        e.preventDefault();
        this.loadFileTree();
      };
    }
  }

  async loadSourceInfo() {
    try {
      const response = await fetch('/api/docs/info');
      const data = await response.json();
      
      if (response.ok) {
        this.setState({ sourceInfo: data });
      }
    } catch (error) {
      console.warn('Could not load source info:', error);
    }
  }

  async loadFileTree() {
    if (this.state.isLoading) return; // Prevent multiple simultaneous requests
    
    this.setState({ isLoading: true, error: null });
    
    // Clear any existing timeout
    if (this.loadingTimeout) {
      clearTimeout(this.loadingTimeout);
    }
    
    try {
      const response = await fetch('/api/docs/tree');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }
      
      this.setState({ 
        tree: data.tree || [], 
        isLoading: false 
      });
      
      // Auto-select first markdown file if no file is selected
      if (!this.state.selectedFile && data.tree && data.tree.length > 0) {
        const firstMarkdownFile = this.findFirstMarkdownFile(data.tree);
        if (firstMarkdownFile) {
          await this.loadFile(firstMarkdownFile.path);
        }
      }
      
    } catch (error) {
      console.error('Error loading file tree:', error);
      this.setState({ 
        error: error.message, 
        isLoading: false,
        tree: []
      });
    }
  }

  findFirstMarkdownFile(nodes) {
    for (const node of nodes) {
      if (node.type === 'file' && /\.(md|mdx)$/i.test(node.name)) {
        return node;
      }
      if (node.type === 'dir' && node.children) {
        const found = this.findFirstMarkdownFile(node.children);
        if (found) return found;
      }
    }
    return null;
  }

  async loadFile(path) {
    if (this.state.currentPath === path) return; // Prevent loading same file
    
    try {
      this.setState({ currentPath: path });
      
      const response = await fetch(`/api/docs/file?path=${encodeURIComponent(path)}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }
      
      // Parse markdown
      const markdownResponse = await fetch('/api/markdown/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: data.content })
      });
      
      const markdownData = await markdownResponse.json();
      
      if (!markdownResponse.ok) {
        throw new Error(markdownData.error || 'Failed to parse markdown');
      }
      
      this.setState({
        selectedFile: {
          path,
          content: data.content,
          html: markdownData.html
        }
      });
      
    } catch (error) {
      console.error('Error loading file:', error);
      this.setState({ error: error.message });
    }
  }

  formatFileName(fileName) {
    return fileName
      .replace(/\.(md|mdx)$/i, '')
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  }

  renderTreeNode(node, level = 0) {
    const isMarkdownFile = node.type === 'file' && /\.(md|mdx)$/i.test(node.name);
    const isSelected = this.state.selectedFile?.path === node.path;
    const paddingLeft = level * 16 + 12;
    
    if (node.type === 'dir') {
      return `
        <div class="tree-item">
          <button class="tree-button dir-button" style="padding-left: ${paddingLeft}px" onclick="app.toggleDirectory('${node.path}')">
            <span class="tree-icon">📁</span>
            <span class="tree-name">${this.formatFileName(node.name)}</span>
          </button>
          <div class="tree-children" id="children-${node.path.replace(/[^a-zA-Z0-9]/g, '-')}">
            ${node.children ? node.children.map(child => this.renderTreeNode(child, level + 1)).join('') : ''}
          </div>
        </div>
      `;
    }
    
    if (!isMarkdownFile) return '';
    
    return `
      <div class="tree-item">
        <button class="tree-button file-button ${isSelected ? 'selected' : ''}" 
                style="padding-left: ${paddingLeft}px" 
                onclick="app.loadFile('${node.path}')">
          <span class="tree-icon">📄</span>
          <span class="tree-name">${this.formatFileName(node.name)}</span>
        </button>
      </div>
    `;
  }

  toggleDirectory(path) {
    const childrenId = `children-${path.replace(/[^a-zA-Z0-9]/g, '-')}`;
    const childrenEl = document.getElementById(childrenId);
    if (childrenEl) {
      childrenEl.style.display = childrenEl.style.display === 'none' ? 'block' : 'none';
    }
  }

  render() {
    const app = document.getElementById('app');
    if (!app) return;
    
    // Update loading state
    const refreshBtn = document.getElementById('refresh-btn');
    if (refreshBtn) {
      refreshBtn.disabled = this.state.isLoading;
      refreshBtn.innerHTML = this.state.isLoading ? 
        '<span class="spinner"></span> Loading...' : 
        '🔄 Refresh';
    }
    
    // Update sidebar header with source info
    const sidebarHeader = document.querySelector('.sidebar-subtitle');
    if (sidebarHeader && this.state.sourceInfo) {
      sidebarHeader.textContent = this.state.sourceInfo.description;
    }
    
    // Render sidebar
    const sidebar = document.getElementById('sidebar-content');
    if (sidebar) {
      if (this.state.isLoading && this.state.tree.length === 0) {
        sidebar.innerHTML = `
          <div class="loading-placeholder">
            <div class="loading-item"></div>
            <div class="loading-item"></div>
            <div class="loading-item"></div>
          </div>
        `;
      } else if (this.state.error && this.state.tree.length === 0) {
        sidebar.innerHTML = `
          <div class="error-message">
            <p>❌ ${this.state.error}</p>
          </div>
        `;
      } else if (this.state.tree.length === 0) {
        sidebar.innerHTML = `
          <div class="empty-message">
            <p>📁 No documentation files found</p>
          </div>
        `;
      } else {
        sidebar.innerHTML = this.state.tree.map(node => this.renderTreeNode(node)).join('');
      }
    }
    
    // Render main content
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      if (this.state.selectedFile) {
        mainContent.innerHTML = `
          <div class="content-header">
            <h1>${this.formatFileName(this.state.selectedFile.path.split('/').pop())}</h1>
          </div>
          <div class="markdown-content">
            ${this.state.selectedFile.html || '<p>Loading content...</p>'}
          </div>
        `;
      } else if (!this.state.isLoading) {
        mainContent.innerHTML = `
          <div class="empty-content">
            <h2>📖 Select a document</h2>
            <p>Choose a file from the sidebar to start reading the documentation.</p>
          </div>
        `;
      }
    }
  }
}

// Initialize app when DOM is loaded
let app;
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    app = new DocApp();
  });
} else {
  app = new DocApp();
}