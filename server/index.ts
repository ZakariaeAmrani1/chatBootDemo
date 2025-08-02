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
} from "./routes/chats";
import {
  getCurrentUser,
  updateUser,
  updateUserSettings,
  uploadAvatar,
  uploadLightLogo,
  uploadDarkLogo,
} from "./routes/users";
import { uploadFiles, serveFile, getFileInfo } from "./routes/files";
import {
  getDataStats,
  clearChatHistory,
  clearUploadedFiles,
} from "./routes/data";
import { handleMessageFeedback } from "./routes/feedback";
import { getModels, addModel } from "./routes/models";
import { loginUser, registerUser, verifyUserToken } from "./routes/auth";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Chat API routes
  app.get("/api/chats", getChats);
  app.get("/api/chats/:chatId/messages", getChatMessages);
  app.post("/api/chats", createChat);
  app.post("/api/chats/message", sendMessage);
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
  app.get("/api/files/:filename", serveFile);
  app.get("/api/files/info/:fileId", getFileInfo);

  // Data management API routes
  app.get("/api/data/stats", getDataStats);
  app.post("/api/data/clear-chats", clearChatHistory);
  app.post("/api/data/clear-files", clearUploadedFiles);

  // Feedback API routes
  app.post("/api/messages/feedback", handleMessageFeedback);

  // Models API routes
  app.get("/api/models", getModels);
  app.post("/api/models", addModel);

  // Authentication API routes
  app.post("/api/auth/login", loginUser);
  app.post("/api/auth/register", registerUser);
  app.get("/api/auth/verify", verifyUserToken);

  return app;
}
