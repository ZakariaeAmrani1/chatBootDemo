import { RequestHandler } from "express";
import * as crypto from "crypto";
import { v4 as uuidv4 } from "uuid";
import { DataManager } from "../utils/dataManager";
import {
  User,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  ApiResponse,
} from "@shared/types";

// Simple hash function for passwords (in production, use bcrypt)
const hashPassword = (password: string): string => {
  return crypto
    .createHash("sha256")
    .update(password + "salt_key_2024")
    .digest("hex");
};

// Generate simple JWT-like token (in production, use proper JWT)
const generateToken = (userId: string): string => {
  const payload = {
    userId,
    timestamp: Date.now(),
  };
  return Buffer.from(JSON.stringify(payload)).toString("base64");
};

// Verify token
export const verifyToken = (token: string): { userId: string } | null => {
  try {
    const payload = JSON.parse(Buffer.from(token, "base64").toString());
    // Token expires after 30 days
    if (Date.now() - payload.timestamp > 30 * 24 * 60 * 60 * 1000) {
      return null;
    }
    return { userId: payload.userId };
  } catch {
    return null;
  }
};

// Default user settings
const getDefaultSettings = () => ({
  theme: "light" as const,
  fontSize: "medium" as const,
  density: "comfortable" as const,
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
  selectedModel: "gpt-4",
});

// Login endpoint
export const loginUser: RequestHandler = (req, res) => {
  try {
    const { email, password }: LoginRequest = req.body;

    if (!email || !password) {
      const response: ApiResponse<AuthResponse> = {
        success: false,
        error: "Email and password are required",
      };
      return res.status(400).json(response);
    }

    // Find user by email
    const users = DataManager.getAllUsers();
    const user = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase(),
    );

    if (!user) {
      const response: ApiResponse<AuthResponse> = {
        success: false,
        error: "Invalid email or password",
      };
      return res.status(401).json(response);
    }

    // Check password
    const hashedPassword = hashPassword(password);
    if (user.passwordHash !== hashedPassword) {
      const response: ApiResponse<AuthResponse> = {
        success: false,
        error: "Invalid email or password",
      };
      return res.status(401).json(response);
    }

    // Generate token
    const token = generateToken(user.id);

    // Remove password hash from user object
    const { passwordHash, ...userWithoutPassword } = user;

    const response: ApiResponse<AuthResponse> = {
      success: true,
      data: {
        user: userWithoutPassword,
        token,
      },
    };

    res.json(response);
  } catch (error) {
    console.error("Login error:", error);
    const response: ApiResponse<AuthResponse> = {
      success: false,
      error: "Login failed",
    };
    res.status(500).json(response);
  }
};

// Register endpoint
export const registerUser: RequestHandler = (req, res) => {
  try {
    const { displayName, email, password }: RegisterRequest = req.body;

    if (!displayName || !email || !password) {
      const response: ApiResponse<AuthResponse> = {
        success: false,
        error: "Display name, email, and password are required",
      };
      return res.status(400).json(response);
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      const response: ApiResponse<AuthResponse> = {
        success: false,
        error: "Invalid email format",
      };
      return res.status(400).json(response);
    }

    // Validate password length
    if (password.length < 6) {
      const response: ApiResponse<AuthResponse> = {
        success: false,
        error: "Password must be at least 6 characters long",
      };
      return res.status(400).json(response);
    }

    // Check if user already exists
    const users = DataManager.getAllUsers();
    const existingUser = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase(),
    );

    if (existingUser) {
      const response: ApiResponse<AuthResponse> = {
        success: false,
        error: "An account with this email already exists",
      };
      return res.status(409).json(response);
    }

    // Create new user
    const userId = uuidv4();
    const hashedPassword = hashPassword(password);

    const newUser: User = {
      id: userId,
      displayName: displayName.trim(),
      email: email.toLowerCase().trim(),
      bio: "",
      createdAt: new Date().toISOString(),
      settings: getDefaultSettings(),
      passwordHash: hashedPassword,
    };

    // Save user
    const savedUser = DataManager.createUser(newUser);

    if (!savedUser) {
      const response: ApiResponse<AuthResponse> = {
        success: false,
        error: "Failed to create user account",
      };
      return res.status(500).json(response);
    }

    // Generate token
    const token = generateToken(userId);

    // Remove password hash from user object
    const { passwordHash, ...userWithoutPassword } = savedUser;

    const response: ApiResponse<AuthResponse> = {
      success: true,
      data: {
        user: userWithoutPassword,
        token,
      },
    };

    res.status(201).json(response);
  } catch (error) {
    console.error("Registration error:", error);
    const response: ApiResponse<AuthResponse> = {
      success: false,
      error: "Registration failed",
    };
    res.status(500).json(response);
  }
};

// Verify token endpoint
export const verifyUserToken: RequestHandler = (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(" ")[1]; // Bearer token

    if (!token) {
      const response: ApiResponse<null> = {
        success: false,
        error: "No token provided",
      };
      return res.status(401).json(response);
    }

    const payload = verifyToken(token);
    if (!payload) {
      const response: ApiResponse<null> = {
        success: false,
        error: "Invalid or expired token",
      };
      return res.status(401).json(response);
    }

    const user = DataManager.getUserById(payload.userId);
    if (!user) {
      const response: ApiResponse<null> = {
        success: false,
        error: "User not found",
      };
      return res.status(404).json(response);
    }

    // Remove password hash from user object
    const { passwordHash, ...userWithoutPassword } = user;

    const response: ApiResponse<Omit<User, "passwordHash">> = {
      success: true,
      data: userWithoutPassword,
    };

    res.json(response);
  } catch (error) {
    console.error("Token verification error:", error);
    const response: ApiResponse<null> = {
      success: false,
      error: "Token verification failed",
    };
    res.status(500).json(response);
  }
};

// Middleware to authenticate requests
export const authenticateToken: RequestHandler = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1]; // Bearer token

  if (!token) {
    return res.status(401).json({
      success: false,
      error: "Access token required",
    });
  }

  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({
      success: false,
      error: "Invalid or expired token",
    });
  }

  // Add user ID to request for use in other endpoints
  (req as any).userId = payload.userId;
  next();
};
