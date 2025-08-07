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
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  UpdateChatCategoryRequest,
} from "@shared/types";

// Import client services
import { AuthService } from './authService';
import { ClientChatService } from './clientChatService';
import { ClientFileService } from './clientFileService';
import { ClientCategoryService } from './clientCategoryService';
import { ClientUserService } from './clientUserService';
import { ClientDataService } from './clientDataService';
import { StorageManager } from './storageManager';

class ApiService {
  constructor() {
    // Initialize storage manager when API service is created
    StorageManager.initializeDefaultData();
  }

  private getCurrentUserId(): string | null {
    const user = StorageManager.getCurrentUser();
    return user ? user.id : null;
  }

  private requireAuth(): string {
    const userId = this.getCurrentUserId();
    if (!userId) {
      throw new Error('User not authenticated');
    }
    return userId;
  }

  // Chat operations
  async getChats(userId?: string): Promise<ApiResponse<Chat[]>> {
    try {
      const targetUserId = userId || this.requireAuth();
      return await ClientChatService.getChats(targetUserId);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get chats',
      };
    }
  }

  async getChatMessages(chatId: string): Promise<ApiResponse<Message[]>> {
    try {
      return await ClientChatService.getChatMessages(chatId);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get chat messages',
      };
    }
  }

  async createChat(request: CreateChatRequest): Promise<ApiResponse<Chat>> {
    try {
      const userId = this.requireAuth();
      
      let file: File | undefined;
      if (request.pdfFile) {
        file = request.pdfFile;
      } else if (request.csvFile) {
        file = request.csvFile;
      }

      return await ClientChatService.createChat(request, userId, file);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create chat',
      };
    }
  }

  async sendMessage(request: SendMessageRequest): Promise<ApiResponse<Message>> {
    try {
      return await ClientChatService.sendMessage(request);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send message',
      };
    }
  }

  async updateChat(chatId: string, updates: Partial<Chat>): Promise<ApiResponse<Chat>> {
    try {
      return await ClientChatService.updateChat(chatId, updates);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update chat',
      };
    }
  }

  async deleteChat(chatId: string): Promise<ApiResponse<null>> {
    try {
      const result = await ClientChatService.deleteChat(chatId);
      return {
        success: result.success,
        data: null,
        error: result.error,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete chat',
      };
    }
  }

  async sendMessageFeedback(
    request: MessageFeedbackRequest,
  ): Promise<ApiResponse<{ messageId: string; liked: boolean; disliked: boolean }>> {
    try {
      // For client-side implementation, we'll just store feedback in message metadata
      const message = StorageManager.getAllMessages().find(m => m.id === request.messageId);
      if (!message) {
        return {
          success: false,
          error: 'Message not found',
        };
      }

      const updatedMessage = StorageManager.updateMessage(request.messageId, {
        feedback: {
          liked: request.liked,
          disliked: request.disliked,
        }
      });

      if (!updatedMessage) {
        return {
          success: false,
          error: 'Failed to update message feedback',
        };
      }

      return {
        success: true,
        data: {
          messageId: request.messageId,
          liked: request.liked,
          disliked: request.disliked,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send feedback',
      };
    }
  }

  // User operations
  async getCurrentUser(userId?: string): Promise<ApiResponse<User>> {
    try {
      return await ClientUserService.getCurrentUser();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get current user',
      };
    }
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<ApiResponse<User>> {
    try {
      return await ClientUserService.updateUser(userId, updates);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update user',
      };
    }
  }

  async updateUserSettings(userId: string, settings: any): Promise<ApiResponse<User>> {
    try {
      return await ClientUserService.updateUserSettings(userId, settings);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update user settings',
      };
    }
  }

  async uploadUserAvatar(userId: string, avatarFile: File): Promise<ApiResponse<User>> {
    try {
      return await ClientUserService.uploadAvatar(userId, avatarFile);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to upload avatar',
      };
    }
  }

  async uploadLightLogo(userId: string, logoFile: File): Promise<ApiResponse<User>> {
    try {
      return await ClientUserService.uploadLightLogo(userId, logoFile);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to upload light logo',
      };
    }
  }

  async uploadDarkLogo(userId: string, logoFile: File): Promise<ApiResponse<User>> {
    try {
      return await ClientUserService.uploadDarkLogo(userId, logoFile);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to upload dark logo',
      };
    }
  }

  // File operations
  async uploadFiles(files: File[]): Promise<ApiResponse<FileAttachment[]>> {
    try {
      return await ClientFileService.uploadFiles(files);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to upload files',
      };
    }
  }

  async getAllFiles(): Promise<ApiResponse<FileAttachment[]>> {
    try {
      return await ClientFileService.getAllFiles();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get files',
      };
    }
  }

  async getFileInfo(fileId: string): Promise<ApiResponse<FileAttachment>> {
    try {
      return await ClientFileService.getFileInfo(fileId);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get file info',
      };
    }
  }

  // Data management operations
  async getDataStats(): Promise<ApiResponse<DataStats>> {
    try {
      const result = await ClientDataService.getDataStats();
      return result as ApiResponse<DataStats>;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get data stats',
      };
    }
  }

  async clearChatHistory(): Promise<ApiResponse<null>> {
    try {
      const result = await ClientDataService.clearChatHistory();
      return {
        success: result.success,
        data: null,
        error: result.error,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to clear chat history',
      };
    }
  }

  async clearUploadedFiles(): Promise<ApiResponse<null>> {
    try {
      const result = await ClientDataService.clearUploadedFiles();
      return {
        success: result.success,
        data: null,
        error: result.error,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to clear uploaded files',
      };
    }
  }

  async clearCategories(): Promise<ApiResponse<null>> {
    try {
      const result = await ClientDataService.clearCategories();
      return {
        success: result.success,
        data: null,
        error: result.error,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to clear categories',
      };
    }
  }

  async resetUserSettings(): Promise<ApiResponse<null>> {
    try {
      const userId = this.requireAuth();
      const result = await ClientUserService.resetUserSettings(userId);
      return {
        success: result.success,
        data: null,
        error: result.error,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to reset user settings',
      };
    }
  }

  // Authentication operations
  async login(email: string, password: string): Promise<ApiResponse<AuthResponse>> {
    try {
      return await AuthService.login({ email, password });
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Login failed',
      };
    }
  }

  async register(data: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
    try {
      return await AuthService.register(data);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Registration failed',
      };
    }
  }

  async verifyToken(): Promise<ApiResponse<User>> {
    try {
      const token = StorageManager.getAuthToken();
      const result = await AuthService.verifyToken(token || undefined);
      return result as ApiResponse<User>;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Token verification failed',
      };
    }
  }

  async logout(): Promise<void> {
    AuthService.logout();
  }

  // Models operations (simplified for client-side)
  async getModels(): Promise<ApiResponse<any[]>> {
    try {
      // Return some default models since we don't have a server
      const models = [
        { id: 'gpt-4', name: 'GPT-4', provider: 'openai' },
        { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'openai' },
        { id: 'gemini-pro', name: 'Gemini Pro', provider: 'google' },
        { id: 'claude-3', name: 'Claude 3', provider: 'anthropic' },
        { id: 'local-cloud', name: 'Local Cloud', provider: 'local' },
        { id: 'cloud', name: 'Cloud', provider: 'cloud' },
      ];

      return {
        success: true,
        data: models,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get models',
      };
    }
  }

  // Category operations
  async getCategories(userId?: string): Promise<ApiResponse<Category[]>> {
    try {
      const targetUserId = userId || this.requireAuth();
      return await ClientCategoryService.getCategories(targetUserId);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get categories',
      };
    }
  }

  async createCategory(request: CreateCategoryRequest): Promise<ApiResponse<Category>> {
    try {
      const userId = this.requireAuth();
      return await ClientCategoryService.createCategory(request.name, userId);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create category',
      };
    }
  }

  async updateCategory(
    categoryId: string,
    updates: UpdateCategoryRequest,
  ): Promise<ApiResponse<Category>> {
    try {
      const userId = this.requireAuth();
      return await ClientCategoryService.updateCategory(categoryId, updates.name, userId);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update category',
      };
    }
  }

  async deleteCategory(categoryId: string): Promise<ApiResponse<null>> {
    try {
      const userId = this.requireAuth();
      const result = await ClientCategoryService.deleteCategory(categoryId, userId);
      return {
        success: result.success,
        data: null,
        error: result.error,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete category',
      };
    }
  }

  async updateChatCategory(
    chatId: string,
    categoryId: string | null,
  ): Promise<ApiResponse<Chat>> {
    try {
      if (!categoryId) {
        // If no category provided, use default category
        const userId = this.requireAuth();
        const defaultCategory = await ClientCategoryService.ensureDefaultCategory(userId);
        categoryId = defaultCategory.id;
      }
      
      return await ClientChatService.updateChatCategory(chatId, categoryId);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update chat category',
      };
    }
  }

  // Utility method to get file URL (now returns blob URLs)
  async getFileUrl(fileId: string): Promise<string | null> {
    try {
      const file = await ClientFileService.serveFile(fileId);
      if (file) {
        return ClientFileService.createFileURL(file);
      }
      return null;
    } catch (error) {
      console.error('Error getting file URL:', error);
      return null;
    }
  }
}

export const apiService = new ApiService();
