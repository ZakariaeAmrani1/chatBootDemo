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
  const [isVisible, setIsVisible] = useState(false);

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

  // Parse markdown to HTML with error handling and simpler approach
  let htmlContent: string;
  try {
    // Use the basic marked function which should return a string synchronously
    htmlContent = marked(displayedContent, {
      breaks: true, // Convert line breaks to <br>
      gfm: true, // GitHub Flavored Markdown
    }) as string;

    // If it's still not a string, force conversion
    if (typeof htmlContent !== 'string') {
      htmlContent = String(htmlContent);
    }
  } catch (error) {
    console.error('Markdown parsing error:', error);
    // Fallback to simple text processing
    htmlContent = displayedContent
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-muted px-1.5 py-0.5 rounded text-sm font-mono border">$1</code>')
      .replace(/\n/g, '<br>');
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
