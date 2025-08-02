import { RequestHandler } from "express";
import { DataManager } from "../utils/dataManager";
import { User, ApiResponse } from "@shared/types";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import path from "path";

// Get current user profile
export const getCurrentUser: RequestHandler = (req, res) => {
  try {
    const userId = (req.query.userId as string) || "user-1"; // Default to demo user
    const user = DataManager.getUserById(userId);

    if (!user) {
      const response: ApiResponse<User> = {
        success: false,
        error: "User not found",
      };
      return res.status(404).json(response);
    }

    const response: ApiResponse<User> = {
      success: true,
      data: user,
    };

    res.json(response);
  } catch (error) {
    const response: ApiResponse<User> = {
      success: false,
      error: "Failed to fetch user",
    };
    res.status(500).json(response);
  }
};

// Update user profile
export const updateUser: RequestHandler = (req, res) => {
  try {
    const userId = req.params.userId || "user-1";
    const updates = req.body;

    const updatedUser = DataManager.updateUser(userId, updates);

    if (!updatedUser) {
      const response: ApiResponse<User> = {
        success: false,
        error: "User not found",
      };
      return res.status(404).json(response);
    }

    const response: ApiResponse<User> = {
      success: true,
      data: updatedUser,
    };

    res.json(response);
  } catch (error) {
    const response: ApiResponse<User> = {
      success: false,
      error: "Failed to update user",
    };
    res.status(500).json(response);
  }
};

// Update user settings
export const updateUserSettings: RequestHandler = (req, res) => {
  try {
    const userId = req.params.userId || "user-1";
    const settingsUpdates = req.body;

    const user = DataManager.getUserById(userId);
    if (!user) {
      const response: ApiResponse<User> = {
        success: false,
        error: "User not found",
      };
      return res.status(404).json(response);
    }

    const updatedUser = DataManager.updateUser(userId, {
      settings: { ...user.settings, ...settingsUpdates },
    });

    const response: ApiResponse<User> = {
      success: true,
      data: updatedUser!,
    };

    res.json(response);
  } catch (error) {
    const response: ApiResponse<User> = {
      success: false,
      error: "Failed to update user settings",
    };
    res.status(500).json(response);
  }
};

// Configure multer for avatar uploads
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "server/uploads/");
  },
  filename: (req, file, cb) => {
    const fileExtension = path.extname(file.originalname);
    const filename = `avatar-${uuidv4()}${fileExtension}`;
    cb(null, filename);
  },
});

const avatarUpload = multer({
  storage: avatarStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only image files (JPEG, PNG, GIF, WebP) are allowed"));
    }
  },
});

// Upload user avatar
export const uploadAvatar = [
  avatarUpload.single("avatar"),
  (req: any, res: any) => {
    try {
      const userId = req.params.userId || "user-1";

      if (!req.file) {
        const response: ApiResponse<User> = {
          success: false,
          error: "No avatar file provided",
        };
        return res.status(400).json(response);
      }

      // Get the relative path for the avatar URL
      const avatarUrl = `/api/files/${req.file.filename}`;

      // Update user with new avatar URL
      const updatedUser = DataManager.updateUser(userId, {
        avatar: avatarUrl,
      });

      if (!updatedUser) {
        const response: ApiResponse<User> = {
          success: false,
          error: "User not found",
        };
        return res.status(404).json(response);
      }

      const response: ApiResponse<User> = {
        success: true,
        data: updatedUser,
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse<User> = {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to upload avatar",
      };
      res.status(500).json(response);
    }
  },
];

// Upload app light logo
export const uploadLightLogo = [
  avatarUpload.single("lightLogo"),
  (req: any, res: any) => {
    try {
      const userId = req.params.userId || "user-1";

      if (!req.file) {
        const response: ApiResponse<User> = {
          success: false,
          error: "No logo file provided",
        };
        return res.status(400).json(response);
      }

      // Get the relative path for the logo URL
      const logoUrl = `/api/files/${req.file.filename}`;

      // Get current user to preserve existing settings
      const user = DataManager.getUserById(userId);
      if (!user) {
        const response: ApiResponse<User> = {
          success: false,
          error: "User not found",
        };
        return res.status(404).json(response);
      }

      // Update user settings with new light logo URL
      const updatedUser = DataManager.updateUser(userId, {
        settings: { ...user.settings, lightLogo: logoUrl },
      });

      const response: ApiResponse<User> = {
        success: true,
        data: updatedUser!,
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse<User> = {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to upload light logo",
      };
      res.status(500).json(response);
    }
  },
];

// Upload app dark logo
export const uploadDarkLogo = [
  avatarUpload.single("darkLogo"),
  (req: any, res: any) => {
    try {
      const userId = req.params.userId || "user-1";

      if (!req.file) {
        const response: ApiResponse<User> = {
          success: false,
          error: "No logo file provided",
        };
        return res.status(400).json(response);
      }

      // Get the relative path for the logo URL
      const logoUrl = `/api/files/${req.file.filename}`;

      // Get current user to preserve existing settings
      const user = DataManager.getUserById(userId);
      if (!user) {
        const response: ApiResponse<User> = {
          success: false,
          error: "User not found",
        };
        return res.status(404).json(response);
      }

      // Update user settings with new dark logo URL
      const updatedUser = DataManager.updateUser(userId, {
        settings: { ...user.settings, darkLogo: logoUrl },
      });

      const response: ApiResponse<User> = {
        success: true,
        data: updatedUser!,
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse<User> = {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to upload dark logo",
      };
      res.status(500).json(response);
    }
  },
];
