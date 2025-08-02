import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  User,
  Bell,
  Shield,
  Palette,
  MessageSquare,
  Database,
  Download,
  Trash2,
  Key,
  Globe,
  Mic,
  Volume2,
  Eye,
  Moon,
  Sun,
  Monitor,
  ChevronRight,
  Settings2,
  Check,
  EyeOff,
  Smartphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { apiService } from "@/services/api";
import { User as UserType, UserSettings, DataStats } from "@shared/types";
import ConfirmDialog from "@/components/ConfirmDialog";
import SuccessDialog from "@/components/SuccessDialog";
import { useTheme } from "@/components/ThemeProvider";
import { useAuth } from "@/contexts/AuthContext";
import { getAppName, getAppLogo } from "@/lib/app-config";

interface SettingsProps {
  onClose: () => void;
  onBack?: () => void;
  isModal?: boolean;
  onRefresh?: () => void;
  onUserUpdate?: (user: UserType) => void;
}

type SettingsSection =
  | "overview"
  | "profile"
  | "appearance"
  | "notifications"
  | "privacy"
  | "chat"
  | "data"
  | "language"
  | "voice"
  | "accessibility"
  | "app";

const Settings: React.FC<SettingsProps> = ({
  onClose,
  onBack,
  isModal = true,
  onRefresh,
  onUserUpdate,
}) => {
  const [activeSection, setActiveSection] =
    useState<SettingsSection>("overview");
  const [dataStats, setDataStats] = useState<DataStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<Partial<UserType>>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingLightLogo, setIsUploadingLightLogo] = useState(false);
  const [isUploadingDarkLogo, setIsUploadingDarkLogo] = useState(false);

  // Use auth context for user data instead of local state
  const { user, updateUser } = useAuth();
  // Theme context for immediate theme application
  const { setTheme } = useTheme();

  // Load data stats on mount (user data comes from AuthContext)
  useEffect(() => {
    loadDataStats();
  }, []);

  // User data is now provided by AuthContext, no need to load separately

  const loadDataStats = async () => {
    try {
      const response = await apiService.getDataStats();
      if (response.success && response.data) {
        setDataStats(response.data);
      }
    } catch (error) {
      console.error("Failed to load data stats:", error);
    }
  };

  const updateUserProfile = async (updates: Partial<UserType>) => {
    if (!user) return;

    setIsSaving(true);
    setError(null);

    try {
      const response = await apiService.updateUser(user.id, updates);
      if (response.success && response.data) {
        // Update user via AuthContext instead of local state
        updateUser(response.data);
        // Call the callback to update parent component
        onUserUpdate?.(response.data);
      } else {
        setError(response.error || "Failed to update profile");
      }
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to update profile",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const updateUserSettings = async (settingsUpdates: Partial<UserSettings>) => {
    if (!user) return;

    setIsSaving(true);
    setError(null);

    try {
      const response = await apiService.updateUserSettings(
        user.id,
        settingsUpdates,
      );
      if (response.success && response.data) {
        // Update user via AuthContext instead of local state
        updateUser(response.data);
      } else {
        setError(response.error || "Failed to update settings");
      }
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to update settings",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const updateSetting = (key: string, value: any) => {
    if (!user) return;

    // Check if this is a profile field or settings field
    const profileFields = ["displayName", "email", "bio"];

    if (profileFields.includes(key)) {
      // For profile fields, only update local state and track changes (manual save)
      const newChanges = { ...pendingChanges, [key]: value };
      setPendingChanges(newChanges);
      setHasUnsavedChanges(true);

      // Note: AuthContext will handle the state update when profile is saved
    } else {
      // For settings (including appearance), update immediately with auto-save
      updateUserSettings({ [key]: value });

      // Special handling for theme to apply immediately
      if (key === "theme") {
        setTheme(value as "light" | "dark" | "system");
      }

      // Settings will be applied automatically via AuthContext when user data updates
    }
  };

  const handleSaveProfileChanges = async () => {
    if (!user || !hasUnsavedChanges) return;

    await updateUserProfile(pendingChanges);
    setPendingChanges({});
    setHasUnsavedChanges(false);
    setLastSaveTime(new Date());
  };

  // Settings application is now handled by AuthContext and Chatbot component

  const handleClearChatHistory = () => {
    setShowConfirmDialog(true);
  };

  const handleConfirmClear = async () => {
    setIsClearing(true);
    setError(null);

    try {
      const response = await apiService.clearChatHistory();
      if (response.success) {
        // Reload data stats to show updated sizes
        await loadDataStats();
        setShowSuccessDialog(true);
      } else {
        setError(response.error || "Failed to clear chat history");
      }
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to clear chat history",
      );
    } finally {
      setIsClearing(false);
    }
  };

  const handleSuccessClose = () => {
    // Close settings modal and refresh the page
    onClose();
    onRefresh?.();
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setError("Please select a valid image file (JPEG, PNG, GIF, or WebP)");
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB");
      return;
    }

    setIsUploadingAvatar(true);
    setError(null);

    try {
      const response = await apiService.uploadUserAvatar(user.id, file);
      if (response.success && response.data) {
        // Update user via AuthContext
        updateUser(response.data);
        // Call the callback to update parent component
        onUserUpdate?.(response.data);
        setLastSaveTime(new Date());
      } else {
        setError(response.error || "Failed to upload avatar");
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to upload avatar");
    } finally {
      setIsUploadingAvatar(false);
      // Reset the input
      event.target.value = "";
    }
  };

  const handleLightLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setError("Please select a valid image file (JPEG, PNG, GIF, or WebP)");
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB");
      return;
    }

    setIsUploadingLightLogo(true);
    setError(null);

    try {
      const response = await apiService.uploadLightLogo(user.id, file);
      if (response.success && response.data) {
        updateUser(response.data);
        setLastSaveTime(new Date());
      } else {
        setError(response.error || "Failed to upload light logo");
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to upload light logo");
    } finally {
      setIsUploadingLightLogo(false);
      event.target.value = "";
    }
  };

  const handleDarkLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setError("Please select a valid image file (JPEG, PNG, GIF, or WebP)");
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB");
      return;
    }

    setIsUploadingDarkLogo(true);
    setError(null);

    try {
      const response = await apiService.uploadDarkLogo(user.id, file);
      if (response.success && response.data) {
        updateUser(response.data);
        setLastSaveTime(new Date());
      } else {
        setError(response.error || "Failed to upload dark logo");
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to upload dark logo");
    } finally {
      setIsUploadingDarkLogo(false);
      event.target.value = "";
    }
  };

  const settingsMenu = [
    { id: "overview", label: "Overview", icon: Settings2 },
    { id: "profile", label: "Profile", icon: User },
    { id: "app", label: "App Customization", icon: Smartphone },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "privacy", label: "Privacy & Security", icon: Shield },
    { id: "chat", label: "Chat Settings", icon: MessageSquare },
    { id: "data", label: "Data & Storage", icon: Database },
    { id: "language", label: "Language & Region", icon: Globe },
    { id: "voice", label: "Voice & Speech", icon: Mic },
    { id: "accessibility", label: "Accessibility", icon: Eye },
  ] as const;

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="hidden md:block">
        <h2 className="text-2xl font-bold text-foreground mb-2">Settings</h2>
        <p className="text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>

      <div className="grid gap-3 md:gap-4 grid-cols-1 md:grid-cols-2">
        {settingsMenu.slice(1).map((section) => {
          const Icon = section.icon;
          return (
            <Card
              key={section.id}
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => setActiveSection(section.id as SettingsSection)}
            >
              <CardHeader className="pb-3 md:pb-3 p-4 md:p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Icon className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    <CardTitle className="text-sm md:text-base">
                      {section.label}
                    </CardTitle>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                </div>
              </CardHeader>
            </Card>
          );
        })}
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Manage your personal information and preferences.
        </p>
        {(hasUnsavedChanges || isSaving) && (
          <div className="flex items-center text-sm text-muted-foreground">
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 border-b border-primary mr-2"></div>
                Saving...
              </>
            ) : hasUnsavedChanges ? (
              <>
                <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                Unsaved changes
              </>
            ) : null}
          </div>
        )}
        {lastSaveTime && !hasUnsavedChanges && !isSaving && (
          <div className="flex items-center text-sm text-green-600">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            Saved at {lastSaveTime.toLocaleTimeString()}
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 flex items-center justify-center">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt="User Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-white font-bold text-xl">
                {user?.displayName?.charAt(0).toUpperCase() || "U"}
              </span>
            )}
          </div>
          <div>
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              onChange={handleAvatarUpload}
              className="hidden"
              id="avatar-upload"
              disabled={isUploadingAvatar}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => document.getElementById("avatar-upload")?.click()}
              disabled={isUploadingAvatar}
            >
              {isUploadingAvatar ? "Uploading..." : "Change Avatar"}
            </Button>
            <p className="text-xs text-muted-foreground mt-1">
              JPEG, PNG, GIF, WebP up to 5MB
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              value={user?.displayName || ""}
              onChange={(e) => updateSetting("displayName", e.target.value)}
              disabled={isSaving}
              className={cn(
                hasUnsavedChanges && pendingChanges.displayName !== undefined
                  ? "border-orange-300 focus:border-orange-500"
                  : "",
              )}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={user?.email || ""}
              onChange={(e) => updateSetting("email", e.target.value)}
              disabled={isSaving}
              className={cn(
                hasUnsavedChanges && pendingChanges.email !== undefined
                  ? "border-orange-300 focus:border-orange-500"
                  : "",
              )}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            placeholder="Tell us about yourself..."
            value={user?.bio || ""}
            onChange={(e) => updateSetting("bio", e.target.value)}
            rows={3}
            disabled={isSaving}
            className={cn(
              hasUnsavedChanges && pendingChanges.bio !== undefined
                ? "border-orange-300 focus:border-orange-500"
                : "",
            )}
          />
        </div>
      </div>

      {hasUnsavedChanges && (
        <div className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <p className="text-sm text-orange-700">
            You have unsaved changes. Click "Save Now" or use the "Save Changes"
            button to save.
          </p>
          <Button
            size="sm"
            onClick={handleSaveProfileChanges}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save Now"}
          </Button>
        </div>
      )}

      <Separator />

      <div className="space-y-4">
        <h4 className="font-medium">Account Actions</h4>
        <div className="space-y-2">
          <Button variant="outline" className="w-full justify-start">
            <Key className="h-4 w-4 mr-2" />
            Change Password
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <Download className="h-4 w-4 mr-2" />
            Download Data
          </Button>
          <Button variant="destructive" className="w-full justify-start">
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Account
          </Button>
        </div>
      </div>
    </div>
  );

  const renderAppearance = () => (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">
          Customize how the interface looks and feels.
        </p>
      </div>

      <div className="space-y-6">
        <div className="space-y-3">
          <Label>Theme</Label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: "light", label: "Light", icon: Sun },
              { value: "dark", label: "Dark", icon: Moon },
              { value: "system", label: "System", icon: Monitor },
            ].map(({ value, label, icon: Icon }) => (
              <Button
                key={value}
                variant={user?.settings.theme === value ? "default" : "outline"}
                className="flex flex-col items-center gap-2 h-auto py-3"
                onClick={() => updateSetting("theme", value)}
              >
                <Icon className="h-4 w-4" />
                <span className="text-sm">{label}</span>
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <Label>Font Size</Label>
          <Select
            value={user?.settings.fontSize || "medium"}
            onValueChange={(value) => updateSetting("fontSize", value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="small">Small</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="large">Large</SelectItem>
              <SelectItem value="extra-large">Extra Large</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <Label>Display Density</Label>
          <Select
            value={user?.settings.density || "comfortable"}
            onValueChange={(value) => updateSetting("density", value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="compact">Compact</SelectItem>
              <SelectItem value="comfortable">Comfortable</SelectItem>
              <SelectItem value="spacious">Spacious</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );

  const renderNotifications = () => (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">
          Configure how you receive notifications.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Email Notifications</Label>
            <p className="text-sm text-muted-foreground">
              Receive notifications via email
            </p>
          </div>
          <Switch
            checked={user?.settings.emailNotifications || false}
            onCheckedChange={(checked) =>
              updateSetting("emailNotifications", checked)
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Push Notifications</Label>
            <p className="text-sm text-muted-foreground">
              Receive browser notifications
            </p>
          </div>
          <Switch
            checked={user?.settings.pushNotifications || false}
            onCheckedChange={(checked) =>
              updateSetting("pushNotifications", checked)
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Sound Effects</Label>
            <p className="text-sm text-muted-foreground">
              Play sounds for notifications
            </p>
          </div>
          <Switch
            checked={user?.settings.soundEnabled || false}
            onCheckedChange={(checked) =>
              updateSetting("soundEnabled", checked)
            }
          />
        </div>
      </div>
    </div>
  );

  const renderPrivacy = () => (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">
          Control your privacy and security settings.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Data Collection</Label>
            <p className="text-sm text-muted-foreground">
              Allow collection of usage data
            </p>
          </div>
          <Switch
            checked={user?.settings.dataCollection || false}
            onCheckedChange={(checked) =>
              updateSetting("dataCollection", checked)
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Analytics</Label>
            <p className="text-sm text-muted-foreground">
              Help improve the service with analytics
            </p>
          </div>
          <Switch
            checked={user?.settings.analytics || false}
            onCheckedChange={(checked) => updateSetting("analytics", checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Share Usage Data</Label>
            <p className="text-sm text-muted-foreground">
              Share anonymized usage patterns
            </p>
          </div>
          <Switch
            checked={user?.settings.shareUsage || false}
            onCheckedChange={(checked) => updateSetting("shareUsage", checked)}
          />
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h4 className="font-medium">Security</h4>
        <Button variant="outline" className="w-full justify-start">
          <Shield className="h-4 w-4 mr-2" />
          Two-Factor Authentication
          <Badge variant="secondary" className="ml-auto">
            Disabled
          </Badge>
        </Button>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            <Label htmlFor="grokApiKey">Grok API Key</Label>
          </div>
          <div className="relative">
            <Input
              id="grokApiKey"
              type={showApiKey ? "text" : "password"}
              placeholder="Enter your Grok API key..."
              value={user?.settings.grokApiKey || ""}
              onChange={(e) => updateSetting("grokApiKey", e.target.value)}
              disabled={isSaving}
              className="font-mono text-sm pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowApiKey(!showApiKey)}
            >
              {showApiKey ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Your API key is stored securely and used to enable AI chat
            functionality. Get your key from{" "}
            <a
              href="https://console.groq.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Groq Console
            </a>
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            <Label htmlFor="appUrl">App URL</Label>
          </div>
          <Input
            id="appUrl"
            type="url"
            placeholder="http://localhost:8080"
            value={user?.settings.appUrl || ""}
            onChange={(e) => updateSetting("appUrl", e.target.value)}
            disabled={isSaving}
            className="font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">
            The base URL for your application. This is used when generating
            share links for chats. Update this when deploying to production.
          </p>
        </div>
      </div>
    </div>
  );

  const renderChatSettings = () => (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">
          Customize your chat experience.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Auto-save Chats</Label>
            <p className="text-sm text-muted-foreground">
              Automatically save chat conversations
            </p>
          </div>
          <Switch
            checked={user?.settings.autoSave || false}
            onCheckedChange={(checked) => updateSetting("autoSave", checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Message History</Label>
            <p className="text-sm text-muted-foreground">
              Keep chat history across sessions
            </p>
          </div>
          <Switch
            checked={user?.settings.messageHistory || false}
            onCheckedChange={(checked) =>
              updateSetting("messageHistory", checked)
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Show Timestamps</Label>
            <p className="text-sm text-muted-foreground">
              Display message timestamps
            </p>
          </div>
          <Switch
            checked={user?.settings.showTimestamps || false}
            onCheckedChange={(checked) =>
              updateSetting("showTimestamps", checked)
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Enter to Send</Label>
            <p className="text-sm text-muted-foreground">
              Send messages with Enter key
            </p>
          </div>
          <Switch
            checked={user?.settings.enterToSend || false}
            onCheckedChange={(checked) => updateSetting("enterToSend", checked)}
          />
        </div>
      </div>
    </div>
  );

  const renderDataStorage = () => (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">
          Manage your data and storage preferences.
        </p>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Storage Usage</CardTitle>
            <CardDescription>
              Current storage usage for your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Chat History</span>
                <span>
                  {dataStats?.chatHistory.sizeFormatted || "Loading..."}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>File Metadata</span>
                <span>
                  {dataStats?.uploadedFiles.sizeFormatted || "Loading..."}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>User Settings</span>
                <span>
                  {dataStats?.userSettings.sizeFormatted || "Loading..."}
                </span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between font-medium">
                <span>Total JSON Data</span>
                <span>{dataStats?.totalSizeFormatted || "Loading..."}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-2">
          <Button variant="outline" className="w-full justify-start">
            <Download className="h-4 w-4 mr-2" />
            Export All Data
          </Button>
          <Button
            variant="destructive"
            className="w-full justify-start"
            onClick={handleClearChatHistory}
            disabled={isClearing}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {isClearing ? "Clearing..." : "Clear All Chat History"}
          </Button>
        </div>
      </div>
    </div>
  );

  const renderLanguage = () => (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">
          Set your language and regional preferences.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Language</Label>
          <Select
            value={user?.settings.language || "english"}
            onValueChange={(value) => updateSetting("language", value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="english">English</SelectItem>
              <SelectItem value="spanish">Espa��ol</SelectItem>
              <SelectItem value="french">Français</SelectItem>
              <SelectItem value="german">Deutsch</SelectItem>
              <SelectItem value="chinese">中文</SelectItem>
              <SelectItem value="japanese">日本語</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Region</Label>
          <Select
            value={user?.settings.region || "us"}
            onValueChange={(value) => updateSetting("region", value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="us">United States</SelectItem>
              <SelectItem value="uk">United Kingdom</SelectItem>
              <SelectItem value="ca">Canada</SelectItem>
              <SelectItem value="au">Australia</SelectItem>
              <SelectItem value="de">Germany</SelectItem>
              <SelectItem value="fr">France</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );

  const renderVoice = () => (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">
          Configure voice and speech settings.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Voice Input</Label>
            <p className="text-sm text-muted-foreground">
              Enable voice-to-text input
            </p>
          </div>
          <Switch
            checked={user?.settings.voiceEnabled || false}
            onCheckedChange={(checked) =>
              updateSetting("voiceEnabled", checked)
            }
          />
        </div>

        {user?.settings.voiceEnabled && (
          <>
            <div className="space-y-2">
              <Label>Voice Model</Label>
              <Select
                value={user?.settings.voiceModel || "natural"}
                onValueChange={(value) => updateSetting("voiceModel", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="natural">Natural</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label>Speech Rate</Label>
              <div className="px-2">
                <Slider
                  value={user?.settings.speechRate || [1]}
                  onValueChange={(value) => updateSetting("speechRate", value)}
                  max={2}
                  min={0.5}
                  step={0.1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Slow</span>
                  <span>Normal</span>
                  <span>Fast</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );

  const renderAccessibility = () => (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">
          Configure accessibility features.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>High Contrast</Label>
            <p className="text-sm text-muted-foreground">
              Increase contrast for better visibility
            </p>
          </div>
          <Switch
            checked={user?.settings.highContrast || false}
            onCheckedChange={(checked) =>
              updateSetting("highContrast", checked)
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Reduced Motion</Label>
            <p className="text-sm text-muted-foreground">
              Minimize animations and transitions
            </p>
          </div>
          <Switch
            checked={user?.settings.reducedMotion || false}
            onCheckedChange={(checked) =>
              updateSetting("reducedMotion", checked)
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Screen Reader Support</Label>
            <p className="text-sm text-muted-foreground">
              Optimize for screen readers
            </p>
          </div>
          <Switch
            checked={user?.settings.screenReader || false}
            onCheckedChange={(checked) =>
              updateSetting("screenReader", checked)
            }
          />
        </div>
      </div>
    </div>
  );

  const renderAppCustomization = () => (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">
          Customize your app branding and appearance.
        </p>
      </div>

      <div className="space-y-6">
        {/* App Name */}
        <div className="space-y-3">
          <Label htmlFor="appName">App Name</Label>
          <Input
            id="appName"
            placeholder="ChatNova"
            value={user?.settings.appName || ""}
            onChange={(e) => updateSetting("appName", e.target.value)}
            disabled={isSaving}
          />
          <p className="text-xs text-muted-foreground">
            The name of your application that appears in the sidebar and other places
          </p>
        </div>

        <Separator />

        {/* Light Theme Logo */}
        <div className="space-y-4">
          <div>
            <Label>Light Theme Logo</Label>
            <p className="text-sm text-muted-foreground">
              Logo displayed when using light theme
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-lg border border-border overflow-hidden bg-background flex items-center justify-center">
              {user?.settings.lightLogo ? (
                <img
                  src={user.settings.lightLogo}
                  alt="Light Theme Logo"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-muted-foreground text-xs">No logo</span>
              )}
            </div>
            <div>
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                onChange={handleLightLogoUpload}
                className="hidden"
                id="light-logo-upload"
                disabled={isUploadingLightLogo}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => document.getElementById("light-logo-upload")?.click()}
                disabled={isUploadingLightLogo}
              >
                {isUploadingLightLogo ? "Uploading..." : "Upload Light Logo"}
              </Button>
              <p className="text-xs text-muted-foreground mt-1">
                JPEG, PNG, GIF, WebP up to 5MB
              </p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Dark Theme Logo */}
        <div className="space-y-4">
          <div>
            <Label>Dark Theme Logo</Label>
            <p className="text-sm text-muted-foreground">
              Logo displayed when using dark theme
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-lg border border-border overflow-hidden bg-background flex items-center justify-center">
              {user?.settings.darkLogo ? (
                <img
                  src={user.settings.darkLogo}
                  alt="Dark Theme Logo"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-muted-foreground text-xs">No logo</span>
              )}
            </div>
            <div>
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                onChange={handleDarkLogoUpload}
                className="hidden"
                id="dark-logo-upload"
                disabled={isUploadingDarkLogo}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => document.getElementById("dark-logo-upload")?.click()}
                disabled={isUploadingDarkLogo}
              >
                {isUploadingDarkLogo ? "Uploading..." : "Upload Dark Logo"}
              </Button>
              <p className="text-xs text-muted-foreground mt-1">
                JPEG, PNG, GIF, WebP up to 5MB
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case "overview":
        return renderOverview();
      case "profile":
        return renderProfile();
      case "app":
        return renderAppCustomization();
      case "appearance":
        return renderAppearance();
      case "notifications":
        return renderNotifications();
      case "privacy":
        return renderPrivacy();
      case "chat":
        return renderChatSettings();
      case "data":
        return renderDataStorage();
      case "language":
        return renderLanguage();
      case "voice":
        return renderVoice();
      case "accessibility":
        return renderAccessibility();
      default:
        return renderOverview();
    }
  };

  const containerClasses = isModal
    ? "fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 md:p-4"
    : "min-h-screen bg-background";

  const contentClasses = isModal
    ? "bg-background rounded-lg w-full max-w-4xl h-[85vh] md:h-[80vh] overflow-hidden flex flex-col"
    : "w-full";

  if (isLoading) {
    return (
      <div className={containerClasses}>
        <div className={contentClasses}>
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading settings...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={containerClasses}>
        <div className={contentClasses}>
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-destructive mb-4">Error: {error}</p>
              <Button onClick={onClose}>Close</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={containerClasses}>
        <div className={contentClasses}>
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-muted-foreground">No user data found</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={containerClasses}>
      <div className={contentClasses}>
        <div className="flex h-full min-h-0">
          {/* Sidebar Navigation - Hidden on mobile */}
          <div className="hidden md:block w-64 border-r border-border bg-muted/30 flex-shrink-0">
            <div className="h-full overflow-y-auto p-4">
              <div className="space-y-1">
                {settingsMenu.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Button
                      key={item.id}
                      variant={
                        activeSection === item.id ? "secondary" : "ghost"
                      }
                      className="w-full justify-start"
                      onClick={() =>
                        setActiveSection(item.id as SettingsSection)
                      }
                    >
                      <Icon className="h-4 w-4 mr-3" />
                      {item.label}
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
              <div className="flex items-center space-x-3">
                {onBack && (
                  <Button variant="ghost" size="sm" onClick={onBack}>
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                )}
                {activeSection !== "overview" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveSection("overview")}
                    className="md:hidden"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                )}
                <h1 className="text-lg md:text-xl font-semibold">
                  {activeSection === "overview"
                    ? "Settings"
                    : settingsMenu.find((item) => item.id === activeSection)
                        ?.label || "Settings"}
                </h1>
              </div>
              <Button variant="ghost" size="sm" onClick={onClose}>
                ×
              </Button>
            </div>

            {/* Mobile Navigation - Only visible on mobile when not in overview */}
            {activeSection === "overview" && (
              <div className="md:hidden border-b border-border bg-muted/30 p-2 flex-shrink-0">
                <div className="text-sm text-muted-foreground px-2">
                  Choose a setting category
                </div>
              </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 min-h-0">
              <div className="h-full">{renderContent()}</div>
            </div>

            {/* Footer */}
            {activeSection !== "overview" && (
              <div className="border-t border-border p-3 md:p-4 flex-shrink-0">
                <div className="flex flex-col-reverse md:flex-row md:justify-end space-y-2 space-y-reverse md:space-y-0 md:space-x-2">
                  <Button
                    variant="outline"
                    className="w-full md:w-auto"
                    onClick={onClose}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="w-full md:w-auto"
                    onClick={
                      activeSection === "profile"
                        ? async () => {
                            await handleSaveProfileChanges();
                            onClose();
                          }
                        : onClose
                    }
                    disabled={
                      activeSection === "profile"
                        ? !hasUnsavedChanges || isSaving
                        : false
                    }
                  >
                    {activeSection === "profile" && isSaving
                      ? "Saving..."
                      : "Save Changes"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        title="Clear Chat History"
        description="Are you sure you want to clear all chat history? This action cannot be undone and will permanently delete all your conversations."
        confirmText="Clear All"
        cancelText="Cancel"
        onConfirm={handleConfirmClear}
        destructive={true}
      />

      {/* Success Dialog */}
      <SuccessDialog
        open={showSuccessDialog}
        onOpenChange={setShowSuccessDialog}
        title="Chat History Cleared"
        description="Your chat history has been successfully cleared. All conversations have been permanently removed."
        buttonText="Continue"
        onClose={handleSuccessClose}
      />
    </div>
  );
};

export default Settings;
