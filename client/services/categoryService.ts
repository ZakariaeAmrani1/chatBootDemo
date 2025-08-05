import { Category } from "@shared/types";
import { apiService } from "./api";

export interface CategoryState {
  categories: Category[];
  isLoading: boolean;
  error: string | null;
}

class CategoryService {
  private listeners: Set<(state: CategoryState) => void> = new Set();
  private state: CategoryState = {
    categories: [],
    isLoading: false,
    error: null,
  };

  // Subscribe to state changes
  subscribe(listener: (state: CategoryState) => void): () => void {
    this.listeners.add(listener);
    // Call immediately with current state
    listener(this.state);

    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  private setState(updates: Partial<CategoryState>) {
    this.state = { ...this.state, ...updates };
    this.listeners.forEach((listener) => listener(this.state));
  }

  getState(): CategoryState {
    return this.state;
  }

  async loadCategories(userId?: string): Promise<void> {
    this.setState({ isLoading: true, error: null });

    try {
      const response = await apiService.getCategories(userId);

      if (response.success && response.data) {
        this.setState({
          categories: response.data,
          isLoading: false,
        });
      } else {
        this.setState({
          error: response.error || "Failed to load categories",
          isLoading: false,
        });
      }
    } catch (error) {
      this.setState({
        error: error instanceof Error ? error.message : "Failed to load categories",
        isLoading: false,
      });
    }
  }

  async createCategory(name: string, color?: string): Promise<Category | null> {
    this.setState({ error: null });

    try {
      const response = await apiService.createCategory({ name, color });

      if (response.success && response.data) {
        const newCategory = response.data;
        this.setState({
          categories: [...this.state.categories, newCategory],
        });
        return newCategory;
      } else {
        this.setState({
          error: response.error || "Failed to create category",
        });
        return null;
      }
    } catch (error) {
      this.setState({
        error: error instanceof Error ? error.message : "Failed to create category",
      });
      return null;
    }
  }

  async updateCategory(categoryId: string, updates: { name?: string; color?: string }): Promise<Category | null> {
    this.setState({ error: null });

    try {
      const response = await apiService.updateCategory(categoryId, updates);

      if (response.success && response.data) {
        const updatedCategory = response.data;
        this.setState({
          categories: this.state.categories.map(cat =>
            cat.id === categoryId ? updatedCategory : cat
          ),
        });
        return updatedCategory;
      } else {
        this.setState({
          error: response.error || "Failed to update category",
        });
        return null;
      }
    } catch (error) {
      this.setState({
        error: error instanceof Error ? error.message : "Failed to update category",
      });
      return null;
    }
  }

  async deleteCategory(categoryId: string): Promise<boolean> {
    this.setState({ error: null });

    try {
      const response = await apiService.deleteCategory(categoryId);

      if (response.success) {
        this.setState({
          categories: this.state.categories.filter(cat => cat.id !== categoryId),
        });
        return true;
      } else {
        this.setState({
          error: response.error || "Failed to delete category",
        });
        return false;
      }
    } catch (error) {
      this.setState({
        error: error instanceof Error ? error.message : "Failed to delete category",
      });
      return false;
    }
  }

  updateCategoriesLocally(categories: Category[]): void {
    this.setState({ categories });
  }

  async forceReload(userId?: string): Promise<void> {
    // Clear current categories and reload
    this.setState({ categories: [], isLoading: true, error: null });
    await this.loadCategories(userId);
  }

  clearError(): void {
    this.setState({ error: null });
  }

  getCategoryById(categoryId: string): Category | undefined {
    return this.state.categories.find(cat => cat.id === categoryId);
  }

  getDefaultCategory(): Category | undefined {
    return this.state.categories.find(cat => cat.isDefault);
  }
}

export const categoryService = new CategoryService();
