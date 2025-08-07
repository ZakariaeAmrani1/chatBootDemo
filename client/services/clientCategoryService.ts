import { Category, ApiResponse } from "@shared/types";
import { StorageManager } from "./storageManager";
import { v4 as uuidv4 } from "uuid";

export class ClientCategoryService {
  static async getCategories(userId: string): Promise<ApiResponse<Category[]>> {
    try {
      const categories = StorageManager.getCategoriesByUserId(userId);

      // Sort by createdAt ascending (default category first)
      const sortedCategories = categories.sort((a, b) => {
        // Put default category first
        if (a.isDefault && !b.isDefault) return -1;
        if (!a.isDefault && b.isDefault) return 1;

        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      });

      return {
        success: true,
        data: sortedCategories,
      };
    } catch (error) {
      console.error("Error getting categories:", error);
      return {
        success: false,
        error: "Failed to get categories",
      };
    }
  }

  static async createCategory(
    name: string,
    userId: string,
  ): Promise<ApiResponse<Category>> {
    try {
      if (!name.trim()) {
        return {
          success: false,
          error: "Category name is required",
        };
      }

      // Check if category name already exists for this user
      const existingCategories = StorageManager.getCategoriesByUserId(userId);
      const nameExists = existingCategories.some(
        (category) => category.name.toLowerCase() === name.trim().toLowerCase(),
      );

      if (nameExists) {
        return {
          success: false,
          error: "A category with this name already exists",
        };
      }

      const categoryId = uuidv4();
      const now = new Date().toISOString();

      const newCategory: Category = {
        id: categoryId,
        name: name.trim(),
        createdAt: now,
        updatedAt: now,
        userId: userId,
        isDefault: false,
      };

      const savedCategory = StorageManager.createCategory(newCategory);

      return {
        success: true,
        data: savedCategory,
      };
    } catch (error) {
      console.error("Error creating category:", error);
      return {
        success: false,
        error: "Failed to create category",
      };
    }
  }

  static async updateCategory(
    categoryId: string,
    name: string,
    userId: string,
  ): Promise<ApiResponse<Category>> {
    try {
      if (!name.trim()) {
        return {
          success: false,
          error: "Category name is required",
        };
      }

      // Check if the category exists and belongs to the user
      const category = StorageManager.getCategoryById(categoryId);
      if (!category) {
        return {
          success: false,
          error: "Category not found",
        };
      }

      if (category.userId !== userId) {
        return {
          success: false,
          error: "Unauthorized to update this category",
        };
      }

      // Check if category name already exists for this user (excluding current category)
      const existingCategories = StorageManager.getCategoriesByUserId(userId);
      const nameExists = existingCategories.some(
        (cat) =>
          cat.id !== categoryId &&
          cat.name.toLowerCase() === name.trim().toLowerCase(),
      );

      if (nameExists) {
        return {
          success: false,
          error: "A category with this name already exists",
        };
      }

      const updatedCategory = StorageManager.updateCategory(categoryId, {
        name: name.trim(),
        updatedAt: new Date().toISOString(),
      });

      if (!updatedCategory) {
        return {
          success: false,
          error: "Failed to update category",
        };
      }

      return {
        success: true,
        data: updatedCategory,
      };
    } catch (error) {
      console.error("Error updating category:", error);
      return {
        success: false,
        error: "Failed to update category",
      };
    }
  }

  static async deleteCategory(
    categoryId: string,
    userId: string,
  ): Promise<ApiResponse<{ success: boolean }>> {
    try {
      // Check if the category exists and belongs to the user
      const category = StorageManager.getCategoryById(categoryId);
      if (!category) {
        return {
          success: false,
          error: "Category not found",
        };
      }

      if (category.userId !== userId) {
        return {
          success: false,
          error: "Unauthorized to delete this category",
        };
      }

      // Prevent deletion of default category
      if (category.isDefault) {
        return {
          success: false,
          error: "Cannot delete the default category",
        };
      }

      // Check if there are chats using this category
      const userChats = StorageManager.getChatsByUserId(userId);
      const chatsUsingCategory = userChats.filter(
        (chat) => chat.categoryId === categoryId,
      );

      if (chatsUsingCategory.length > 0) {
        // Move chats to default category
        const defaultCategory = StorageManager.getCategoriesByUserId(
          userId,
        ).find((cat) => cat.isDefault);

        if (defaultCategory) {
          chatsUsingCategory.forEach((chat) => {
            StorageManager.updateChat(chat.id, {
              categoryId: defaultCategory.id,
              updatedAt: new Date().toISOString(),
            });
          });
        }
      }

      const deleted = StorageManager.deleteCategory(categoryId);

      if (!deleted) {
        return {
          success: false,
          error: "Failed to delete category",
        };
      }

      return {
        success: true,
        data: { success: true },
      };
    } catch (error) {
      console.error("Error deleting category:", error);
      return {
        success: false,
        error: "Failed to delete category",
      };
    }
  }

  static async getCategoryById(
    categoryId: string,
  ): Promise<ApiResponse<Category>> {
    try {
      const category = StorageManager.getCategoryById(categoryId);

      if (!category) {
        return {
          success: false,
          error: "Category not found",
        };
      }

      return {
        success: true,
        data: category,
      };
    } catch (error) {
      console.error("Error getting category:", error);
      return {
        success: false,
        error: "Failed to get category",
      };
    }
  }

  static async ensureDefaultCategory(userId: string): Promise<Category> {
    const categories = StorageManager.getCategoriesByUserId(userId);
    let defaultCategory = categories.find((cat) => cat.isDefault);

    if (!defaultCategory) {
      const categoryId = `default-general-${userId}`;
      const now = new Date().toISOString();

      defaultCategory = {
        id: categoryId,
        name: "General",
        createdAt: now,
        updatedAt: now,
        userId: userId,
        isDefault: true,
      };

      StorageManager.createCategory(defaultCategory);
    }

    return defaultCategory;
  }
}
