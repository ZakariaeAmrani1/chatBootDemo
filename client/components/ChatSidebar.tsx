import React from 'react';
import { MessageSquare, Plus, Settings, Trash2, Edit3, X, Archive, HelpCircle, Zap, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ThemeSelector } from '@/components/ThemeSelector';
import { cn } from '@/lib/utils';
import type { Chat } from '@/pages/Chatbot';

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
  onToggleCollapse
}) => {
  return (
    <TooltipProvider>
      <div className="h-full bg-background text-foreground flex flex-col border-r border-border">
        {/* Header */}
        <div className={cn("border-b border-sidebar-border", collapsed ? "p-2" : "p-4")}>
          <div className={cn("flex items-center mb-4", collapsed ? "justify-center" : "justify-between")}>
            {!collapsed && <h2 className="text-lg font-semibold text-sidebar-foreground">ChatGPT</h2>}
            <div className="flex items-center gap-1">
              {!collapsed && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="lg:hidden text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
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
                    className="text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent hidden lg:flex"
                    onClick={onToggleCollapse}
                  >
                    {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  {collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
          
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={onNewChat}
                  className="w-full bg-sidebar-accent hover:bg-sidebar-accent/80 text-sidebar-foreground border border-sidebar-border h-10 px-2"
                  variant="outline"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                New chat
              </TooltipContent>
            </Tooltip>
          ) : (
            <Button
              onClick={onNewChat}
              className="w-full bg-sidebar-accent hover:bg-sidebar-accent/80 text-sidebar-foreground border border-sidebar-border"
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
            {chats.map((chat) => (
              collapsed ? (
                <Tooltip key={chat.id}>
                  <TooltipTrigger asChild>
                    <div
                      className={cn(
                        "flex items-center justify-center p-2 rounded-lg cursor-pointer transition-colors",
                        "hover:bg-sidebar-accent",
                        currentChatId === chat.id ? "bg-sidebar-accent" : ""
                      )}
                      onClick={() => onChatSelect(chat.id)}
                    >
                      <MessageSquare className="h-4 w-4 text-sidebar-foreground/60" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    {chat.title}
                  </TooltipContent>
                </Tooltip>
              ) : (
                <div
                  key={chat.id}
                  className={cn(
                    "group relative flex items-center px-3 py-2 rounded-lg cursor-pointer transition-colors",
                    "hover:bg-sidebar-accent",
                    currentChatId === chat.id ? "bg-sidebar-accent" : ""
                  )}
                  onClick={() => onChatSelect(chat.id)}
                >
                  <MessageSquare className="h-4 w-4 mr-3 text-sidebar-foreground/60 flex-shrink-0" />
                  <span className="text-sm truncate flex-1 text-sidebar-foreground">
                    {chat.title}
                  </span>
                  
                  {/* Action buttons (visible on hover) */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                    >
                      <Edit3 className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-sidebar-foreground/60 hover:text-destructive hover:bg-sidebar-accent"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )
            ))}
          </div>
        </ScrollArea>

        {/* Bottom Section */}
        <div className={cn("border-t border-sidebar-border space-y-2", collapsed ? "p-2" : "p-4")}>
          {collapsed ? (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-center text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent h-10 px-2"
                  >
                    <Zap className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  Upgrade plan
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-center text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent h-10 px-2"
                  >
                    <Archive className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  Library
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-center text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent h-10 px-2"
                  >
                    <HelpCircle className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  Help & FAQ
                </TooltipContent>
              </Tooltip>
              
              <ThemeSelector collapsed={collapsed} />
              
              <Separator className="my-2 bg-sidebar-border" />
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex justify-center">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm cursor-pointer">
                      U
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <div>
                    <p className="font-medium">User</p>
                    <p className="text-xs text-gray-400">user@example.com</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
              >
                <Zap className="h-4 w-4 mr-3" />
                Upgrade plan
              </Button>
              
              <Button
                variant="ghost"
                className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
              >
                <Archive className="h-4 w-4 mr-3" />
                Library
              </Button>
              
              <Button
                variant="ghost"
                className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
              >
                <HelpCircle className="h-4 w-4 mr-3" />
                Help & FAQ
              </Button>
              
              <ThemeSelector collapsed={collapsed} />
              
              <Separator className="my-2 bg-sidebar-border" />
              
              <div className="flex items-center gap-3 px-3 py-2">
                <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  U
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-sidebar-foreground truncate">User</p>
                  <p className="text-xs text-sidebar-foreground/60 truncate">user@example.com</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
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
