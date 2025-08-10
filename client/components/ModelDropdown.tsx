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

// Fallback models when API fails
const getFallbackModels = (): ModelOption[] => [
  {
    id: "cloud",
    name: "Cloud",
    description: "Advanced cloud-based AI model",
    features: ["High performance", "Latest features"],
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-950/30",
    borderColor: "border-blue-200 dark:border-blue-800",
    icon: "Globe",
    badge: "Recommended",
    price: "",
  },
  // {
  //   id: "local-cloud",
  //   name: "PDF Local Model",
  //   description: "Uses your selected Gemini model for PDF analysis",
  //   features: ["PDF Processing", "Uses Settings Model", "Direct file upload"],
  //   color: "text-emerald-600 dark:text-emerald-400",
  //   bgColor: "bg-emerald-50 dark:bg-emerald-950/30",
  //   borderColor: "border-emerald-200 dark:border-emerald-800",
  //   icon: "Brain",
  //   badge: "PDF",
  //   price: "",
  // },
  {
    id: "csv-local",
    name: "CSV Local Model",
    description: "Local processing for CSV data analysis",
    features: ["CSV Processing", "Data analysis", "Client-side preview"],
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-50 dark:bg-purple-950/30",
    borderColor: "border-purple-200 dark:border-purple-800",
    icon: "Brain",
    badge: "CSV",
    price: "",
  },
];

export function ModelDropdown({
  selectedModel,
  onModelChange,
  disabled = false,
}: ModelDropdownProps) {
  const [models, setModels] = useState<ModelOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadModels = async () => {
      try {
        // Temporarily use fallback models to test UI functionality
        console.log("🔄 Loading models...");

        // Use fallback models immediately to ensure UI is always responsive
        const fallbackModels = getFallbackModels();
        setModels(fallbackModels);

        // Auto-select first model if none is selected
        if (!selectedModel && fallbackModels.length > 0) {
          onModelChange(fallbackModels[0].id);
        }

        // API disabled temporarily to prevent fetch errors
        console.log(
          "🔧 API calls disabled - using fallback models for stability",
        );
      } catch (error) {
        console.error("❌ Critical error loading models:", error);
        // Emergency fallback
        const fallbackModels = getFallbackModels();
        setModels(fallbackModels);

        if (!selectedModel && fallbackModels.length > 0) {
          onModelChange(fallbackModels[0].id);
        }
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
          disabled={disabled}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-xl border bg-muted/30",
            "shadow-sm hover:bg-muted/50 transition-colors",
            disabled && "opacity-50 cursor-not-allowed hover:bg-muted/30",
          )}
        >
          {currentModel ? (
            <>
              {(() => {
                const IconComponent = iconMap[currentModel.icon] || Brain;
                return (
                  <IconComponent
                    className={cn("w-4 h-4", currentModel.color)}
                  />
                );
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
          {!disabled && (
            <ChevronDown className="w-3 h-3 text-muted-foreground" />
          )}
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
                isSelected && "bg-muted",
              )}
            >
              <IconComponent
                className={cn(
                  "w-4 h-4 mt-0.5 flex-shrink-0",
                  isSelected ? model.color : "text-muted-foreground",
                )}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "font-medium text-sm",
                      isSelected ? model.color : "text-foreground",
                    )}
                  >
                    {model.name}
                  </span>
                  {model.badge && (
                    <span
                      className={cn(
                        "px-1.5 py-0.5 text-xs rounded font-medium",
                        model.bgColor,
                        model.color,
                      )}
                    >
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
                  <span
                    className={cn(
                      "text-xs font-medium mt-1 inline-block",
                      model.price === "Premium"
                        ? "text-amber-600"
                        : "text-green-600",
                    )}
                  >
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
