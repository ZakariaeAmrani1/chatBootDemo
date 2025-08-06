import React, { useEffect, useRef, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Copy,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  Share,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/services/api";
import FileAttachmentDisplay from "@/components/FileAttachment";
import { PDFUpload } from "@/components/PDFUpload";
import { CSVUpload } from "@/components/CSVUpload";
import FadeInText from "@/components/FadeInText";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import { useTheme } from "@/components/ThemeProvider";
import { getAppLogo } from "@/lib/app-config";
import type { Message, User } from "@shared/types";

interface ChatAreaProps {
  messages: Message[];
  selectedModel: string;
  onModelChange: (modelId: string) => void;
  isThinking?: boolean;
  isLoading?: boolean;
  error?: string | null;
  onRegenerateMessage?: (messageId: string) => void;
  onMessageUpdate?: (messageId: string, updates: Partial<Message>) => void;
  onStartChat?: (model: string, pdfFile: File) => void;
  user?: User | null;
  hasActiveChat?: boolean;
  currentChatHasPdf?: boolean;
  currentChatHasCsv?: boolean;
}

const ChatArea: React.FC<ChatAreaProps> = ({
  messages,
  selectedModel,
  onModelChange,
  isThinking = false,
  isLoading = false,
  error = null,
  onRegenerateMessage,
  onMessageUpdate,
  onStartChat,
  user,
  hasActiveChat = false,
  currentChatHasPdf = false,
  currentChatHasCsv = false,
}) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { resolvedTheme } = useTheme();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Get the appropriate AI avatar image
  const getAILogo = () => {
    return "https://cdn.builder.io/api/v1/image/assets%2F44a5eb94f41543f4ab63e8551bda8b34%2F30d698035d524e09b05a68e5b29f2b1d?format=webp&width=800";
  };

  // Copy message content to clipboard
  const handleCopy = async (content: string) => {
    // Fallback function using older method
    const fallbackCopy = () => {
      const textArea = document.createElement("textarea");
      textArea.value = content;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      try {
        const successful = document.execCommand("copy");
        document.body.removeChild(textArea);
        return successful;
      } catch (err) {
        document.body.removeChild(textArea);
        throw err;
      }
    };

    try {
      // Try modern clipboard API first, but always fall back if it fails
      if (navigator.clipboard && navigator.clipboard.writeText) {
        try {
          await navigator.clipboard.writeText(content);
        } catch (clipboardError) {
          // If clipboard API fails (permissions, etc.), use fallback
          console.log(
            "Clipboard API failed, using fallback:",
            clipboardError.message,
          );
          const success = fallbackCopy();
          if (!success) {
            throw new Error("Fallback copy method failed");
          }
        }
      } else {
        // No modern clipboard API available, use fallback
        const success = fallbackCopy();
        if (!success) {
          throw new Error("Copy command not supported");
        }
      }

      toast({
        title: "Copied to clipboard",
        description: "Message content has been copied.",
      });
    } catch (error) {
      console.error("Copy failed:", error);
      toast({
        title: "Failed to copy",
        description:
          "Could not copy message to clipboard. Please select and copy manually.",
        variant: "destructive",
      });
    }
  };

  // Handle thumbs up
  const handleLike = async (messageId: string) => {
    const message = messages.find((m) => m.id === messageId);
    if (!message) return;

    const action = message.liked ? "removelike" : "like";

    try {
      const response = await apiService.sendMessageFeedback({
        messageId,
        action,
      });

      if (response.success) {
        // Update local state immediately for better UX
        if (onMessageUpdate) {
          const updates =
            action === "like"
              ? { liked: true, disliked: false }
              : { liked: false };
          onMessageUpdate(messageId, updates);
        }
      } else {
        throw new Error(response.error || "Failed to update feedback");
      }
    } catch (error) {
      toast({
        title: "Failed to update feedback",
        description: "Could not save your feedback. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle thumbs down
  const handleDislike = async (messageId: string) => {
    const message = messages.find((m) => m.id === messageId);
    if (!message) return;

    const action = message.disliked ? "removedislike" : "dislike";

    try {
      const response = await apiService.sendMessageFeedback({
        messageId,
        action,
      });

      if (response.success) {
        // Update local state immediately for better UX
        if (onMessageUpdate) {
          const updates =
            action === "dislike"
              ? { disliked: true, liked: false }
              : { disliked: false };
          onMessageUpdate(messageId, updates);
        }
      } else {
        throw new Error(response.error || "Failed to update feedback");
      }
    } catch (error) {
      toast({
        title: "Failed to update feedback",
        description: "Could not save your feedback. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle regenerate message
  const handleRegenerate = (messageId: string) => {
    if (onRegenerateMessage) {
      onRegenerateMessage(messageId);
    } else {
      toast({
        title: "Regeneration not available",
        description: "Message regeneration is not implemented yet.",
        variant: "destructive",
      });
    }
  };

  // Handle share message
  const handleShare = async (content: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "AI Message",
          text: content,
        });
      } catch (error) {
        // User cancelled or error occurred, fallback to clipboard
        await handleCopy(content);
      }
    } else {
      // Fallback to clipboard if Web Share API is not available
      await handleCopy(content);
    }
  };
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Show initial page when: no active chat OR active chat with no messages and no files
  if (
    !hasActiveChat ||
    (hasActiveChat &&
      messages.length === 0 &&
      !currentChatHasPdf &&
      !currentChatHasCsv)
  ) {
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
            {selectedModel === "cloud"
              ? "Upload any file to start your analysis"
              : selectedModel === "local-cloud"
                ? "Upload a PDF document to analyze with AI"
                : selectedModel === "csv-local"
                  ? "Upload a CSV dataset to analyze with AI"
                  : "Upload a file to start your analysis"}
          </p>

          {/* Direct File Upload based on Selected Model */}
          <div className="w-full max-w-4xl space-y-8">
            {/* File Upload Component */}
            {selectedModel === "csv-local" ? (
              <CSVUpload
                onFileSelect={setSelectedFile}
                selectedFile={selectedFile}
              />
            ) : selectedModel === "local-cloud" ? (
              <PDFUpload
                onFileSelect={setSelectedFile}
                selectedFile={selectedFile}
              />
            ) : (
              /* Cloud model - accept any file type with enhanced UI */
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Upload File</label>
                  <span className="text-xs text-muted-foreground">
                    Any file type supported
                  </span>
                </div>

                {selectedFile ? (
                  <div className="border border-border rounded-lg p-4 bg-muted/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-950/30 rounded-lg flex items-center justify-center">
                          <svg
                            className="w-5 h-5 text-blue-600 dark:text-blue-400"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            {selectedFile.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-green-100 dark:bg-green-950/30 rounded-full flex items-center justify-center">
                          <svg
                            className="w-4 h-4 text-green-600 dark:text-green-400"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M9,20.42L2.79,14.21L5.62,11.38L9,14.77L18.88,4.88L21.71,7.71L9,20.42Z" />
                          </svg>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                          onClick={() => setSelectedFile(null)}
                        >
                          <svg
                            className="h-4 w-4"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
                          </svg>
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer transition-all duration-200 hover:border-muted-foreground/40 hover:bg-muted/20"
                    onClick={() =>
                      document.getElementById("cloudFileInput")?.click()
                    }
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.add(
                        "border-primary",
                        "bg-primary/5",
                      );
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.remove(
                        "border-primary",
                        "bg-primary/5",
                      );
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.remove(
                        "border-primary",
                        "bg-primary/5",
                      );
                      const file = e.dataTransfer.files[0];
                      if (file) {
                        setSelectedFile(file);
                      }
                    }}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                        <svg
                          className="w-6 h-6 text-muted-foreground"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-sm">Upload Any File</p>
                        <p className="text-xs text-muted-foreground">
                          Drag and drop or click to browse
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        All file types supported • Max 10MB
                      </p>
                    </div>
                  </div>
                )}

                <input
                  id="cloudFileInput"
                  type="file"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    setSelectedFile(file || null);
                  }}
                  className="hidden"
                  accept="*/*"
                />
              </div>
            )}

            {/* Start Chat Button */}
            {selectedFile && (
              <div className="animate-in fade-in duration-300 flex justify-center">
                <Button
                  onClick={() => {
                    if (selectedModel && selectedFile && onStartChat) {
                      onStartChat(selectedModel, selectedFile);
                    }
                  }}
                  size="lg"
                  className="gap-2 px-8"
                >
                  <MessageSquare className="w-5 h-5" />
                  Start Chatting
                </Button>
              </div>
            )}

            {/* Instructions */}
            <div className="text-center text-sm text-muted-foreground space-y-1">
              <p>
                {!selectedFile
                  ? `Upload a ${selectedModel === "csv-local" ? "CSV" : selectedModel === "local-cloud" ? "PDF" : "file"} to analyze`
                  : "Ready to start your conversation!"}
              </p>
              {!selectedFile && (
                <p className="text-xs">
                  {selectedModel === "csv-local"
                    ? "The AI will analyze your CSV data to provide insights and answer questions"
                    : selectedModel === "local-cloud"
                      ? "The AI will use your PDF to provide contextual answers and insights"
                      : "The AI will analyze your file content to provide insights and answer questions"}
                </p>
              )}
            </div>
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
                <AvatarImage
                  src={getAILogo()}
                  alt="AI"
                  className="rounded-full"
                />
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
                  <div className="space-y-2 mb-3">
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
                      <MarkdownRenderer
                        content={message.content}
                        typewriter={false}
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
                    onClick={() => handleCopy(message.content)}
                    title="Copy message"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "h-8 w-8 p-0 text-muted-foreground hover:text-foreground",
                      message.liked && "text-green-600 hover:text-green-700",
                    )}
                    onClick={() => handleLike(message.id)}
                    title="Like message"
                  >
                    <ThumbsUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "h-8 w-8 p-0 text-muted-foreground hover:text-foreground",
                      message.disliked && "text-red-600 hover:text-red-700",
                    )}
                    onClick={() => handleDislike(message.id)}
                    title="Dislike message"
                  >
                    <ThumbsDown className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                    onClick={() => handleRegenerate(message.id)}
                    title="Regenerate response"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                    onClick={() => handleShare(message.content)}
                    title="Share message"
                  >
                    <Share className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            {message.type === "user" && (
              <Avatar className="w-8 h-8 mt-1">
                {user?.avatar ? (
                  <AvatarImage
                    src={user.avatar}
                    alt="User"
                    className="rounded-full"
                  />
                ) : null}
                <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                  {user?.displayName?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        ))}

        {/* Thinking indicator */}
        {isThinking && (
          <div className="flex gap-4 justify-start">
            <Avatar className="w-8 h-8 mt-1">
              <AvatarImage
                src={getAILogo()}
                alt="AI"
                className="rounded-full"
              />
              <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                AI
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 max-w-3xl mr-12">
              <div className="bg-transparent rounded-2xl px-6 py-4">
                <div className="flex items-center justify-start text-muted-foreground">
                  <div
                    className="w-2 h-2 bg-current rounded-full transform-gpu"
                    style={{
                      animation: "zoom-pulse 1.5s ease-in-out infinite",
                      transformOrigin: "center",
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error display */}
        {error && (
          <div className="flex gap-4 justify-start">
            <Avatar className="w-8 h-8 mt-1">
              <AvatarImage
                src={getAILogo()}
                alt="AI"
                className="rounded-full"
              />
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
