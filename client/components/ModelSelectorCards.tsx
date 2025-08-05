import React, { useState, useEffect } from "react";
import { Check, Zap, Brain, Sparkles, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { apiService } from "@/services/api";

interface ModelOption {
  id: string;
  name: string;
  description: string;
  features: string[];
  color: string;
  bgColor: string;
  borderColor: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  price?: string;
}

interface ModelSelectorCardsProps {
  selectedModel: string;
  onModelChange: (modelId: string) => void;
}

// Icon mapping for string to component conversion
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Brain,
  Zap,
  Sparkles,
  Globe,
};

export function ModelSelectorCards({
  selectedModel,
  onModelChange,
}: ModelSelectorCardsProps) {
  const [models, setModels] = useState<ModelOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadModels = async () => {
      try {
        const response = await apiService.getModels();
        if (response.success && response.data) {
          // Convert icon strings to components
          const modelsWithIcons = response.data.map((model: any) => ({
            ...model,
            icon: iconMap[model.icon] || Brain, // Fallback to Brain if icon not found
          }));
          setModels(modelsWithIcons);

          // Auto-select the first model if none is selected
          if (!selectedModel && modelsWithIcons.length > 0) {
            onModelChange(modelsWithIcons[0].id);
          }
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
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Choose Model</label>
          <span className="text-xs text-muted-foreground">Loading...</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Choose Model</label>
        <span className="text-xs text-muted-foreground">
          {models.find((m) => m.id === selectedModel)?.name || "Select a model"}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {models.map((model) => {
          const Icon = model.icon;
          const isSelected = selectedModel === model.id;

          return (
            <div
              key={model.id}
              className={cn(
                "relative p-4 rounded-lg border cursor-pointer transition-all duration-200",
                "hover:shadow-md hover:scale-[1.02]",
                isSelected
                  ? `${model.bgColor} ${model.borderColor} shadow-sm ring-2 ring-offset-2 ring-offset-background`
                  : "bg-card border-border hover:border-muted-foreground/40",
              )}
              onClick={() => onModelChange(model.id)}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Icon
                    className={cn(
                      "w-5 h-5",
                      isSelected ? model.color : "text-muted-foreground",
                    )}
                  />
                  <h3
                    className={cn(
                      "font-semibold",
                      isSelected ? model.color : "text-foreground",
                    )}
                  >
                    {model.name}
                  </h3>
                </div>

                <div className="flex items-center gap-1">
                  {model.badge && (
                    <span
                      className={cn(
                        "px-2 py-0.5 text-xs rounded-full font-medium",
                        model.bgColor,
                        model.color,
                      )}
                    >
                      {model.badge}
                    </span>
                  )}
                  {isSelected && (
                    <div
                      className={cn(
                        "w-5 h-5 rounded-full flex items-center justify-center",
                        model.bgColor,
                      )}
                    >
                      <Check className={cn("w-3 h-3", model.color)} />
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                {model.description}
              </p>

              {/* Features */}
              <div className="flex flex-wrap gap-1 mb-2">
                {model.features.map((feature, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 text-xs rounded-md bg-muted text-muted-foreground"
                  >
                    {feature}
                  </span>
                ))}
              </div>

              {/* Price */}
              {model.price && (
                <div className="flex justify-end">
                  <span
                    className={cn(
                      "text-xs font-medium",
                      model.price === "Premium"
                        ? "text-amber-600"
                        : "text-green-600",
                    )}
                  >
                    {model.price}
                  </span>
                </div>
              )}

              {/* Hidden radio input for accessibility */}
              <input
                type="radio"
                name="model"
                value={model.id}
                checked={isSelected}
                onChange={() => onModelChange(model.id)}
                className="sr-only"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
