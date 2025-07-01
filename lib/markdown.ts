import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import rehypeStringify from 'rehype-stringify';

export async function parseMarkdown(content: string): Promise<string> {
  try {
    const result = await unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkRehype, { allowDangerousHtml: true })
      .use(rehypeRaw)
      .use(rehypeHighlight, {
        detect: true,
        ignoreMissing: true,
      })
      .use(rehypeStringify)
      .process(content);

    return result.toString();
  } catch (error) {
    console.error('Error parsing markdown:', error);
    return `<p>Error parsing markdown content: ${error instanceof Error ? error.message : 'Unknown error'}</p>`;
  }
}

export function extractTitle(content: string): string {
  const lines = content.split('\n');
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('# ')) {
      return trimmed.substring(2).trim();
    }
  }
  
  return '';
}

export function formatFileName(fileName: string): string {
  return fileName
    .replace(/\.(md|mdx)$/i, '')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
}