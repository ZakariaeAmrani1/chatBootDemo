import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/components/ThemeProvider";
import { getAppLogo, getAppName } from "@/lib/app-config";
import {
  MessageSquare,
  Plus,
  Settings,
  Trash2,
  Edit3,
  X,
  Archive,
  PanelLeftClose,
  PanelLeftOpen,
  MoreHorizontal,
  Folder,
  FolderOpen,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import ConfirmDialog from "@/components/ConfirmDialog";
import CategoryManager from "@/components/CategoryManager";
import { apiService } from "@/services/api";
import { categoryService, CategoryState } from "@/services/categoryService";
import { chatService } from "@/services/chatService";

import { cn } from "@/lib/utils";
import type { Chat, User, Category } from "@shared/types";

interface ChatSidebarProps {
  chats: Chat[];
  currentChatId: string;
  onChatSelect: (chatId: string) => void;
  onNewChat: () => void;
  onCloseSidebar: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onOpenSettings?: () => void;
  onDeleteChat?: (chatId: string) => void;
  onUpdateChat?: (chatId: string, updates: Partial<Chat>) => void;
  isLoading?: boolean;
  user?: User | null;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({
  chats,
  currentChatId,
  onChatSelect,
  onNewChat,
  onCloseSidebar,
  collapsed,
  onToggleCollapse,
  onOpenSettings,
  onDeleteChat,
  onUpdateChat,
  isLoading = false,
  user,
}) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { resolvedTheme } = useTheme();
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [chatToDelete, setChatToDelete] = useState<string | null>(null);

  // Category state
  const [categoryState, setCategoryState] = useState<CategoryState>({
    categories: [],
    isLoading: false,
    error: null,
  });
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(
    new Set(),
  );
  const [selectedChatForCategory, setSelectedChatForCategory] = useState<
    string | null
  >(null);

  const handleDeleteClick = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setChatToDelete(chatId);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (chatToDelete && onDeleteChat) {
      onDeleteChat(chatToDelete);
    }
    // Clean up state
    setChatToDelete(null);
  };

  const handleEditClick = (chat: Chat, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingChatId(chat.id);
    setEditTitle(chat.title);
  };

  const handleEditSave = async (chatId: string) => {
    if (editTitle.trim() && onUpdateChat) {
      await onUpdateChat(chatId, { title: editTitle.trim() });
    }
    setEditingChatId(null);
    setEditTitle("");
  };

  const handleEditCancel = () => {
    setEditingChatId(null);
    setEditTitle("");
  };

  const handleKeyDown = (e: React.KeyboardEvent, chatId: string) => {
    if (e.key === "Enter") {
      handleEditSave(chatId);
    } else if (e.key === "Escape") {
      handleEditCancel();
    }
  };

  // Subscribe to category service and track category changes
  useEffect(() => {
    const unsubscribe = categoryService.subscribe((newState) => {
      setCategoryState((prevState) => {
        const oldCategoryIds = new Set(
          prevState.categories.map((cat) => cat.id),
        );

        // Auto-expand newly created categories
        newState.categories.forEach((category) => {
          if (!oldCategoryIds.has(category.id)) {
            // This is a new category, make sure it's expanded
            setCollapsedCategories((prev) => {
              const newCollapsed = new Set(prev);
              newCollapsed.delete(category.id);
              return newCollapsed;
            });
          }
        });

        return newState;
      });
    });
    return unsubscribe;
  }, []); // Remove dependency to prevent infinite loops

  // Load categories when user changes
  useEffect(() => {
    if (user?.id) {
      // Force reload to ensure fresh data
      categoryService.loadCategories(user.id);
    }
  }, [user?.id]);

  // Ensure default categories are expanded
  useEffect(() => {
    if (categoryState.categories.length > 0) {
      setCollapsedCategories((prev) => {
        const newCollapsed = new Set(prev);
        // Expand default categories
        categoryState.categories.forEach((category) => {
          if (category.isDefault) {
            newCollapsed.delete(category.id);
          }
        });
        return newCollapsed;
      });
    }
  }, [categoryState.categories]);

  // Ensure categories are loaded when chats change
  useEffect(() => {
    if (
      user?.id &&
      categoryState.categories.length === 0 &&
      !categoryState.isLoading
    ) {
      categoryService.loadCategories(user.id);
    }
  }, [
    chats,
    user?.id,
    categoryState.categories.length,
    categoryState.isLoading,
  ]);

  // Organize chats by category
  const organizedChats = useMemo(() => {
    const categorized: { [categoryId: string]: Chat[] } = {};
    const uncategorized: Chat[] = [];

    // Initialize all categories with empty arrays
    categoryState.categories.forEach((category) => {
      categorized[category.id] = [];
    });

    // Sort chats into categories
    chats.forEach((chat) => {
      if (chat.categoryId) {
        // First check if we have this category initialized
        if (categorized[chat.categoryId] !== undefined) {
          categorized[chat.categoryId].push(chat);
        } else {
          // Category doesn't exist in our current categories, put in uncategorized
          uncategorized.push(chat);
        }
      } else {
        uncategorized.push(chat);
      }
    });
    return { categorized, uncategorized };
  }, [chats, categoryState.categories]);

  const toggleCategory = (categoryId: string) => {
    const newCollapsed = new Set(collapsedCategories);
    if (newCollapsed.has(categoryId)) {
      newCollapsed.delete(categoryId);
    } else {
      newCollapsed.add(categoryId);
    }
    setCollapsedCategories(newCollapsed);
  };

  const moveChatToCategory = async (
    chatId: string,
    categoryId: string | null,
  ) => {
    try {
      const response = await apiService.updateChatCategory(chatId, categoryId);
      if (response.success && response.data && onUpdateChat) {
        // Update the chat with the new category immediately
        onUpdateChat(chatId, { categoryId: categoryId || undefined });

        // Ensure the target category is expanded to show the moved chat
        if (categoryId) {
          setCollapsedCategories((prev) => {
            const newCollapsed = new Set(prev);
            newCollapsed.delete(categoryId);
            return newCollapsed;
          });
        }
      } else {
        console.error("Failed to move chat to category:", response.error);
      }
    } catch (error) {
      console.error("Failed to move chat to category:", error);
    }
  };

  const handleNewChatInCategory = (categoryId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!user?.id) {
      console.error("No user available");
      return;
    }

    try {
      // Create a draft chat (not saved to backend until first message)
      const createChatRequest = {
        title: "New chat",
        model: "gemini-pro", // Default model
        chatbootVersion: "1.0",
      };

      const draftChat = chatService.createDraftChat(createChatRequest, user.id, categoryId);

      // Ensure the category is expanded to show the new draft chat
      setCollapsedCategories((prev) => {
        const newCollapsed = new Set(prev);
        newCollapsed.delete(categoryId);
        return newCollapsed;
      });
    } catch (error) {
      console.error("Error creating draft chat in category:", error);
      // Fallback to regular new chat
      onNewChat();
    }
  };

  // Ensure proper cleanup when modal closes
  useEffect(() => {
    if (!deleteConfirmOpen) {
      setChatToDelete(null);
    }
  }, [deleteConfirmOpen]);
  return (
    <TooltipProvider>
      <div className="h-full bg-background text-foreground flex flex-col border-r border-border shadow-sm">
        {/* Header */}
        <div
          className={cn(
            "border-b border-border bg-background/50 backdrop-blur-sm",
            collapsed ? "p-2" : "p-4",
          )}
        >
          <div
            className={cn(
              "flex items-center mb-4",
              collapsed ? "justify-center" : "justify-between",
            )}
          >
            {!collapsed && (
              <div className="flex items-center gap-2">
                <img
                  src={getAppLogo(resolvedTheme, user)}
                  alt={`${getAppName(user)} Logo`}
                  className="w-6 h-6 rounded-lg shadow-sm"
                />
                <h2 className="text-lg font-semibold text-foreground tracking-tight">
                  {getAppName(user)}
                </h2>
              </div>
            )}
            <div className="flex items-center gap-1">
              {!collapsed && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="lg:hidden text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  onClick={onCloseSidebar}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-foreground hover:bg-muted/50 hidden lg:flex"
                    onClick={onToggleCollapse}
                  >
                    {collapsed ? (
                      <PanelLeftOpen className="h-4 w-4" />
                    ) : (
                      <PanelLeftClose className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  {collapsed ? "Expand sidebar" : "Collapse sidebar"}
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

          <div className="space-y-2">
            {collapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => onNewChat()}
                    className="w-full bg-accent hover:bg-accent/80 text-accent-foreground border border-border h-10"
                    variant="outline"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">New chat</TooltipContent>
              </Tooltip>
            ) : (
              <Button
                onClick={() => onNewChat()}
                className="w-full bg-accent hover:bg-accent/80 text-accent-foreground border border-border"
                variant="outline"
              >
                <Plus className="h-4 w-4 mr-2" />
                New chat
              </Button>
            )}

            {!collapsed && (
              <CategoryManager
                categories={categoryState.categories}
                onCategoriesChange={(categories) => {
                  categoryService.updateCategoriesLocally(categories);
                  // Force reload categories from server to ensure sync
                  if (user?.id) {
                    setTimeout(() => {
                      categoryService.forceReload(user.id);
                    }, 200);
                  }
                }}
                onDialogClose={() => {
                  // Ensure categories are expanded when dialog closes
                  if (user?.id) {
                    categoryService.forceReload(user.id);
                  }
                }}
                triggerButton={
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-muted-foreground"
                  >
                    <Folder className="h-4 w-4 mr-2" />
                    Manage Categories
                  </Button>
                }
              />
            )}
          </div>
        </div>

        {/* Chat History */}
        <ScrollArea className={cn("flex-1", collapsed ? "px-1" : "px-2")}>
          <div className="space-y-1 py-2">
            {chats.length === 0 && !collapsed && (
              <div className="px-3 py-6 text-center">
                <MessageSquare className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  No conversations yet
                </p>
                <p className="text-xs text-muted-foreground/70 mt-1">
                  Start a new chat to begin
                </p>
              </div>
            )}

            {collapsed ? (
              // Collapsed view - show all chats as icons
              chats.map((chat) => (
                <Tooltip key={chat.id}>
                  <TooltipTrigger asChild>
                    <div
                      className={cn(
                        "flex items-center justify-center p-2 rounded-md cursor-pointer transition-colors",
                        "hover:bg-muted/50",
                        currentChatId === chat.id ? "bg-muted" : "",
                      )}
                      onClick={() => onChatSelect(chat.id)}
                    >
                      <MessageSquare
                        className={cn(
                          "h-4 w-4 transition-colors",
                          currentChatId === chat.id
                            ? "text-accent-foreground"
                            : "text-muted-foreground",
                        )}
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right">{chat.title}</TooltipContent>
                </Tooltip>
              ))
            ) : (
              // Expanded view - show organized by categories
              <>
                {/* Render categorized chats */}
                {categoryState.categories.map((category) => {
                  const categoryChats =
                    organizedChats.categorized[category.id] || [];
                  const isCollapsed = collapsedCategories.has(category.id);

                  // Always show categories, even if empty

                  return (
                    <div key={category.id} className="space-y-1">
                      {/* Category header */}
                      <div className="flex items-center justify-between px-2 py-1 group">
                        <div
                          className="flex items-center text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors flex-1"
                          onClick={() => toggleCategory(category.id)}
                        >
                          {isCollapsed ? (
                            <ChevronRight className="h-3 w-3 mr-1" />
                          ) : (
                            <ChevronDown className="h-3 w-3 mr-1" />
                          )}
                          <Folder className="h-3 w-3 mr-2" />
                          {category.name}
                        </div>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                              onClick={(e) => handleNewChatInCategory(category.id, e)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="right">
                            New chat in {category.name}
                          </TooltipContent>
                        </Tooltip>
                      </div>

                      {/* Category chats */}
                      {!isCollapsed &&
                        categoryChats.map((chat) => (
                          <div
                            key={chat.id}
                            className={cn(
                              "group flex items-center px-3 py-2 ml-4 rounded-md cursor-pointer transition-colors",
                              "hover:bg-muted/50",
                              currentChatId === chat.id ? "bg-muted" : "",
                              editingChatId === chat.id && "bg-muted",
                            )}
                            onClick={() =>
                              editingChatId !== chat.id && onChatSelect(chat.id)
                            }
                          >
                            <MessageSquare className="h-4 w-4 mr-3 flex-shrink-0 text-muted-foreground" />

                            {editingChatId === chat.id ? (
                              <Input
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                onKeyDown={(e) => handleKeyDown(e, chat.id)}
                                onBlur={() => handleEditSave(chat.id)}
                                className="text-sm h-6 px-1 border-none shadow-none focus:ring-1 focus:ring-primary flex-1 min-w-0"
                                autoFocus
                              />
                            ) : (
                              <span
                                className={cn(
                                  "text-sm flex-1 min-w-0 pr-2 flex items-center gap-1",
                                  chat.isDraft ? "text-muted-foreground italic" : "text-foreground"
                                )}
                                title={chat.title}
                              >
                                {chat.title.length > 25
                                  ? `${chat.title.substring(0, 25)}...`
                                  : chat.title}
                                {chat.isDraft && (
                                  <span className="text-xs text-muted-foreground/70">(draft)</span>
                                )}
                              </span>
                            )}

                            {editingChatId !== chat.id && !chat.isDraft && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" side="right">
                                  <DropdownMenuItem
                                    onClick={(e) => handleEditClick(chat, e)}
                                  >
                                    <Edit3 className="mr-2 h-4 w-4" />
                                    Edit
                                  </DropdownMenuItem>
                                  {/* Category assignment submenu */}
                                  <DropdownMenu>
                                    <DropdownMenuTrigger className="flex items-center w-full px-2 py-1.5 text-sm hover:bg-accent rounded-sm">
                                      <Folder className="mr-2 h-4 w-4" />
                                      Move to Category
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent side="right">
                                      {categoryState.categories.map((cat) => (
                                        <DropdownMenuItem
                                          key={cat.id}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            moveChatToCategory(chat.id, cat.id);
                                          }}
                                        >
                                          <Folder className="mr-2 h-4 w-4" />
                                          {cat.name}
                                        </DropdownMenuItem>
                                      ))}
                                      <DropdownMenuItem
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          moveChatToCategory(chat.id, null);
                                        }}
                                      >
                                        <X className="mr-2 h-4 w-4" />
                                        Remove from Category
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                  <DropdownMenuItem
                                    onClick={(e) =>
                                      handleDeleteClick(chat.id, e)
                                    }
                                    className="text-destructive focus:text-destructive"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </div>
                        ))}
                    </div>
                  );
                })}

                {/* Render uncategorized chats */}
                {organizedChats.uncategorized.length > 0 && (
                  <div className="space-y-1">
                    <div className="flex items-center px-2 py-1 text-sm font-medium text-muted-foreground">
                      <MessageSquare className="h-3 w-3 mr-2" />
                      Uncategorized
                    </div>

                    {organizedChats.uncategorized.map((chat) => (
                      <div
                        key={chat.id}
                        className={cn(
                          "group flex items-center px-3 py-2 ml-4 rounded-md cursor-pointer transition-colors",
                          "hover:bg-muted/50",
                          currentChatId === chat.id ? "bg-muted" : "",
                          editingChatId === chat.id && "bg-muted",
                        )}
                        onClick={() =>
                          editingChatId !== chat.id && onChatSelect(chat.id)
                        }
                      >
                        <MessageSquare className="h-4 w-4 mr-3 flex-shrink-0 text-muted-foreground" />

                        {editingChatId === chat.id ? (
                          <Input
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, chat.id)}
                            onBlur={() => handleEditSave(chat.id)}
                            className="text-sm h-6 px-1 border-none shadow-none focus:ring-1 focus:ring-primary flex-1 min-w-0"
                            autoFocus
                          />
                        ) : (
                          <span
                            className={cn(
                              "text-sm flex-1 min-w-0 pr-2 flex items-center gap-1",
                              chat.isDraft ? "text-muted-foreground italic" : "text-foreground"
                            )}
                            title={chat.title}
                          >
                            {chat.title.length > 25
                              ? `${chat.title.substring(0, 25)}...`
                              : chat.title}
                            {chat.isDraft && (
                              <span className="text-xs text-muted-foreground/70">(draft)</span>
                            )}
                          </span>
                        )}

                        {editingChatId !== chat.id && !chat.isDraft && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" side="right">
                              <DropdownMenuItem
                                onClick={(e) => handleEditClick(chat, e)}
                              >
                                <Edit3 className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              {/* Category assignment submenu */}
                              <DropdownMenu>
                                <DropdownMenuTrigger className="flex items-center w-full px-2 py-1.5 text-sm hover:bg-accent rounded-sm">
                                  <Folder className="mr-2 h-4 w-4" />
                                  Move to Category
                                </DropdownMenuTrigger>
                                <DropdownMenuContent side="right">
                                  {categoryState.categories.map((cat) => (
                                    <DropdownMenuItem
                                      key={cat.id}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        moveChatToCategory(chat.id, cat.id);
                                      }}
                                    >
                                      <Folder className="mr-2 h-4 w-4" />
                                      {cat.name}
                                    </DropdownMenuItem>
                                  ))}
                                </DropdownMenuContent>
                              </DropdownMenu>
                              <DropdownMenuItem
                                onClick={(e) => handleDeleteClick(chat.id, e)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </ScrollArea>

        {/* Bottom Section */}
        <div
          className={cn(
            "border-t border-border/50 bg-background/30 backdrop-blur-sm space-y-2",
            collapsed ? "p-2" : "p-4",
          )}
        >
          {collapsed ? (
            <>
              <div className="space-y-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 h-10"
                      onClick={() => navigate("/library")}
                    >
                      <Archive className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">Library</TooltipContent>
                </Tooltip>
              </div>

              <Separator className="my-2 bg-border/50" />

              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex justify-center">
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 flex items-center justify-center cursor-pointer shadow-sm transition-all duration-200">
                      {user?.avatar ? (
                        <img
                          src={user.avatar}
                          alt="User Avatar"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-white font-semibold text-sm">
                          {user?.displayName?.charAt(0).toUpperCase() || "U"}
                        </span>
                      )}
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <div className="text-left">
                    <p className="font-semibold">
                      {user?.displayName || "User"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {user?.email || "user@example.com"}
                    </p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </>
          ) : (
            <>
              <div className="space-y-1">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  onClick={() => navigate("/library")}
                >
                  <Archive className="h-4 w-4 mr-3" />
                  Library
                </Button>
              </div>

              <Separator className="my-2 bg-border/50" />

              <div className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted/50 cursor-pointer group">
                <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 flex items-center justify-center">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt="User Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-white font-semibold text-sm">
                      {user?.displayName?.charAt(0).toUpperCase() || "U"}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {user?.displayName || "User"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user?.email || "user@example.com"}
                  </p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground hover:bg-muted/50 opacity-0 group-hover:opacity-100"
                    >
                      <Settings className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" side="top">
                    <DropdownMenuItem onClick={onOpenSettings}>
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={logout}
                      className="text-destructive focus:text-destructive"
                    >
                      <X className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={(open) => {
          setDeleteConfirmOpen(open);
          if (!open) {
            setChatToDelete(null);
          }
        }}
        title="Delete Chat"
        description="Are you sure you want to delete this chat? This action cannot be undone and will permanently remove all messages in this conversation."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        destructive={true}
      />
    </TooltipProvider>
  );
};

export default ChatSidebar;
