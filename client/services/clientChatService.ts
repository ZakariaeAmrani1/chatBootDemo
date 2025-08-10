import {
  Chat,
  Message,
  CreateChatRequest,
  SendMessageRequest,
  ApiResponse,
  FileAttachment,
} from "@shared/types";
import { StorageManager } from "./storageManager";
import { v4 as uuidv4 } from "uuid";

export class ClientChatService {
  static async getChats(userId: string): Promise<ApiResponse<Chat[]>> {
    try {
      const chats = StorageManager.getChatsByUserId(userId);

      // Sort by updatedAt descending
      const sortedChats = chats.sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      );

      return {
        success: true,
        data: sortedChats,
      };
    } catch (error) {
      console.error("Error getting chats:", error);
      return {
        success: false,
        error: "Failed to get chats",
      };
    }
  }

  static async getChatMessages(
    chatId: string,
  ): Promise<ApiResponse<Message[]>> {
    try {
      const messages = StorageManager.getMessagesByChatId(chatId);

      // Sort by timestamp ascending
      const sortedMessages = messages.sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
      );

      return {
        success: true,
        data: sortedMessages,
      };
    } catch (error) {
      console.error("Error getting chat messages:", error);
      return {
        success: false,
        error: "Failed to get chat messages",
      };
    }
  }

  static async createChat(
    chatData: CreateChatRequest,
    userId: string,
    file?: File,
  ): Promise<ApiResponse<Chat>> {
    try {
      const chatId = uuidv4();
      const now = new Date().toISOString();

      let pdfFile: FileAttachment | undefined;
      let csvFile: FileAttachment | undefined;

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

        // Create proper blob URL for the file
        const blobUrl = URL.createObjectURL(file);
        fileAttachment.url = blobUrl;

        StorageManager.createFileAttachment(fileAttachment);

        // Determine file type and assign to appropriate property
        if (file.type === "text/csv" || file.type === "application/csv" || file.name.toLowerCase().endsWith('.csv')) {
          csvFile = fileAttachment;
        } else {
          pdfFile = fileAttachment;
        }
      }

      const newChat: Chat = {
        id: chatId,
        title: chatData.title,
        model: chatData.model,
        chatbootVersion: "ChatNova V3",
        createdAt: now,
        updatedAt: now,
        messageCount: 0,
        userId: userId,
        ...(pdfFile && { pdfFile }),
        ...(csvFile && { csvFile }),
      };

      const savedChat = StorageManager.createChat(newChat);

      return {
        success: true,
        data: savedChat,
      };
    } catch (error) {
      console.error("Error creating chat:", error);
      return {
        success: false,
        error: "Failed to create chat",
      };
    }
  }

  static async updateChat(
    chatId: string,
    updates: Partial<Chat>,
  ): Promise<ApiResponse<Chat>> {
    try {
      const updatedChat = StorageManager.updateChat(chatId, {
        ...updates,
        updatedAt: new Date().toISOString(),
      });

      if (!updatedChat) {
        return {
          success: false,
          error: "Chat not found",
        };
      }

      return {
        success: true,
        data: updatedChat,
      };
    } catch (error) {
      console.error("Error updating chat:", error);
      return {
        success: false,
        error: "Failed to update chat",
      };
    }
  }

  static async deleteChat(
    chatId: string,
  ): Promise<ApiResponse<{ success: boolean }>> {
    try {
      const deleted = StorageManager.deleteChat(chatId);

      if (!deleted) {
        return {
          success: false,
          error: "Chat not found",
        };
      }

      return {
        success: true,
        data: { success: true },
      };
    } catch (error) {
      console.error("Error deleting chat:", error);
      return {
        success: false,
        error: "Failed to delete chat",
      };
    }
  }

  static async addUserMessage(
    chatId: string,
    content: string,
    attachments?: FileAttachment[],
  ): Promise<ApiResponse<Message>> {
    try {
      const messageId = uuidv4();
      const now = new Date().toISOString();

      const message: Message = {
        id: messageId,
        chatId: chatId,
        type: "user",
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
      console.error("Error adding user message:", error);
      return {
        success: false,
        error: "Failed to add user message",
      };
    }
  }

  static async addAssistantMessage(
    chatId: string,
    content: string,
  ): Promise<ApiResponse<Message>> {
    try {
      const messageId = uuidv4();
      const now = new Date().toISOString();

      const message: Message = {
        id: messageId,
        chatId: chatId,
        type: "assistant",
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
      console.error("Error adding assistant message:", error);
      return {
        success: false,
        error: "Failed to add assistant message",
      };
    }
  }

  static async sendMessage(
    messageData: SendMessageRequest,
  ): Promise<ApiResponse<Message>> {
    try {
      // Ensure message is a string
      const messageContent = messageData.message || "";

      // Add the user message first
      const userMessageResult = await this.addUserMessage(
        messageData.chatId,
        messageContent,
        messageData.attachments,
      );

      if (!userMessageResult.success) {
        return userMessageResult;
      }

      // Get AI response
      let assistantResponse =
        "I apologize, but I couldn't generate a response. Please try again.";

      try {
        // Import here to avoid circular dependencies
        const { ClientGeminiService } = await import("./clientGeminiService");
        const { StorageManager } = await import("./storageManager");

        // Get user settings for model selection
        const currentUser = StorageManager.getCurrentUser();
        const selectedModel = currentUser?.settings?.selectedModel || "cloud";
        const geminiApiKey =
          currentUser?.settings?.geminiApiKey ||
          "AIzaSyDxnf409EQ6bxYQiwJlxh2pEi8osHrpV-A";

        // Check if this is a file upload message
        const hasAttachments =
          messageData.attachments && messageData.attachments.length > 0;
        const isFileUploadMessage =
          hasAttachments ||
          messageContent.includes("Uploaded") ||
          messageContent.includes("file") ||
          messageContent.includes(".pdf") ||
          messageContent.includes(".csv") ||
          messageContent.includes(".doc");

        if (selectedModel === "cloud" || selectedModel === "local-cloud" || selectedModel === "csv-local") {
          // Check if Gemini API key is available
          if (!geminiApiKey || !geminiApiKey.trim()) {
            if (isFileUploadMessage) {
              assistantResponse = `I can see you've uploaded a file, but I need a Gemini API key to analyze it.

**Please note**: Due to browser security restrictions (CORS), direct API calls to Gemini may not work in all environments. If you encounter connection issues after adding your API key, try copying and pasting the file content directly instead.

Add your API key in Settings - you can get one from [Google AI Studio](https://aistudio.google.com/app/apikey).`;
            } else {
              assistantResponse = `To use AI responses, please add your Gemini API key in Settings. You can get your API key from [Google AI Studio](https://aistudio.google.com/app/apikey).

**Note**: Direct browser API calls may be limited due to CORS restrictions in some environments.`;
            }
          } else {
            // Use Gemini API
            const geminiModel =
              currentUser?.settings?.geminiModel || "gemini-1.5-flash-latest";

            console.log(`🤖 Using Gemini model: ${geminiModel}`);

            // Prepare context with chat history
            const chatMessages = StorageManager.getMessagesByChatId(
              messageData.chatId,
            );
            const recentMessages = chatMessages
              .slice(-10) // Last 10 messages for context
              .map(
                (msg) =>
                  `${msg.type === "user" ? "User" : "Assistant"}: ${msg.content}`,
              )
              .join("\n");

            let prompt = messageContent || "Hello";

            // Handle file uploads with better prompting
            if (hasAttachments) {
              const fileNames = messageData.attachments
                .map((att) => att.name)
                .join(", ");
              const fileTypes = messageData.attachments
                .map((att) => att.type)
                .join(", ");

              // Check if any attachments are PDFs
              const pdfAttachments = messageData.attachments.filter(
                (att) => att.type === "application/pdf",
              );

              if (pdfAttachments.length > 0) {
                prompt = `I have uploaded ${messageData.attachments.length} file(s): ${fileNames} (${fileTypes}).

I can see that you've uploaded PDF file(s). However, I cannot directly read PDF files through file attachments in this interface.

To analyze your PDF content, you have a few options:
1. Use the "local-cloud" model which can extract and analyze PDF text content
2. Copy and paste the text content from your PDF into this chat
3. Provide specific questions about the document and I'll guide you on how to extract the relevant information

What would you like me to help you with regarding these files? Original message: ${messageContent}`;
              } else {
                prompt = `I have uploaded ${messageData.attachments.length} file(s): ${fileNames} (${fileTypes}). Please analyze the content and provide insights about what the file contains and how I can work with it. Original message: ${messageContent}`;
              }
            }

            const contextPrompt = recentMessages
              ? `Previous conversation:\n${recentMessages}\n\nUser: ${prompt}\n\nAssistant:`
              : prompt;

            const geminiResult = await ClientGeminiService.generateContent(
              contextPrompt,
              geminiModel,
            );

            if (geminiResult.content && !geminiResult.error) {
              assistantResponse = geminiResult.content;
            } else if (geminiResult.error) {
              if (geminiResult.error.includes("CORS")) {
                assistantResponse = `⚠️ **API Connection Issue**: Direct browser connections to Gemini API are blocked due to CORS restrictions.

**Alternative solutions:**
1. **Use a browser extension** that disables CORS (for development only)
2. **Copy/paste content**: Instead of uploading files, copy and paste the text content directly into this chat
3. **Server integration**: Ask your administrator to set up a server-side proxy for Gemini API calls

**For now, you can still chat with me by typing your questions directly!**`;
              } else if (isFileUploadMessage) {
                assistantResponse = `I can see you've uploaded a file, but I encountered an error analyzing it: ${geminiResult.error}. Please try uploading the file again or check your API key.`;
              } else {
                assistantResponse = `Error: ${geminiResult.error}`;
              }
            }
          }
        } else {
          // For other models, provide a helpful message
          if (isFileUploadMessage) {
            assistantResponse = `I can see you've uploaded a file, but the ${selectedModel} model requires server integration. Please configure Gemini API in your settings to analyze files, or contact your administrator to set up the ${selectedModel} integration.`;
          } else {
            assistantResponse = `I'm currently configured to use ${selectedModel}, but this requires server integration. Please configure Gemini API in your settings to get AI responses, or contact your administrator to set up the ${selectedModel} integration.`;
          }
        }
      } catch (aiError) {
        console.error("AI service error:", aiError);
        if (messageData.attachments && messageData.attachments.length > 0) {
          assistantResponse =
            "I encountered an error while analyzing your file. Please try again or check your settings.";
        } else {
          assistantResponse =
            "I encountered an error while generating a response. Please try again.";
        }
      }

      const assistantMessageResult = await this.addAssistantMessage(
        messageData.chatId,
        assistantResponse,
      );

      return assistantMessageResult;
    } catch (error) {
      console.error("Error sending message:", error);
      return {
        success: false,
        error: "Failed to send message",
      };
    }
  }

  static async updateChatCategory(
    chatId: string,
    categoryId: string,
  ): Promise<ApiResponse<Chat>> {
    try {
      const updatedChat = StorageManager.updateChat(chatId, {
        categoryId: categoryId,
        updatedAt: new Date().toISOString(),
      });

      if (!updatedChat) {
        return {
          success: false,
          error: "Chat not found",
        };
      }

      return {
        success: true,
        data: updatedChat,
      };
    } catch (error) {
      console.error("Error updating chat category:", error);
      return {
        success: false,
        error: "Failed to update chat category",
      };
    }
  }

  static async getFileContent(fileId: string): Promise<Blob | null> {
    try {
      return await StorageManager.getFile(fileId);
    } catch (error) {
      console.error("Error getting file content:", error);
      return null;
    }
  }

  static createFileURL(file: Blob, fileId: string): string {
    return URL.createObjectURL(file);
  }
}
