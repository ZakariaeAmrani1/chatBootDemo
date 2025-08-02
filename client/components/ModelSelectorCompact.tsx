import React, { useState, useEffect } from "react";
import { ChevronDown, Check, Zap, Brain, Sparkles, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { apiService } from "@/services/api";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface ModelOption {
  id: string;
  name: string;
  shortName: string;
  description: string;
  color: string;
  bgColor: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

interface ModelSelectorCompactProps {
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

export function ModelSelectorCompact({
  selectedModel,
  onModelChange,
}: ModelSelectorCompactProps) {
  const [open, setOpen] = useState(false);
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
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-muted-foreground">
          Model:
        </span>
        <div className="h-8 w-24 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-medium text-muted-foreground">Model:</span>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all duration-200",
              "hover:shadow-sm hover:border-muted-foreground/40",
              selectedModelData?.bgColor || "bg-background",
              selectedModelData?.color || "text-foreground",
            )}
          >
            {selectedModelData && (
              <>
                <selectedModelData.icon className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {selectedModelData.shortName}
                </span>
                {selectedModelData.badge && (
                  <span className="px-1.5 py-0.5 text-xs rounded-md bg-background/50 font-medium">
                    {selectedModelData.badge}
                  </span>
                )}
              </>
            )}
            <ChevronDown className="w-3 h-3 opacity-50" />
          </button>
        </PopoverTrigger>

        <PopoverContent className="w-80 p-2" align="start">
          <div className="space-y-1">
            {models.map((model) => {
              const Icon = model.icon;
              const isSelected = selectedModel === model.id;

              return (
                <button
                  key={model.id}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200",
                    "hover:bg-muted/50 text-left",
                    isSelected && "bg-muted",
                  )}
                  onClick={() => {
                    onModelChange(model.id);
                    setOpen(false);
                  }}
                >
                  <div
                    className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center",
                      model.bgColor,
                    )}
                  >
                    <Icon className={cn("w-4 h-4", model.color)} />
                  </div>

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
                    <p className="text-xs text-muted-foreground">
                      {model.description}
                    </p>
                  </div>

                  {isSelected && <Check className="w-4 h-4 text-primary" />}
                </button>
              );
            })}
          </div>

          {/* Quick switch buttons */}
          <div className="border-t mt-2 pt-2">
            <div className="flex gap-1">
              {models.map((model) => {
                const Icon = model.icon;
                const isSelected = selectedModel === model.id;

                return (
                  <button
                    key={model.id}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-1 py-2 rounded-md transition-all",
                      "hover:bg-muted/50",
                      isSelected ? model.bgColor : "bg-background",
                    )}
                    onClick={() => {
                      onModelChange(model.id);
                      setOpen(false);
                    }}
                    title={model.name}
                  >
                    <Icon
                      className={cn(
                        "w-3 h-3",
                        isSelected ? model.color : "text-muted-foreground",
                      )}
                    />
                    <span
                      className={cn(
                        "text-xs font-medium",
                        isSelected ? model.color : "text-muted-foreground",
                      )}
                    >
                      {model.shortName}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
