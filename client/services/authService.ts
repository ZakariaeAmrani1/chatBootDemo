import { User, LoginRequest, RegisterRequest, AuthResponse, ApiResponse } from '@shared/types';
import { StorageManager } from './storageManager';
import { v4 as uuidv4 } from 'uuid';

// Simple hash function for passwords (same as server)
const hashPassword = (password: string): string => {
  // Using a simple hash for demo purposes
  // In production, use proper bcrypt or similar
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'salt_key_2024');
  
  return crypto.subtle.digest('SHA-256', data).then(hash => {
    return Array.from(new Uint8Array(hash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }).catch(() => {
    // Fallback for older browsers
    let hash = 0;
    for (let i = 0; i < (password + 'salt_key_2024').length; i++) {
      const char = (password + 'salt_key_2024').charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  });
};

// Generate simple token
const generateToken = (userId: string): string => {
  const payload = {
    userId,
    timestamp: Date.now(),
  };
  return btoa(JSON.stringify(payload));
};

// Verify token
export const verifyToken = (token: string): { userId: string } | null => {
  try {
    const payload = JSON.parse(atob(token));
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
});

export class AuthService {
  static async login(loginData: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    try {
      const { email, password } = loginData;

      if (!email || !password) {
        return {
          success: false,
          error: 'Email and password are required',
        };
      }

      // Find user by email
      const users = StorageManager.getAllUsers();
      const user = users.find(
        (u) => u.email.toLowerCase() === email.toLowerCase(),
      );

      if (!user) {
        return {
          success: false,
          error: 'Invalid email or password',
        };
      }

      // Check password
      const hashedPassword = await hashPassword(password);
      if (user.passwordHash !== hashedPassword) {
        return {
          success: false,
          error: 'Invalid email or password',
        };
      }

      // Generate token
      const token = generateToken(user.id);

      // Store auth state
      StorageManager.setAuthToken(token);
      StorageManager.setCurrentUser(user);

      // Remove password hash from user object
      const { passwordHash, ...userWithoutPassword } = user;

      return {
        success: true,
        data: {
          user: userWithoutPassword,
          token,
        },
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: 'Login failed',
      };
    }
  }

  static async register(registerData: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
    try {
      const { displayName, email, password } = registerData;

      if (!displayName || !email || !password) {
        return {
          success: false,
          error: 'Display name, email, and password are required',
        };
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return {
          success: false,
          error: 'Invalid email format',
        };
      }

      // Validate password length
      if (password.length < 6) {
        return {
          success: false,
          error: 'Password must be at least 6 characters long',
        };
      }

      // Check if user already exists
      const users = StorageManager.getAllUsers();
      const existingUser = users.find(
        (u) => u.email.toLowerCase() === email.toLowerCase(),
      );

      if (existingUser) {
        return {
          success: false,
          error: 'An account with this email already exists',
        };
      }

      // Create new user
      const userId = uuidv4();
      const hashedPassword = await hashPassword(password);

      const newUser: User = {
        id: userId,
        displayName: displayName.trim(),
        email: email.toLowerCase().trim(),
        bio: '',
        createdAt: new Date().toISOString(),
        settings: getDefaultSettings(),
        passwordHash: hashedPassword,
      };

      // Save user
      const savedUser = StorageManager.createUser(newUser);

      if (!savedUser) {
        return {
          success: false,
          error: 'Failed to create user account',
        };
      }

      // Generate token
      const token = generateToken(userId);

      // Store auth state
      StorageManager.setAuthToken(token);
      StorageManager.setCurrentUser(savedUser);

      // Create default category for the user
      const defaultCategory = {
        id: `default-general-${userId}`,
        name: 'General',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: userId,
        isDefault: true
      };
      StorageManager.createCategory(defaultCategory);

      // Remove password hash from user object
      const { passwordHash, ...userWithoutPassword } = savedUser;

      return {
        success: true,
        data: {
          user: userWithoutPassword,
          token,
        },
      };
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        error: 'Registration failed',
      };
    }
  }

  static async verifyToken(token?: string): Promise<ApiResponse<Omit<User, 'passwordHash'>>> {
    try {
      const authToken = token || StorageManager.getAuthToken();

      if (!authToken) {
        return {
          success: false,
          error: 'No token provided',
        };
      }

      const payload = verifyToken(authToken);
      if (!payload) {
        return {
          success: false,
          error: 'Invalid or expired token',
        };
      }

      const user = StorageManager.getUserById(payload.userId);
      if (!user) {
        return {
          success: false,
          error: 'User not found',
        };
      }

      // Remove password hash from user object
      const { passwordHash, ...userWithoutPassword } = user;

      return {
        success: true,
        data: userWithoutPassword,
      };
    } catch (error) {
      console.error('Token verification error:', error);
      return {
        success: false,
        error: 'Token verification failed',
      };
    }
  }

  static logout(): void {
    StorageManager.setAuthToken(null);
    StorageManager.setCurrentUser(null);
  }

  static getCurrentUser(): User | null {
    return StorageManager.getCurrentUser();
  }

  static isAuthenticated(): boolean {
    const token = StorageManager.getAuthToken();
    const user = StorageManager.getCurrentUser();
    
    if (!token || !user) return false;
    
    const payload = verifyToken(token);
    return payload !== null;
  }
}
