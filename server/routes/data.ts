import { RequestHandler } from "express";
import fs from "fs";
import path from "path";
import { ApiResponse } from "@shared/types";

const DATA_DIR = path.join(process.cwd(), "server/data");

interface FileSize {
  name: string;
  size: number;
  sizeFormatted: string;
}

interface DataStats {
  chatHistory: FileSize;
  userSettings: FileSize;
  uploadedFiles: FileSize;
  categories: FileSize;
  totalSize: number;
  totalSizeFormatted: string;
}

// Helper function to format file size
function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

// Helper function to get file size
function getFileSize(filename: string): number {
  const filePath = path.join(DATA_DIR, filename);
  try {
    const stats = fs.statSync(filePath);
    return stats.size;
  } catch (error) {
    return 0;
  }
}

// Get data storage statistics
export const getDataStats: RequestHandler = (req, res) => {
  try {
    const chatHistorySize = getFileSize("chats.json");
    const userSettingsSize = getFileSize("users.json");
    const uploadedFilesSize = getFileSize("files.json");
    const categoriesSize = getFileSize("categories.json");
    const totalSize = chatHistorySize + userSettingsSize + uploadedFilesSize + categoriesSize;

    const stats: DataStats = {
      chatHistory: {
        name: "Chat History",
        size: chatHistorySize,
        sizeFormatted: formatFileSize(chatHistorySize),
      },
      userSettings: {
        name: "User Settings",
        size: userSettingsSize,
        sizeFormatted: formatFileSize(userSettingsSize),
      },
      uploadedFiles: {
        name: "File Metadata",
        size: uploadedFilesSize,
        sizeFormatted: formatFileSize(uploadedFilesSize),
      },
      categories: {
        name: "Categories",
        size: categoriesSize,
        sizeFormatted: formatFileSize(categoriesSize),
      },
      totalSize,
      totalSizeFormatted: formatFileSize(totalSize),
    };

    const response: ApiResponse<DataStats> = {
      success: true,
      data: stats,
    };

    res.json(response);
  } catch (error) {
    const response: ApiResponse<DataStats> = {
      success: false,
      error: "Failed to get data statistics",
    };
    res.status(500).json(response);
  }
};

// Clear all chat history
export const clearChatHistory: RequestHandler = (req, res) => {
  try {
    const chatsFilePath = path.join(DATA_DIR, "chats.json");

    // Reset chats.json to empty state
    const emptyChatsData = {
      chats: [],
      messages: [],
    };

    fs.writeFileSync(chatsFilePath, JSON.stringify(emptyChatsData, null, 2));

    const response: ApiResponse<null> = {
      success: true,
    };

    res.json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: "Failed to clear chat history",
    };
    res.status(500).json(response);
  }
};

// Clear all uploaded files
export const clearUploadedFiles: RequestHandler = (req, res) => {
  try {
    const filesFilePath = path.join(DATA_DIR, "files.json");
    const uploadsDir = path.join(process.cwd(), "server/uploads");

    // Reset files.json to empty state
    const emptyFilesData = {
      files: [],
    };

    fs.writeFileSync(filesFilePath, JSON.stringify(emptyFilesData, null, 2));

    // Remove all uploaded files (but keep .gitkeep)
    if (fs.existsSync(uploadsDir)) {
      const files = fs.readdirSync(uploadsDir);
      files.forEach((file) => {
        if (file !== ".gitkeep") {
          fs.unlinkSync(path.join(uploadsDir, file));
        }
      });
    }

    const response: ApiResponse<null> = {
      success: true,
    };

    res.json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: "Failed to clear uploaded files",
    };
    res.status(500).json(response);
  }
};

// Clear all categories
export const clearCategories: RequestHandler = (req, res) => {
  try {
    const categoriesFilePath = path.join(DATA_DIR, "categories.json");

    // Reset categories.json to empty state
    const emptyCategoriesData = {
      categories: [],
    };

    fs.writeFileSync(categoriesFilePath, JSON.stringify(emptyCategoriesData, null, 2));

    const response: ApiResponse<null> = {
      success: true,
    };

    res.json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: "Failed to clear categories",
    };
    res.status(500).json(response);
  }
};
