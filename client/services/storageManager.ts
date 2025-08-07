import { User, Chat, Message, Category, FileAttachment } from "@shared/types";

export class StorageManager {
  private static KEYS = {
    USERS: "chatnova_users",
    CHATS: "chatnova_chats",
    MESSAGES: "chatnova_messages",
    CATEGORIES: "chatnova_categories",
    FILES: "chatnova_files",
    CURRENT_USER: "chatnova_current_user",
    AUTH_TOKEN: "chatnova_auth_token",
  };

  // User Management
  static getAllUsers(): User[] {
    const users = localStorage.getItem(this.KEYS.USERS);
    return users ? JSON.parse(users) : [];
  }

  static saveUsers(users: User[]): void {
    localStorage.setItem(this.KEYS.USERS, JSON.stringify(users));
  }

  static getUserById(userId: string): User | null {
    const users = this.getAllUsers();
    return users.find((user) => user.id === userId) || null;
  }

  static createUser(user: User): User {
    const users = this.getAllUsers();
    users.push(user);
    this.saveUsers(users);
    return user;
  }

  static updateUser(userId: string, updates: Partial<User>): User | null {
    const users = this.getAllUsers();
    const userIndex = users.findIndex((user) => user.id === userId);

    if (userIndex === -1) return null;

    users[userIndex] = { ...users[userIndex], ...updates };
    this.saveUsers(users);
    return users[userIndex];
  }

  // Authentication
  static getCurrentUser(): User | null {
    const userData = localStorage.getItem(this.KEYS.CURRENT_USER);
    return userData ? JSON.parse(userData) : null;
  }

