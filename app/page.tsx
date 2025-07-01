'use client';

import { useState, useEffect, useCallback } from 'react';
import { createGitHubClient, TreeNode } from '@/lib/github';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import { Button } from '@/components/ui/button';
import { AlertCircle, FileText, Settings } from 'lucide-react';

interface AppState {
  tree: TreeNode[];
  selectedFile: {
    path: string;
    content: string;
    downloadUrl: string;
  } | null;
  isLoading: boolean;
  error: string | null;
  pageTitle: string;
}

export default function Home() {
  const [state, setState] = useState<AppState>({
    tree: [],
    selectedFile: null,
    isLoading: true,
    error: null,
    pageTitle: '',
  });

  const githubClient = createGitHubClient();
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'DocsDeploy';
  const githubUrl = process.env.NEXT_PUBLIC_GITHUB_REPO_OWNER && process.env.NEXT_PUBLIC_GITHUB_REPO_NAME
    ? `https://github.com/${process.env.NEXT_PUBLIC_GITHUB_REPO_OWNER}/${process.env.NEXT_PUBLIC_GITHUB_REPO_NAME}`
    : undefined;

  const loadFileTree = useCallback(async () => {
    if (!githubClient) {
      setState(prev => ({
        ...prev,
        error: 'GitHub configuration is missing. Please check your environment variables.',
        isLoading: false,
      }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const tree = await githubClient.buildFileTree();
      setState(prev => ({ ...prev, tree, isLoading: false }));

      // Auto-select first markdown file if available
      const firstMarkdownFile = findFirstMarkdownFile(tree);
      if (firstMarkdownFile) {
        await loadFile(firstMarkdownFile.path, firstMarkdownFile.download_url!);
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load documentation',
        isLoading: false,
      }));
    }
  }, [githubClient]);

  const findFirstMarkdownFile = (nodes: TreeNode[]): TreeNode | null => {
    for (const node of nodes) {
      if (node.type === 'file' && /\.(md|mdx)$/i.test(node.name) && node.download_url) {
        return node;
      }
      if (node.type === 'dir' && node.children) {
        const found = findFirstMarkdownFile(node.children);
        if (found) return found;
      }
    }
    return null;
  };

  const loadFile = async (path: string, downloadUrl: string) => {
    if (!githubClient) return;

    try {
      const content = await githubClient.fetchFileContent(downloadUrl);
      setState(prev => ({
        ...prev,
        selectedFile: { path, content, downloadUrl },
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load file',
      }));
    }
  };

  const handleTitleExtracted = (title: string) => {
    setState(prev => ({ ...prev, pageTitle: title }));
  };

  useEffect(() => {
    loadFileTree();
  }, [loadFileTree]);

  if (!githubClient) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="max-w-md w-full text-center">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8">
            <Settings className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Configuration Required
            </h2>
            <p className="text-gray-600 mb-6">
              Please configure your GitHub repository settings in the environment variables.
            </p>
            <div className="text-left bg-gray-50 rounded p-4 text-sm font-mono">
              <div>NEXT_PUBLIC_GITHUB_REPO_OWNER=your-username</div>
              <div>NEXT_PUBLIC_GITHUB_REPO_NAME=your-repo</div>
              <div>NEXT_PUBLIC_GITHUB_DOCS_PATH=docs</div>
              <div className="text-gray-500"># Optional for private repos:</div>
              <div>NEXT_PUBLIC_GITHUB_TOKEN=your-token</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (state.error && state.tree.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar siteName={siteName} githubUrl={githubUrl} />
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="max-w-md w-full text-center">
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-8">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Failed to Load Documentation
              </h2>
              <p className="text-muted-foreground mb-6">{state.error}</p>
              <Button onClick={loadFileTree} className="flex items-center space-x-2">
                <span>Retry</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar
        siteName={siteName}
        onRefresh={loadFileTree}
        isLoading={state.isLoading}
        githubUrl={githubUrl}
      />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          tree={state.tree}
          selectedPath={state.selectedFile?.path}
          onFileSelect={loadFile}
          isLoading={state.isLoading}
        />
        
        <main className="flex-1 overflow-auto">
          {state.selectedFile ? (
            <MarkdownRenderer
              content={state.selectedFile.content}
              filePath={state.selectedFile.path}
              onTitleExtracted={handleTitleExtracted}
            />
          ) : !state.isLoading ? (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center">
                <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h2 className="text-xl font-semibold text-foreground mb-2">
                  Select a document
                </h2>
                <p className="text-muted-foreground">
                  Choose a file from the sidebar to start reading the documentation.
                </p>
              </div>
            </div>
          ) : null}
        </main>
      </div>
    </div>
  );
}