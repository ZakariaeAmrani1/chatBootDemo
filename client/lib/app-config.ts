import type { User } from "@shared/types";

export interface AppConfig {
  name: string;
  lightLogo: string;
  darkLogo: string;
}

// Default app configuration
const DEFAULT_APP_CONFIG: AppConfig = {
  name: "WEPILOT",
  lightLogo:
    "https://cdn.builder.io/api/v1/image/assets%2F44a5eb94f41543f4ab63e8551bda8b34%2F6ead540a48134e50a31b2e5ae416d5b5?format=webp&width=800",
  darkLogo:
    "https://cdn.builder.io/api/v1/image/assets%2F44a5eb94f41543f4ab63e8551bda8b34%2F6ead540a48134e50a31b2e5ae416d5b5?format=webp&width=800",
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
