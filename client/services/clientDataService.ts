import { ApiResponse } from "@shared/types";
import { StorageManager } from "./storageManager";

interface DataStats {
  totalChats: number;
  totalMessages: number;
  totalFiles: number;
  totalCategories: number;
  totalUsers: number;
}

export class ClientDataService {
  static async getDataStats(): Promise<ApiResponse<DataStats>> {
    try {
      const stats = StorageManager.getDataStats();

      return {
        success: true,
        data: stats,
      };
    } catch (error) {
      console.error("Error getting data stats:", error);
      return {
        success: false,
        error: "Failed to get data statistics",
      };
    }
  }

  static async clearChatHistory(): Promise<ApiResponse<{ success: boolean }>> {
    try {
      StorageManager.clearAllChats();

      return {
        success: true,
        data: { success: true },
      };
    } catch (error) {
      console.error("Error clearing chat history:", error);
      return {
        success: false,
        error: "Failed to clear chat history",
      };
    }
  }

  static async clearUploadedFiles(): Promise<
    ApiResponse<{ success: boolean }>
  > {
    try {
      StorageManager.clearAllFiles();

      return {
        success: true,
        data: { success: true },
      };
    } catch (error) {
      console.error("Error clearing uploaded files:", error);
      return {
        success: false,
        error: "Failed to clear uploaded files",
      };
    }
  }

  static async clearCategories(): Promise<ApiResponse<{ success: boolean }>> {
    try {
      StorageManager.clearAllCategories();

      return {
        success: true,
        data: { success: true },
      };
    } catch (error) {
      console.error("Error clearing categories:", error);
      return {
        success: false,
        error: "Failed to clear categories",
      };
    }
  }

  static async exportAllData(): Promise<ApiResponse<string>> {
    try {
      const data = {
        users: StorageManager.getAllUsers().map((user) => {
          // Remove password hash from export
          const { passwordHash, ...userWithoutPassword } = user;
          return userWithoutPassword;
        }),
        chats: StorageManager.getAllChats(),
        messages: StorageManager.getAllMessages(),
        categories: StorageManager.getAllCategories(),
        files: StorageManager.getAllFileAttachments(),
        exportedAt: new Date().toISOString(),
      };

      const jsonData = JSON.stringify(data, null, 2);

      return {
        success: true,
        data: jsonData,
      };
    } catch (error) {
      console.error("Error exporting data:", error);
      return {
        success: false,
        error: "Failed to export data",
      };
    }
  }

  static async importData(
    jsonData: string,
  ): Promise<ApiResponse<{ success: boolean }>> {
    try {
      const data = JSON.parse(jsonData);

      // Validate data structure
      if (!data.users || !Array.isArray(data.users)) {
        return {
          success: false,
          error: "Invalid data format: users array is required",
        };
      }

      // Import users (but don't overwrite existing ones)
      const existingUsers = StorageManager.getAllUsers();
      const existingUserIds = new Set(existingUsers.map((u) => u.id));

      if (data.users) {
        data.users.forEach((user: any) => {
          if (!existingUserIds.has(user.id)) {
            // Add a default password hash for imported users
            const userWithPassword = {
              ...user,
              passwordHash: "imported_user_needs_password_reset",
            };
            StorageManager.createUser(userWithPassword);
          }
        });
      }

      // Import other data
      if (data.chats && Array.isArray(data.chats)) {
        StorageManager.saveChats(data.chats);
      }

      if (data.messages && Array.isArray(data.messages)) {
        StorageManager.saveMessages(data.messages);
      }

      if (data.categories && Array.isArray(data.categories)) {
        StorageManager.saveCategories(data.categories);
      }

      if (data.files && Array.isArray(data.files)) {
        StorageManager.saveFileAttachments(data.files);
      }

      return {
        success: true,
        data: { success: true },
      };
    } catch (error) {
      console.error("Error importing data:", error);
      return {
        success: false,
        error: "Failed to import data: " + (error as Error).message,
      };
    }
  }

  static downloadDataAsFile(
    jsonData: string,
    filename: string = "chatnova-data.json",
  ): void {
    try {
      const blob = new Blob([jsonData], { type: "application/json" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading data file:", error);
    }
  }

  static async readDataFromFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  }

  // Clear all application data (reset to factory defaults)
  static async resetAllData(): Promise<ApiResponse<{ success: boolean }>> {
    try {
      // Clear all storage
      StorageManager.clearAllChats();
      StorageManager.clearAllFiles();
      StorageManager.clearAllCategories();

      // Don't clear users as that would log out the current user
      // Instead, just reset their settings if needed

      return {
        success: true,
        data: { success: true },
      };
    } catch (error) {
      console.error("Error resetting all data:", error);
      return {
        success: false,
        error: "Failed to reset application data",
      };
    }
  }

  // Get storage usage information
  static async getStorageInfo(): Promise<
    ApiResponse<{
      used: number;
      quota: number;
      percentage: number;
    }>
  > {
    try {
      if ("storage" in navigator && "estimate" in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        const used = estimate.usage || 0;
        const quota = estimate.quota || 0;
        const percentage = quota > 0 ? (used / quota) * 100 : 0;

        return {
          success: true,
          data: {
            used,
            quota,
            percentage,
          },
        };
      } else {
        return {
          success: false,
          error: "Storage estimation not supported",
        };
      }
    } catch (error) {
      console.error("Error getting storage info:", error);
      return {
        success: false,
        error: "Failed to get storage information",
      };
    }
  }

  static formatBytes(bytes: number): string {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }
}
