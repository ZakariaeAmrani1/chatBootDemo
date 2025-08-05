import React, { useState, useEffect } from "react";
import { marked } from "marked";
import { cn } from "@/lib/utils";

interface MarkdownRendererProps {
  content: string;
  className?: string;
  typewriter?: boolean;
  typewriterSpeed?: number;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  className,
  typewriter = false,
  typewriterSpeed = 30,
}) => {
  const [displayedContent, setDisplayedContent] = useState(typewriter ? "" : content);

  // Typewriter effect
  useEffect(() => {
    if (!typewriter) {
      setDisplayedContent(content);
      return;
    }

    if (content.length === 0) {
      setDisplayedContent("");
      return;
    }

    let currentIndex = 0;
    const timer = setInterval(() => {
      if (currentIndex < content.length) {
        setDisplayedContent(content.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        clearInterval(timer);
      }
    }, typewriterSpeed);

    return () => clearInterval(timer);
  }, [content, typewriter, typewriterSpeed]);

  // Configure marked options for better rendering
  const renderer = new marked.Renderer();
  
  // Custom rendering for better styling
  renderer.paragraph = (text: string) => {
    return `<p class="mb-2 last:mb-0">${text}</p>`;
  };
  
  renderer.strong = (text: string) => {
    return `<strong class="font-semibold text-foreground">${text}</strong>`;
  };
  
  renderer.em = (text: string) => {
    return `<em class="italic text-foreground/90">${text}</em>`;
  };
  
  renderer.code = (code: string, infostring?: string) => {
    const language = infostring ? infostring.split(' ')[0] : '';
    return `<pre class="bg-muted/50 border rounded-lg p-4 my-3 overflow-x-auto"><code class="text-sm font-mono text-foreground" data-language="${language}">${code}</code></pre>`;
  };

  renderer.codespan = (code: string) => {
    return `<code class="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-foreground border">${code}</code>`;
  };
  
  renderer.blockquote = (quote: string) => {
    return `<blockquote class="border-l-4 border-muted-foreground/30 pl-4 py-2 my-3 text-muted-foreground italic">${quote}</blockquote>`;
  };
  
  renderer.list = (body: string, ordered: boolean) => {
    const tag = ordered ? 'ol' : 'ul';
    const classes = ordered 
      ? 'list-decimal list-inside space-y-1 mb-3' 
      : 'list-disc list-inside space-y-1 mb-3';
    return `<${tag} class="${classes}">${body}</${tag}>`;
  };
  
  renderer.listitem = (text: string) => {
    return `<li class="text-foreground">${text}</li>`;
  };
  
  renderer.heading = (text: string, level: number) => {
    const sizes = {
      1: 'text-2xl font-bold',
      2: 'text-xl font-semibold', 
      3: 'text-lg font-semibold',
      4: 'text-base font-semibold',
      5: 'text-sm font-semibold',
      6: 'text-xs font-semibold'
    };
    const sizeClass = sizes[level as keyof typeof sizes] || sizes[6];
    return `<h${level} class="${sizeClass} text-foreground mb-2 mt-3 first:mt-0">${text}</h${level}>`;
  };
  
  renderer.link = (href: string | null, title: string | null, text: string) => {
    const titleAttr = title ? ` title="${title}"` : '';
    return `<a href="${href}" class="text-primary underline hover:text-primary/80 transition-colors"${titleAttr} target="_blank" rel="noopener noreferrer">${text}</a>`;
  };

  // Set marked options
  marked.setOptions({
    renderer,
    breaks: true, // Convert line breaks to <br>
    gfm: true, // GitHub Flavored Markdown
  });

  // Parse markdown to HTML with error handling
  let htmlContent: string;
  try {
    const result = marked.parse(displayedContent);
    htmlContent = typeof result === 'string' ? result : String(result);
  } catch (error) {
    console.error('Markdown parsing error:', error);
    // Fallback to plain text with line breaks
    htmlContent = displayedContent.replace(/\n/g, '<br>');
  }

  return (
    <div
      className={cn(
        "prose prose-sm max-w-none text-foreground leading-relaxed",
        // Strong/Bold styling
        "[&_strong]:font-semibold [&_strong]:text-foreground",
        // Italic styling
        "[&_em]:italic [&_em]:text-foreground/90",
        // Inline code styling
        "[&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm [&_code]:font-mono [&_code]:border",
        // Code block styling
        "[&_pre]:bg-muted/50 [&_pre]:border [&_pre]:rounded-lg [&_pre]:p-4 [&_pre]:my-3 [&_pre]:overflow-x-auto",
        "[&_pre_code]:bg-transparent [&_pre_code]:border-0 [&_pre_code]:p-0",
        // Blockquote styling
        "[&_blockquote]:border-l-4 [&_blockquote]:border-primary/30 [&_blockquote]:pl-4 [&_blockquote]:py-2 [&_blockquote]:my-3 [&_blockquote]:text-muted-foreground [&_blockquote]:italic",
        // List styling
        "[&_ul]:list-disc [&_ul]:list-inside [&_ul]:space-y-1 [&_ul]:mb-3 [&_ul]:ml-4",
        "[&_ol]:list-decimal [&_ol]:list-inside [&_ol]:space-y-1 [&_ol]:mb-3 [&_ol]:ml-4",
        "[&_li]:text-foreground",
        // Link styling
        "[&_a]:text-primary [&_a]:underline hover:[&_a]:text-primary/80 [&_a]:transition-colors",
        // Heading styling
        "[&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-2 [&_h1]:mt-3 first:[&_h1]:mt-0",
        "[&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mb-2 [&_h2]:mt-3 first:[&_h2]:mt-0",
        "[&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mb-2 [&_h3]:mt-3 first:[&_h3]:mt-0",
        "[&_h4]:text-base [&_h4]:font-semibold [&_h4]:mb-2 [&_h4]:mt-3 first:[&_h4]:mt-0",
        "[&_h5]:text-sm [&_h5]:font-semibold [&_h5]:mb-2 [&_h5]:mt-3 first:[&_h5]:mt-0",
        "[&_h6]:text-xs [&_h6]:font-semibold [&_h6]:mb-2 [&_h6]:mt-3 first:[&_h6]:mt-0",
        // Paragraph styling
        "[&_p]:mb-2 last:[&_p]:mb-0",
        className
      )}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
};

export default MarkdownRenderer;
