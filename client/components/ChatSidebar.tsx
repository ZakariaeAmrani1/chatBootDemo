import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  MessageSquare,
  Plus,
  Settings,
  Trash2,
  Edit3,
  X,
  Archive,
  HelpCircle,
  Zap,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import ConfirmDialog from "@/components/ConfirmDialog";
import { apiService } from "@/services/api";

import { cn } from "@/lib/utils";
import type { Chat, User } from "@shared/types";

interface ChatSidebarProps {
  chats: Chat[];
  currentChatId: string;
  onChatSelect: (chatId: string) => void;
  onNewChat: () => void;
  onCloseSidebar: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onOpenSettings?: () => void;
  onDeleteChat?: (chatId: string) => void;
  onUpdateChat?: (chatId: string, updates: Partial<Chat>) => void;
  isLoading?: boolean;
  user?: User | null;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({
  chats,
  currentChatId,
  onChatSelect,
  onNewChat,
  onCloseSidebar,
  collapsed,
  onToggleCollapse,
  onOpenSettings,
  onDeleteChat,
  onUpdateChat,
  isLoading = false,
  user,
}) => {
  const navigate = useNavigate();
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [chatToDelete, setChatToDelete] = useState<string | null>(null);

  const handleDeleteClick = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setChatToDelete(chatId);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (chatToDelete && onDeleteChat) {
      onDeleteChat(chatToDelete);
    }
    // Clean up state
    setChatToDelete(null);
    setDeleteConfirmOpen(false);
  };

  const handleDeleteCancel = () => {
    setChatToDelete(null);
    setDeleteConfirmOpen(false);
  };

  const handleEditClick = (chat: Chat, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingChatId(chat.id);
    setEditTitle(chat.title);
  };

  const handleEditSave = async (chatId: string) => {
    if (editTitle.trim() && onUpdateChat) {
      await onUpdateChat(chatId, { title: editTitle.trim() });
    }
    setEditingChatId(null);
    setEditTitle("");
  };

  const handleEditCancel = () => {
    setEditingChatId(null);
    setEditTitle("");
  };

  const handleKeyDown = (e: React.KeyboardEvent, chatId: string) => {
    if (e.key === "Enter") {
      handleEditSave(chatId);
    } else if (e.key === "Escape") {
      handleEditCancel();
    }
  };

