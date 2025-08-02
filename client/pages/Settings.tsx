import React, { useState } from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface SettingsProps {
  onClose: () => void;
  onBack?: () => void;
  isModal?: boolean;
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
  | "accessibility";

const Settings: React.FC<SettingsProps> = ({ onClose, onBack, isModal = true }) => {
  const [activeSection, setActiveSection] = useState<SettingsSection>("overview");
  const [settings, setSettings] = useState({
    // Profile settings
    displayName: "User",
    email: "user@example.com",
    bio: "",
    
    // Appearance settings
    theme: "system",
    fontSize: "medium",
    density: "comfortable",
    
    // Notification settings
    emailNotifications: true,
    pushNotifications: true,
    soundEnabled: true,
    
    // Privacy settings
    dataCollection: true,
    analytics: false,
    shareUsage: false,
    
    // Chat settings
    autoSave: true,
    messageHistory: true,
    showTimestamps: true,
    enterToSend: true,
    
    // Language settings
    language: "english",
    region: "us",
    
    // Voice settings
    voiceEnabled: false,
    voiceModel: "natural",
    speechRate: [1],
    
    // Accessibility settings
    highContrast: false,
    reducedMotion: false,
    screenReader: false,
  });

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const settingsMenu = [
    { id: "overview", label: "Overview", icon: User },
    { id: "profile", label: "Profile", icon: User },
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
        <p className="text-muted-foreground">Manage your account settings and preferences.</p>
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
                    <CardTitle className="text-sm md:text-base">{section.label}</CardTitle>
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
      <div>
        <h3 className="text-lg font-semibold mb-2">Profile</h3>
        <p className="text-sm text-muted-foreground">Manage your personal information and preferences.</p>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
            U
          </div>
          <Button variant="outline" size="sm">Change Avatar</Button>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              value={settings.displayName}
              onChange={(e) => updateSetting("displayName", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={settings.email}
              onChange={(e) => updateSetting("email", e.target.value)}
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            placeholder="Tell us about yourself..."
            value={settings.bio}
            onChange={(e) => updateSetting("bio", e.target.value)}
            rows={3}
          />
        </div>
      </div>
      
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
        <h3 className="text-lg font-semibold mb-2">Appearance</h3>
        <p className="text-sm text-muted-foreground">Customize how the interface looks and feels.</p>
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
                variant={settings.theme === value ? "default" : "outline"}
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
          <Select value={settings.fontSize} onValueChange={(value) => updateSetting("fontSize", value)}>
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
          <Select value={settings.density} onValueChange={(value) => updateSetting("density", value)}>
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
        <h3 className="text-lg font-semibold mb-2">Notifications</h3>
        <p className="text-sm text-muted-foreground">Configure how you receive notifications.</p>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Email Notifications</Label>
            <p className="text-sm text-muted-foreground">Receive notifications via email</p>
          </div>
          <Switch
            checked={settings.emailNotifications}
            onCheckedChange={(checked) => updateSetting("emailNotifications", checked)}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Push Notifications</Label>
            <p className="text-sm text-muted-foreground">Receive browser notifications</p>
          </div>
          <Switch
            checked={settings.pushNotifications}
            onCheckedChange={(checked) => updateSetting("pushNotifications", checked)}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Sound Effects</Label>
            <p className="text-sm text-muted-foreground">Play sounds for notifications</p>
          </div>
          <Switch
            checked={settings.soundEnabled}
            onCheckedChange={(checked) => updateSetting("soundEnabled", checked)}
          />
        </div>
      </div>
    </div>
  );

  const renderPrivacy = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Privacy & Security</h3>
        <p className="text-sm text-muted-foreground">Control your privacy and security settings.</p>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Data Collection</Label>
            <p className="text-sm text-muted-foreground">Allow collection of usage data</p>
          </div>
          <Switch
            checked={settings.dataCollection}
            onCheckedChange={(checked) => updateSetting("dataCollection", checked)}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Analytics</Label>
            <p className="text-sm text-muted-foreground">Help improve the service with analytics</p>
          </div>
          <Switch
            checked={settings.analytics}
            onCheckedChange={(checked) => updateSetting("analytics", checked)}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Share Usage Data</Label>
            <p className="text-sm text-muted-foreground">Share anonymized usage patterns</p>
          </div>
          <Switch
            checked={settings.shareUsage}
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
          <Badge variant="secondary" className="ml-auto">Disabled</Badge>
        </Button>
        <Button variant="outline" className="w-full justify-start">
          <Key className="h-4 w-4 mr-2" />
          API Keys
        </Button>
      </div>
    </div>
  );

  const renderChatSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Chat Settings</h3>
        <p className="text-sm text-muted-foreground">Customize your chat experience.</p>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Auto-save Chats</Label>
            <p className="text-sm text-muted-foreground">Automatically save chat conversations</p>
          </div>
          <Switch
            checked={settings.autoSave}
            onCheckedChange={(checked) => updateSetting("autoSave", checked)}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Message History</Label>
            <p className="text-sm text-muted-foreground">Keep chat history across sessions</p>
          </div>
          <Switch
            checked={settings.messageHistory}
            onCheckedChange={(checked) => updateSetting("messageHistory", checked)}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Show Timestamps</Label>
            <p className="text-sm text-muted-foreground">Display message timestamps</p>
          </div>
          <Switch
            checked={settings.showTimestamps}
            onCheckedChange={(checked) => updateSetting("showTimestamps", checked)}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Enter to Send</Label>
            <p className="text-sm text-muted-foreground">Send messages with Enter key</p>
          </div>
          <Switch
            checked={settings.enterToSend}
            onCheckedChange={(checked) => updateSetting("enterToSend", checked)}
          />
        </div>
      </div>
    </div>
  );

  const renderDataStorage = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Data & Storage</h3>
        <p className="text-sm text-muted-foreground">Manage your data and storage preferences.</p>
      </div>
      
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Storage Usage</CardTitle>
            <CardDescription>Current storage usage for your account</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Chat History</span>
                <span>2.1 MB</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Attachments</span>
                <span>156 MB</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Settings</span>
                <span>0.1 MB</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between font-medium">
                <span>Total</span>
                <span>158.2 MB / 1 GB</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="space-y-2">
          <Button variant="outline" className="w-full justify-start">
            <Download className="h-4 w-4 mr-2" />
            Export All Data
          </Button>
          <Button variant="destructive" className="w-full justify-start">
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All Chat History
          </Button>
        </div>
      </div>
    </div>
  );

  const renderLanguage = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Language & Region</h3>
        <p className="text-sm text-muted-foreground">Set your language and regional preferences.</p>
      </div>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Language</Label>
          <Select value={settings.language} onValueChange={(value) => updateSetting("language", value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="english">English</SelectItem>
              <SelectItem value="spanish">Español</SelectItem>
              <SelectItem value="french">Français</SelectItem>
              <SelectItem value="german">Deutsch</SelectItem>
              <SelectItem value="chinese">中文</SelectItem>
              <SelectItem value="japanese">日本語</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label>Region</Label>
          <Select value={settings.region} onValueChange={(value) => updateSetting("region", value)}>
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
        <h3 className="text-lg font-semibold mb-2">Voice & Speech</h3>
        <p className="text-sm text-muted-foreground">Configure voice and speech settings.</p>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Voice Input</Label>
            <p className="text-sm text-muted-foreground">Enable voice-to-text input</p>
          </div>
          <Switch
            checked={settings.voiceEnabled}
            onCheckedChange={(checked) => updateSetting("voiceEnabled", checked)}
          />
        </div>
        
        {settings.voiceEnabled && (
          <>
            <div className="space-y-2">
              <Label>Voice Model</Label>
              <Select value={settings.voiceModel} onValueChange={(value) => updateSetting("voiceModel", value)}>
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
                  value={settings.speechRate}
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
        <h3 className="text-lg font-semibold mb-2">Accessibility</h3>
        <p className="text-sm text-muted-foreground">Configure accessibility features.</p>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>High Contrast</Label>
            <p className="text-sm text-muted-foreground">Increase contrast for better visibility</p>
          </div>
          <Switch
            checked={settings.highContrast}
            onCheckedChange={(checked) => updateSetting("highContrast", checked)}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Reduced Motion</Label>
            <p className="text-sm text-muted-foreground">Minimize animations and transitions</p>
          </div>
          <Switch
            checked={settings.reducedMotion}
            onCheckedChange={(checked) => updateSetting("reducedMotion", checked)}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Screen Reader Support</Label>
            <p className="text-sm text-muted-foreground">Optimize for screen readers</p>
          </div>
          <Switch
            checked={settings.screenReader}
            onCheckedChange={(checked) => updateSetting("screenReader", checked)}
          />
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
    ? "bg-background rounded-lg w-full max-w-4xl max-h-[95vh] md:max-h-[90vh] overflow-hidden"
    : "w-full";

  return (
    <div className={containerClasses}>
      <div className={contentClasses}>
        <div className="flex h-full">
          {/* Sidebar Navigation - Hidden on mobile */}
          <div className="hidden md:block w-64 border-r border-border bg-muted/30 p-4 overflow-y-auto">
            <div className="space-y-1">
              {settingsMenu.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.id}
                    variant={activeSection === item.id ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveSection(item.id as SettingsSection)}
                  >
                    <Icon className="h-4 w-4 mr-3" />
                    {item.label}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
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
                  {activeSection === "overview" ? "Settings" : settingsMenu.find(item => item.id === activeSection)?.label || "Settings"}
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
            <div className="flex-1 overflow-y-auto p-4 md:p-6">
              {renderContent()}
            </div>

            {/* Footer */}
            {activeSection !== "overview" && (
              <div className="border-t border-border p-3 md:p-4 flex-shrink-0">
                <div className="flex flex-col-reverse md:flex-row md:justify-end space-y-2 space-y-reverse md:space-y-0 md:space-x-2">
                  <Button
                    variant="outline"
                    className="w-full md:w-auto"
                    onClick={() => setActiveSection("overview")}
                  >
                    Cancel
                  </Button>
                  <Button className="w-full md:w-auto">Save Changes</Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
