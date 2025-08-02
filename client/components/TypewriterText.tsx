import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface TypewriterTextProps {
  text: string;
  speed?: number; // Characters per second
  className?: string;
  onComplete?: () => void;
  showCursor?: boolean;
}

const TypewriterText: React.FC<TypewriterTextProps> = ({
  text,
  speed = 50, // 50 characters per second by default
  className,
  onComplete,
  showCursor = true,
}) => {
  const [displayedText, setDisplayedText] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const [showBlinkingCursor, setShowBlinkingCursor] = useState(true);

  useEffect(() => {
    // Reset state when text changes
    setDisplayedText("");
    setIsComplete(false);
    setShowBlinkingCursor(true);

    if (!text) {
      setIsComplete(true);
      onComplete?.();
      return;
    }

    let currentIndex = 0;
    const intervalTime = 1000 / speed; // Convert speed to milliseconds per character

    const interval = setInterval(() => {
      if (currentIndex < text.length) {
        setDisplayedText(text.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        // Animation complete
        setIsComplete(true);
        onComplete?.();
        clearInterval(interval);
        
        // Hide cursor after a delay
        setTimeout(() => {
          setShowBlinkingCursor(false);
        }, 1000);
      }
    }, intervalTime);

    return () => clearInterval(interval);
  }, [text, speed, onComplete]);

  return (
    <span className={cn("relative", className)}>
      <span className="whitespace-pre-wrap leading-relaxed">
        {displayedText}
      </span>
      {showCursor && showBlinkingCursor && (
        <span 
          className="inline-block w-0.5 h-5 bg-primary ml-0.5 animate-pulse"
          style={{
            animation: "blink 1s infinite",
          }}
        />
      )}
      <style jsx>{`
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
      `}</style>
    </span>
  );
};

export default TypewriterText;
