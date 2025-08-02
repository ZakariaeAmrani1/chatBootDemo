import React, { useState, useEffect } from "react";
import { MessageSquare, Plus, Settings, Share2, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import ChatSidebar from "@/components/ChatSidebar";
import ChatArea from "@/components/ChatArea";
import ChatInput from "@/components/ChatInput";
import ShareModal from "@/components/ShareModal";

import SettingsPage from "@/pages/Settings";
import { chatService, ChatState } from "@/services/chatService";
import { apiService } from "@/services/api";
import { Chat, Message, FileAttachment, User } from "@shared/types";
import { useTheme } from "@/components/ThemeProvider";
import { useAuth } from "@/contexts/AuthContext";

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
  const [shareModalOpen, setShareModalOpen] = useState(false);

  // Authentication and theme context
  const { user, updateUser } = useAuth();
  const { setTheme } = useTheme();

  // Subscribe to chat service state changes
  useEffect(() => {
    const unsubscribe = chatService.subscribe(setChatState);

    // Load initial chats
    chatService.loadChats();

    return unsubscribe;
  }, []);

  // User data is now provided by AuthContext

  // Helper functions to apply appearance settings
  const applyFontSize = (fontSize: string) => {
    const root = document.documentElement;
    root.classList.remove(
      "font-small",
      "font-medium",
      "font-large",
      "font-extra-large",
    );
    root.classList.add(`font-${fontSize}`);
  };

  const applyDensity = (density: string) => {
    const root = document.documentElement;
    root.classList.remove(
      "density-compact",
      "density-comfortable",
      "density-spacious",
    );
    root.classList.add(`density-${density}`);
  };

  // Apply user's appearance settings when user data loads
  useEffect(() => {
    if (user?.settings) {
      // Apply theme
      if (user.settings.theme) {
        setTheme(user.settings.theme as "light" | "dark" | "system");
      }

      // Apply font size
      if (user.settings.fontSize) {
        applyFontSize(user.settings.fontSize);
      }

      // Apply density
      if (user.settings.density) {
        applyDensity(user.settings.density);
      }

      // Apply selected model
      if (user.settings.selectedModel) {
        setSelectedModel(user.settings.selectedModel);
      }
    }
  }, [user, setTheme]);

  const createNewChat = async (message?: string) => {
    // Create chat with or without initial message
    await chatService.createChat({
      title: "New Chat",
      model: selectedModel,
      message: message, // This can be undefined for empty chats
    });
  };

  const addMessage = async (
    content: string,
    attachments?: FileAttachment[],
  ) => {
    if (!content.trim() && (!attachments || attachments.length === 0)) return;

    try {
      if (!chatState.currentChat) {
        // Create new chat with this message
        await chatService.createChat({
          title: "New Chat",
          model: selectedModel,
          message: content,
        });
      } else {
        // Send message to existing chat
        await chatService.sendMessage({
          chatId: chatState.currentChat.id,
          message: content,
        });
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleChatSelect = async (chatId: string) => {
    const chat = chatState.chats.find((c) => c.id === chatId);
    if (chat) {
      await chatService.selectChat(chat);
    }
  };

  const handleDeleteChat = async (chatId: string) => {
    await chatService.deleteChat(chatId);
  };

  const handleUpdateChat = async (chatId: string, updates: Partial<Chat>) => {
    try {
      const response = await apiService.updateChat(chatId, updates);
      if (response.success) {
        // Refresh chats to show updated title
        chatService.loadChats();
      }
    } catch (error) {
      console.error("Failed to update chat:", error);
    }
  };

  const handleRefresh = () => {
    // Reload chats after clearing history
    chatService.loadChats();
  };

  const handleUserRefresh = async () => {
    // Reload user data after profile updates
    try {
      const response = await apiService.getCurrentUser();
      if (response.success && response.data) {
        updateUser(response.data);
      }
    } catch (error) {
      console.error("Failed to reload user data:", error);
    }

    // Also refresh chats if needed
    handleRefresh();
  };

  const handleModelChange = async (modelId: string) => {
    setSelectedModel(modelId);

    // Save model selection to user settings
    try {
      const userId = user?.id || "user-1";
      await apiService.updateUserSettings(userId, { selectedModel: modelId });
    } catch (error) {
      console.error("Failed to save model preference:", error);
    }
  };

  const handleMessageUpdate = (
    messageId: string,
    updates: Partial<Message>,
  ) => {
    // Update the message in the chatService state
    chatService.updateMessage(messageId, updates);
  };

  const handleShareClick = () => {
    if (chatState.currentChat) {
      setShareModalOpen(true);
    }
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
          currentChatId={chatState.currentChat?.id || ""}
          onChatSelect={handleChatSelect}
          onNewChat={createNewChat}
          onCloseSidebar={() => setSidebarOpen(false)}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          onOpenSettings={() => setSettingsOpen(true)}
          onDeleteChat={handleDeleteChat}
          onUpdateChat={handleUpdateChat}
          isLoading={chatState.isLoading}
          user={user}
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
            <Button
              variant="ghost"
              size="sm"
              className="hidden sm:flex"
              onClick={handleShareClick}
              disabled={!chatState.currentChat}
            >
              <Share2 className="h-4 w-4" />
              <span className="ml-1 hidden md:inline">Share</span>
            </Button>

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
            onModelChange={handleModelChange}
            isThinking={chatState.isThinking}
            isLoading={chatState.isLoading}
            error={chatState.error}
            onMessageUpdate={handleMessageUpdate}
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
        <SettingsPage
          onClose={() => setSettingsOpen(false)}
          isModal={true}
          onRefresh={handleUserRefresh}
          onUserUpdate={setUser}
        />
      )}

      {/* Share Modal */}
      <ShareModal
        open={shareModalOpen}
        onOpenChange={setShareModalOpen}
        chat={chatState.currentChat}
        appUrl={user?.settings?.appUrl || "http://localhost:8080"}
      />
    </div>
  );
};

export default Chatbot;
