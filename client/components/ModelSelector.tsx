import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { apiService } from "@/services/api";

interface ModelOption {
  id: string;
  name: string;
  description: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (modelId: string) => void;
}

export function ModelSelector({
  selectedModel,
  onModelChange,
}: ModelSelectorProps) {
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

  if (loading) {
    return (
      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground">
          Model
        </label>
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-8 w-20 bg-muted animate-pulse rounded-xl"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-muted-foreground">Model</label>

      <div className="flex flex-wrap gap-2">
        {models.map((model) => (
          <label
            key={model.id}
            className={cn(
              "relative flex items-center gap-2 px-3 py-1.5 rounded-xl border cursor-pointer transition-all duration-200 hover:scale-105",
              selectedModel === model.id
                ? `${model.bgColor} ${model.borderColor.replace("hover:", "")} shadow-sm`
                : `bg-background border-border hover:border-muted-foreground/40`,
            )}
          >
            <input
              type="radio"
              name="model"
              value={model.id}
              checked={selectedModel === model.id}
              onChange={() => onModelChange(model.id)}
              className="sr-only"
            />

            <span
              className={cn(
                "text-sm font-medium transition-colors",
                selectedModel === model.id ? model.color : "text-foreground",
              )}
            >
              {model.name}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
