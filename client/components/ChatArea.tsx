import React, { useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Copy, ThumbsUp, ThumbsDown, RotateCcw, Share } from "lucide-react";
import { cn } from "@/lib/utils";
import FileAttachmentDisplay from "@/components/FileAttachment";
import { ModelSelectorCards } from "@/components/ModelSelectorCards";
import type { Message } from "@/pages/Chatbot";

interface ChatAreaProps {
  messages: Message[];
  selectedModel: string;
  onModelChange: (modelId: string) => void;
}

const ChatArea: React.FC<ChatAreaProps> = ({ messages, selectedModel, onModelChange }) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
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
        <div className="w-full max-w-4xl">
          <ModelSelectorCards
            selectedModel={selectedModel}
            onModelChange={onModelChange}
          />
        </div>
      </div>
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
              message.sender === "user" ? "justify-end" : "justify-start",
            )}
          >
            {message.sender === "assistant" && (
              <Avatar className="w-8 h-8 mt-1">
                <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                  AI
                </AvatarFallback>
              </Avatar>
            )}

            <div
              className={cn(
                "flex-1 max-w-3xl",
                message.sender === "user" ? "ml-12" : "mr-12",
              )}
            >
              <div
                className={cn(
                  "rounded-2xl px-6 py-4 space-y-3",
                  message.sender === "user"
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
                  <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                    {message.content}
                  </p>
                )}
              </div>

              {message.sender === "assistant" && (
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

            {message.sender === "user" && (
              <Avatar className="w-8 h-8 mt-1">
                <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                  U
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );
};

export default ChatArea;
