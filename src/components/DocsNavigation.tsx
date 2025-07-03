import { useState } from 'react';
import { ChevronRight, File, Folder, FolderOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MarkdownFile } from '@/hooks/useMarkdownFiles';

interface DocsNavigationProps {
  files: MarkdownFile[];
  activeFile: string | null;
  onFileSelect: (file: MarkdownFile) => void;
  source: 'local' | 'github';
}

interface NavItemProps {
  file: MarkdownFile;
  level: number;
  isActive: boolean;
  onSelect: (file: MarkdownFile) => void;
}

const NavItem = ({ file, level, isActive, onSelect }: NavItemProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = file.children && file.children.length > 0;

  const handleClick = () => {
    if (file.isDirectory && hasChildren) {
      setIsExpanded(!isExpanded);
    } else {
      onSelect(file);
    }
  };

  return (
    <div>
      <div
        className={cn(
          "flex items-center gap-2 px-3 py-2 text-sm cursor-pointer rounded-md transition-colors",
          "hover:bg-docs-nav-active",
          isActive && "bg-docs-nav-active font-medium text-primary",
          level > 0 && "ml-4"
        )}
        onClick={handleClick}
      >
        {file.isDirectory ? (
          <>
            {hasChildren && (
              <ChevronRight
                size={16}
                className={cn(
                  "transition-transform",
                  isExpanded && "rotate-90"
                )}
              />
            )}
            {isExpanded ? (
              <FolderOpen size={16} className="text-docs-sidebar-foreground" />
            ) : (
              <Folder size={16} className="text-docs-sidebar-foreground" />
            )}
          </>
        ) : (
          <File size={16} className="text-docs-sidebar-foreground ml-4" />
        )}
        <span className="flex-1">{file.name}</span>
      </div>
      
      {file.isDirectory && hasChildren && isExpanded && (
        <div className="ml-2">
          {file.children!.map((child, index) => (
            <NavItem
              key={index}
              file={child}
              level={level + 1}
              isActive={isActive}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const DocsNavigation = ({ files, activeFile, onFileSelect, source }: DocsNavigationProps) => {
  return (
    <div className="w-80 h-screen bg-docs-sidebar border-r border-docs-border flex flex-col">
      <div className="p-4 border-b border-docs-border">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
            <File size={16} className="text-primary-foreground" />
          </div>
          <h1 className="font-semibold text-lg">DocsDeploy</h1>
        </div>
        <p className="text-sm text-docs-sidebar-foreground">Documentation</p>
        <p className="text-xs text-muted-foreground mt-1">
          Reading from {source === 'local' ? 'local docs folder' : 'GitHub repository'}
        </p>
      </div>
      
      <div className="flex-1 overflow-auto p-4">
        <div className="space-y-1">
          {files.map((file, index) => (
            <NavItem
              key={index}
              file={file}
              level={0}
              isActive={activeFile === file.path}
              onSelect={onFileSelect}
            />
          ))}
        </div>
      </div>
    </div>
  );
};