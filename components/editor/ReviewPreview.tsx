"use client";

import { Download } from "lucide-react";
import { Button } from "../ui/button";
import { toast } from "sonner";
import type { ReviewData } from "@/types/review";
import { renderReview } from "./ReviewRenderer";

interface ReviewPreviewProps {
  platform: string;
  reviewData: ReviewData;
}

/**
 * Client component for editor preview with download button
 *
 * Uses ReviewRenderer - single source of truth for all templates
 */
export const ReviewPreview = ({ platform, reviewData }: ReviewPreviewProps) => {
  const handleDownload = async () => {
    toast.promise(
      async () => {
        const response = await fetch("/api/screenshot", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            reviewData: {
              ...reviewData,
              platform: platform,
            },
            platform: platform,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || "Failed to generate screenshot");
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `review-${platform || "custom"}-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        return { success: true };
      },
      {
        loading: "Generating screenshot...",
        success: "Screenshot downloaded successfully!",
        error: (error) =>
          error instanceof Error
            ? error.message
            : "Failed to generate screenshot",
      }
    );
  };

  return (
    <div id="review-preview" className="">
      <Button
        onClick={handleDownload}
        className="flex-1 z-10 cursor-pointer absolute bottom-4 right-4"
        size="sm"
        variant="outline"
      >
        <Download className="mr-2 h-4 w-4" />
        Download Screenshot
      </Button>
      {renderReview(platform, reviewData)}
    </div>
  );
};
