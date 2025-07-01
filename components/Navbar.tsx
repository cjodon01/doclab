'use client';

import { Button } from '@/components/ui/button';
import { GitBranch, RefreshCw, ExternalLink } from 'lucide-react';
import { useState } from 'react';

interface NavbarProps {
  siteName: string;
  onRefresh?: () => void;
  isLoading?: boolean;
  githubUrl?: string;
}

export default function Navbar({ siteName, onRefresh, isLoading = false, githubUrl }: NavbarProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (!onRefresh) return;
    
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <nav className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-50">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center space-x-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <GitBranch className="h-4 w-4" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">{siteName}</h1>
            <p className="text-xs text-muted-foreground">Documentation</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {githubUrl && (
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="text-muted-foreground hover:text-foreground"
            >
              <a
                href={githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2"
              >
                <ExternalLink className="h-4 w-4" />
                <span className="hidden sm:inline">View on GitHub</span>
              </a>
            </Button>
          )}
          
          {onRefresh && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading || isRefreshing}
              className="text-muted-foreground hover:text-foreground"
            >
              <RefreshCw className={`h-4 w-4 ${(isLoading || isRefreshing) ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline ml-2">Refresh</span>
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}