import React from "react";
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
import { ThemeSelector } from "@/components/ThemeSelector";
import { cn } from "@/lib/utils";
import type { Chat } from "@/pages/Chatbot";

interface ChatSidebarProps {
  chats: Chat[];
  currentChatId: string;
  onChatSelect: (chatId: string) => void;
  onNewChat: () => void;
  onCloseSidebar: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({
  chats,
  currentChatId,
  onChatSelect,
  onNewChat,
  onCloseSidebar,
  collapsed,
  onToggleCollapse,
}) => {
  return (
    <TooltipProvider>
      <div className="h-full bg-background text-foreground flex flex-col border-r border-border shadow-sm">
        {/* Header */}
        <div
          className={cn(
            "border-b border-border bg-background/50 backdrop-blur-sm",
            collapsed ? "p-2" : "p-4"
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
                <h2 className="text-lg font-semibold text-foreground tracking-tight">ChatGPT</h2>
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
                  onClick={onNewChat}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-10"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">New chat</TooltipContent>
            </Tooltip>
          ) : (
            <Button
              onClick={onNewChat}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
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
                <p className="text-sm text-muted-foreground">No conversations yet</p>
                <p className="text-xs text-muted-foreground/70 mt-1">Start a new chat to begin</p>
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
                currentChatId === chat.id
                  ? "bg-muted"
                  : "",
              )}
                      onClick={() => onChatSelect(chat.id)}
                    >
                      <MessageSquare className={cn(
                        "h-4 w-4 transition-colors",
                        currentChatId === chat.id ? "text-accent-foreground" : "text-muted-foreground"
                      )} />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right">{chat.title}</TooltipContent>
                </Tooltip>
              ) : (
                <div
                  key={chat.id}
                  className={cn(
                    "group relative flex items-center px-3 py-2 rounded-md cursor-pointer transition-colors",
                    "hover:bg-muted/50",
                    currentChatId === chat.id
                      ? "bg-muted"
                      : "",
                  )}
                  onClick={() => onChatSelect(chat.id)}
                >
                  <MessageSquare className="h-4 w-4 mr-3 flex-shrink-0 text-muted-foreground" />
                  <span className="text-sm truncate flex-1 text-foreground">
                    {chat.title}
                  </span>

                  {/* Action buttons (visible on hover) */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    >
                      <Edit3 className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive hover:bg-muted/50"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
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

                <ThemeSelector collapsed={collapsed} />
              </div>

              <Separator className="my-2 bg-border/50" />

              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex justify-center">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm cursor-pointer shadow-sm transition-all duration-200">
                      U
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <div className="text-left">
                    <p className="font-semibold">User</p>
                    <p className="text-xs text-muted-foreground">user@example.com</p>
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

                <ThemeSelector collapsed={collapsed} />
              </div>

              <Separator className="my-2 bg-border/50" />

              <div className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted/50 cursor-pointer group">
                <div className="w-8 h-8 bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  U
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    User
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    user@example.com
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground hover:bg-muted/50 opacity-0 group-hover:opacity-100"
                >
                  <Settings className="h-3 w-3" />
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
};

export default ChatSidebar;
