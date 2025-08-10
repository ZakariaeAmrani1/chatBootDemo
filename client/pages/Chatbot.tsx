import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  Plus,
  Settings,
  Share2,
  Menu,
  X,
  Eye,
  FileSpreadsheet,
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
import { PDFPreview } from "@/components/PDFPreview";
import { CSVPreview } from "@/components/CSVPreview";
import { ModelDropdown } from "@/components/ModelDropdown";

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
  const [selectedModel, setSelectedModel] = useState("cloud"); // Default to valid model
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState("ChatNova V3");
  const [models, setModels] = useState<any[]>([]);
  const [pdfPreviewOpen, setPdfPreviewOpen] = useState(true);
  const [csvPreviewOpen, setCsvPreviewOpen] = useState(true);
  const [pdfPreviewWidth, setPdfPreviewWidth] = useState(() => {
    // Load saved width from localStorage, default to 384px
    const saved = localStorage.getItem("pdfPreviewWidth");
    return saved ? parseInt(saved, 10) : 384;
  });
  const [csvPreviewWidth, setCsvPreviewWidth] = useState(() => {
    // Load saved width from localStorage, default to 384px
    const saved = localStorage.getItem("csvPreviewWidth");
    return saved ? parseInt(saved, 10) : 384;
  });

  // Save width changes to localStorage
  const handlePdfWidthChange = (width: number) => {
    setPdfPreviewWidth(width);
    localStorage.setItem("pdfPreviewWidth", width.toString());
  };

  const handleCsvWidthChange = (width: number) => {
    setCsvPreviewWidth(width);
    localStorage.setItem("csvPreviewWidth", width.toString());
  };

  // Load models for display (API disabled for stability)
  useEffect(() => {
    console.log("🔧 Model loading disabled - using component fallbacks");
    setModels([]); // ModelDropdown has its own fallback models
  }, []);

  // Authentication and theme context
  const { user, updateUser } = useAuth();
  const { setTheme } = useTheme();

  // Subscribe to chat service state changes
  useEffect(() => {
    const unsubscribe = chatService.subscribe(setChatState);
    return unsubscribe;
  }, []);

  // Remove the periodic refresh interval as it conflicts with polling
  // The chat service now handles all polling internally

  // Load chats when user is authenticated
  useEffect(() => {
    if (user && user.id) {
      chatService.loadChats(user.id);
    }
  }, [user]);

  // Load user's selected model when user is authenticated
  useEffect(() => {
    if (user?.settings?.selectedModel) {
      setSelectedModel(user.settings.selectedModel);
    }
  }, [user?.settings?.selectedModel]);

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

    const handleBeforeUnload = () => {
      // Clean up draft chats when user is about to leave
      chatService.cleanupDraftChats();
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Clean up draft chats when tab becomes hidden
        chatService.cleanupDraftChats();
      }
    };

    window.addEventListener(
      "userSettingsUpdated",
      handleSettingsUpdate as EventListener,
    );
    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener(
        "userSettingsUpdated",
        handleSettingsUpdate as EventListener,
      );
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const createNewChat = async (message?: string) => {
    if (!user) return;

    if (message && message.trim()) {
      // Create a saved chat immediately if there's an initial message
      await chatService.createChat(
        {
          title: "New Chat",
          model: selectedModel,
          chatbootVersion: selectedVersion,
          message: message,
        },
        user.id,
      );
    } else {
      // Clear current chat to allow model selection for new chat
      chatService.clearCurrentChat();
    }
  };

  const handleStartChat = async (model: string, file: File) => {
    if (!user) return;

    try {
      // Update selected model to match the one chosen
      setSelectedModel(model);

      // Save model selection to user settings
      try {
        await apiService.updateUserSettings(user.id, { selectedModel: model });
      } catch (error) {
        console.error("Failed to save model preference:", error);
      }

      // Handle different models and file types
      if (model === "local-cloud" && file.type === "application/pdf") {
        // Create chat with backend but handle PDF processing locally
        const createChatRequest: any = {
          title: `PDF: ${file.name}`,
          model: model,
          chatbootVersion: selectedVersion,
          pdfFile: file,
        };

        const newChat = await chatService.createChat(
          createChatRequest,
          user.id,
        );

        if (newChat) {
          // First, upload the file and create a proper file attachment
          const uploadedFiles = await apiService.uploadFiles([file]);

          if (
            uploadedFiles.success &&
            uploadedFiles.data &&
            uploadedFiles.data.length > 0
          ) {
            // Add a user message with the file attachment - this will automatically trigger AI response
            await chatService.sendMessage({
              chatId: newChat.id,
              message: `Please analyze this PDF document titled "${file.name}" and provide a comprehensive summary. Tell me what the document is about, key information it contains, main topics, and any important findings.`,
              attachments: uploadedFiles.data,
            });
          } else {
            // Fallback to text message if upload fails
            await chatService.sendMessage({
              chatId: newChat.id,
              message: `I uploaded a PDF file "${file.name}" but the upload failed. Can you help me understand how to proceed?`,
            });
          }
        }
      } else if (
        model === "csv-local" &&
        (file.type === "text/csv" ||
          file.type === "application/csv" ||
          file.name.toLowerCase().endsWith(".csv"))
      ) {
        // Create chat with client-side CSV processing like PDF model
        const createChatRequest: any = {
          title: `CSV: ${file.name}`,
          model: model,
          chatbootVersion: selectedVersion,
          csvFile: file,
        };

        const newChat = await chatService.createChat(
          createChatRequest,
          user.id,
        );

        if (newChat) {
          // Upload the file and create a proper file attachment
          const uploadedFiles = await apiService.uploadFiles([file]);

          if (
            uploadedFiles.success &&
            uploadedFiles.data &&
            uploadedFiles.data.length > 0
          ) {
            // Add a user message with the file attachment - this will automatically trigger AI response
            await chatService.sendMessage({
              chatId: newChat.id,
              message: `Please analyze this CSV dataset titled "${file.name}" and provide a comprehensive summary. Tell me about the data structure, key columns, data patterns, and any interesting insights you can find.`,
              attachments: uploadedFiles.data,
            });
          } else {
            // Fallback to text message if upload fails
            await chatService.sendMessage({
              chatId: newChat.id,
              message: `I uploaded a CSV file "${file.name}" but the upload failed. Can you help me understand how to proceed?`,
            });
          }
        }
      } else if (model === "cloud") {
        // For cloud model, create chat first, then upload file as attachment
        const createChatRequest: any = {
          title: "New Chat",
          model: model,
          chatbootVersion: selectedVersion,
        };

        const newChat = await chatService.createChat(
          createChatRequest,
          user.id,
        );

        if (newChat) {
          // Upload file and send as message attachment
          try {
            const uploadedFiles = await apiService.uploadFiles([file]);
            if (
              uploadedFiles.success &&
              uploadedFiles.data &&
              uploadedFiles.data.length > 0
            ) {
              // Send message with file attachment
              await chatService.sendMessage({
                chatId: newChat.id,
                message: `I've uploaded a file (${file.name}) for analysis. Please analyze its content.`,
                attachments: uploadedFiles.data,
              });
            }
          } catch (uploadError) {
            console.error(
              "Failed to upload file for cloud model:",
              uploadError,
            );
            // Send message without attachment as fallback
            await chatService.sendMessage({
              chatId: newChat.id,
              message: `I tried to upload a file (${file.name}) for analysis, but the upload failed. Please help me understand how to proceed.`,
            });
          }
        }
      }
    } catch (error) {
      console.error("Failed to start chat:", error);
    }
  };

  const addMessage = async (
    content: string,
    attachments?: FileAttachment[],
  ) => {
    // Don't send if no content and no attachments
    if (!content.trim() && (!attachments || attachments.length === 0)) return;

    // Don't send if content is just whitespace
    if (!content.trim() && (!attachments || attachments.length === 0)) return;

    try {
      // Handle existing backend chat with local-cloud model - use local processing
      if (
        false && // Temporarily disabled
        chatState.currentChat &&
        chatState.currentChat.model === "local-cloud"
      ) {
        if (!user) return;

        // Check if user has Gemini API key
        const geminiApiKey = user?.settings?.geminiApiKey;
        if (!geminiApiKey || !geminiApiKey.trim()) {
          // Add user message to UI immediately
          chatService.addUserMessageToUI(chatState.currentChat.id, content);

          // Save user message to backend first
          await fetch("/api/chats/add-user-message", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              chatId: chatState.currentChat.id,
              content: content,
            }),
          });

          // Save error response
          await fetch("/api/chats/add-assistant-message", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              chatId: chatState.currentChat.id,
              content:
                "❌ **API Key Required**: To use the local PDF model, please add your Gemini API key in Settings. You can get your API key from [Google AI Studio](https://aistudio.google.com/app/apikey).",
            }),
          });

          // Refresh messages to show the new messages
          await chatService.loadChatMessages(chatState.currentChat.id);
          // Stop thinking state
          chatService.stopThinking();
          return;
        }

        // If the chat has a PDF file, process with Gemini
        if (chatState.currentChat.pdfFile) {
          try {
            // Add user message to UI immediately
            chatService.addUserMessageToUI(chatState.currentChat.id, content);

            // Save user message first
            await fetch("/api/chats/add-user-message", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                chatId: chatState.currentChat.id,
                content: content,
              }),
            });

            // Get the PDF file from the attachment URL
            const pdfResponse = await fetch(chatState.currentChat.pdfFile.url);
            const pdfBlob = await pdfResponse.blob();
            const pdfFile = new File(
              [pdfBlob],
              chatState.currentChat.pdfFile.name,
              { type: "application/pdf" },
            );

            // Process with Gemini using new client service
            const { ClientGeminiService } = await import(
              "../services/clientGeminiService"
            );
            const geminiModel =
              user?.settings?.geminiModel || "gemini-1.5-flash-latest";

            // Get chat history for context
            const chatHistory = chatState.messages;

            // For now, just use simple text processing since ClientGeminiService doesn't have PDF processing yet
            const aiResponse = await ClientGeminiService.generateContent(
              `Analyze this message in context: ${content}`,
              geminiModel,
            );

            // Save AI response
            await fetch("/api/chats/add-assistant-message", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                chatId: chatState.currentChat.id,
                content: aiResponse,
              }),
            });

            // Refresh messages to show the new messages
            await chatService.loadChatMessages(chatState.currentChat.id);
            // Stop thinking state
            chatService.stopThinking();
            return;
          } catch (error) {
            console.error("Failed to process with Gemini:", error);

            // Save error response
            await fetch("/api/chats/add-assistant-message", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                chatId: chatState.currentChat.id,
                content:
                  "❌ **Error**: Failed to process PDF with Gemini. Please try again.",
              }),
            });

            // Refresh messages to show the error
            await chatService.loadChatMessages(chatState.currentChat.id);
            // Stop thinking state
            chatService.stopThinking();
            return;
          }
        } else {
          // Add user message to UI immediately
          chatService.addUserMessageToUI(chatState.currentChat.id, content);

          // Save user message first
          await fetch("/api/chats/add-user-message", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              chatId: chatState.currentChat.id,
              content: content,
            }),
          });

          // Save error response
          await fetch("/api/chats/add-assistant-message", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              chatId: chatState.currentChat.id,
              content:
                "❌ **No PDF Found**: This local PDF chat doesn't have an associated PDF file. Please create a new chat and upload a PDF document.",
            }),
          });

          // Refresh messages to show the error
          await chatService.loadChatMessages(chatState.currentChat.id);
          // Stop thinking state
          chatService.stopThinking();
          return;
        }
      }

      if (!chatState.currentChat) {
        if (!user) return;

        // Create new chat first, then send the message with attachments
        const newChat = await chatService.createChat(
          {
            title: "New Chat",
            model: selectedModel,
            chatbootVersion: selectedVersion,
          },
          user.id,
        );

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
      // Auto-open file preview if chat has files, close other previews
      if (chat.pdfFile) {
        setPdfPreviewOpen(true);
        setCsvPreviewOpen(false);
      } else if (chat.csvFile) {
        setCsvPreviewOpen(true);
        setPdfPreviewOpen(false);
      } else {
        // No files, close all previews
        setPdfPreviewOpen(false);
        setCsvPreviewOpen(false);
      }
    }
  };

  const handleDeleteChat = async (chatId: string) => {
    await chatService.deleteChat(chatId);
  };

  const handleUpdateChat = async (chatId: string, updates: Partial<Chat>) => {
    try {
      const response = await apiService.updateChat(chatId, updates);
      if (response.success) {
        // Refresh chats to show updated title - make sure to pass userId
        if (user?.id) {
          chatService.loadChats(user.id);
        }
      }
    } catch (error) {
      console.error("Failed to update chat:", error);
    }
  };

  const handleRefresh = () => {
    // Reload chats after clearing history
    if (user?.id) {
      chatService.loadChats(user.id);
    }
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

    // Update current chat's model if there's an active chat
    if (chatState.currentChat) {
      // Only update on server if it's not a draft chat
      if (!chatState.currentChat.isDraft) {
        try {
          await apiService.updateChat(chatState.currentChat.id, {
            model: modelId,
          });
        } catch (error) {
          console.error("Failed to update chat model:", error);
        }
      }
      // Always update the local chat state to reflect the change
      chatService.updateCurrentChat({ model: modelId });
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
          selectedModel={selectedModel}
        />
      </div>

      {/* Main content */}
      <div
        className="flex-1 flex flex-col min-w-0 h-screen"
        style={{
          marginRight: (() => {
            // Calculate margin based on which preview is open
            let margin = 0;

            if (
              chatState.currentChat?.pdfFile &&
              pdfPreviewOpen &&
              window.innerWidth >= 640
            ) {
              margin = pdfPreviewWidth;
            } else if (
              chatState.currentChat?.csvFile &&
              csvPreviewOpen &&
              window.innerWidth >= 640
            ) {
              margin = csvPreviewWidth;
            }

            return `${margin}px`;
          })(),
          transition: "margin-right 0.3s ease-in-out",
        }}
      >
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
            <div className="flex items-center gap-2">
              <ModelDropdown
                selectedModel={selectedModel}
                onModelChange={handleModelChange}
                disabled={
                  chatState.currentChat &&
                  !chatState.currentChat.isDraft &&
                  chatState.messages.length > 0
                }
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* PDF Preview Toggle */}
            {chatState.currentChat?.pdfFile && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const newPdfState = !pdfPreviewOpen;
                  setPdfPreviewOpen(newPdfState);
                  if (newPdfState) setCsvPreviewOpen(false); // Close CSV when opening PDF
                }}
                className="hidden sm:flex"
                title={pdfPreviewOpen ? "Hide PDF" : "Show PDF"}
              >
                <Eye className="h-4 w-4" />
                <span className="ml-1 hidden md:inline text-xs">
                  {pdfPreviewOpen ? "Hide PDF" : "Show PDF"}
                </span>
              </Button>
            )}

            {/* CSV Preview Toggle */}
            {chatState.currentChat?.csvFile && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const newCsvState = !csvPreviewOpen;
                  setCsvPreviewOpen(newCsvState);
                  if (newCsvState) setPdfPreviewOpen(false); // Close PDF when opening CSV
                }}
                className="hidden sm:flex"
                title={csvPreviewOpen ? "Hide CSV" : "Show CSV"}
              >
                <FileSpreadsheet className="h-4 w-4" />
                <span className="ml-1 hidden md:inline text-xs">
                  {csvPreviewOpen ? "Hide CSV" : "Show CSV"}
                </span>
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              className="hidden sm:flex"
              onClick={handleShareClick}
              disabled={!chatState.currentChat}
            >
              <Share2 className="h-4 w-4" />
              <span className="ml-1 hidden md:inline text-xs">Share</span>
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
            onStartChat={handleStartChat}
            user={user}
            hasActiveChat={!!chatState.currentChat}
            currentChatHasPdf={!!chatState.currentChat?.pdfFile}
            currentChatHasCsv={!!chatState.currentChat?.csvFile}
          />
        </div>

        {/* Chat Input - Fixed at bottom - Only show when chat is active */}
        {chatState.currentChat && (
          <div className="sticky bottom-0 z-10">
            <ChatInput
              onSendMessage={addMessage}
              disabled={chatState.isLoading || chatState.isThinking}
            />
          </div>
        )}
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

      {/* Mobile file overlay */}
      {((chatState.currentChat?.pdfFile && pdfPreviewOpen) ||
        (chatState.currentChat?.csvFile && csvPreviewOpen)) && (
        <div
          className="sm:hidden fixed inset-0 bg-black/50 z-10"
          onClick={() => {
            setPdfPreviewOpen(false);
            setCsvPreviewOpen(false);
          }}
        />
      )}

      {/* PDF Preview */}
      {chatState.currentChat?.pdfFile && (
        <PDFPreview
          pdfFile={chatState.currentChat?.pdfFile}
          isOpen={pdfPreviewOpen}
          onToggle={() => setPdfPreviewOpen(!pdfPreviewOpen)}
          width={pdfPreviewWidth}
          onWidthChange={handlePdfWidthChange}
        />
      )}

      {/* CSV Preview */}
      {chatState.currentChat?.csvFile && (
        <CSVPreview
          csvFile={chatState.currentChat?.csvFile}
          isOpen={csvPreviewOpen}
          onToggle={() => setCsvPreviewOpen(!csvPreviewOpen)}
          width={csvPreviewWidth}
          onWidthChange={handleCsvWidthChange}
        />
      )}
    </div>
  );
};

export default Chatbot;
