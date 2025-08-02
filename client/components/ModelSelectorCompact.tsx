import React, { useState } from "react";
import { ChevronDown, Check, Zap, Brain, Sparkles, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
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

const models: ModelOption[] = [
  {
    id: "gpt-4",
    name: "GPT-4",
    shortName: "GPT-4",
    description: "Most capable model",
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/30",
    icon: Brain,
    badge: "Best",
  },
  {
    id: "gpt-4-turbo",
    name: "GPT-4 Turbo",
    shortName: "Turbo",
    description: "Faster & cheaper",
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-950/30",
    icon: Zap,
    badge: "Fast",
  },
  {
    id: "claude-3",
    name: "Claude 3",
    shortName: "Claude",
    description: "Anthropic's latest",
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-50 dark:bg-purple-950/30",
    icon: Sparkles,
    badge: "New",
  },
  {
    id: "gemini-pro",
    name: "Gemini Pro",
    shortName: "Gemini",
    description: "Google's model",
    color: "text-orange-600 dark:text-orange-400",
    bgColor: "bg-orange-50 dark:bg-orange-950/30",
    icon: Globe,
  },
];

export function ModelSelectorCompact({
  selectedModel,
  onModelChange,
}: ModelSelectorCompactProps) {
  const [open, setOpen] = useState(false);
  const selectedModelData = models.find((m) => m.id === selectedModel);

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
