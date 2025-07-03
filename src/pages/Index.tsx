import { useState, useEffect } from 'react';
import { DocsNavigation } from '@/components/DocsNavigation';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { RefreshButton } from '@/components/RefreshButton';
import { useMarkdownFiles, MarkdownFile } from '@/hooks/useMarkdownFiles';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const { files, loading, error, source } = useMarkdownFiles();
  const [activeFile, setActiveFile] = useState<MarkdownFile | null>(null);

  // Set the first non-directory file as active by default
  useEffect(() => {
    if (files.length > 0 && !activeFile) {
      const firstFile = files.find(f => !f.isDirectory);
      if (firstFile) {
        setActiveFile(firstFile);
      }
    }
  }, [files, activeFile]);

  const handleFileSelect = (file: MarkdownFile) => {
    if (!file.isDirectory) {
      setActiveFile(file);
    }
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading documentation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-background">
      <DocsNavigation
        files={files}
        activeFile={activeFile?.path || null}
        onFileSelect={handleFileSelect}
        source={source}
      />
      
      <div className="flex-1 flex flex-col">
        <header className="h-14 border-b border-docs-border flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            {activeFile && (
              <h1 className="text-lg font-semibold">{activeFile.name}</h1>
            )}
          </div>
          <RefreshButton onRefresh={handleRefresh} />
        </header>
        
        <main className="flex-1 overflow-hidden">
          {error && (
            <div className="p-6">
              <Alert>
                <AlertDescription>
                  {error}
                </AlertDescription>
              </Alert>
            </div>
          )}
          
          {activeFile ? (
            <MarkdownRenderer 
              content={activeFile.content}
              title={activeFile.name}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-2xl font-semibold mb-2">No documentation found</h2>
                <p className="text-muted-foreground mb-4">
                  Add markdown files to your docs folder or configure GitHub integration.
                </p>
                <RefreshButton onRefresh={handleRefresh} />
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Index;
