import React, { useState } from "react";
import { MessageSquare, Plus, Settings, Share2, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import ChatSidebar from "@/components/ChatSidebar";
import ChatArea from "@/components/ChatArea";
import ChatInput from "@/components/ChatInput";
import { ThemeToggle } from "@/components/ThemeToggle";
import SettingsPage from "@/pages/Settings";

export interface FileAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url?: string;
  data?: string;
}

export interface Message {
  id: string;
  content: string;
  sender: "user" | "assistant";
  timestamp: Date;
  attachments?: FileAttachment[];
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
}

const Chatbot = () => {
  const [chats, setChats] = useState<Chat[]>([
    {
      id: "1",
      title: "New chat",
      messages: [],
      createdAt: new Date(),
    },
  ]);
  const [currentChatId, setCurrentChatId] = useState<string>("1");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedModel, setSelectedModel] = useState("gpt-4");
  const [settingsOpen, setSettingsOpen] = useState(false);

  const currentChat = chats.find((chat) => chat.id === currentChatId);

  const createNewChat = () => {
    const newChat: Chat = {
      id: Date.now().toString(),
      title: "New chat",
      messages: [],
      createdAt: new Date(),
    };
    setChats((prev) => [newChat, ...prev]);
    setCurrentChatId(newChat.id);
  };

  const addMessage = (content: string, attachments?: FileAttachment[]) => {
    if (!currentChat) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      sender: "user",
      timestamp: new Date(),
      attachments,
    };

    // Generate title from content or first attachment name
    const generateTitle = () => {
      if (content.trim()) {
        return content.slice(0, 30) + (content.length > 30 ? "..." : "");
      }
      if (attachments && attachments.length > 0) {
        return `📎 ${attachments[0].name}`;
      }
      return "New chat";
    };

    // Update chat title if it's the first message
    const updatedChat = {
      ...currentChat,
      title:
        currentChat.messages.length === 0 ? generateTitle() : currentChat.title,
      messages: [...currentChat.messages, userMessage],
    };

    setChats((prev) =>
      prev.map((chat) => (chat.id === currentChatId ? updatedChat : chat)),
    );

    // Simulate assistant response
    setTimeout(() => {
      let assistantContent =
        "I'm a demo assistant response. In a real implementation, this would connect to your AI model.";

      if (attachments && attachments.length > 0) {
        const fileTypes = attachments.map((a) => {
          if (a.type.startsWith("image/")) return "image";
          if (a.type === "application/pdf") return "PDF";
          return "file";
        });
        assistantContent = `I can see you've shared ${attachments.length} ${fileTypes.join(", ")}(s). In a real implementation, I would analyze these files and provide relevant insights.`;
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: assistantContent,
        sender: "assistant",
        timestamp: new Date(),
      };

      setChats((prev) =>
        prev.map((chat) =>
          chat.id === currentChatId
            ? { ...chat, messages: [...chat.messages, assistantMessage] }
            : chat,
        ),
      );
    }, 1000);
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
          chats={chats}
          currentChatId={currentChatId}
          onChatSelect={setCurrentChatId}
          onNewChat={createNewChat}
          onCloseSidebar={() => setSidebarOpen(false)}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
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
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </header>

        {/* Chat area - Scrollable */}
        <div className="flex-1 overflow-hidden">
          <ChatArea
            messages={currentChat?.messages || []}
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
          />
        </div>

        {/* Chat Input - Fixed at bottom */}
        <div className="sticky bottom-0 z-10">
          <ChatInput onSendMessage={addMessage} />
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
