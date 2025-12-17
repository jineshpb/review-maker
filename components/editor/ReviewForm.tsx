"use client";

import type { ReviewData, AppStoreReviewData } from "@/types/review";
import { platformFormConfigs } from "./form-configs";
import { FormFieldRenderer } from "./FormFieldRenderer";
import { platformDefaults } from "./platformDefaults";

interface ReviewFormProps {
  reviewData: ReviewData;
  onChange: (data: ReviewData) => void;
  platform: string;
}

// Helper function to get nested value (e.g., "awardBadge.heading")
const getNestedValue = (obj: any, path: string): unknown => {
  const keys = path.split(".");
  let value = obj;
  for (const key of keys) {
    if (value === null || value === undefined) return undefined;
    value = value[key];
  }
  return value;
};

// Helper function to set nested value
const setNestedValue = (obj: any, path: string, value: unknown): any => {
  const keys = path.split(".");
  const result = { ...obj };
  let current = result;

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!current[key] || typeof current[key] !== "object") {
      current[key] = {};
    } else {
      current[key] = { ...current[key] };
    }
    current = current[key];
  }

  current[keys[keys.length - 1]] = value;
  return result;
};

export const ReviewForm = ({
  reviewData,
  onChange,
  platform,
}: ReviewFormProps) => {
  const config = platformFormConfigs[platform];

  if (!config) {
    return (
      <div className="text-muted-foreground">
        Form configuration not found for platform: {platform}
      </div>
    );
  }

  const updateField = (fieldId: string, value: unknown) => {
    if (fieldId.includes(".")) {
      // Handle nested fields (e.g., "awardBadge.heading")
      const updated = setNestedValue(reviewData, fieldId, value);
      onChange(updated as ReviewData);
    } else {
      // Handle simple fields
      onChange({ ...reviewData, [fieldId]: value } as ReviewData);
    }
  };

  const getFieldValue = (fieldId: string): unknown => {
    if (fieldId.includes(".")) {
      return getNestedValue(reviewData, fieldId);
    }
    return (reviewData as any)[fieldId];
  };

  // Special handling for App Store award badge toggle
  const handleAwardBadgeToggle = (enabled: boolean) => {
    if (enabled) {
      const awardBadgeDefaults = platformDefaults.awardbadge as {
        heading?: string;
        content?: string;
        textColor?: string;
        laurelWreathColor?: string;
      };
      updateField("awardBadge", {
        heading: awardBadgeDefaults.heading || "",
        content: awardBadgeDefaults.content || "",
        textColor: awardBadgeDefaults.textColor || "",
        laurelWreathColor: awardBadgeDefaults.laurelWreathColor || "",
      });
    } else {
      updateField("awardBadge", undefined);
    }
  };

  return (
    <div className="space-y-6 mt-4 w-full">
      {config.sections.map((section, sectionIndex) => {
        // Check if award badge section should be shown
        if (
          platform === "appstore" &&
          section.title === "Award Badge" &&
          section.fields[0]?.id === "awardBadge.enabled"
        ) {
          const awardBadgeEnabled = !!(reviewData as AppStoreReviewData)
            .awardBadge?.heading;

          return (
            <div key={sectionIndex} className="space-y-4 border-t pt-4">
              {section.title && (
                <h3 className="font-semibold text-lg">{section.title}</h3>
              )}
              {/* Award Badge Toggle */}
              <FormFieldRenderer
                field={section.fields[0]}
                value={awardBadgeEnabled}
                onChange={(value) => handleAwardBadgeToggle(value as boolean)}
                reviewData={reviewData}
              />
              {/* Award Badge Fields (only show if enabled) */}
              {awardBadgeEnabled &&
                section.fields
                  .slice(1)
                  .map((field) => (
                    <FormFieldRenderer
                      key={field.id}
                      field={field}
                      value={getFieldValue(field.id)}
                      onChange={(value) => updateField(field.id, value)}
                      reviewData={reviewData}
                    />
                  ))}
            </div>
          );
        }

        return (
          <div key={sectionIndex} className="space-y-4">
            {section.title && (
              <h3 className="font-semibold text-lg">{section.title}</h3>
            )}
            {section.fields.map((field) => (
              <FormFieldRenderer
                key={field.id}
                field={field}
                value={getFieldValue(field.id)}
                onChange={(value) => updateField(field.id, value)}
                reviewData={reviewData}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
};
