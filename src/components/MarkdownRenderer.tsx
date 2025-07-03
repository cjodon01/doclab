import { marked } from 'marked';
import { useEffect, useState } from 'react';

interface MarkdownRendererProps {
  content: string;
  title?: string;
}

export const MarkdownRenderer = ({ content, title }: MarkdownRendererProps) => {
  const [htmlContent, setHtmlContent] = useState('');

  useEffect(() => {
    const renderMarkdown = async () => {
      try {
        // Configure marked options
        marked.setOptions({
          breaks: true,
          gfm: true,
        });

        const html = await marked.parse(content);
        setHtmlContent(html);
      } catch (error) {
        console.error('Error rendering markdown:', error);
        setHtmlContent('<p>Error rendering markdown content</p>');
      }
    };

    renderMarkdown();
  }, [content]);

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-4xl mx-auto p-8">
        {title && (
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">{title}</h1>
            <div className="h-px bg-docs-border"></div>
          </div>
        )}
        <div 
          className="prose prose-slate max-w-none
            prose-headings:text-foreground
            prose-p:text-foreground
            prose-strong:text-foreground
            prose-code:bg-muted prose-code:text-foreground prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono
            prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:border prose-pre:border-gray-700 prose-pre:rounded-lg prose-pre:p-6 prose-pre:overflow-x-auto prose-pre:shadow-lg prose-pre:font-mono prose-pre:text-sm prose-pre:leading-relaxed
            prose-blockquote:border-l-primary
            prose-a:text-primary hover:prose-a:text-primary/80
            prose-ul:text-foreground
            prose-ol:text-foreground
            prose-li:text-foreground"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      </div>
    </div>
  );
};