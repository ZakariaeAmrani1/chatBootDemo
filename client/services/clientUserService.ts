import { User, ApiResponse } from '@shared/types';
import { StorageManager } from './storageManager';

export class ClientUserService {
  static async getCurrentUser(): Promise<ApiResponse<Omit<User, 'passwordHash'>>> {
    try {
      const user = StorageManager.getCurrentUser();

      if (!user) {
        return {
          success: false,
          error: 'No user logged in',
        };
      }

      // Remove password hash from user object
      const { passwordHash, ...userWithoutPassword } = user;

      return {
        success: true,
        data: userWithoutPassword,
      };
    } catch (error) {
      console.error('Error getting current user:', error);
      return {
        success: false,
        error: 'Failed to get current user',
      };
    }
  }

  static async updateUser(
    userId: string,
    updates: Partial<Omit<User, 'id' | 'passwordHash' | 'createdAt'>>
  ): Promise<ApiResponse<Omit<User, 'passwordHash'>>> {
    try {
      // Validate the user exists and we're updating the correct user
      const currentUser = StorageManager.getCurrentUser();
      if (!currentUser || currentUser.id !== userId) {
        return {
          success: false,
          error: 'Unauthorized to update this user',
        };
      }

      // Validate email format if email is being updated
      if (updates.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(updates.email)) {
          return {
            success: false,
            error: 'Invalid email format',
          };
        }

        // Check if email is already taken by another user
        const users = StorageManager.getAllUsers();
        const existingUser = users.find(
          u => u.id !== userId && u.email.toLowerCase() === updates.email!.toLowerCase()
        );

        if (existingUser) {
          return {
            success: false,
            error: 'Email is already taken',
          };
        }

        updates.email = updates.email.toLowerCase().trim();
      }

      // Trim display name if provided
      if (updates.displayName) {
        updates.displayName = updates.displayName.trim();
      }

      const updatedUser = StorageManager.updateUser(userId, updates);

      if (!updatedUser) {
        return {
          success: false,
          error: 'Failed to update user',
        };
      }

      // Update current user in storage
      StorageManager.setCurrentUser(updatedUser);

      // Remove password hash from response
      const { passwordHash, ...userWithoutPassword } = updatedUser;

      return {
        success: true,
        data: userWithoutPassword,
      };
    } catch (error) {
      console.error('Error updating user:', error);
      return {
        success: false,
        error: 'Failed to update user',
      };
    }
  }

  static async updateUserSettings(
    userId: string,
    settings: Partial<User['settings']>
  ): Promise<ApiResponse<Omit<User, 'passwordHash'>>> {
    try {
      // Validate the user exists and we're updating the correct user
      const currentUser = StorageManager.getCurrentUser();
      if (!currentUser || currentUser.id !== userId) {
        return {
          success: false,
          error: 'Unauthorized to update this user',
        };
      }

      // Merge settings with existing settings
      const updatedSettings = {
        ...currentUser.settings,
        ...settings,
      };

      const updatedUser = StorageManager.updateUser(userId, {
        settings: updatedSettings,
      });

      if (!updatedUser) {
        return {
          success: false,
          error: 'Failed to update user settings',
        };
      }

      // Update current user in storage
      StorageManager.setCurrentUser(updatedUser);

      // Remove password hash from response
      const { passwordHash, ...userWithoutPassword } = updatedUser;

      return {
        success: true,
        data: userWithoutPassword,
      };
    } catch (error) {
      console.error('Error updating user settings:', error);
      return {
        success: false,
        error: 'Failed to update user settings',
      };
    }
  }

  static async uploadAvatar(
    userId: string,
    avatarFile: File
  ): Promise<ApiResponse<Omit<User, 'passwordHash'>>> {
    try {
      // Validate the user exists and we're updating the correct user
      const currentUser = StorageManager.getCurrentUser();
      if (!currentUser || currentUser.id !== userId) {
        return {
          success: false,
          error: 'Unauthorized to update this user',
        };
      }

      // Validate file type
      if (!avatarFile.type.startsWith('image/')) {
        return {
          success: false,
          error: 'Avatar must be an image file',
        };
      }

      // Validate file size (5MB limit for avatars)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (avatarFile.size > maxSize) {
        return {
          success: false,
          error: 'Avatar file size must be less than 5MB',
        };
      }

      // Create a data URL for the avatar
      const avatarDataURL = await this.fileToDataURL(avatarFile);

      const updatedUser = StorageManager.updateUser(userId, {
        avatar: avatarDataURL,
      });

      if (!updatedUser) {
        return {
          success: false,
          error: 'Failed to upload avatar',
        };
      }

      // Update current user in storage
      StorageManager.setCurrentUser(updatedUser);

      // Remove password hash from response
      const { passwordHash, ...userWithoutPassword } = updatedUser;

      return {
        success: true,
        data: userWithoutPassword,
      };
    } catch (error) {
      console.error('Error uploading avatar:', error);
      return {
        success: false,
        error: 'Failed to upload avatar',
      };
    }
  }

  static async uploadLightLogo(
    userId: string,
    logoFile: File
  ): Promise<ApiResponse<Omit<User, 'passwordHash'>>> {
    try {
      // Validate the user exists and we're updating the correct user
      const currentUser = StorageManager.getCurrentUser();
      if (!currentUser || currentUser.id !== userId) {
        return {
          success: false,
          error: 'Unauthorized to update this user',
        };
      }

      // Validate file type
      if (!logoFile.type.startsWith('image/')) {
        return {
          success: false,
          error: 'Logo must be an image file',
        };
      }

      // Create a data URL for the logo
      const logoDataURL = await this.fileToDataURL(logoFile);

      const updatedUser = StorageManager.updateUser(userId, {
        lightLogo: logoDataURL,
      });

      if (!updatedUser) {
        return {
          success: false,
          error: 'Failed to upload light logo',
        };
      }

      // Update current user in storage
      StorageManager.setCurrentUser(updatedUser);

      // Remove password hash from response
      const { passwordHash, ...userWithoutPassword } = updatedUser;

      return {
        success: true,
        data: userWithoutPassword,
      };
    } catch (error) {
      console.error('Error uploading light logo:', error);
      return {
        success: false,
        error: 'Failed to upload light logo',
      };
    }
  }

  static async uploadDarkLogo(
    userId: string,
    logoFile: File
  ): Promise<ApiResponse<Omit<User, 'passwordHash'>>> {
    try {
      // Validate the user exists and we're updating the correct user
      const currentUser = StorageManager.getCurrentUser();
      if (!currentUser || currentUser.id !== userId) {
        return {
          success: false,
          error: 'Unauthorized to update this user',
        };
      }

      // Validate file type
      if (!logoFile.type.startsWith('image/')) {
        return {
          success: false,
          error: 'Logo must be an image file',
        };
      }

      // Create a data URL for the logo
      const logoDataURL = await this.fileToDataURL(logoFile);

      const updatedUser = StorageManager.updateUser(userId, {
        darkLogo: logoDataURL,
      });

      if (!updatedUser) {
        return {
          success: false,
          error: 'Failed to upload dark logo',
        };
      }

      // Update current user in storage
      StorageManager.setCurrentUser(updatedUser);

      // Remove password hash from response
      const { passwordHash, ...userWithoutPassword } = updatedUser;

      return {
        success: true,
        data: userWithoutPassword,
      };
    } catch (error) {
      console.error('Error uploading dark logo:', error);
      return {
        success: false,
        error: 'Failed to upload dark logo',
      };
    }
  }

  static async resetUserSettings(userId: string): Promise<ApiResponse<Omit<User, 'passwordHash'>>> {
    try {
      // Validate the user exists and we're updating the correct user
      const currentUser = StorageManager.getCurrentUser();
      if (!currentUser || currentUser.id !== userId) {
        return {
          success: false,
          error: 'Unauthorized to reset settings for this user',
        };
      }

      // Default settings
      const defaultSettings = {
        theme: 'light' as const,
        fontSize: 'medium' as const,
        density: 'comfortable' as const,
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
        language: 'english',
        region: 'us',
        voiceEnabled: false,
        voiceModel: 'natural',
        speechRate: [1],
        highContrast: false,
        reducedMotion: false,
        screenReader: false,
        selectedModel: 'gpt-4',
      };

      const updatedUser = StorageManager.updateUser(userId, {
        settings: defaultSettings,
      });

      if (!updatedUser) {
        return {
          success: false,
          error: 'Failed to reset user settings',
        };
      }

      // Update current user in storage
      StorageManager.setCurrentUser(updatedUser);

      // Remove password hash from response
      const { passwordHash, ...userWithoutPassword } = updatedUser;

      return {
        success: true,
        data: userWithoutPassword,
      };
    } catch (error) {
      console.error('Error resetting user settings:', error);
      return {
        success: false,
        error: 'Failed to reset user settings',
      };
    }
  }

  private static fileToDataURL(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }
}
