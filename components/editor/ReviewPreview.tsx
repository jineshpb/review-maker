"use client";

import { Download } from "lucide-react";
import { Button } from "../ui/button";
import { toast } from "@/hooks/use-toast";
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
    try {
      toast({
        title: "Generating screenshot...",
        description: "Please wait",
      });

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

      toast({
        title: "Success",
        description: "Screenshot downloaded successfully!",
      });
    } catch (error) {
      console.error("Download error:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to generate screenshot",
        variant: "destructive",
      });
    }
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
