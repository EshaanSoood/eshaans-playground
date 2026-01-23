/**
 * Convert MDX/Markdown content to email-safe HTML
 * Uses remark and rehype for processing
 */

import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import rehypeHighlight from 'rehype-highlight';

/**
 * Convert MDX content to email-safe HTML
 * Strips React components and converts markdown to HTML
 */
export async function mdxToEmailHtml(mdxContent: string): Promise<string> {
  try {
    // Remove JSX/React components and MDX-specific syntax
    // This is a simple approach - for more complex MDX, you might need more sophisticated parsing
    let cleanedContent = mdxContent
      // Remove JSX components (simple pattern matching)
      .replace(/<[A-Z][a-zA-Z0-9]*[^>]*\/>/g, '')
      .replace(/<[A-Z][a-zA-Z0-9]*[^>]*>[\s\S]*?<\/[A-Z][a-zA-Z0-9]*>/g, '')
      // Remove import statements
      .replace(/^import\s+.*$/gm, '')
      // Remove export statements
      .replace(/^export\s+.*$/gm, '');

    // Process markdown to HTML
    const processor = unified()
      .use(remarkParse)
      .use(remarkRehype, { allowDangerousHtml: false })
      .use(rehypeHighlight, { 
        // Email-safe syntax highlighting - use inline styles
        detect: true,
        // We'll style code blocks with inline styles for email compatibility
      })
      .use(rehypeStringify, { 
        allowDangerousHtml: false,
        // Ensure email-safe HTML output
      });

    const result = await processor.process(cleanedContent);
    let html = String(result);

    // Post-process HTML to make it more email-safe
    html = makeEmailSafe(html);

    return html;
  } catch (error) {
    console.error('Error converting MDX to HTML:', error);
    // Fallback: return content as plain text wrapped in paragraphs
    return `<p style="font-family:system-ui,-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif; font-size:14px; line-height:20px; color:#1F2A33; margin:0 0 10px 0;">${escapeHtml(mdxContent)}</p>`;
  }
}

/**
 * Make HTML email-safe by:
 * - Adding inline styles to common elements
 * - Ensuring proper email client compatibility
 * - Converting code blocks to email-safe format
 */
function makeEmailSafe(html: string): string {
  // Add inline styles to headings
  html = html.replace(
    /<h1([^>]*)>/g,
    '<h1$1 style="font-family:Georgia,\'Times New Roman\',serif; font-weight:700; font-size:28px; line-height:34px; color:#1F2A33; margin:16px 0 10px 0;">'
  );
  html = html.replace(
    /<h2([^>]*)>/g,
    '<h2$1 style="font-family:Georgia,\'Times New Roman\',serif; font-weight:700; font-size:22px; line-height:28px; color:#1F2A33; margin:14px 0 10px 0;">'
  );
  html = html.replace(
    /<h3([^>]*)>/g,
    '<h3$1 style="font-family:Georgia,\'Times New Roman\',serif; font-weight:700; font-size:18px; line-height:24px; color:#1F2A33; margin:12px 0 8px 0;">'
  );
  html = html.replace(
    /<h4([^>]*)>/g,
    '<h4$1 style="font-family:Georgia,\'Times New Roman\',serif; font-weight:700; font-size:14px; line-height:20px; color:#1F2A33; margin:10px 0 6px 0;">'
  );

  // Add inline styles to paragraphs
  html = html.replace(
    /<p([^>]*)>/g,
    '<p$1 style="font-family:system-ui,-apple-system,\'Segoe UI\',Roboto,Helvetica,Arial,sans-serif; font-size:14px; line-height:20px; color:#1F2A33; margin:0 0 10px 0;">'
  );

  // Add inline styles to links
  html = html.replace(
    /<a([^>]*href="[^"]*"[^>]*)>/g,
    '<a$1 style="color:#094881; text-decoration:underline;">'
  );

  // Add inline styles to lists
  html = html.replace(
    /<ul([^>]*)>/g,
    '<ul$1 style="font-family:system-ui,-apple-system,\'Segoe UI\',Roboto,Helvetica,Arial,sans-serif; font-size:14px; line-height:20px; color:#1F2A33; margin:0 0 10px 0; padding-left:20px;">'
  );
  html = html.replace(
    /<ol([^>]*)>/g,
    '<ol$1 style="font-family:system-ui,-apple-system,\'Segoe UI\',Roboto,Helvetica,Arial,sans-serif; font-size:14px; line-height:20px; color:#1F2A33; margin:0 0 10px 0; padding-left:20px;">'
  );
  html = html.replace(
    /<li([^>]*)>/g,
    '<li$1 style="margin:4px 0;">'
  );

  // Style code blocks for email (simplified - email clients have limited CSS support)
  html = html.replace(
    /<pre([^>]*)>/g,
    '<pre$1 style="font-family:\'Courier New\',Courier,monospace; font-size:12px; line-height:18px; background-color:#E7E9E3; border:1px solid #C6CBC8; border-radius:4px; padding:12px; margin:12px 0; overflow-x:auto;">'
  );
  html = html.replace(
    /<code([^>]*)>/g,
    '<code$1 style="font-family:\'Courier New\',Courier,monospace; font-size:12px; background-color:#E7E9E3; padding:2px 4px; border-radius:2px;">'
  );

  // Style blockquotes
  html = html.replace(
    /<blockquote([^>]*)>/g,
    '<blockquote$1 style="border-left:5px solid #B7BDC0; padding:10px 16px; margin:12px 0; font-family:Georgia,\'Times New Roman\',serif; font-size:16px; line-height:22px; color:#1F2A33; background-color:#E7E9E3;">'
  );

  // Style horizontal rules
  html = html.replace(
    /<hr([^>]*)>/g,
    '<hr$1 style="border-top:1px solid #C6CBC8; margin:16px 0; border-bottom:none; border-left:none; border-right:none;">'
  );

  // Style images (make them responsive and email-safe)
  html = html.replace(
    /<img([^>]*src="[^"]*"[^>]*)>/g,
    '<img$1 style="max-width:100%; height:auto; display:block; border:0; outline:none; text-decoration:none;">'
  );

  // Style strong and emphasis
  html = html.replace(
    /<strong([^>]*)>/g,
    '<strong$1 style="font-weight:700;">'
  );
  html = html.replace(
    /<em([^>]*)>/g,
    '<em$1 style="font-style:italic;">'
  );

  // Remove any remaining style attributes that might conflict
  // and ensure all elements have proper email-safe styling

  return html;
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}
