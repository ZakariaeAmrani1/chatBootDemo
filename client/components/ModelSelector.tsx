import React from 'react';
import { cn } from '@/lib/utils';

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

const models: ModelOption[] = [
  {
    id: 'gpt-4',
    name: 'GPT-4',
    description: 'Most capable model',
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/30',
    borderColor: 'border-emerald-200 hover:border-emerald-300 dark:border-emerald-800 dark:hover:border-emerald-700'
  },
  {
    id: 'gpt-4-turbo',
    name: 'GPT-4 Turbo',
    description: 'Faster & cheaper',
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-950/30',
    borderColor: 'border-blue-200 hover:border-blue-300 dark:border-blue-800 dark:hover:border-blue-700'
  },
  {
    id: 'claude-3',
    name: 'Claude 3',
    description: 'Anthropic\'s latest',
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-50 dark:bg-purple-950/30',
    borderColor: 'border-purple-200 hover:border-purple-300 dark:border-purple-800 dark:hover:border-purple-700'
  },
  {
    id: 'gemini-pro',
    name: 'Gemini Pro',
    description: 'Google\'s model',
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-50 dark:bg-orange-950/30',
    borderColor: 'border-orange-200 hover:border-orange-300 dark:border-orange-800 dark:hover:border-orange-700'
  }
];

export function ModelSelector({ selectedModel, onModelChange }: ModelSelectorProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground">Choose Model</label>
        <div className="text-xs text-muted-foreground">
          Select the AI model for your conversation
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {models.map((model) => (
          <label
            key={model.id}
            className={cn(
              "relative flex flex-col p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-105",
              selectedModel === model.id
                ? `${model.bgColor} ${model.borderColor.replace('hover:', '')} shadow-md scale-105`
                : `bg-background border-border ${model.borderColor}`
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
            
            <div className="flex items-center justify-between mb-1">
              <span className={cn(
                "text-sm font-semibold transition-colors",
                selectedModel === model.id ? model.color : "text-foreground"
              )}>
                {model.name}
              </span>
              
              {/* Radio indicator */}
              <div className={cn(
                "w-4 h-4 rounded-full border-2 transition-all duration-200 flex items-center justify-center",
                selectedModel === model.id
                  ? model.color.replace('text-', 'border-')
                  : "border-muted-foreground/30"
              )}>
                {selectedModel === model.id && (
                  <div className={cn(
                    "w-2 h-2 rounded-full transition-all duration-200",
                    model.color.replace('text-', 'bg-')
                  )} />
                )}
              </div>
            </div>
            
            <span className="text-xs text-muted-foreground">
              {model.description}
            </span>
            
            {/* Selection overlay */}
            {selectedModel === model.id && (
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
            )}
          </label>
        ))}
      </div>
    </div>
  );
}
