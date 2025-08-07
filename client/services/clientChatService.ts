import { Chat, Message, CreateChatRequest, SendMessageRequest, ApiResponse, FileAttachment } from '@shared/types';
import { StorageManager } from './storageManager';
import { v4 as uuidv4 } from 'uuid';

export class ClientChatService {
  static async getChats(userId: string): Promise<ApiResponse<Chat[]>> {
    try {
      const chats = StorageManager.getChatsByUserId(userId);
      
      // Sort by updatedAt descending
      const sortedChats = chats.sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );

      return {
        success: true,
        data: sortedChats,
      };
    } catch (error) {
      console.error('Error getting chats:', error);
      return {
        success: false,
        error: 'Failed to get chats',
      };
    }
  }

  static async getChatMessages(chatId: string): Promise<ApiResponse<Message[]>> {
    try {
      const messages = StorageManager.getMessagesByChatId(chatId);
      
      // Sort by timestamp ascending
      const sortedMessages = messages.sort((a, b) => 
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );

      return {
        success: true,
        data: sortedMessages,
      };
    } catch (error) {
      console.error('Error getting chat messages:', error);
      return {
        success: false,
        error: 'Failed to get chat messages',
      };
    }
  }

  static async createChat(
    chatData: CreateChatRequest,
    userId: string,
    file?: File
  ): Promise<ApiResponse<Chat>> {
    try {
      const chatId = uuidv4();
      const now = new Date().toISOString();

      let pdfFile: FileAttachment | undefined;

      // Handle file upload if provided
      if (file) {
        const fileId = uuidv4();
        const fileAttachment: FileAttachment = {
          id: fileId,
          name: file.name,
          size: file.size,
          type: file.type,
          url: `blob:${fileId}`, // We'll use blob URLs for client-side files
          uploadedAt: now,
        };

        // Store file in IndexedDB
        await StorageManager.saveFile(fileId, file);
        StorageManager.createFileAttachment(fileAttachment);
        
        pdfFile = fileAttachment;
      }

      const newChat: Chat = {
        id: chatId,
        title: chatData.title,
        model: chatData.model,
        chatbootVersion: 'ChatNova V3',
        createdAt: now,
        updatedAt: now,
        messageCount: 0,
        userId: userId,
        ...(pdfFile && { pdfFile }),
      };

      const savedChat = StorageManager.createChat(newChat);

      return {
        success: true,
        data: savedChat,
      };
    } catch (error) {
      console.error('Error creating chat:', error);
      return {
        success: false,
        error: 'Failed to create chat',
      };
    }
  }

  static async updateChat(chatId: string, updates: Partial<Chat>): Promise<ApiResponse<Chat>> {
    try {
      const updatedChat = StorageManager.updateChat(chatId, {
        ...updates,
        updatedAt: new Date().toISOString(),
      });

      if (!updatedChat) {
        return {
          success: false,
          error: 'Chat not found',
        };
      }

      return {
        success: true,
        data: updatedChat,
      };
    } catch (error) {
      console.error('Error updating chat:', error);
      return {
        success: false,
        error: 'Failed to update chat',
      };
    }
  }

  static async deleteChat(chatId: string): Promise<ApiResponse<{ success: boolean }>> {
    try {
      const deleted = StorageManager.deleteChat(chatId);

      if (!deleted) {
        return {
          success: false,
          error: 'Chat not found',
        };
      }

      return {
        success: true,
        data: { success: true },
      };
    } catch (error) {
      console.error('Error deleting chat:', error);
      return {
        success: false,
        error: 'Failed to delete chat',
      };
    }
  }

  static async addUserMessage(
    chatId: string,
    content: string,
    attachments?: FileAttachment[]
  ): Promise<ApiResponse<Message>> {
    try {
      const messageId = uuidv4();
      const now = new Date().toISOString();

      const message: Message = {
        id: messageId,
        chatId: chatId,
        type: 'user',
        content: content,
        timestamp: now,
        ...(attachments && { attachments }),
      };

      const savedMessage = StorageManager.addMessage(message);

      // Update chat message count and timestamp
      const chat = StorageManager.getChatById(chatId);
      if (chat) {
        StorageManager.updateChat(chatId, {
          messageCount: chat.messageCount + 1,
          updatedAt: now,
        });
      }

      return {
        success: true,
        data: savedMessage,
      };
    } catch (error) {
      console.error('Error adding user message:', error);
      return {
        success: false,
        error: 'Failed to add user message',
      };
    }
  }

  static async addAssistantMessage(
    chatId: string,
    content: string
  ): Promise<ApiResponse<Message>> {
    try {
      const messageId = uuidv4();
      const now = new Date().toISOString();

      const message: Message = {
        id: messageId,
        chatId: chatId,
        type: 'assistant',
        content: content,
        timestamp: now,
      };

      const savedMessage = StorageManager.addMessage(message);

      // Update chat message count and timestamp
      const chat = StorageManager.getChatById(chatId);
      if (chat) {
        StorageManager.updateChat(chatId, {
          messageCount: chat.messageCount + 1,
          updatedAt: now,
        });
      }

      return {
        success: true,
        data: savedMessage,
      };
    } catch (error) {
      console.error('Error adding assistant message:', error);
      return {
        success: false,
        error: 'Failed to add assistant message',
      };
    }
  }

  static async sendMessage(messageData: SendMessageRequest): Promise<ApiResponse<Message>> {
    try {
      // Add the user message first
      const userMessageResult = await this.addUserMessage(
        messageData.chatId,
        messageData.content,
        messageData.attachments
      );

      if (!userMessageResult.success) {
        return userMessageResult;
      }

      // Get AI response
      let assistantResponse = "I apologize, but I couldn't generate a response. Please try again.";

      try {
        // Import here to avoid circular dependencies
        const { ClientGeminiService } = await import('./clientGeminiService');
        const { StorageManager } = await import('./storageManager');

        // Get user settings for model selection
        const currentUser = StorageManager.getCurrentUser();
        const selectedModel = currentUser?.settings?.selectedModel || 'cloud';

        if (selectedModel === 'cloud' || selectedModel === 'local-cloud') {
          // Use Gemini API
          const geminiModel = currentUser?.settings?.geminiModel || 'gemini-1.5-flash-latest';

          // Prepare context with chat history
          const chatMessages = StorageManager.getMessagesByChatId(messageData.chatId);
          const recentMessages = chatMessages
            .slice(-10) // Last 10 messages for context
            .map(msg => `${msg.type === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
            .join('\n');

          const contextPrompt = recentMessages
            ? `Previous conversation:\n${recentMessages}\n\nUser: ${messageData.content}\n\nAssistant:`
            : messageData.content;

          const geminiResult = await ClientGeminiService.generateContent(
            contextPrompt,
            geminiModel
          );

          if (geminiResult.content && !geminiResult.error) {
            assistantResponse = geminiResult.content;
          } else if (geminiResult.error) {
            assistantResponse = `Error: ${geminiResult.error}`;
          }
        } else {
          // For other models, provide a helpful message
          assistantResponse = `I'm currently configured to use ${selectedModel}, but this requires server integration. Please configure Gemini API in your settings to get AI responses, or contact your administrator to set up the ${selectedModel} integration.`;
        }
      } catch (aiError) {
        console.error('AI service error:', aiError);
        assistantResponse = "I encountered an error while generating a response. Please try again.";
      }

      const assistantMessageResult = await this.addAssistantMessage(
        messageData.chatId,
        assistantResponse
      );

      return assistantMessageResult;
    } catch (error) {
      console.error('Error sending message:', error);
      return {
        success: false,
        error: 'Failed to send message',
      };
    }
  }

  static async updateChatCategory(chatId: string, categoryId: string): Promise<ApiResponse<Chat>> {
    try {
      const updatedChat = StorageManager.updateChat(chatId, {
        categoryId: categoryId,
        updatedAt: new Date().toISOString(),
      });

      if (!updatedChat) {
        return {
          success: false,
          error: 'Chat not found',
        };
      }

      return {
        success: true,
        data: updatedChat,
      };
    } catch (error) {
      console.error('Error updating chat category:', error);
      return {
        success: false,
        error: 'Failed to update chat category',
      };
    }
  }

  static async getFileContent(fileId: string): Promise<Blob | null> {
    try {
      return await StorageManager.getFile(fileId);
    } catch (error) {
      console.error('Error getting file content:', error);
      return null;
    }
  }

  static createFileURL(file: Blob, fileId: string): string {
    return URL.createObjectURL(file);
  }
}
