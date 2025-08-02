import React from "react";
import { Check, Zap, Brain, Sparkles, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

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

const models: ModelOption[] = [
  {
    id: "gpt-4",
    name: "GPT-4",
    description:
      "Most capable model with superior reasoning and complex task handling",
    features: ["Advanced reasoning", "Complex tasks", "High accuracy"],
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/30",
    borderColor: "border-emerald-200 dark:border-emerald-800",
    icon: Brain,
    badge: "Recommended",
    price: "Premium",
  },
  {
    id: "gpt-4-turbo",
    name: "GPT-4 Turbo",
    description: "Faster responses with lower cost while maintaining quality",
    features: ["Fast responses", "Cost effective", "Good quality"],
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-950/30",
    borderColor: "border-blue-200 dark:border-blue-800",
    icon: Zap,
    badge: "Fast",
    price: "Standard",
  },
  {
    id: "claude-3",
    name: "Claude 3",
    description:
      "Anthropic's latest with excellent coding and analysis capabilities",
    features: ["Code generation", "Analysis", "Safety focused"],
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-50 dark:bg-purple-950/30",
    borderColor: "border-purple-200 dark:border-purple-800",
    icon: Sparkles,
    badge: "New",
    price: "Premium",
  },
  {
    id: "gemini-pro",
    name: "Gemini Pro",
    description: "Google's multimodal model with image and text capabilities",
    features: ["Multimodal", "Image analysis", "Google integration"],
    color: "text-orange-600 dark:text-orange-400",
    bgColor: "bg-orange-50 dark:bg-orange-950/30",
    borderColor: "border-orange-200 dark:border-orange-800",
    icon: Globe,
    price: "Standard",
  },
];

export function ModelSelectorCards({
  selectedModel,
  onModelChange,
}: ModelSelectorCardsProps) {
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
