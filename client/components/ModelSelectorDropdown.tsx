import React from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
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

const models: ModelOption[] = [
  {
    id: "gpt-4",
    name: "GPT-4",
    description: "Most capable model with superior reasoning",
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/30",
    borderColor: "border-emerald-200 dark:border-emerald-800",
    badge: "Popular",
  },
  {
    id: "gpt-4-turbo",
    name: "GPT-4 Turbo",
    description: "Faster responses, lower cost",
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-950/30",
    borderColor: "border-blue-200 dark:border-blue-800",
    badge: "Fast",
  },
  {
    id: "claude-3",
    name: "Claude 3",
    description: "Anthropic's latest with excellent coding",
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-50 dark:bg-purple-950/30",
    borderColor: "border-purple-200 dark:border-purple-800",
    badge: "New",
  },
  {
    id: "gemini-pro",
    name: "Gemini Pro",
    description: "Google's multimodal model",
    color: "text-orange-600 dark:text-orange-400",
    bgColor: "bg-orange-50 dark:bg-orange-950/30",
    borderColor: "border-orange-200 dark:border-orange-800",
  },
];

export function ModelSelectorDropdown({
  selectedModel,
  onModelChange,
}: ModelSelectorDropdownProps) {
  const selectedModelData = models.find((m) => m.id === selectedModel);

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
