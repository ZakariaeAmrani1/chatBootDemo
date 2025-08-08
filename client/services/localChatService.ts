import { Chat, Message, User, FileAttachment } from "../../shared/types";
import { v4 as uuidv4 } from "uuid";
import { GeminiService } from "./geminiService";

interface LocalChatState {
  chats: Chat[];
  currentChat: Chat | null;
  messages: Message[];
  isLoading: boolean;
  isThinking: boolean;
  error: string | null;
}

export class LocalChatService {
  private listeners: Set<(state: LocalChatState) => void> = new Set();
  private state: LocalChatState = {
    chats: [],
    currentChat: null,
    messages: [],
    isLoading: false,
    isThinking: false,
    error: null,
  };

  // Subscribe to state changes
  subscribe(listener: (state: LocalChatState) => void): () => void {
    this.listeners.add(listener);
    // Call immediately with current state
    listener(this.state);

    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  private setState(updates: Partial<LocalChatState>) {
    this.state = { ...this.state, ...updates };
    this.listeners.forEach((listener) => listener(this.state));
  }

  getState(): LocalChatState {
    return this.state;
  }

  /**
   * Creates a new local PDF chat with Gemini integration
   */
  async createLocalPDFChat(
    pdfFile: File,
    user: User,
    title: string = "PDF Analysis",
  ): Promise<Chat | null> {
    this.setState({ isLoading: true, error: null });

    try {
      // Check if user has Gemini API key
      const geminiApiKey =
        user?.settings?.geminiApiKey ||
        "AIzaSyDxnf409EQ6bxYQiwJlxh2pEi8osHrpV-A";
      if (!geminiApiKey || !geminiApiKey.trim()) {
        this.setState({
          error:
            "❌ **API Key Required**: To use the local PDF model, please add your Gemini API key in Settings. You can get your API key from [Google AI Studio](https://aistudio.google.com/app/apikey).",
          isLoading: false,
        });
        return null;
      }

      // First, create a regular backend chat to ensure persistence
      const { apiService } = await import("./api");

      const createChatRequest = {
        title: title,
        model: "local-cloud",
        chatbootVersion: "ChatNova V3",
        pdfFile: pdfFile,
      };

      const response = await apiService.createChat(createChatRequest);
      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to create chat");
      }

      const backendChat = response.data;
      const now = new Date().toISOString();

      // Create file attachment object (use the one from backend if available)
      const pdfAttachment: FileAttachment = backendChat.pdfFile || {
        id: uuidv4(),
        name: pdfFile.name,
        size: pdfFile.size,
        type: pdfFile.type,
        url: URL.createObjectURL(pdfFile), // Create blob URL for local file
        uploadedAt: now,
      };

      // Use the chat from backend
      const chat: Chat = {
        ...backendChat,
        pdfFile: pdfAttachment,
      };

      // Add user message showing file upload
      const userMessage: Message = {
        id: uuidv4(),
        chatId: chat.id,
        type: "user",
        content: `📄 Uploaded PDF document for analysis: ${pdfFile.name}`,
        timestamp: now,
        attachments: [pdfAttachment],
      };

      // Save the initial user message to backend
      try {
        const response = await fetch("/api/chats/add-user-message", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            chatId: chat.id,
            content: userMessage.content,
            attachments: userMessage.attachments,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to save initial user message");
        }
      } catch (saveError) {
        console.error(
          "Failed to save initial user message to backend:",
          saveError,
        );
        // Continue anyway
      }

      // Add to state
      this.setState({
        chats: [chat, ...this.state.chats],
        currentChat: chat,
        messages: [userMessage],
        isLoading: false,
        isThinking: true,
      });

      // Process PDF with Gemini
      try {
        const geminiModel =
          user?.settings?.geminiModel || "gemini-1.5-flash-latest";
        const geminiService = new GeminiService(geminiApiKey, geminiModel);

        const initialPrompt = `I've uploaded a PDF document (${pdfFile.name}). Please analyze this document and provide a summary of its content. Tell me what the document is about and what key information it contains.`;

        const aiResponse = await geminiService.processPDFWithPrompt(
          pdfFile,
          initialPrompt,
          [],
        );

        // Create assistant message directly in the backend data store
        const aiMessage = {
          id: uuidv4(),
          chatId: chat.id,
          type: "assistant" as const,
          content: aiResponse,
          timestamp: new Date().toISOString(),
        };

        // Save the assistant message to backend storage
        try {
          const response = await fetch("/api/chats/add-assistant-message", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              chatId: chat.id,
              content: aiResponse,
            }),
          });

          if (!response.ok) {
            throw new Error("Failed to save assistant message");
          }
        } catch (saveError) {
          console.error("Failed to save AI message to backend:", saveError);
          // Continue anyway, the message will still be shown in UI
        }

