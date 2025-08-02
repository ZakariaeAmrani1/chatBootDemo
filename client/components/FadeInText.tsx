import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface FadeInTextProps {
  text: string;
  className?: string;
  delay?: number;
}

const FadeInText: React.FC<FadeInTextProps> = ({
  text,
  className,
  delay = 100,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay, text]);

  return (
    <div
      className={cn(
        "transition-all duration-700 ease-out transform",
        isVisible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-2",
        className
      )}
    >
      <p className="whitespace-pre-wrap leading-relaxed">
        {text}
      </p>
    </div>
  );
};

export default FadeInText;
