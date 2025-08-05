import {
  Chat,
  Message,
  CreateChatRequest,
  SendMessageRequest,
} from "@shared/types";
import { apiService } from "./api";

export interface ChatState {
  chats: Chat[];
  currentChat: Chat | null;
  messages: Message[];
  isLoading: boolean;
  isThinking: boolean;
  error: string | null;
}

class ChatService {
  private listeners: Set<(state: ChatState) => void> = new Set();
  private state: ChatState = {
    chats: [],
    currentChat: null,
    messages: [],
    isLoading: false,
    isThinking: false,
    error: null,
  };

  // Subscribe to state changes
  subscribe(listener: (state: ChatState) => void): () => void {
    this.listeners.add(listener);
    // Call immediately with current state
    listener(this.state);

    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  private setState(updates: Partial<ChatState>) {
    this.state = { ...this.state, ...updates };
    this.listeners.forEach((listener) => listener(this.state));
  }

  getState(): ChatState {
    return this.state;
  }

  async loadChats(userId?: string): Promise<void> {
    this.setState({ isLoading: true, error: null });

    try {
      const response = await apiService.getChats(userId);

      if (response.success && response.data) {
        this.setState({
          chats: response.data,
          isLoading: false,
        });
      } else {
        this.setState({
          error: response.error || "Failed to load chats",
          isLoading: false,
        });
      }
    } catch (error) {
      this.setState({
        error: error instanceof Error ? error.message : "Failed to load chats",
        isLoading: false,
      });
    }
  }

  async loadChatMessages(chatId: string): Promise<void> {
    this.setState({ isLoading: true, error: null });

    try {
      const response = await apiService.getChatMessages(chatId);

      if (response.success && response.data) {
        this.setState({
          messages: response.data,
          isLoading: false,
        });
      } else {
        this.setState({
          error: response.error || "Failed to load messages",
          isLoading: false,
        });
      }
    } catch (error) {
      this.setState({
        error:
          error instanceof Error ? error.message : "Failed to load messages",
        isLoading: false,
      });
    }
  }

  // Create a draft chat that only exists locally until first message is sent
  createDraftChat(
    request: CreateChatRequest,
    userId: string,
    categoryId?: string
  ): Chat {
    const draftChat: Chat = {
      id: `draft_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: request.title || "New chat",
      model: request.model,
      chatbootVersion: request.chatbootVersion || "1.0",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messageCount: 0,
      userId: userId,
      categoryId: categoryId,
      isDraft: true,
    };

    // Add to chats list
    this.setState({
      chats: [draftChat, ...this.state.chats],
      currentChat: draftChat,
      messages: [],
    });

    return draftChat;
  }

  async createChat(
    request: CreateChatRequest,
    userId?: string,
  ): Promise<Chat | null> {
    this.setState({ isLoading: true, error: null });

    try {
      // Add userId to request if provided
      const requestWithUserId = userId ? { ...request, userId } : request;
      const response = await apiService.createChat(requestWithUserId);

      if (response.success && response.data) {
        const newChat = response.data;

        // Add to chats list
        this.setState({
          chats: [newChat, ...this.state.chats],
          currentChat: newChat,
          messages: [],
          isLoading: false,
          isThinking: request.message || request.pdfFile ? true : false, // Thinking if there was a message or PDF file
        });

        // Start polling for new messages (AI response) if there was a message or PDF file
        if ((request.message && request.message.trim()) || request.pdfFile) {
          this.startPollingForMessages(newChat.id);
        }

        return newChat;
      } else {
        this.setState({
          error: response.error || "Failed to create chat",
          isLoading: false,
        });
        return null;
      }
    } catch (error) {
      this.setState({
        error: error instanceof Error ? error.message : "Failed to create chat",
        isLoading: false,
      });
      return null;
    }
  }

  // Convert a draft chat to a saved chat when first message is sent
  async saveDraftChat(draftChat: Chat): Promise<Chat | null> {
    try {
      const request: CreateChatRequest = {
        title: draftChat.title,
        model: draftChat.model,
        chatbootVersion: draftChat.chatbootVersion,
        userId: draftChat.userId,
      };

      const response = await apiService.createChat(request);

      if (response.success && response.data) {
        const savedChat = { ...response.data, categoryId: draftChat.categoryId };

        // If the draft chat was assigned to a category, update the saved chat
        if (draftChat.categoryId) {
          await apiService.updateChatCategory(savedChat.id, draftChat.categoryId);
          savedChat.categoryId = draftChat.categoryId;
        }

        // Replace draft chat with saved chat
        this.setState({
          chats: this.state.chats.map(chat =>
            chat.id === draftChat.id ? savedChat : chat
          ),
          currentChat: savedChat,
        });

        return savedChat;
      }
    } catch (error) {
      console.error("Failed to save draft chat:", error);
    }
    return null;
  }

  // Remove draft chats (cleanup when user navigates away without sending message)
  removeDraftChat(chatId: string): void {
    this.setState({
      chats: this.state.chats.filter(chat => chat.id !== chatId),
      currentChat: this.state.currentChat?.id === chatId ? null : this.state.currentChat,
    });
  }

  // Clean up all empty draft chats
  cleanupDraftChats(): void {
    const hasEmptyDrafts = this.state.chats.some(chat => chat.isDraft && chat.messageCount === 0);

    if (hasEmptyDrafts) {
      this.setState({
        chats: this.state.chats.filter(chat => !chat.isDraft || chat.messageCount > 0),
        currentChat: this.state.currentChat?.isDraft && this.state.currentChat?.messageCount === 0
          ? null
          : this.state.currentChat,
      });
    }
  }

  async sendMessage(request: SendMessageRequest): Promise<void> {
    this.setState({ error: null });

    // Check if this is a draft chat
    const currentChat = this.state.chats.find(chat => chat.id === request.chatId);
    let finalChatId = request.chatId;

    if (currentChat?.isDraft) {
      // This is the first message to a draft chat, save it first
      const savedChat = await this.saveDraftChat(currentChat);
      if (savedChat) {
        finalChatId = savedChat.id;
      } else {
        this.setState({
          error: "Failed to save chat",
          isThinking: false,
        });
        return;
      }
    }

    // Add user message immediately to UI
    const userMessage: Message = {
      id: Date.now().toString(), // Temporary ID
      chatId: finalChatId,
      type: "user",
      content: request.message,
      timestamp: new Date().toISOString(),
      attachments: request.attachments,
    };

    this.setState({
      messages: [...this.state.messages, userMessage],
      isThinking: true,
    });

    try {
      // Send message to the final chat ID (either original or newly saved)
      const messageRequest = { ...request, chatId: finalChatId };
      const response = await apiService.sendMessage(messageRequest);

      if (response.success) {
        // Update the temporary message with real ID if needed
        // Start polling for AI response
        this.startPollingForMessages(finalChatId);
      } else {
        this.setState({
          error: response.error || "Failed to send message",
          isThinking: false,
        });
      }
    } catch (error) {
      this.setState({
        error:
          error instanceof Error ? error.message : "Failed to send message",
        isThinking: false,
      });
    }
  }

  private async startPollingForMessages(chatId: string): Promise<void> {
    const pollCount = 0;
    const maxPolls = 20; // Poll for max 10 seconds (500ms * 20)

    const poll = async (count: number) => {
      if (count >= maxPolls) {
        this.setState({ isThinking: false });
        return;
      }

      try {
        const response = await apiService.getChatMessages(chatId);

        if (response.success && response.data) {
          const newMessages = response.data;
          const lastMessage = newMessages[newMessages.length - 1];

          // Check if we have a new AI message
          if (
            lastMessage &&
            lastMessage.type === "assistant" &&
            lastMessage.timestamp >
              (this.state.messages[this.state.messages.length - 1]?.timestamp ||
                "")
          ) {
            this.setState({
              messages: newMessages,
              isThinking: false,
            });
            return; // Stop polling
          }
        }

        // Continue polling
        setTimeout(() => poll(count + 1), 500);
      } catch (error) {
        // Continue polling even on error (network might be temporarily down)
        setTimeout(() => poll(count + 1), 500);
      }
    };

    // Start polling after a short delay
    setTimeout(() => poll(0), 500);
  }

  async selectChat(chat: Chat): Promise<void> {
    // Clean up any abandoned draft chats (except the one being selected)
    const draftChats = this.state.chats.filter(c =>
      c.isDraft && c.id !== chat.id && c.messageCount === 0
    );

    if (draftChats.length > 0) {
      this.setState({
        chats: this.state.chats.filter(c =>
          !c.isDraft || c.id === chat.id || c.messageCount > 0
        )
      });
    }

    this.setState({
      currentChat: chat,
      messages: [],
      error: null,
    });

    // Only load messages if this is not a draft chat
    if (!chat.isDraft) {
      await this.loadChatMessages(chat.id);
    }
  }

  async deleteChat(chatId: string): Promise<void> {
    this.setState({ error: null });

    try {
      const response = await apiService.deleteChat(chatId);

      if (response.success) {
        const updatedChats = this.state.chats.filter(
          (chat) => chat.id !== chatId,
        );

        this.setState({
          chats: updatedChats,
          currentChat:
            this.state.currentChat?.id === chatId
              ? null
              : this.state.currentChat,
          messages:
            this.state.currentChat?.id === chatId ? [] : this.state.messages,
        });
      } else {
        this.setState({
          error: response.error || "Failed to delete chat",
        });
      }
    } catch (error) {
      this.setState({
        error: error instanceof Error ? error.message : "Failed to delete chat",
      });
    }
  }

  clearError(): void {
    this.setState({ error: null });
  }

  updateMessage(messageId: string, updates: Partial<Message>): void {
    const updatedMessages = this.state.messages.map((msg) =>
      msg.id === messageId ? { ...msg, ...updates } : msg,
    );
    this.setState({ messages: updatedMessages });
  }

  updateCurrentChat(updates: Partial<Chat>): void {
    if (this.state.currentChat) {
      const updatedChat = { ...this.state.currentChat, ...updates };
      this.setState({
        currentChat: updatedChat,
        chats: this.state.chats.map((chat) =>
          chat.id === updatedChat.id ? updatedChat : chat,
        ),
      });
    }
  }
}

export const chatService = new ChatService();