        this.setState({
          messages: [...this.state.messages, aiMessage],
          isThinking: false,
        });
      } catch (error) {
        console.error("Error processing PDF with Gemini:", error);
        const errorMessage: Message = {
          id: uuidv4(),
          chatId: chatId,
          type: "assistant",
          content: `❌ **Processing Error**: Failed to analyze the PDF document. ${error instanceof Error ? error.message : "Unknown error"}`,
          timestamp: new Date().toISOString(),
        };

        this.setState({
          messages: [...this.state.messages, errorMessage],
          isThinking: false,
        });
      }

      return chat;
    } catch (error) {
      this.setState({
        error: error instanceof Error ? error.message : "Failed to create chat",
        isLoading: false,
      });
      return null;
    }
  }

  /**
   * Sends a message to the current local PDF chat
   */
  async sendMessageToLocalChat(message: string, user: User): Promise<void> {
    if (!this.state.currentChat) {
      this.setState({ error: "No active chat" });
      return;
    }

    this.setState({ error: null });

    const now = new Date().toISOString();

    // Add user message
    const userMessage: Message = {
      id: uuidv4(),
      chatId: this.state.currentChat.id,
      type: "user",
      content: message,
      timestamp: now,
    };

    // Save user message to backend
    try {
      const response = await fetch("/api/chats/add-user-message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chatId: this.state.currentChat.id,
          content: message,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save user message");
      }
    } catch (saveError) {
      console.error("Failed to save user message to backend:", saveError);
      // Continue anyway
    }

    this.setState({
      messages: [...this.state.messages, userMessage],
      isThinking: true,
    });

    try {
      const geminiApiKey = user?.settings?.geminiApiKey;
      if (!geminiApiKey || !geminiApiKey.trim()) {
        throw new Error("Gemini API key is required");
      }

      const geminiModel =
        user?.settings?.geminiModel || "gemini-1.5-flash-latest";
      const geminiService = new GeminiService(geminiApiKey, geminiModel);

      // Get the PDF file from the current chat
      const pdfFile = await this.getPDFFileFromAttachment(
        this.state.currentChat.pdfFile,
      );
      if (!pdfFile) {
        throw new Error("PDF file not found");
      }

      // Get chat history (excluding the message we just added)
      const chatHistory = this.state.messages.slice(0, -1);

      const aiResponse = await geminiService.processPDFWithPrompt(
        pdfFile,
        message,
        chatHistory,
      );

      // Add AI response message
      const aiMessage: Message = {
        id: uuidv4(),
        chatId: this.state.currentChat.id,
        type: "assistant",
        content: aiResponse,
        timestamp: new Date().toISOString(),
      };

      // Save AI response to backend
      try {
        const response = await fetch("/api/chats/add-assistant-message", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            chatId: this.state.currentChat.id,
            content: aiResponse,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to save AI response");
        }
      } catch (saveError) {
        console.error("Failed to save AI response to backend:", saveError);
        // Continue anyway
      }

      this.setState({
        messages: [...this.state.messages, aiMessage],
        isThinking: false,
      });
    } catch (error) {
      console.error("Error sending message to local chat:", error);
      const errorMessage: Message = {
        id: uuidv4(),
        chatId: this.state.currentChat.id,
        type: "assistant",
        content: `❌ **Error**: ${error instanceof Error ? error.message : "Unknown error"}`,
        timestamp: new Date().toISOString(),
      };

      this.setState({
        messages: [...this.state.messages, errorMessage],
        isThinking: false,
      });
    }
  }

  /**
   * Helper to convert blob URL back to File object
   */
  private async getPDFFileFromAttachment(
    attachment?: FileAttachment,
  ): Promise<File | null> {
    if (!attachment || !attachment.url) {
      return null;
    }

    try {
      const response = await fetch(attachment.url);
      const blob = await response.blob();
      return new File([blob], attachment.name, { type: attachment.type });
    } catch (error) {
      console.error("Error converting blob URL to file:", error);
      return null;
    }
  }

  /**
   * Selects a local chat
   */
  selectChat(chat: Chat): void {
    this.setState({
      currentChat: chat,
      // Note: In a real implementation, you might want to load messages from local storage
      // For now, we'll keep the current messages if they belong to this chat
      messages: this.state.messages.filter((m) => m.chatId === chat.id),
      error: null,
      isThinking: false,
    });
  }

  /**
   * Clears the current chat
   */
  clearCurrentChat(): void {
    this.setState({
      currentChat: null,
      messages: [],
      isThinking: false,
      isLoading: false,
      error: null,
    });
  }

  /**
   * Updates a message
   */
  updateMessage(messageId: string, updates: Partial<Message>): void {
    const updatedMessages = this.state.messages.map((msg) =>
      msg.id === messageId ? { ...msg, ...updates } : msg,
    );
    this.setState({ messages: updatedMessages });
  }
}

export const localChatService = new LocalChatService();
