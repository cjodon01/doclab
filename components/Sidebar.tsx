'use client';

import { TreeNode } from '@/lib/github';
import { formatFileName } from '@/lib/markdown';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronRight, ChevronDown, File, Folder, FolderOpen } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  tree: TreeNode[];
  selectedPath?: string;
  onFileSelect: (path: string, downloadUrl: string) => void;
  isLoading?: boolean;
}

interface TreeItemProps {
  node: TreeNode;
  level: number;
  selectedPath?: string;
  onFileSelect: (path: string, downloadUrl: string) => void;
}

function TreeItem({ node, level, selectedPath, onFileSelect }: TreeItemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isSelected = selectedPath === node.path;
  const isMarkdownFile = node.type === 'file' && /\.(md|mdx)$/i.test(node.name);

  const handleClick = () => {
    if (node.type === 'dir') {
      setIsOpen(!isOpen);
    } else if (isMarkdownFile && node.download_url) {
      onFileSelect(node.path, node.download_url);
    }
  };

  const paddingLeft = `${level * 16 + 12}px`;

  if (node.type === 'dir') {
    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className={cn(
              'w-full justify-start h-auto py-2 px-3 text-left hover:bg-muted/50',
              'transition-colors duration-150'
            )}
            style={{ paddingLeft }}
            onClick={handleClick}
          >
            <div className="flex items-center space-x-2 min-w-0 flex-1">
              {isOpen ? (
                <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              )}
              {isOpen ? (
                <FolderOpen className="h-4 w-4 shrink-0 text-blue-500" />
              ) : (
                <Folder className="h-4 w-4 shrink-0 text-blue-500" />
              )}
              <span className="text-sm font-medium truncate">
                {formatFileName(node.name)}
              </span>
            </div>
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-0">
          {node.children?.map((child) => (
            <TreeItem
              key={child.path}
              node={child}
              level={level + 1}
              selectedPath={selectedPath}
              onFileSelect={onFileSelect}
            />
          ))}
        </CollapsibleContent>
      </Collapsible>
    );
  }

  if (!isMarkdownFile) {
    return null;
  }

  return (
    <Button
      variant="ghost"
      className={cn(
        'w-full justify-start h-auto py-2 px-3 text-left hover:bg-muted/50',
        'transition-colors duration-150',
        isSelected && 'bg-muted text-foreground font-medium'
      )}
      style={{ paddingLeft }}
      onClick={handleClick}
    >
      <div className="flex items-center space-x-2 min-w-0 flex-1">
        <File className="h-4 w-4 shrink-0 text-muted-foreground" />
        <span className="text-sm truncate">
          {formatFileName(node.name)}
        </span>
      </div>
    </Button>
  );
}

export default function Sidebar({ tree, selectedPath, onFileSelect, isLoading }: SidebarProps) {
  if (isLoading) {
    return (
      <div className="w-80 border-r bg-muted/20 p-4">
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-8 bg-muted animate-pulse rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (tree.length === 0) {
    return (
      <div className="w-80 border-r bg-muted/20 p-4">
        <div className="text-center text-muted-foreground">
          <Folder className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No documentation files found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 border-r bg-muted/20">
      <div className="p-4 border-b">
        <h2 className="text-sm font-semibold text-foreground">Documentation</h2>
        <p className="text-xs text-muted-foreground mt-1">
          {tree.length} {tree.length === 1 ? 'item' : 'items'}
        </p>
      </div>
      <ScrollArea className="h-[calc(100vh-8rem)]">
        <div className="p-2 space-y-1">
          {tree.map((node) => (
            <TreeItem
              key={node.path}
              node={node}
              level={0}
              selectedPath={selectedPath}
              onFileSelect={onFileSelect}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}