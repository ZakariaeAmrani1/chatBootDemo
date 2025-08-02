import React, { useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Copy, ThumbsUp, ThumbsDown, RotateCcw, Share } from "lucide-react";
import { cn } from "@/lib/utils";
import FileAttachmentDisplay from "@/components/FileAttachment";
import { ModelSelectorCards } from "@/components/ModelSelectorCards";
import FadeInText from "@/components/FadeInText";
import type { Message } from "@shared/types";

interface ChatAreaProps {
  messages: Message[];
  selectedModel: string;
  onModelChange: (modelId: string) => void;
  isThinking?: boolean;
  isLoading?: boolean;
  error?: string | null;
}

const ChatArea: React.FC<ChatAreaProps> = ({
  messages,
  selectedModel,
  onModelChange,
  isThinking = false,
  isLoading = false,
  error = null,
}) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <ScrollArea className="h-full">
        <div className="flex flex-col items-center justify-center min-h-full p-8 text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-6">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              className="text-muted-foreground"
            >
              <path
                d="M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.77L5.82 21L7 14L2 9L8.91 8.26L12 2Z"
                fill="currentColor"
              />
            </svg>
          </div>
          <h3 className="text-2xl font-semibold text-foreground mb-2">
            How can I help you today?
          </h3>
          <p className="text-muted-foreground mb-8">
            Choose your AI model and start a conversation
          </p>

          {/* Model Selection */}
          <div className="w-full max-w-4xl pb-8">
            <ModelSelectorCards
              selectedModel={selectedModel}
              onModelChange={onModelChange}
            />
          </div>
        </div>
      </ScrollArea>
    );
  }

  return (
    <ScrollArea className="h-full px-4 bg-background" ref={scrollAreaRef}>
      <div className="max-w-4xl mx-auto py-6 space-y-6">
        {messages.map((message, index) => (
          <div
            key={message.id}
            className={cn(
              "flex gap-4",
              message.type === "user" ? "justify-end" : "justify-start",
            )}
          >
            {message.type === "assistant" && (
              <Avatar className="w-8 h-8 mt-1">
                <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                  AI
                </AvatarFallback>
              </Avatar>
            )}

            <div
              className={cn(
                "flex-1 max-w-3xl",
                message.type === "user" ? "ml-12" : "mr-12",
              )}
            >
              <div
                className={cn(
                  "rounded-2xl px-6 py-4 space-y-3",
                  message.type === "user"
                    ? "bg-muted ml-auto max-w-lg"
                    : "bg-transparent",
                )}
              >
                {/* File attachments */}
                {message.attachments && message.attachments.length > 0 && (
                  <div className="space-y-2">
                    {message.attachments.map((attachment) => (
                      <FileAttachmentDisplay
                        key={attachment.id}
                        attachment={attachment}
                        className="max-w-sm"
                      />
                    ))}
                  </div>
                )}

                {/* Message content */}
                {message.content && (
                  <div className="text-foreground">
                    {message.type === "assistant" ? (
                      <FadeInText
                        text={message.content}
                        delay={50}
                      />
                    ) : (
                      <p className="whitespace-pre-wrap leading-relaxed">
                        {message.content}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {message.type === "assistant" && (
                <div className="flex items-center gap-2 mt-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                  >
                    <ThumbsUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                  >
                    <ThumbsDown className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                  >
                    <Share className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            {message.type === "user" && (
              <Avatar className="w-8 h-8 mt-1">
                <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                  U
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        ))}

        {/* Thinking indicator */}
        {isThinking && (
          <div className="flex gap-4 justify-start">
            <Avatar className="w-8 h-8 mt-1">
              <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                AI
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 max-w-3xl mr-12">
              <div className="bg-transparent rounded-2xl px-6 py-4">
                <div className="flex items-center justify-start text-muted-foreground">
                  <div className="w-2 h-2 bg-current rounded-full transform-gpu"
                       style={{
                         animation: 'zoom-pulse 1.5s ease-in-out infinite',
                         transformOrigin: 'center'
                       }}>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error display */}
        {error && (
          <div className="flex gap-4 justify-start">
            <Avatar className="w-8 h-8 mt-1">
              <AvatarFallback className="bg-destructive text-destructive-foreground text-sm font-semibold">
                !
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 max-w-3xl mr-12">
              <div className="bg-destructive/10 border border-destructive/20 rounded-2xl px-6 py-4">
                <p className="text-destructive text-sm">Error: {error}</p>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );
};

export default ChatArea;
