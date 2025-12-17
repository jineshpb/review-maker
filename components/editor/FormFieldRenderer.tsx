"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FormField, ColorPickerField } from "@/types/form-fields";
import { FormFieldType } from "@/types/form-fields";
import type { ReviewData } from "@/types/review";
import { ColorPicker } from "./ColorPicker";

interface FormFieldRendererProps {
  field: FormField;
  value: unknown;
  onChange: (value: unknown) => void;
  reviewData: ReviewData;
}

export const FormFieldRenderer = ({
  field,
  value,
  onChange,
  reviewData,
}: FormFieldRendererProps) => {
  const handleChange = (newValue: unknown) => {
    onChange(newValue);
  };

  switch (field.type) {
    case FormFieldType.INPUT:
      return (
        <div className="space-y-2">
          <Label htmlFor={field.id}>{field.label}</Label>
          <Input
            id={field.id}
            type={field.inputType || "text"}
            value={(value as string) || ""}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={field.placeholder}
          />
        </div>
      );

    case FormFieldType.TEXTAREA:
      return (
        <div className="space-y-2">
          <Label htmlFor={field.id}>{field.label}</Label>
          <Textarea
            id={field.id}
            value={(value as string) || ""}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={field.placeholder}
            rows={field.rows || 6}
          />
          {field.id === "reviewText" && (
            <div className="text-xs text-muted-foreground text-right">
              {((value as string) || "").length} characters
            </div>
          )}
        </div>
      );

    case FormFieldType.TOGGLE:
      return (
        <div className="flex items-center justify-between">
          <Label htmlFor={field.id} className="cursor-pointer">
            {field.label}
          </Label>
          <Switch
            id={field.id}
            checked={(value as boolean) || false}
            onCheckedChange={handleChange}
          />
        </div>
      );

    case FormFieldType.SLIDER:
      if (field.id === "rating") {
        const rating = (value as number) || 5;
        return (
          <div className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label}: {rating} stars
            </Label>
            <div className="flex items-center gap-2">
              <Slider
                id={field.id}
                min={field.min}
                max={field.max}
                step={field.step || 1}
                value={[rating]}
                onValueChange={([val]) => handleChange(val)}
                className="flex-1"
              />
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={cn(
                      "h-5 w-5",
                      star <= rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground"
                    )}
                  />
                ))}
              </div>
            </div>
          </div>
        );
      }
      return (
        <div className="space-y-2">
          <Label htmlFor={field.id}>{field.label}</Label>
          <Slider
            id={field.id}
            min={field.min}
            max={field.max}
            step={field.step || 1}
            value={[(value as number) || field.min]}
            onValueChange={([val]) => handleChange(val)}
            className="flex-1"
          />
        </div>
      );

    case FormFieldType.NUMBER:
      return (
        <div className="space-y-2">
          <Label htmlFor={field.id}>{field.label}</Label>
          <Input
            id={field.id}
            type="number"
            min={field.min}
            max={field.max}
            value={(value as number) || 0}
            onChange={(e) =>
              handleChange(parseInt(e.target.value) || field.min || 0)
            }
            placeholder={field.placeholder}
          />
        </div>
      );

    case FormFieldType.DATE:
      return (
        <div className="space-y-2">
          <Label htmlFor={field.id}>{field.label}</Label>
          <Input
            id={field.id}
            type="date"
            value={(value as string) || ""}
            onChange={(e) => handleChange(e.target.value)}
          />
        </div>
      );

    case FormFieldType.COLOR_PICKER:
      const colorPickerField = field as ColorPickerField;
      // Use defaultColor or first color as default if no value is set
      const colorValue =
        (value as string) ||
        colorPickerField.defaultColor ||
        colorPickerField.colors[0] ||
        "";
      return (
        <ColorPicker
          value={colorValue}
          onChange={handleChange}
          colors={colorPickerField.colors}
          label={field.label}
        />
      );

    default:
      return null;
  }
};
