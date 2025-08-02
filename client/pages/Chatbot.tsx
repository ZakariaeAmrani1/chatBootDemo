import React, { useState, useEffect } from "react";
import { MessageSquare, Plus, Settings, Share2, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import ChatSidebar from "@/components/ChatSidebar";
import ChatArea from "@/components/ChatArea";
import ChatInput from "@/components/ChatInput";
import { ThemeToggle } from "@/components/ThemeToggle";
import SettingsPage from "@/pages/Settings";
import { chatService, ChatState } from "@/services/chatService";
import { apiService } from "@/services/api";
import { Chat, Message, FileAttachment } from "@shared/types";

const Chatbot = () => {
  const [chatState, setChatState] = useState<ChatState>({
    chats: [],
    currentChat: null,
    messages: [],
    isLoading: false,
    isThinking: false,
    error: null,
  });
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedModel, setSelectedModel] = useState("gpt-4");
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Subscribe to chat service state changes
  useEffect(() => {
    const unsubscribe = chatService.subscribe(setChatState);

    // Load initial chats
    chatService.loadChats();

    return unsubscribe;
  }, []);

  const createNewChat = async (message?: string) => {
    if (message) {
      // Create chat with initial message
      await chatService.createChat({
        title: "New Chat",
        model: selectedModel,
        message: message
      });
    } else {
      // Just create empty chat (will be done on first message)
      // For now, do nothing - chat will be created when user sends first message
    }
  };

  const addMessage = async (content: string, attachments?: FileAttachment[]) => {
    if (!content.trim() && (!attachments || attachments.length === 0)) return;

    try {
      if (!chatState.currentChat) {
        // Create new chat with this message
        await chatService.createChat({
          title: "New Chat",
          model: selectedModel,
          message: content
        });
      } else {
        // Send message to existing chat
        await chatService.sendMessage({
          chatId: chatState.currentChat.id,
          message: content
        });
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleChatSelect = async (chatId: string) => {
    const chat = chatState.chats.find(c => c.id === chatId);
    if (chat) {
      await chatService.selectChat(chat);
    }
  };

  const handleDeleteChat = async (chatId: string) => {
    await chatService.deleteChat(chatId);
  };

  const handleRefresh = () => {
    // Reload chats after clearing history
    chatService.loadChats();
  };

  return (
    <div className="flex h-screen bg-background transition-colors duration-300">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed lg:relative lg:translate-x-0 transition-all duration-300 ease-in-out z-50 h-full",
          sidebarCollapsed ? "w-16" : "w-80",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <ChatSidebar
          chats={chatState.chats}
          currentChatId={chatState.currentChat?.id || ''}
          onChatSelect={handleChatSelect}
          onNewChat={createNewChat}
          onCloseSidebar={() => setSidebarOpen(false)}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          onOpenSettings={() => setSettingsOpen(true)}
          onDeleteChat={handleDeleteChat}
          isLoading={chatState.isLoading}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 h-screen">
        {/* Header - Fixed */}
        <header className="flex items-center justify-between p-4 border-b border-border bg-background sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-4 w-4" />
            </Button>
            <h1 className="text-lg font-semibold text-foreground">ChatGPT</h1>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="hidden sm:flex">
              <Share2 className="h-4 w-4" />
              <span className="ml-1 hidden md:inline">Share</span>
            </Button>
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSettingsOpen(true)}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </header>

        {/* Chat area - Scrollable */}
        <div className="flex-1 overflow-hidden">
          <ChatArea
            messages={chatState.messages}
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
            isThinking={chatState.isThinking}
            isLoading={chatState.isLoading}
            error={chatState.error}
          />
        </div>

        {/* Chat Input - Fixed at bottom */}
        <div className="sticky bottom-0 z-10">
          <ChatInput
            onSendMessage={addMessage}
            disabled={chatState.isLoading || chatState.isThinking}
          />
        </div>
      </div>

      {/* Settings Modal */}
      {settingsOpen && (
        <SettingsPage onClose={() => setSettingsOpen(false)} isModal={true} />
      )}
    </div>
  );
};

export default Chatbot;
