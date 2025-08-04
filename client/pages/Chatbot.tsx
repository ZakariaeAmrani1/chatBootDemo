import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  Plus,
  Settings,
  Share2,
  Menu,
  X,
  Brain,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  const [selectedVersion, setSelectedVersion] = useState("ChatNova V3");

  // Version configurations with colors
  const versions = [
    {
      name: "V1",
      fullName: "ChatNova V1",
      color: "text-slate-600",
      bgColor: "bg-transparent",
      borderColor: "border-slate-300",
    },
    {
      name: "V2",
      fullName: "ChatNova V2",
      color: "text-blue-600",
      bgColor: "bg-transparent",
      borderColor: "border-blue-300",
    },
    {
      name: "V3",
      fullName: "ChatNova V3",
      color: "text-purple-600",
      bgColor: "bg-transparent",
      borderColor: "border-purple-300",
    },
    {
      name: "V4",
      fullName: "ChatNova V4",
      color: "text-orange-600",
      bgColor: "bg-transparent",
      borderColor: "border-orange-300",
    },
  ];

  const getCurrentVersion = () =>
    versions.find((v) => v.fullName === selectedVersion) || versions[2];

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

  // Function to apply all appearance settings
  const applyAllSettings = (settings: any) => {
    if (!settings) return;

    // Apply theme
    if (settings.theme) {
      setTheme(settings.theme as "light" | "dark" | "system");
    }

    // Apply font size with immediate DOM update
    if (settings.fontSize) {
      applyFontSize(settings.fontSize);
    }

    // Apply density with immediate DOM update
    if (settings.density) {
      applyDensity(settings.density);
    }

    // Apply selected model
    if (settings.selectedModel) {
      setSelectedModel(settings.selectedModel);
    }
  };

  // Apply user's appearance settings when user data loads or changes
  useEffect(() => {
    if (user?.settings) {
      applyAllSettings(user.settings);
    }
  }, [user, setTheme]);

  // Additional effect to force immediate application on user change
  useEffect(() => {
    if (user?.settings) {
      // Use requestAnimationFrame to ensure DOM is ready
      requestAnimationFrame(() => {
        applyAllSettings(user.settings);

        // Double-check with a small timeout for any race conditions
        setTimeout(() => {
          applyAllSettings(user.settings);
        }, 50);
      });
    }
  }, [user?.id]); // Trigger when user ID changes (i.e., different user logs in)

  // Listen for custom settings update events
  useEffect(() => {
    const handleSettingsUpdate = (event: CustomEvent) => {
      if (event.detail?.settings) {
        applyAllSettings(event.detail.settings);
      }
    };

    window.addEventListener(
      "userSettingsUpdated",
      handleSettingsUpdate as EventListener,
    );

    return () => {
      window.removeEventListener(
        "userSettingsUpdated",
        handleSettingsUpdate as EventListener,
      );
    };
  }, []);

  const createNewChat = async (message?: string) => {
    // Create chat with or without initial message
    await chatService.createChat({
      title: "New Chat",
      model: selectedModel,
      chatbootVersion: selectedVersion,
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
        // Create new chat first, then send the message with attachments
        const newChat = await chatService.createChat({
          title: "New Chat",
          model: selectedModel,
          chatbootVersion: selectedVersion,
        });

        if (newChat) {
          // Now send the message with attachments to the new chat
          await chatService.sendMessage({
            chatId: newChat.id,
            message: content,
            attachments: attachments,
          });
        }
      } else {
        // Send message to existing chat
        await chatService.sendMessage({
          chatId: chatState.currentChat.id,
          message: content,
          attachments: attachments,
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-xl border cursor-pointer transition-all duration-200 hover:scale-105",
                    getCurrentVersion().bgColor,
                    getCurrentVersion().borderColor,
                    "shadow-sm",
                  )}
                >
                  <span
                    className={cn(
                      "text-sm font-medium transition-colors",
                      getCurrentVersion().color,
                    )}
                  >
                    {getCurrentVersion().fullName}
                  </span>
                  <ChevronDown className="h-3 w-3 text-muted-foreground/70" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-40 p-1">
                {versions.map((version) => (
                  <DropdownMenuItem
                    key={version.fullName}
                    onClick={() => setSelectedVersion(version.fullName)}
                    className={cn(
                      "flex items-center justify-center px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 border",
                      "hover:bg-muted/30",
                      selectedVersion === version.fullName
                        ? `bg-transparent ${version.borderColor}`
                        : "border-transparent hover:border-muted",
                    )}
                  >
                    <span
                      className={cn(
                        "text-sm font-medium",
                        selectedVersion === version.fullName
                          ? version.color
                          : "text-foreground",
                      )}
                    >
                      {version.name}
                    </span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
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
            user={user}
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
          onUserUpdate={updateUser}
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
