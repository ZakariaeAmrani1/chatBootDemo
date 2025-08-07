import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import {
  getChats,
  getChatMessages,
  createChat,
  sendMessage,
  updateChat,
  deleteChat,
  uploadFile,
  addAssistantMessage,
  addUserMessage,
} from "./routes/chats";
import {
  getCurrentUser,
  updateUser,
  updateUserSettings,
  uploadAvatar,
  uploadLightLogo,
  uploadDarkLogo,
} from "./routes/users";
import {
  uploadFiles,
  serveFile,
  getFileInfo,
  getAllFiles,
} from "./routes/files";
import {
  getDataStats,
  clearChatHistory,
  clearUploadedFiles,
  clearCategories,
} from "./routes/data";
import { resetUserSettings } from "./routes/data-reset";
import { handleMessageFeedback } from "./routes/feedback";
import { getModels, addModel } from "./routes/models";
import { loginUser, registerUser, verifyUserToken } from "./routes/auth";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  updateChatCategory,
} from "./routes/categories";
import { geminiProxy } from "./routes/gemini-proxy";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Debug middleware to log all API requests
  app.use("/api", (req, res, next) => {
    console.log(`🔍 API Request: ${req.method} ${req.path}`);
    next();
  });

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  // Test endpoint for debugging
  app.get("/api/test", (_req, res) => {
    console.log("🧪 Test endpoint called");
    res.json({ success: true, message: "Server is working" });
  });

  app.get("/api/demo", handleDemo);

  // Chat API routes
  app.get("/api/chats", getChats);
  app.get("/api/chats/:chatId/messages", getChatMessages);
  app.post("/api/chats", uploadFile, createChat);
  app.post("/api/chats/message", sendMessage);
  app.post("/api/chats/add-assistant-message", addAssistantMessage);
  app.post("/api/chats/add-user-message", addUserMessage);
  app.put("/api/chats/:chatId", updateChat);
  app.delete("/api/chats/:chatId", deleteChat);

  // User API routes
  app.get("/api/user", getCurrentUser);
  app.put("/api/user/:userId", updateUser);
  app.put("/api/user/:userId/settings", updateUserSettings);
  app.post("/api/user/:userId/avatar", ...uploadAvatar);
  app.post("/api/user/:userId/light-logo", ...uploadLightLogo);
  app.post("/api/user/:userId/dark-logo", ...uploadDarkLogo);

  // File API routes
  app.post("/api/files/upload", ...uploadFiles);
  app.get("/api/files", getAllFiles);
  app.get("/api/files/:filename", serveFile);
  app.get("/api/files/info/:fileId", getFileInfo);

  // Data management API routes
  app.get("/api/data/stats", getDataStats);
  app.post("/api/data/clear-chats", clearChatHistory);
  app.post("/api/data/clear-files", clearUploadedFiles);
  app.post("/api/data/clear-categories", clearCategories);
  app.post("/api/data/reset-settings", resetUserSettings);

  // Feedback API routes
  app.post("/api/messages/feedback", handleMessageFeedback);

  // Models API routes
  app.get("/api/models", getModels);
  app.post("/api/models", addModel);

  // Gemini API proxy route
  app.post("/api/gemini-proxy", geminiProxy);

  // Authentication API routes
  app.post("/api/auth/login", loginUser);
  app.post("/api/auth/register", registerUser);
  app.get("/api/auth/verify", verifyUserToken);

  // Category API routes
  app.get("/api/categories", getCategories);
  app.post("/api/categories", createCategory);
  app.put("/api/categories/:categoryId", updateCategory);
  app.delete("/api/categories/:categoryId", deleteCategory);
  app.put("/api/chats/:chatId/category", updateChatCategory);

  return app;
}
