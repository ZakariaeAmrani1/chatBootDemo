export interface User {
  id: string;
  displayName: string;
  email: string;
  bio: string;
  avatar?: string;
  createdAt: string;
  settings: UserSettings;
  passwordHash?: string; // Only used server-side
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  displayName: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: Omit<User, "passwordHash">; // Don't expose password hash
  token: string;
}

export interface UserSettings {
  theme: "light" | "dark" | "system";
  fontSize: "small" | "medium" | "large" | "extra-large";
  density: "compact" | "comfortable" | "spacious";
  emailNotifications: boolean;
  pushNotifications: boolean;
  soundEnabled: boolean;
  dataCollection: boolean;
  analytics: boolean;
  shareUsage: boolean;
  autoSave: boolean;
  messageHistory: boolean;
  showTimestamps: boolean;
  enterToSend: boolean;
  language: string;
  region: string;
  voiceEnabled: boolean;
  voiceModel: string;
  speechRate: number[];
  highContrast: boolean;
  reducedMotion: boolean;
  screenReader: boolean;
  grokApiKey?: string;
  appUrl?: string;
}

export interface Message {
  id: string;
  chatId: string;
  type: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  attachments?: FileAttachment[];
  isThinking?: boolean;
  liked?: boolean;
  disliked?: boolean;
}

export interface Chat {
  id: string;
  title: string;
  model: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  userId: string;
}

export interface FileAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: string;
}

export interface CreateChatRequest {
  title?: string;
  model: string;
  message?: string;
  attachments?: File[];
}

export interface SendMessageRequest {
  chatId: string;
  message: string;
  attachments?: File[];
}

export interface MessageFeedbackRequest {
  messageId: string;
  action: "like" | "dislike" | "removelike" | "removedislike";
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface ChatModel {
  id: string;
  name: string;
  description: string;
  category: "general" | "creative" | "code" | "analysis";
  isAvailable: boolean;
}

export interface FileSize {
  name: string;
  size: number;
  sizeFormatted: string;
}

export interface DataStats {
  chatHistory: FileSize;
  userSettings: FileSize;
  uploadedFiles: FileSize;
  totalSize: number;
  totalSizeFormatted: string;
}