  // Ensure proper cleanup when modal closes
  useEffect(() => {
    if (!deleteConfirmOpen) {
      setChatToDelete(null);
    }
  }, [deleteConfirmOpen]);
  return (
    <TooltipProvider>
      <div className="h-full bg-background text-foreground flex flex-col border-r border-border shadow-sm">
        {/* Header */}
        <div
          className={cn(
            "border-b border-border bg-background/50 backdrop-blur-sm",
            collapsed ? "p-2" : "p-4",
          )}
        >
          <div
            className={cn(
              "flex items-center mb-4",
              collapsed ? "justify-center" : "justify-between",
            )}
          >
            {!collapsed && (
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-sm">
                  <MessageSquare className="h-3 w-3 text-white" />
                </div>
                <h2 className="text-lg font-semibold text-foreground tracking-tight">
                  ChatGPT
                </h2>
              </div>
            )}
            <div className="flex items-center gap-1">
              {!collapsed && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="lg:hidden text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  onClick={onCloseSidebar}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-foreground hover:bg-muted/50 hidden lg:flex"
                    onClick={onToggleCollapse}
                  >
                    {collapsed ? (
                      <ChevronRight className="h-4 w-4" />
                    ) : (
                      <ChevronLeft className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  {collapsed ? "Expand sidebar" : "Collapse sidebar"}
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => onNewChat()}
                  className="w-full bg-accent hover:bg-accent/80 text-accent-foreground border border-border h-10"
                  variant="outline"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">New chat</TooltipContent>
            </Tooltip>
          ) : (
            <Button
              onClick={() => onNewChat()}
              className="w-full bg-accent hover:bg-accent/80 text-accent-foreground border border-border"
              variant="outline"
            >
              <Plus className="h-4 w-4 mr-2" />
              New chat
            </Button>
          )}
        </div>

        {/* Chat History */}
        <ScrollArea className={cn("flex-1", collapsed ? "px-1" : "px-2")}>
          <div className="space-y-1 py-2">
            {chats.length === 0 && !collapsed && (
              <div className="px-3 py-6 text-center">
                <MessageSquare className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  No conversations yet
                </p>
                <p className="text-xs text-muted-foreground/70 mt-1">
                  Start a new chat to begin
                </p>
              </div>
            )}
            {chats.map((chat) =>
              collapsed ? (
                <Tooltip key={chat.id}>
                  <TooltipTrigger asChild>
                    <div
                      className={cn(
                        "flex items-center justify-center p-2 rounded-md cursor-pointer transition-colors",
                        "hover:bg-muted/50",
                        currentChatId === chat.id ? "bg-muted" : "",
                      )}
                      onClick={() => onChatSelect(chat.id)}
                    >
                      <MessageSquare
                        className={cn(
                          "h-4 w-4 transition-colors",
                          currentChatId === chat.id
                            ? "text-accent-foreground"
                            : "text-muted-foreground",
                        )}
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right">{chat.title}</TooltipContent>
                </Tooltip>
              ) : (
                <div
                  key={chat.id}
                  className={cn(
                    "group flex items-center px-3 py-2 rounded-md cursor-pointer transition-colors",
                    "hover:bg-muted/50",
                    currentChatId === chat.id ? "bg-muted" : "",
                    editingChatId === chat.id && "bg-muted",
                  )}
                  onClick={() =>
                    editingChatId !== chat.id && onChatSelect(chat.id)
                  }
                >
                  <MessageSquare className="h-4 w-4 mr-3 flex-shrink-0 text-muted-foreground" />

                  {editingChatId === chat.id ? (
                    <Input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, chat.id)}
                      onBlur={() => handleEditSave(chat.id)}
                      className="text-sm h-6 px-1 border-none shadow-none focus:ring-1 focus:ring-primary flex-1 min-w-0"
                      autoFocus
                    />
                  ) : (
                    <span
                      className="text-sm text-foreground flex-1 min-w-0 pr-2"
                      title={chat.title}
                    >
                      {chat.title.length > 25
                        ? `${chat.title.substring(0, 25)}...`
                        : chat.title}
                    </span>
                  )}

                  {editingChatId !== chat.id && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" side="right">
                        <DropdownMenuItem
                          onClick={(e) => handleEditClick(chat, e)}
                        >
                          <Edit3 className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => handleDeleteClick(chat.id, e)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              ),
            )}
          </div>
        </ScrollArea>

        {/* Bottom Section */}
        <div
          className={cn(
            "border-t border-border/50 bg-background/30 backdrop-blur-sm space-y-2",
            collapsed ? "p-2" : "p-4",
          )}
        >
          {collapsed ? (
            <>
              <div className="space-y-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 h-10"
                      onClick={() => navigate("/upgrade")}
                    >
                      <Zap className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">Upgrade plan</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 h-10"
                      onClick={() => navigate("/library")}
                    >
                      <Archive className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">Library</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 h-10"
                    >
                      <HelpCircle className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">Help & FAQ</TooltipContent>
                </Tooltip>
              </div>

              <Separator className="my-2 bg-border/50" />

              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex justify-center">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm cursor-pointer shadow-sm transition-all duration-200">
                      {user?.displayName?.charAt(0).toUpperCase() || "U"}
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <div className="text-left">
                    <p className="font-semibold">
                      {user?.displayName || "User"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {user?.email || "user@example.com"}
                    </p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </>
          ) : (
            <>
              <div className="space-y-1">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-muted/50"
                >
                  <Zap className="h-4 w-4 mr-3" />
                  Upgrade plan
                </Button>

                <Button
                  variant="ghost"
                  className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-muted/50"
                >
                  <Archive className="h-4 w-4 mr-3" />
                  Library
                </Button>

                <Button
                  variant="ghost"
                  className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-muted/50"
                >
                  <HelpCircle className="h-4 w-4 mr-3" />
                  Help & FAQ
                </Button>
              </div>

              <Separator className="my-2 bg-border/50" />

              <div className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted/50 cursor-pointer group">
                <div className="w-8 h-8 bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {user?.displayName?.charAt(0).toUpperCase() || "U"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {user?.displayName || "User"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user?.email || "user@example.com"}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground hover:bg-muted/50 opacity-0 group-hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenSettings?.();
                  }}
                >
                  <Settings className="h-3 w-3" />
                </Button>
              </div>
            </>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Delete Chat"
        description="Are you sure you want to delete this chat? This action cannot be undone and will permanently remove all messages in this conversation."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        destructive={true}
      />
    </TooltipProvider>
  );
};

export default ChatSidebar;
