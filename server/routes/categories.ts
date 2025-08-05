import { RequestHandler } from "express";
import {
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  ApiResponse,
} from "@shared/types";
import { DataManager } from "../utils/dataManager";

const dataManager = new DataManager();

// Get all categories for a user
export const getCategories: RequestHandler = async (req, res) => {
  try {
    const userId = req.query.userId as string;

    if (!userId) {
      res.status(400).json({
        success: false,
        error: "User ID is required",
      });
      return;
    }

    // Ensure user has a default category
    await dataManager.ensureDefaultCategory(userId);

    const categories = await dataManager.getCategoriesByUserId(userId);

    res.json({
      success: true,
      data: categories,
    } as ApiResponse<Category[]>);
  } catch (error) {
    console.error("Error getting categories:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get categories",
    });
  }
};

// Create a new category
export const createCategory: RequestHandler = async (req, res) => {
  try {
    const request = req.body as CreateCategoryRequest;
    const userId = request.userId || (req.query.userId as string);

    if (!userId || !request.name?.trim()) {
      res.status(400).json({
        success: false,
        error: "User ID and category name are required",
      });
      return;
    }

    const category = await dataManager.createCategory({
      ...request,
      userId,
      name: request.name.trim(),
    });

    res.json({
      success: true,
      data: category,
    } as ApiResponse<Category>);
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create category",
    });
  }
};

// Update a category
export const updateCategory: RequestHandler = async (req, res) => {
  try {
    const categoryId = req.params.categoryId;
    const updates = req.body as UpdateCategoryRequest;
    const userId = req.query.userId as string;

    if (!categoryId || !userId) {
      res.status(400).json({
        success: false,
        error: "Category ID and User ID are required",
      });
      return;
    }

    const category = await dataManager.updateCategory(
      categoryId,
      updates,
      userId,
    );

    if (!category) {
      res.status(404).json({
        success: false,
        error: "Category not found",
      });
      return;
    }

    res.json({
      success: true,
      data: category,
    } as ApiResponse<Category>);
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update category",
    });
  }
};

// Delete a category
export const deleteCategory: RequestHandler = async (req, res) => {
  try {
    const categoryId = req.params.categoryId;
    const userId = req.query.userId as string;

    if (!categoryId || !userId) {
      res.status(400).json({
        success: false,
        error: "Category ID and User ID are required",
      });
      return;
    }

    const success = await dataManager.deleteCategory(categoryId, userId);

    if (!success) {
      res.status(404).json({
        success: false,
        error: "Category not found or cannot be deleted",
      });
      return;
    }

    res.json({
      success: true,
    } as ApiResponse<null>);
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete category",
    });
  }
};

// Update chat category
export const updateChatCategory: RequestHandler = async (req, res) => {
  try {
    const chatId = req.params.chatId;
    const { categoryId } = req.body;
    const userId = req.query.userId as string;

    if (!chatId || !userId) {
      res.status(400).json({
        success: false,
        error: "Chat ID and User ID are required",
      });
      return;
    }

    const chat = await dataManager.updateChatCategory(
      chatId,
      categoryId,
      userId,
    );

    if (!chat) {
      res.status(404).json({
        success: false,
        error: "Chat not found",
      });
      return;
    }

    res.json({
      success: true,
      data: chat,
    });
  } catch (error) {
    console.error("Error updating chat category:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update chat category",
    });
  }
};
