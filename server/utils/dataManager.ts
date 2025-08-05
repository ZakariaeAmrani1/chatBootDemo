import fs from "fs";
import path from "path";
import { User, Chat, Message, FileAttachment, Category, CreateCategoryRequest } from "@shared/types";

const DATA_DIR = path.join(process.cwd(), "server/data");

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export class DataManager {
  private static readJsonFile<T>(filename: string): T {
    const filePath = path.join(DATA_DIR, filename);

    if (!fs.existsSync(filePath)) {
      throw new Error(`File ${filename} not found`);
    }

    const data = fs.readFileSync(filePath, "utf8");
    return JSON.parse(data);
  }

  private static writeJsonFile<T>(filename: string, data: T): void {
    const filePath = path.join(DATA_DIR, filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  }

  // User operations
  static getUsers(): User[] {
    const data = this.readJsonFile<{ users: User[] }>("users.json");
    return data.users;
  }

  static getAllUsers(): User[] {
    return this.getUsers();
  }

  static getUserById(id: string): User | null {
    const users = this.getUsers();
    return users.find((user) => user.id === id) || null;
  }

  static createUser(user: User): User {
    const data = this.readJsonFile<{ users: User[] }>("users.json");
    data.users.push(user);
    this.writeJsonFile("users.json", data);
    return user;
  }

  static updateUser(id: string, updates: Partial<User>): User | null {
    const data = this.readJsonFile<{ users: User[] }>("users.json");
    const userIndex = data.users.findIndex((user) => user.id === id);

    if (userIndex === -1) return null;

    data.users[userIndex] = { ...data.users[userIndex], ...updates };
    this.writeJsonFile("users.json", data);
    return data.users[userIndex];
  }

  // Chat operations
  static getChats(): Chat[] {
    const data = this.readJsonFile<{ chats: Chat[]; messages: Message[] }>(
      "chats.json",
    );
    return data.chats;
  }

  static getChatsByUserId(userId: string): Chat[] {
    const chats = this.getChats();
    return chats.filter((chat) => chat.userId === userId);
  }

  static getChatById(id: string): Chat | null {
    const chats = this.getChats();
    return chats.find((chat) => chat.id === id) || null;
  }

  static createChat(chat: Chat): Chat {
    const data = this.readJsonFile<{ chats: Chat[]; messages: Message[] }>(
      "chats.json",
    );
    data.chats.push(chat);
    this.writeJsonFile("chats.json", data);
    return chat;
  }

  static updateChat(id: string, updates: Partial<Chat>): Chat | null {
    const data = this.readJsonFile<{ chats: Chat[]; messages: Message[] }>(
      "chats.json",
    );
    const chatIndex = data.chats.findIndex((chat) => chat.id === id);

    if (chatIndex === -1) return null;

    data.chats[chatIndex] = { ...data.chats[chatIndex], ...updates };
    this.writeJsonFile("chats.json", data);
    return data.chats[chatIndex];
  }

  static deleteChat(id: string): boolean {
    const data = this.readJsonFile<{ chats: Chat[]; messages: Message[] }>(
      "chats.json",
    );
    const chatIndex = data.chats.findIndex((chat) => chat.id === id);

    if (chatIndex === -1) return false;

    const chat = data.chats[chatIndex];

    // Delete associated PDF file if it exists
    if (chat.pdfFile) {
      try {
        // Extract filename from URL (e.g., "/api/files/filename.pdf" -> "filename.pdf")
        const filename = chat.pdfFile.url.split("/").pop();
        if (filename) {
          const filePath = path.join(process.cwd(), "server/uploads", filename);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        }

        // Also remove from files.json
        const filesData = this.readJsonFile<{ files: FileAttachment[] }>(
          "files.json",
        );
        filesData.files = filesData.files.filter(
          (file) => file.id !== chat.pdfFile?.id,
        );
        this.writeJsonFile("files.json", filesData);
      } catch (error) {
        console.error("Failed to delete PDF file:", error);
        // Continue with chat deletion even if file deletion fails
      }
    }

    // Remove chat and all its messages
    data.chats.splice(chatIndex, 1);
    data.messages = data.messages.filter((message) => message.chatId !== id);

    // Also clean up any remaining references to the deleted file in other messages
    if (chat.pdfFile) {
      data.messages = data.messages.map((message) => {
        if (message.attachments) {
          message.attachments = message.attachments.filter(
            (attachment) => attachment.id !== chat.pdfFile?.id,
          );
          if (message.attachments.length === 0) {
            delete message.attachments;
          }
        }
        return message;
      });
    }

    this.writeJsonFile("chats.json", data);
    return true;
  }

  // Message operations
  static getMessages(): Message[] {
    const data = this.readJsonFile<{ chats: Chat[]; messages: Message[] }>(
      "chats.json",
    );
    return data.messages;
  }

  static getMessagesByChatId(chatId: string): Message[] {
    const messages = this.getMessages();
    return messages.filter((message) => message.chatId === chatId);
  }

  static addMessage(message: Message): Message {
    const data = this.readJsonFile<{ chats: Chat[]; messages: Message[] }>(
      "chats.json",
    );
    data.messages.push(message);

    // Update chat's message count and updatedAt
    const chatIndex = data.chats.findIndex(
      (chat) => chat.id === message.chatId,
    );
    if (chatIndex !== -1) {
      data.chats[chatIndex].messageCount = data.messages.filter(
        (m) => m.chatId === message.chatId,
      ).length;
      data.chats[chatIndex].updatedAt = message.timestamp;
    }

    this.writeJsonFile("chats.json", data);
    return message;
  }

  static updateMessage(id: string, updates: Partial<Message>): Message | null {
    const data = this.readJsonFile<{ chats: Chat[]; messages: Message[] }>(
      "chats.json",
    );
    const messageIndex = data.messages.findIndex(
      (message) => message.id === id,
    );

    if (messageIndex === -1) return null;

    data.messages[messageIndex] = {
      ...data.messages[messageIndex],
      ...updates,
    };
    this.writeJsonFile("chats.json", data);
    return data.messages[messageIndex];
  }

  // File operations
  static getFiles(): FileAttachment[] {
    const data = this.readJsonFile<{ files: FileAttachment[] }>("files.json");
    return data.files;
  }

  static addFile(file: FileAttachment): FileAttachment {
    const data = this.readJsonFile<{ files: FileAttachment[] }>("files.json");
    data.files.push(file);
    this.writeJsonFile("files.json", data);
    return file;
  }

  static getFileById(id: string): FileAttachment | null {
    const files = this.getFiles();
    return files.find((file) => file.id === id) || null;
  }

  // Category operations
  getCategories(): Category[] {
    try {
      const data = DataManager.readJsonFile<{ categories: Category[] }>("categories.json");
      return data.categories;
    } catch (error) {
      // If file doesn't exist, return empty array
      return [];
    }
  }

  getCategoriesByUserId(userId: string): Category[] {
    const categories = this.getCategories();
    return categories.filter((category) => category.userId === userId);
  }

  getCategoryById(id: string): Category | null {
    const categories = this.getCategories();
    return categories.find((category) => category.id === id) || null;
  }

  createCategory(request: CreateCategoryRequest & { userId: string; isDefault?: boolean }): Category {
    let data;
    try {
      data = DataManager.readJsonFile<{ categories: Category[] }>("categories.json");
    } catch (error) {
      // If file doesn't exist, create it
      data = { categories: [] };
    }

    const category: Category = {
      id: request.isDefault ?
        `default-general-${request.userId}` :
        `cat_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      name: request.name,
      color: request.color,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: request.userId,
      isDefault: request.isDefault || false,
    };

    data.categories.push(category);
    DataManager.writeJsonFile("categories.json", data);
    return category;
  }

  updateCategory(id: string, updates: Partial<Category>, userId: string): Category | null {
    let data;
    try {
      data = DataManager.readJsonFile<{ categories: Category[] }>("categories.json");
    } catch (error) {
      return null;
    }

    const categoryIndex = data.categories.findIndex(
      (category) => category.id === id && category.userId === userId
    );

    if (categoryIndex === -1) return null;

    // Don't allow updating default categories name
    if (data.categories[categoryIndex].isDefault && updates.name) {
      delete updates.name;
    }

    data.categories[categoryIndex] = {
      ...data.categories[categoryIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    DataManager.writeJsonFile("categories.json", data);
    return data.categories[categoryIndex];
  }

  deleteCategory(id: string, userId: string): boolean {
    let data;
    try {
      data = DataManager.readJsonFile<{ categories: Category[] }>("categories.json");
    } catch (error) {
      return false;
    }

    const categoryIndex = data.categories.findIndex(
      (category) => category.id === id && category.userId === userId
    );

    if (categoryIndex === -1) return false;

    // Don't allow deleting default categories
    if (data.categories[categoryIndex].isDefault) {
      return false;
    }

    // Remove category from all chats before deleting
    this.removeCategoryFromChats(id);

    data.categories.splice(categoryIndex, 1);
    DataManager.writeJsonFile("categories.json", data);
    return true;
  }

  updateChatCategory(chatId: string, categoryId: string | null, userId: string): Chat | null {
    const data = DataManager.readJsonFile<{ chats: Chat[]; messages: Message[] }>("chats.json");
    const chatIndex = data.chats.findIndex(
      (chat) => chat.id === chatId && chat.userId === userId
    );

    if (chatIndex === -1) return null;

    data.chats[chatIndex] = {
      ...data.chats[chatIndex],
      categoryId: categoryId || undefined,
      updatedAt: new Date().toISOString(),
    };

    DataManager.writeJsonFile("chats.json", data);
    return data.chats[chatIndex];
  }

  private removeCategoryFromChats(categoryId: string): void {
    try {
      const data = DataManager.readJsonFile<{ chats: Chat[]; messages: Message[] }>("chats.json");

      data.chats = data.chats.map((chat) => {
        if (chat.categoryId === categoryId) {
          const { categoryId: _, ...chatWithoutCategory } = chat;
          return chatWithoutCategory;
        }
        return chat;
      });

      DataManager.writeJsonFile("chats.json", data);
    } catch (error) {
      console.error("Error removing category from chats:", error);
    }
  }

  // Create default category for a user if it doesn't exist
  ensureDefaultCategory(userId: string): Category {
    const categories = this.getCategoriesByUserId(userId);
    const defaultCategory = categories.find(cat => cat.isDefault);

    if (defaultCategory) {
      return defaultCategory;
    }

    // Create default category with isDefault flag
    return this.createCategory({
      name: "General",
      userId,
      isDefault: true,
    });
  }
}
