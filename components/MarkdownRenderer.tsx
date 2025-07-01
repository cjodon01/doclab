'use client';

import { useEffect, useState } from 'react';
import { parseMarkdown, extractTitle } from '@/lib/markdown';
import { getGitHubEditUrl } from '@/lib/github';
import { Button } from '@/components/ui/button';
import { ExternalLink, Edit3, AlertCircle } from 'lucide-react';
import 'prismjs/themes/prism-tomorrow.css';

interface MarkdownRendererProps {
  content: string;
  filePath: string;
  onTitleExtracted?: (title: string) => void;
}

export default function MarkdownRenderer({ content, filePath, onTitleExtracted }: MarkdownRendererProps) {
  const [html, setHtml] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processMarkdown = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Extract title if callback provided
        if (onTitleExtracted) {
          const title = extractTitle(content);
          if (title) {
            onTitleExtracted(title);
          }
        }

        // Parse markdown to HTML
        const parsedHtml = await parseMarkdown(content);
        setHtml(parsedHtml);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to parse markdown');
      } finally {
        setIsLoading(false);
      }
    };

    processMarkdown();
  }, [content, onTitleExtracted]);

  const editUrl = getGitHubEditUrl(filePath);

  if (isLoading) {
    return (
      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-6 bg-muted animate-pulse rounded w-3/4" />
              <div className="h-4 bg-muted animate-pulse rounded w-full" />
              <div className="h-4 bg-muted animate-pulse rounded w-5/6" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6">
            <div className="flex items-center space-x-2 text-destructive mb-2">
              <AlertCircle className="h-5 w-5" />
              <h3 className="font-semibold">Error Loading Content</h3>
            </div>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1">
      {editUrl && (
        <div className="border-b bg-muted/30 px-8 py-3">
          <div className="max-w-4xl mx-auto flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="text-muted-foreground hover:text-foreground"
            >
              <a
                href={editUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2"
              >
                <Edit3 className="h-4 w-4" />
                <span>Edit on GitHub</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </Button>
          </div>
        </div>
      )}
      
      <div className="p-8">
        <article className="max-w-4xl mx-auto">
          <div
            className="prose prose-neutral dark:prose-invert max-w-none
              prose-headings:scroll-mt-20
              prose-h1:text-3xl prose-h1:font-bold prose-h1:mb-8 prose-h1:border-b prose-h1:pb-4
              prose-h2:text-2xl prose-h2:font-semibold prose-h2:mt-12 prose-h2:mb-6
              prose-h3:text-xl prose-h3:font-semibold prose-h3:mt-8 prose-h3:mb-4
              prose-p:text-base prose-p:leading-7 prose-p:mb-6
              prose-a:text-blue-600 hover:prose-a:text-blue-800 prose-a:no-underline hover:prose-a:underline
              prose-code:text-sm prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:font-mono
              prose-pre:bg-slate-900 prose-pre:border prose-pre:rounded-lg prose-pre:p-4
              prose-blockquote:border-l-4 prose-blockquote:border-muted prose-blockquote:pl-6 prose-blockquote:italic
              prose-ul:my-6 prose-ol:my-6
              prose-li:my-2
              prose-table:border-collapse prose-table:border prose-table:border-border
              prose-th:border prose-th:border-border prose-th:bg-muted prose-th:p-3 prose-th:text-left prose-th:font-semibold
              prose-td:border prose-td:border-border prose-td:p-3
              prose-img:rounded-lg prose-img:border prose-img:shadow-sm"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </article>
      </div>
    </div>
  );
}