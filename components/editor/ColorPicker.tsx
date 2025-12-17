"use client";

import { cn } from "@/lib/utils";

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  colors: string[];
  label?: string;
}

// Helper to check if a color is a gradient
const isGradient = (color: string): boolean => {
  return color.startsWith("linear-gradient");
};

export const ColorPicker = ({
  value,
  onChange,
  colors,
  label,
}: ColorPickerProps) => {
  return (
    <div className="space-y-2">
      {label && <label className="text-sm font-medium">{label}</label>}
      <div className="flex flex-wrap gap-1">
        {colors.map((color) => {
          const isSelected = value === color;
          return (
            <button
              key={color}
              type="button"
              onClick={() => onChange(color)}
              className={cn(
                "w-6 h-6 rounded-lg border-2 transition-all hover:scale-110 flex-shrink-0",
                isSelected
                  ? " ring-1 ring-offset-0 ring-gray-400 dark:ring-gray-600"
                  : "border-gray-300 dark:border-gray-700"
              )}
              style={
                isGradient(color)
                  ? { background: color }
                  : { backgroundColor: color }
              }
              aria-label={`Select color ${color}`}
            />
          );
        })}
      </div>
    </div>
  );
};

// Preset color palettes
export const textColorPalette = [
  "#f3f4f6", // gray-100
  "#6b7280", // gray-500
  "#4b5563", // gray-600
  "#374151", // gray-700
  "#1f2937", // gray-800
  "#111827", // gray-900
];

export const laurelWreathColorPalette = [
  "#d1d5dc", // white
  "#4a5565", // gray-600
  "#1e2939", // gray-800
  "#ffb900", // yellow-500
];