  static setCurrentUser(user: User | null): void {
    if (user) {
      localStorage.setItem(this.KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(this.KEYS.CURRENT_USER);
    }
  }

  static getAuthToken(): string | null {
    return localStorage.getItem(this.KEYS.AUTH_TOKEN);
  }

  static setAuthToken(token: string | null): void {
    if (token) {
      localStorage.setItem(this.KEYS.AUTH_TOKEN, token);
    } else {
      localStorage.removeItem(this.KEYS.AUTH_TOKEN);
    }
  }

  // Chat Management
  static getAllChats(): Chat[] {
    const chats = localStorage.getItem(this.KEYS.CHATS);
    return chats ? JSON.parse(chats) : [];
  }

  static saveChats(chats: Chat[]): void {
    localStorage.setItem(this.KEYS.CHATS, JSON.stringify(chats));
  }

  static getChatsByUserId(userId: string): Chat[] {
    const chats = this.getAllChats();
    return chats.filter((chat) => chat.userId === userId);
  }

  static getChatById(chatId: string): Chat | null {
    const chats = this.getAllChats();
    return chats.find((chat) => chat.id === chatId) || null;
  }

  static createChat(chat: Chat): Chat {
    const chats = this.getAllChats();
    chats.push(chat);
    this.saveChats(chats);
    return chat;
  }

  static updateChat(chatId: string, updates: Partial<Chat>): Chat | null {
    const chats = this.getAllChats();
    const chatIndex = chats.findIndex((chat) => chat.id === chatId);

    if (chatIndex === -1) return null;

    chats[chatIndex] = { ...chats[chatIndex], ...updates };
    this.saveChats(chats);
    return chats[chatIndex];
  }

  static deleteChat(chatId: string): boolean {
    const chats = this.getAllChats();
    const filteredChats = chats.filter((chat) => chat.id !== chatId);

    if (filteredChats.length === chats.length) return false;

    this.saveChats(filteredChats);

    // Also delete messages for this chat
    const messages = this.getAllMessages();
    const filteredMessages = messages.filter(
      (message) => message.chatId !== chatId,
    );
    this.saveMessages(filteredMessages);

    return true;
  }

  // Message Management
  static getAllMessages(): Message[] {
    const messages = localStorage.getItem(this.KEYS.MESSAGES);
    return messages ? JSON.parse(messages) : [];
  }

  static saveMessages(messages: Message[]): void {
    localStorage.setItem(this.KEYS.MESSAGES, JSON.stringify(messages));
  }

  static getMessagesByChatId(chatId: string): Message[] {
    const messages = this.getAllMessages();
    return messages.filter((message) => message.chatId === chatId);
  }

  static addMessage(message: Message): Message {
    const messages = this.getAllMessages();
    messages.push(message);
    this.saveMessages(messages);
    return message;
  }

  static updateMessage(
    messageId: string,
    updates: Partial<Message>,
  ): Message | null {
    const messages = this.getAllMessages();
    const messageIndex = messages.findIndex(
      (message) => message.id === messageId,
    );

    if (messageIndex === -1) return null;

    messages[messageIndex] = { ...messages[messageIndex], ...updates };
    this.saveMessages(messages);
    return messages[messageIndex];
  }

  // Category Management
  static getAllCategories(): Category[] {
    const categories = localStorage.getItem(this.KEYS.CATEGORIES);
    return categories ? JSON.parse(categories) : [];
  }

  static saveCategories(categories: Category[]): void {
    localStorage.setItem(this.KEYS.CATEGORIES, JSON.stringify(categories));
  }

  static getCategoriesByUserId(userId: string): Category[] {
    const categories = this.getAllCategories();
    return categories.filter((category) => category.userId === userId);
  }

  static getCategoryById(categoryId: string): Category | null {
    const categories = this.getAllCategories();
    return categories.find((category) => category.id === categoryId) || null;
  }

  static createCategory(category: Category): Category {
    const categories = this.getAllCategories();
    categories.push(category);
    this.saveCategories(categories);
    return category;
  }

  static updateCategory(
    categoryId: string,
    updates: Partial<Category>,
  ): Category | null {
    const categories = this.getAllCategories();
    const categoryIndex = categories.findIndex(
      (category) => category.id === categoryId,
    );

    if (categoryIndex === -1) return null;

    categories[categoryIndex] = { ...categories[categoryIndex], ...updates };
    this.saveCategories(categories);
    return categories[categoryIndex];
  }

  static deleteCategory(categoryId: string): boolean {
    const categories = this.getAllCategories();
    const filteredCategories = categories.filter(
      (category) => category.id !== categoryId,
    );

    if (filteredCategories.length === categories.length) return false;

    this.saveCategories(filteredCategories);
    return true;
  }

  // File Management (using IndexedDB for large files)
  private static fileDB: IDBDatabase | null = null;

  static async initFileDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("ChatNovaFiles", 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.fileDB = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains("files")) {
          db.createObjectStore("files", { keyPath: "id" });
        }
      };
    });
  }

  static async saveFile(fileId: string, fileData: Blob): Promise<void> {
    if (!this.fileDB) await this.initFileDB();

    return new Promise((resolve, reject) => {
      const transaction = this.fileDB!.transaction(["files"], "readwrite");
      const store = transaction.objectStore("files");
      const request = store.put({ id: fileId, data: fileData });

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  static async getFile(fileId: string): Promise<Blob | null> {
    if (!this.fileDB) await this.initFileDB();

    return new Promise((resolve, reject) => {
      const transaction = this.fileDB!.transaction(["files"], "readonly");
      const store = transaction.objectStore("files");
      const request = store.get(fileId);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? result.data : null);
      };
    });
  }

  static async deleteFile(fileId: string): Promise<void> {
    if (!this.fileDB) await this.initFileDB();

    return new Promise((resolve, reject) => {
      const transaction = this.fileDB!.transaction(["files"], "readwrite");
      const store = transaction.objectStore("files");
      const request = store.delete(fileId);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  // File metadata management
  static getAllFileAttachments(): FileAttachment[] {
    const files = localStorage.getItem(this.KEYS.FILES);
    return files ? JSON.parse(files) : [];
  }

  static saveFileAttachments(files: FileAttachment[]): void {
    localStorage.setItem(this.KEYS.FILES, JSON.stringify(files));
  }

  static getFileAttachmentById(fileId: string): FileAttachment | null {
    const files = this.getAllFileAttachments();
    return files.find((file) => file.id === fileId) || null;
  }

  static createFileAttachment(file: FileAttachment): FileAttachment {
    const files = this.getAllFileAttachments();
    files.push(file);
    this.saveFileAttachments(files);
    return file;
  }

  static deleteFileAttachment(fileId: string): boolean {
    const files = this.getAllFileAttachments();
    const filteredFiles = files.filter((file) => file.id !== fileId);

    if (filteredFiles.length === files.length) return false;

    this.saveFileAttachments(filteredFiles);
    return true;
  }

  // Data Management
  static clearAllChats(): void {
    localStorage.removeItem(this.KEYS.CHATS);
    localStorage.removeItem(this.KEYS.MESSAGES);
  }

  static clearAllFiles(): void {
    localStorage.removeItem(this.KEYS.FILES);
    // Clear IndexedDB files
    if (this.fileDB) {
      const transaction = this.fileDB.transaction(["files"], "readwrite");
      const store = transaction.objectStore("files");
      store.clear();
    }
  }

  static clearAllCategories(): void {
    localStorage.removeItem(this.KEYS.CATEGORIES);
  }

  static getDataStats(): {
    totalChats: number;
    totalMessages: number;
    totalFiles: number;
    totalCategories: number;
    totalUsers: number;
  } {
    return {
      totalChats: this.getAllChats().length,
      totalMessages: this.getAllMessages().length,
      totalFiles: this.getAllFileAttachments().length,
      totalCategories: this.getAllCategories().length,
      totalUsers: this.getAllUsers().length,
    };
  }

  // Initialize default data
  static initializeDefaultData(): void {
    // Initialize file database
    this.initFileDB();

    // Create default users if none exist
    const users = this.getAllUsers();
    if (users.length === 0) {
      // No default users - they will be created through registration
    }

    // Create default categories for current user if none exist
    const currentUser = this.getCurrentUser();
    if (currentUser) {
      const categories = this.getCategoriesByUserId(currentUser.id);
      if (categories.length === 0) {
        const defaultCategory: Category = {
          id: `default-general-${currentUser.id}`,
          name: "General",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          userId: currentUser.id,
          isDefault: true,
        };
        this.createCategory(defaultCategory);
      }
    }
  }
}
