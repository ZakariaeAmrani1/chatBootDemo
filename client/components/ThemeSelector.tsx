import React from 'react';
import { Monitor, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useTheme } from './ThemeProvider';
import { cn } from '@/lib/utils';

interface ThemeSelectorProps {
  collapsed?: boolean;
}

export function ThemeSelector({ collapsed = false }: ThemeSelectorProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const themeOptions = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ] as const;

  const currentTheme = themeOptions.find(option => option.value === theme);
  const CurrentIcon = currentTheme?.icon || Monitor;

  const ThemeButton = (
    <Button
      variant="ghost"
      size="sm"
      className={cn(
        "text-gray-400 hover:text-gray-100 hover:bg-gray-800 transition-colors",
        collapsed ? "h-10 w-10 p-0" : "w-full justify-start"
      )}
    >
      <CurrentIcon className="h-4 w-4" />
      {!collapsed && <span className="ml-2">{currentTheme?.label}</span>}
    </Button>
  );

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              {ThemeButton}
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right" align="start" className="w-48">
              {themeOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => setTheme(option.value)}
                    className={cn(
                      "flex items-center",
                      theme === option.value && "bg-accent"
                    )}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {option.label}
                    {theme === option.value && (
                      <span className="ml-auto text-xs text-muted-foreground">✓</span>
                    )}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </TooltipTrigger>
        <TooltipContent side="right">
          Theme: {currentTheme?.label}
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {ThemeButton}
      </DropdownMenuTrigger>
      <DropdownMenuContent side="right" align="start" className="w-48">
        {themeOptions.map((option) => {
          const Icon = option.icon;
          return (
            <DropdownMenuItem
              key={option.value}
              onClick={() => setTheme(option.value)}
              className={cn(
                "flex items-center",
                theme === option.value && "bg-accent"
              )}
            >
              <Icon className="h-4 w-4 mr-2" />
              {option.label}
              {theme === option.value && (
                <span className="ml-auto text-xs text-muted-foreground">✓</span>
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
