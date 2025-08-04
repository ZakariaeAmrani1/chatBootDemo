import { RequestHandler } from "express";
import fs from "fs";
import path from "path";
import { ApiResponse } from "@shared/types";

const DATA_DIR = path.join(process.cwd(), "server/data");

// Reset user settings to default values
export const resetUserSettings: RequestHandler = (req, res) => {
  try {
    const usersFilePath = path.join(DATA_DIR, "users.json");

    if (!fs.existsSync(usersFilePath)) {
      const response: ApiResponse<null> = {
        success: false,
        error: "Users file not found",
      };
      return res.status(404).json(response);
    }

    const usersData = JSON.parse(fs.readFileSync(usersFilePath, "utf8"));

    // Reset all users' settings to default values
    const defaultSettings = {
      theme: "light",
      fontSize: "medium",
      density: "comfortable",
      emailNotifications: true,
      pushNotifications: true,
      soundEnabled: true,
      dataCollection: true,
      analytics: false,
      shareUsage: false,
      autoSave: true,
      messageHistory: true,
      showTimestamps: true,
      enterToSend: true,
      language: "english",
      region: "us",
      voiceEnabled: false,
      voiceModel: "natural",
      speechRate: [1],
      highContrast: false,
      reducedMotion: false,
      screenReader: false,
      selectedModel: "cloud",
    };

    usersData.users = usersData.users.map((user: any) => ({
      ...user,
      settings: { ...defaultSettings },
    }));

    fs.writeFileSync(usersFilePath, JSON.stringify(usersData, null, 2));

    const response: ApiResponse<null> = {
      success: true,
    };

    res.json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: "Failed to reset user settings",
    };
    res.status(500).json(response);
  }
};
