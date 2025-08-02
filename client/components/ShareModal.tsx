import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Check, Share2, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Chat } from "@shared/types";

interface ShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chat: Chat | null;
  appUrl?: string;
}

const ShareModal: React.FC<ShareModalProps> = ({
  open,
  onOpenChange,
  chat,
  appUrl = "http://localhost:8080",
}) => {
  const [shareLink, setShareLink] = useState("");
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (chat) {
      // Generate share link
      const link = `${appUrl}/shared/${chat.id}`;
      setShareLink(link);
    }
  }, [chat, appUrl]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      toast({
        title: "Link copied!",
        description: "Share link has been copied to your clipboard.",
      });

      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Could not copy link to clipboard.",
        variant: "destructive",
      });
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Chat: ${chat?.title || "Shared Chat"}`,
          text: `Check out this conversation`,
          url: shareLink,
        });
      } catch (error) {
        // User cancelled or error occurred, fallback to copy
        await handleCopy();
      }
    } else {
      // Fallback to copy if Web Share API is not available
      await handleCopy();
    }
  };

  if (!chat) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share Chat
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Share this conversation with others. Anyone with the link can view
              this chat.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="chat-title">Chat Title</Label>
            <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
              <span className="text-sm font-medium truncate">{chat.title}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="share-link">Share Link</Label>
            <div className="flex items-center gap-2">
              <Input
                id="share-link"
                value={shareLink}
                readOnly
                className="flex-1"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="flex-shrink-0"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button onClick={handleShare} className="flex-1">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button
              variant="outline"
              onClick={() => window.open(shareLink, "_blank")}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Preview
            </Button>
          </div>

          <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-md">
            <strong>Note:</strong> Shared chats are read-only. Recipients can
            view the conversation but cannot add messages or modify it.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareModal;
