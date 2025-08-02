import React from 'react';
import { MessageSquare, Plus, Settings, Trash2, Edit3, X, Archive, HelpCircle, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import type { Chat } from '@/pages/Chatbot';

interface ChatSidebarProps {
  chats: Chat[];
  currentChatId: string;
  onChatSelect: (chatId: string) => void;
  onNewChat: () => void;
  onCloseSidebar: () => void;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({
  chats,
  currentChatId,
  onChatSelect,
  onNewChat,
  onCloseSidebar
}) => {
  return (
    <div className="h-full bg-gray-900 text-gray-100 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">ChatGPT</h2>
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden text-gray-400 hover:text-gray-100 hover:bg-gray-800"
            onClick={onCloseSidebar}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <Button
          onClick={onNewChat}
          className="w-full bg-gray-800 hover:bg-gray-700 text-gray-100 border border-gray-600"
          variant="outline"
        >
          <Plus className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">New chat</span>
          <span className="sm:hidden">New</span>
        </Button>
      </div>

      {/* Chat History */}
      <ScrollArea className="flex-1 px-2">
        <div className="space-y-1 py-2">
          {chats.map((chat) => (
            <div
              key={chat.id}
              className={cn(
                "group relative flex items-center px-3 py-2 rounded-lg cursor-pointer transition-colors",
                "hover:bg-gray-800",
                currentChatId === chat.id ? "bg-gray-800" : ""
              )}
              onClick={() => onChatSelect(chat.id)}
            >
              <MessageSquare className="h-4 w-4 mr-3 text-gray-400 flex-shrink-0" />
              <span className="text-sm truncate flex-1 text-gray-200">
                {chat.title}
              </span>
              
              {/* Action buttons (visible on hover) */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-gray-400 hover:text-gray-100 hover:bg-gray-700"
                >
                  <Edit3 className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-gray-400 hover:text-red-400 hover:bg-gray-700"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Bottom Section */}
      <div className="p-4 border-t border-gray-700 space-y-2">
        <Button
          variant="ghost"
          className="w-full justify-start text-gray-300 hover:text-gray-100 hover:bg-gray-800"
        >
          <Zap className="h-4 w-4 mr-3" />
          Upgrade plan
        </Button>
        
        <Button
          variant="ghost"
          className="w-full justify-start text-gray-300 hover:text-gray-100 hover:bg-gray-800"
        >
          <Archive className="h-4 w-4 mr-3" />
          Library
        </Button>
        
        <Button
          variant="ghost"
          className="w-full justify-start text-gray-300 hover:text-gray-100 hover:bg-gray-800"
        >
          <HelpCircle className="h-4 w-4 mr-3" />
          Help & FAQ
        </Button>
        
        <Separator className="my-2 bg-gray-700" />
        
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
            U
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-200 truncate">User</p>
            <p className="text-xs text-gray-400 truncate">user@example.com</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-gray-400 hover:text-gray-100 hover:bg-gray-700"
          >
            <Settings className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatSidebar;
