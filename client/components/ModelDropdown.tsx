import React, { useState, useEffect } from "react";
import { Check, ChevronDown, Brain, Zap, Sparkles, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { apiService } from "@/services/api";

interface ModelOption {
  id: string;
  name: string;
  description: string;
  features: string[];
  color: string;
  bgColor: string;
  borderColor: string;
  icon: string;
  badge?: string;
  price?: string;
}

interface ModelDropdownProps {
  selectedModel: string;
  onModelChange: (modelId: string) => void;
  disabled?: boolean;
}

// Icon mapping for string to component conversion
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Brain,
  Zap,
  Sparkles,
  Globe,
};

export function ModelDropdown({ selectedModel, onModelChange }: ModelDropdownProps) {
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
            icon: model.icon || "Brain", // Keep as string for now
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
  }, [selectedModel, onModelChange]);

  const getCurrentModel = () => {
    return models.find((m) => m.id === selectedModel) || null;
  };

  const currentModel = getCurrentModel();

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border bg-muted/30 shadow-sm">
        <div className="w-4 h-4 bg-muted animate-pulse rounded"></div>
        <span className="text-sm font-medium">Loading...</span>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-xl border bg-muted/30",
            "shadow-sm hover:bg-muted/50 transition-colors"
          )}
        >
          {currentModel ? (
            <>
              {(() => {
                const IconComponent = iconMap[currentModel.icon] || Brain;
                return <IconComponent className={cn("w-4 h-4", currentModel.color)} />;
              })()}
              <span className={cn("text-sm font-medium", currentModel.color)}>
                {currentModel.name}
              </span>
            </>
          ) : (
            <>
              <Brain className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">
                Select Model
              </span>
            </>
          )}
          <ChevronDown className="w-3 h-3 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="start" className="w-64">
        {models.map((model) => {
          const IconComponent = iconMap[model.icon] || Brain;
          const isSelected = selectedModel === model.id;

          return (
            <DropdownMenuItem
              key={model.id}
              onClick={() => onModelChange(model.id)}
              className={cn(
                "flex items-start gap-3 p-3 cursor-pointer",
                isSelected && "bg-muted"
              )}
            >
              <IconComponent
                className={cn(
                  "w-4 h-4 mt-0.5 flex-shrink-0",
                  isSelected ? model.color : "text-muted-foreground"
                )}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "font-medium text-sm",
                    isSelected ? model.color : "text-foreground"
                  )}>
                    {model.name}
                  </span>
                  {model.badge && (
                    <span className={cn(
                      "px-1.5 py-0.5 text-xs rounded font-medium",
                      model.bgColor,
                      model.color
                    )}>
                      {model.badge}
                    </span>
                  )}
                  {isSelected && (
                    <Check className="w-3 h-3 text-green-600 ml-auto" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                  {model.description}
                </p>
                {model.price && (
                  <span className={cn(
                    "text-xs font-medium mt-1 inline-block",
                    model.price === "Premium" ? "text-amber-600" : "text-green-600"
                  )}>
                    {model.price}
                  </span>
                )}
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
