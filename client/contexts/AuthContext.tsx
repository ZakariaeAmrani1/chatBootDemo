import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { User } from "@shared/types";
import { apiService } from "@/services/api";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string }>;
  register: (data: {
    displayName: string;
    email: string;
    password: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateUser: (userData: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in on app start
    const checkAuthStatus = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const savedUser = localStorage.getItem("currentUser");

        console.log("Checking auth status - token:", !!token, "savedUser:", !!savedUser);

        if (token && savedUser) {
          try {
            // Parse saved user data
            const userData = JSON.parse(savedUser);

            // Verify token is still valid with server
            const response = await apiService.verifyToken();
            if (response.success && response.data) {
              console.log("Token verification successful");
              setUser(response.data);
            } else {
              console.log("Token verification failed:", response.error);
              // Token is invalid, clear storage
              localStorage.removeItem("authToken");
              localStorage.removeItem("currentUser");
              setUser(null);
            }
          } catch (parseError) {
            console.error("Error parsing saved user data:", parseError);
            // Clear corrupted data
            localStorage.removeItem("authToken");
            localStorage.removeItem("currentUser");
            setUser(null);
          }
        } else {
          console.log("No auth token or saved user found");
          setUser(null);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        // Clear potentially corrupted data
        localStorage.removeItem("authToken");
        localStorage.removeItem("currentUser");
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (
    email: string,
    password: string,
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await apiService.login(email, password);

      if (response.success && response.data) {
        const { user: userData, token } = response.data;

        // Store auth data
        localStorage.setItem("authToken", token);
        localStorage.setItem("currentUser", JSON.stringify(userData));

        // Update state
        setUser(userData);

        return { success: true };
      } else {
        return { success: false, error: response.error || "Login failed" };
      }
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: "An error occurred during login" };
    }
  };

  const register = async (data: {
    displayName: string;
    email: string;
    password: string;
  }): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await apiService.register(data);

      if (response.success && response.data) {
        const { user: userData, token } = response.data;

        // Store auth data
        localStorage.setItem("authToken", token);
        localStorage.setItem("currentUser", JSON.stringify(userData));

        // Update state
        setUser(userData);

        return { success: true };
      } else {
        return {
          success: false,
          error: response.error || "Registration failed",
        };
      }
    } catch (error) {
      console.error("Registration error:", error);
      return { success: false, error: "An error occurred during registration" };
    }
  };

  const logout = () => {
    console.log("Logging out user");
    // Clear auth data
    localStorage.removeItem("authToken");
    localStorage.removeItem("currentUser");

    // Update state
    setUser(null);

    // Call API logout if needed
    apiService.logout();
  };

  // Function to handle authentication failures
  const handleAuthFailure = () => {
    console.log("Authentication failure detected, clearing session");
    logout();
  };

  const updateUser = (userData: User) => {
    setUser(userData);
    localStorage.setItem("currentUser", JSON.stringify(userData));

    // Ensure settings are applied immediately when user data is updated
    if (userData.settings) {
      requestAnimationFrame(() => {
        // Dispatch a custom event to trigger settings application
        window.dispatchEvent(
          new CustomEvent("userSettingsUpdated", {
            detail: { user: userData, settings: userData.settings },
          }),
        );
      });
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
