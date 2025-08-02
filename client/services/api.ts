import {
  Chat,
  Message,
  User,
  CreateChatRequest,
  SendMessageRequest,
  MessageFeedbackRequest,
  ApiResponse,
  FileAttachment,
  DataStats,
} from "@shared/types";

const API_BASE = "/api";

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE}${endpoint}`;

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };

    // Don't set content-type for FormData (let browser set it with boundary)
    if (options.body instanceof FormData) {
      delete config.headers!["Content-Type"];
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      return data as ApiResponse<T>;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Network error",
      };
    }
  }

  // Chat operations
  async getChats(userId?: string): Promise<ApiResponse<Chat[]>> {
    const query = userId ? `?userId=${userId}` : "";
    return this.request<Chat[]>(`/chats${query}`);
  }

  async getChatMessages(chatId: string): Promise<ApiResponse<Message[]>> {
    return this.request<Message[]>(`/chats/${chatId}/messages`);
  }

  async createChat(request: CreateChatRequest): Promise<ApiResponse<Chat>> {
    return this.request<Chat>("/chats", {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  async sendMessage(
    request: SendMessageRequest,
  ): Promise<ApiResponse<Message>> {
    return this.request<Message>("/chats/message", {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  async updateChat(chatId: string, updates: Partial<Chat>): Promise<ApiResponse<Chat>> {
    return this.request<Chat>(`/chats/${chatId}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  }

  async deleteChat(chatId: string): Promise<ApiResponse<null>> {
    return this.request<null>(`/chats/${chatId}`, {
      method: "DELETE",
    });
  }

  async sendMessageFeedback(
    request: MessageFeedbackRequest,
  ): Promise<
    ApiResponse<{ messageId: string; liked: boolean; disliked: boolean }>
  > {
    return this.request<{
      messageId: string;
      liked: boolean;
      disliked: boolean;
    }>("/messages/feedback", {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  // User operations
  async getCurrentUser(userId?: string): Promise<ApiResponse<User>> {
    const query = userId ? `?userId=${userId}` : "";
    return this.request<User>(`/user${query}`);
  }

  async updateUser(
    userId: string,
    updates: Partial<User>,
  ): Promise<ApiResponse<User>> {
    return this.request<User>(`/user/${userId}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  }

  async updateUserSettings(
    userId: string,
    settings: any,
  ): Promise<ApiResponse<User>> {
    return this.request<User>(`/user/${userId}/settings`, {
      method: "PUT",
      body: JSON.stringify(settings),
    });
  }

  // File operations
  async uploadFiles(files: File[]): Promise<ApiResponse<FileAttachment[]>> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });

    return this.request<FileAttachment[]>("/files/upload", {
      method: "POST",
      body: formData,
    });
  }

  async getFileInfo(fileId: string): Promise<ApiResponse<FileAttachment>> {
    return this.request<FileAttachment>(`/files/info/${fileId}`);
  }

  // Data management operations
  async getDataStats(): Promise<ApiResponse<DataStats>> {
    return this.request<DataStats>("/data/stats");
  }

  async clearChatHistory(): Promise<ApiResponse<null>> {
    return this.request<null>("/data/clear-chats", {
      method: "POST",
    });
  }

  async clearUploadedFiles(): Promise<ApiResponse<null>> {
    return this.request<null>("/data/clear-files", {
      method: "POST",
    });
  }

  // Utility method to get file URL
  getFileUrl(filename: string): string {
    return `${API_BASE}/files/${filename}`;
  }
}

export const apiService = new ApiService();
