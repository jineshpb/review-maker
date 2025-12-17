"use client";

import { cn } from "@/lib/utils";

const platforms = [
  {
    id: "google",
    name: "Google Reviews",
    color: "bg-blue-500",
    description: "Google Maps review style",
  },
  {
    id: "amazon",
    name: "Amazon",
    color: "bg-orange-500",
    description: "Product review style",
  },
  {
    id: "yelp",
    name: "Yelp",
    color: "bg-red-500",
    description: "Business review style",
  },
  {
    id: "tripadvisor",
    name: "TripAdvisor",
    color: "bg-green-500",
    description: "Travel review style",
  },
  {
    id: "facebook",
    name: "Facebook",
    color: "bg-blue-600",
    description: "Social media review",
  },
  {
    id: "trustpilot",
    name: "Trustpilot",
    color: "bg-green-600",
    description: "Business review platform",
  },
  {
    id: "appstore",
    name: "App Store",
    color: "bg-slate-700",
    description: "iOS app review style",
  },
  {
    id: "awardbadge",
    name: "Award Badge",
    color: "bg-gradient-to-r from-yellow-400 to-yellow-600",
    description: "Customizable award badge",
  },
];

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
