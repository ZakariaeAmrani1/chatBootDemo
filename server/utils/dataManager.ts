import fs from "fs";
import path from "path";
import { User, Chat, Message, FileAttachment } from "@shared/types";

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

  static getUserById(id: string): User | null {
    const users = this.getUsers();
    return users.find((user) => user.id === id) || null;
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

    // Remove chat and all its messages
    data.chats.splice(chatIndex, 1);
    data.messages = data.messages.filter((message) => message.chatId !== id);
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
}
