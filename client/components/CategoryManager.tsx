import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, MoreHorizontal, Edit3, Trash2, Folder } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/services/api";
import type { Category } from "@shared/types";

interface CategoryManagerProps {
  categories: Category[];
  onCategoriesChange: (categories: Category[]) => void;
  triggerButton?: React.ReactNode;
  onDialogClose?: () => void;
}

const CategoryManager: React.FC<CategoryManagerProps> = ({
  categories,
  onCategoriesChange,
  triggerButton,
  onDialogClose,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editCategoryName, setEditCategoryName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      toast({
        title: "Error",
        description: "Category name is required",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiService.createCategory({
        name: newCategoryName.trim(),
      });

      if (response.success && response.data) {
        // Immediately update local state
        const updatedCategories = [...categories, response.data];
        onCategoriesChange(updatedCategories);
        setNewCategoryName("");
        setIsCreating(false);

        // Close the modal to show the updated sidebar
        setIsOpen(false);
        onDialogClose?.();

        toast({
          title: "Success",
          description: "Category created successfully",
        });
      } else {
        throw new Error(response.error || "Failed to create category");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create category",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory || !editCategoryName.trim()) {
      toast({
        title: "Error",
        description: "Category name is required",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiService.updateCategory(editingCategory.id, {
        name: editCategoryName.trim(),
      });

      if (response.success && response.data) {
        const updatedCategories = categories.map(cat => 
          cat.id === editingCategory.id ? response.data! : cat
        );
        onCategoriesChange(updatedCategories);
        setEditingCategory(null);
        setEditCategoryName("");
        toast({
          title: "Success",
          description: "Category updated successfully",
        });
      } else {
        throw new Error(response.error || "Failed to update category");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update category",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCategory = async (category: Category) => {
    if (category.isDefault) {
      toast({
        title: "Error",
        description: "Cannot delete the default category",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiService.deleteCategory(category.id);

      if (response.success) {
        const updatedCategories = categories.filter(cat => cat.id !== category.id);
        onCategoriesChange(updatedCategories);
        toast({
          title: "Success",
          description: "Category deleted successfully",
        });
      } else {
        throw new Error(response.error || "Failed to delete category");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete category",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const startEditing = (category: Category) => {
    setEditingCategory(category);
    setEditCategoryName(category.name);
  };

  const cancelEditing = () => {
    setEditingCategory(null);
    setEditCategoryName("");
  };

  const defaultTrigger = (
    <Button variant="ghost" size="sm">
      <Folder className="h-4 w-4 mr-2" />
      Manage Categories
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {triggerButton || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Manage Categories</DialogTitle>
          <DialogDescription>
            Organize your chats by creating and managing categories.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Create new category */}
          {isCreating ? (
            <div className="flex gap-2">
              <Input
                placeholder="Category name"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreateCategory();
                  if (e.key === "Escape") {
                    setIsCreating(false);
                    setNewCategoryName("");
                  }
                }}
                autoFocus
              />
              <Button onClick={handleCreateCategory} disabled={isLoading} size="sm">
                Save
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsCreating(false);
                  setNewCategoryName("");
                }}
                size="sm"
              >
                Cancel
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              onClick={() => setIsCreating(true)}
              className="w-full"
              disabled={isLoading}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          )}

          {/* Categories list */}
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {categories.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                {editingCategory?.id === category.id ? (
                  <div className="flex gap-2 flex-1">
                    <Input
                      value={editCategoryName}
                      onChange={(e) => setEditCategoryName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleUpdateCategory();
                        if (e.key === "Escape") cancelEditing();
                      }}
                      className="flex-1"
                      autoFocus
                    />
                    <Button onClick={handleUpdateCategory} disabled={isLoading} size="sm">
                      Save
                    </Button>
                    <Button variant="outline" onClick={cancelEditing} size="sm">
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <Folder className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{category.name}</span>
                      {category.isDefault && (
                        <span className="text-xs text-muted-foreground">(Default)</span>
                      )}
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          disabled={isLoading}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => startEditing(category)}
                          disabled={category.isDefault}
                        >
                          <Edit3 className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteCategory(category)}
                          disabled={category.isDefault}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
                )}
              </div>
            ))}

            {categories.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Folder className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No categories yet</p>
                <p className="text-sm">Create your first category to organize chats</p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CategoryManager;
