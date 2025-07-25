import { marked } from 'marked';
import { useEffect, useState } from 'react';
import DOMPurify from 'dompurify';

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
        // Sanitize HTML to prevent XSS attacks
        const sanitizedHtml = DOMPurify.sanitize(html, {
          ALLOWED_TAGS: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'br', 'strong', 'em', 'u', 'code', 'pre', 'blockquote', 'ul', 'ol', 'li', 'a', 'img', 'table', 'thead', 'tbody', 'tr', 'th', 'td'],
          ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'id']
        });
        setHtmlContent(sanitizedHtml);
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
            prose-blockquote:border-l-primary
            prose-a:text-primary hover:prose-a:text-primary/80
            prose-ul:text-foreground
            prose-ol:text-foreground
            prose-li:text-foreground
            [&_pre]:!bg-docs-code-bg [&_pre]:!text-gray-100 [&_pre]:!border [&_pre]:!border-border [&_pre]:!rounded-lg [&_pre]:!p-6 [&_pre]:!overflow-x-auto [&_pre]:!shadow-lg [&_pre]:!font-mono [&_pre]:!text-sm [&_pre]:!leading-relaxed [&_pre]:!m-0"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      </div>
    </div>
  );
};