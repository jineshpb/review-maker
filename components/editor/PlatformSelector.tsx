"use client";

import { cn } from "@/lib/utils";
import { platforms } from "@/lib/review-editor/platforms";

interface PlatformSelectorProps {
  selectedPlatform: string | null;
  onSelect: (platform: string) => void;
}

export const PlatformSelector = ({
  selectedPlatform,
  onSelect,
}: PlatformSelectorProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6 gap-4">
      {platforms.map((platform) => (
        <button
          key={platform.id}
          onClick={() => onSelect(platform.id)}
          className={cn(
            "p-2 rounded-lg border transition-all text-left items-start justify-start flex cursor-pointer",
            "hover:border-primary/50 hover:shadow-md",
            selectedPlatform === platform.id
              ? "border-primary/50 bg-primary/5"
              : "border-border"
          )}
        >
          <div className="flex items-center justify-center gap-2">
            <div
              className={cn(
                "w-8 h-8 rounded-full",
                platform.color,
                "flex items-center justify-center text-white font-bold"
              )}
            >
              {platform.name[0]}
            </div>
            <div>
              <div className="font-semibold tracking-tight">
                {platform.name}
              </div>
              <div className="text-xs text-muted-foreground truncate">
                {platform.description}
              </div>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
};
