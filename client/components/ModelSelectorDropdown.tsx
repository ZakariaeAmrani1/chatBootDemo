import React, { useState, useEffect } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { apiService } from "@/services/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ModelOption {
  id: string;
  name: string;
  description: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon?: string;
  badge?: string;
}

interface ModelSelectorDropdownProps {
  selectedModel: string;
  onModelChange: (modelId: string) => void;
}

export function ModelSelectorDropdown({
  selectedModel,
  onModelChange,
}: ModelSelectorDropdownProps) {
  const [models, setModels] = useState<ModelOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadModels = async () => {
      try {
        const response = await apiService.getModels();
        if (response.success && response.data) {
          setModels(response.data);
        }
      } catch (error) {
        console.error("Failed to load models:", error);
      } finally {
        setLoading(false);
      }
    };

    loadModels();
  }, []);

  const selectedModelData = models.find((m) => m.id === selectedModel);

  if (loading) {
    return (
      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground">
          Model
        </label>
        <div className="h-10 bg-muted animate-pulse rounded-md" />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-muted-foreground">Model</label>

      <Select value={selectedModel} onValueChange={onModelChange}>
        <SelectTrigger className="w-full">
          <SelectValue>
            {selectedModelData && (
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "w-2 h-2 rounded-full",
                    selectedModelData.bgColor
                      .replace("bg-", "bg-")
                      .replace("dark:bg-", "")
                      .split(" ")[0],
                  )}
                />
                <span className="font-medium">{selectedModelData.name}</span>
                {selectedModelData.badge && (
                  <span
                    className={cn(
                      "px-1.5 py-0.5 text-xs rounded-md font-medium",
                      selectedModelData.bgColor,
                      selectedModelData.color,
                    )}
                  >
                    {selectedModelData.badge}
                  </span>
                )}
              </div>
            )}
          </SelectValue>
        </SelectTrigger>

        <SelectContent>
          {models.map((model) => (
            <SelectItem key={model.id} value={model.id} className="p-3">
              <div className="flex items-start gap-3 w-full">
                <div
                  className={cn(
                    "w-3 h-3 rounded-full mt-1",
                    model.bgColor
                      .replace("bg-", "bg-")
                      .replace("dark:bg-", "")
                      .split(" ")[0],
                  )}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{model.name}</span>
                    {model.badge && (
                      <span
                        className={cn(
                          "px-1.5 py-0.5 text-xs rounded-md font-medium",
                          model.bgColor,
                          model.color,
                        )}
                      >
                        {model.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {model.description}
                  </p>
                </div>
                {selectedModel === model.id && (
                  <Check className="w-4 h-4 text-primary" />
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
