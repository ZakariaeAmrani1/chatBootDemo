import type { User } from "@shared/types";

export interface AppConfig {
  name: string;
  lightLogo: string;
  darkLogo: string;
}

// Default app configuration
const DEFAULT_APP_CONFIG: AppConfig = {
  name: "ChatNova",
  lightLogo:
    "https://cdn.builder.io/api/v1/image/assets%2Fcf4d383aa0a8496e86e8c6800eea5338%2F79be983dd7f84bc9bc3d5b287efc9a36?format=webp&width=800",
  darkLogo:
    "https://cdn.builder.io/api/v1/image/assets%2Fc773263620b04439b4c3604feae0f6da%2F680de7f4e8714a929d2efe1fd2107b8f?format=webp&width=800",
};

/**
 * Get app configuration from user settings or defaults
 */
export function getAppConfig(user?: User | null): AppConfig {
  if (!user?.settings) {
    return DEFAULT_APP_CONFIG;
  }

  return {
    name: user.settings.appName || DEFAULT_APP_CONFIG.name,
    lightLogo: user.settings.lightLogo || DEFAULT_APP_CONFIG.lightLogo,
    darkLogo: user.settings.darkLogo || DEFAULT_APP_CONFIG.darkLogo,
  };
}

/**
 * Get the appropriate logo based on theme
 */
export function getAppLogo(
  theme: "light" | "dark",
  user?: User | null,
): string {
  const config = getAppConfig(user);
  return theme === "dark" ? config.darkLogo : config.lightLogo;
}

/**
 * Get the app name
 */
export function getAppName(user?: User | null): string {
  return getAppConfig(user).name;
}
