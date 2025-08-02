import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { getChats, getChatMessages, createChat, sendMessage, deleteChat } from "./routes/chats";
import { getCurrentUser, updateUser, updateUserSettings } from "./routes/users";
import { uploadFiles, serveFile, getFileInfo } from "./routes/files";
import { getDataStats, clearChatHistory, clearUploadedFiles } from "./routes/data";

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
  app.delete("/api/chats/:chatId", deleteChat);

  // User API routes
  app.get("/api/user", getCurrentUser);
  app.put("/api/user/:userId", updateUser);
  app.put("/api/user/:userId/settings", updateUserSettings);

  // File API routes
  app.post("/api/files/upload", ...uploadFiles);
  app.get("/api/files/:filename", serveFile);
  app.get("/api/files/info/:fileId", getFileInfo);

  // Data management API routes
  app.get("/api/data/stats", getDataStats);
  app.post("/api/data/clear-chats", clearChatHistory);
  app.post("/api/data/clear-files", clearUploadedFiles);

  return app;
}
