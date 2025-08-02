import { RequestHandler } from "express";
import { DataManager } from "../utils/dataManager";
import { User, ApiResponse } from "@shared/types";

// Get current user profile
export const getCurrentUser: RequestHandler = (req, res) => {
  try {
    const userId = req.query.userId as string || 'user-1'; // Default to demo user
    const user = DataManager.getUserById(userId);
    
    if (!user) {
      const response: ApiResponse<User> = {
        success: false,
        error: 'User not found'
      };
      return res.status(404).json(response);
    }
    
    const response: ApiResponse<User> = {
      success: true,
      data: user
    };
    
    res.json(response);
  } catch (error) {
    const response: ApiResponse<User> = {
      success: false,
      error: 'Failed to fetch user'
    };
    res.status(500).json(response);
  }
};

// Update user profile
export const updateUser: RequestHandler = (req, res) => {
  try {
    const userId = req.params.userId || 'user-1';
    const updates = req.body;
    
    const updatedUser = DataManager.updateUser(userId, updates);
    
    if (!updatedUser) {
      const response: ApiResponse<User> = {
        success: false,
        error: 'User not found'
      };
      return res.status(404).json(response);
    }
    
    const response: ApiResponse<User> = {
      success: true,
      data: updatedUser
    };
    
    res.json(response);
  } catch (error) {
    const response: ApiResponse<User> = {
      success: false,
      error: 'Failed to update user'
    };
    res.status(500).json(response);
  }
};

// Update user settings
export const updateUserSettings: RequestHandler = (req, res) => {
  try {
    const userId = req.params.userId || 'user-1';
    const settingsUpdates = req.body;
    
    const user = DataManager.getUserById(userId);
    if (!user) {
      const response: ApiResponse<User> = {
        success: false,
        error: 'User not found'
      };
      return res.status(404).json(response);
    }
    
    const updatedUser = DataManager.updateUser(userId, {
      settings: { ...user.settings, ...settingsUpdates }
    });
    
    const response: ApiResponse<User> = {
      success: true,
      data: updatedUser!
    };
    
    res.json(response);
  } catch (error) {
    const response: ApiResponse<User> = {
      success: false,
      error: 'Failed to update user settings'
    };
    res.status(500).json(response);
  }
};
