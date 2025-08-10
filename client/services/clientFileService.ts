import { FileAttachment, ApiResponse } from "@shared/types";
import { StorageManager } from "./storageManager";
import { v4 as uuidv4 } from "uuid";

export class ClientFileService {
  static async uploadFiles(
    files: File[],
  ): Promise<ApiResponse<FileAttachment[]>> {
    try {
      const uploadedFiles: FileAttachment[] = [];

      for (const file of files) {
        const fileId = uuidv4();
        const now = new Date().toISOString();

        const fileAttachment: FileAttachment = {
          id: fileId,
          name: file.name,
          size: file.size,
          type: file.type,
          url: URL.createObjectURL(file),
          uploadedAt: now,
        };

        // Store file in IndexedDB
        await StorageManager.saveFile(fileId, file);

        // Store file metadata
        const savedFile = StorageManager.createFileAttachment(fileAttachment);
        uploadedFiles.push(savedFile);
      }

      return {
        success: true,
        data: uploadedFiles,
      };
    } catch (error) {
      console.error("Error uploading files:", error);
      return {
        success: false,
        error: "Failed to upload files",
      };
    }
  }

  static async getAllFiles(): Promise<ApiResponse<FileAttachment[]>> {
    try {
      const files = StorageManager.getAllFileAttachments();

      // Sort by uploadedAt descending
      const sortedFiles = files.sort(
        (a, b) =>
          new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime(),
      );

      return {
        success: true,
        data: sortedFiles,
      };
    } catch (error) {
      console.error("Error getting files:", error);
      return {
        success: false,
        error: "Failed to get files",
      };
    }
  }

  static async getFileInfo(
    fileId: string,
  ): Promise<ApiResponse<FileAttachment>> {
    try {
      const file = StorageManager.getFileAttachmentById(fileId);

      if (!file) {
        return {
          success: false,
          error: "File not found",
        };
      }

      return {
        success: true,
        data: file,
      };
    } catch (error) {
      console.error("Error getting file info:", error);
      return {
        success: false,
        error: "Failed to get file info",
      };
    }
  }

  static async serveFile(fileId: string): Promise<Blob | null> {
    try {
      return await StorageManager.getFile(fileId);
    } catch (error) {
      console.error("Error serving file:", error);
      return null;
    }
  }

  static async deleteFile(
    fileId: string,
  ): Promise<ApiResponse<{ success: boolean }>> {
    try {
      // Delete file from IndexedDB
      await StorageManager.deleteFile(fileId);

      // Delete file metadata
      const deleted = StorageManager.deleteFileAttachment(fileId);

      if (!deleted) {
        return {
          success: false,
          error: "File not found",
        };
      }

      return {
        success: true,
        data: { success: true },
      };
    } catch (error) {
      console.error("Error deleting file:", error);
      return {
        success: false,
        error: "Failed to delete file",
      };
    }
  }

  static createFileURL(file: Blob): string {
    return URL.createObjectURL(file);
  }

  static revokeFileURL(url: string): void {
    URL.revokeObjectURL(url);
  }

  // Handle specific file types
  static async readTextFile(file: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  }

  static async readFileAsArrayBuffer(file: Blob): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(file);
    });
  }

  static async readFileAsDataURL(file: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }

  // File validation
  static validateFile(file: File): { valid: boolean; error?: string } {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "application/pdf",
      "text/plain",
      "text/csv",
      "application/json",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "audio/webm",
      "audio/wav",
      "audio/mp3",
      "audio/mpeg",
      "audio/ogg",
      "audio/mp4",
      "audio/x-m4a",
    ];

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `File type ${file.type} is not allowed`,
      };
    }

    // Check file size (50MB limit)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return {
        valid: false,
        error: "File size exceeds 50MB limit",
      };
    }

    return { valid: true };
  }

  static getFileIcon(fileType: string): string {
    if (fileType.startsWith("image/")) return "🖼️";
    if (fileType === "application/pdf") return "📄";
    if (fileType.includes("text/")) return "📝";
    if (fileType.includes("csv")) return "📊";
    if (fileType.includes("excel") || fileType.includes("spreadsheet"))
      return "📊";
    if (fileType.includes("word") || fileType.includes("document")) return "📝";
    if (fileType.startsWith("audio/")) return "🎵";
    return "📁";
  }

  static formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }
}
