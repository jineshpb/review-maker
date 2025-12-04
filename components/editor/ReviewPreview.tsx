"use client";

import { Download, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Button } from "../ui/button";
import { toast } from "@/hooks/use-toast";
import html2canvas from "html2canvas";

interface ReviewData {
  reviewerName: string;
  rating: number;
  reviewText: string;
  reviewTitle: string;
  date: string;
  profilePictureUrl: string;
  verified: boolean;
  helpfulVotes?: number;
}

interface ReviewPreviewProps {
  platform: string;
  reviewData: ReviewData;
}

export const ReviewPreview = ({ platform, reviewData }: ReviewPreviewProps) => {
  const renderStars = (rating: number) => {
    return [1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        className={cn(
          "h-5 w-5",
          star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
        )}
      />
    ));
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) return "Today";
      if (diffDays === 1) return "Yesterday";
      if (diffDays < 30) return `${diffDays} days ago`;
      if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
      return `${Math.floor(diffDays / 365)} years ago`;
    } catch {
      return format(new Date(dateString), "MMM d, yyyy");
    }
  };

  const handleDownload = async () => {
    const previewElement = document.getElementById("review-preview");
    if (!previewElement) {
      toast({
        title: "Error",
        description: "Preview not found",
        variant: "destructive",
      });
      return;
    }

    try {
      const canvas = await html2canvas(previewElement, {
        backgroundColor: null,
        scale: 2,
      });
      const link = document.createElement("a");
      link.download = `review-${platform || "custom"}-${Date.now()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      toast({
        title: "Success",
        description: "Screenshot downloaded successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate screenshot",
        variant: "destructive",
      });
    }
  };

  const platformStyles = {
    google: {
      container:
        "bg-white rounded-lg shadow-sm border border-gray-200 p-6 max-w-[500px] w-full",
      header: "flex items-start gap-4",
      avatar:
        "w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold shrink-0",
      name: "font-semibold text-gray-900 break-words",
      date: "text-sm text-gray-500",
      rating: "flex gap-1 my-2",
      text: "text-gray-700 mt-2 break-words",
    },
    amazon: {
      container:
        "bg-white rounded-lg shadow-sm border border-gray-200 p-6 max-w-[500px] w-full",
      header: "flex items-start gap-4",
      avatar:
        "w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold shrink-0",
      title: "font-semibold text-lg text-gray-900 mb-2 break-words",
      name: "text-sm text-gray-600 break-words",
      date: "text-xs text-gray-500",
      rating: "flex gap-1 my-2",
      verified: "text-xs text-blue-600 font-medium",
      text: "text-gray-700 mt-2 break-words",
      helpful: "text-xs text-gray-500 mt-2 break-words",
    },
    yelp: {
      container:
        "bg-white rounded-lg shadow-sm border border-red-200 p-6 max-w-[500px] w-full",
      header: "flex items-start gap-4",
      avatar:
        "w-12 h-12 rounded-full bg-red-500 flex items-center justify-center text-white font-bold shrink-0",
      name: "font-semibold text-gray-900 break-words",
      date: "text-sm text-gray-500",
      rating: "flex gap-1 my-2",
      text: "text-gray-700 mt-2 break-words",
    },
  };

  const styles =
    platformStyles[platform as keyof typeof platformStyles] ||
    platformStyles.google;

  return (
    <div id="review-preview" className={cn(styles.container, "relative")}>
      <Button
        onClick={handleDownload}
        className="flex-1 absolute bottom-4 right-4 z-10 cursor-pointer"
        size="sm"
        variant="outline"
      >
        <Download className="mr-2 h-4 w-4" />
        Download Screenshot
      </Button>
      <div className={cn(styles.header, "w-full")}>
        {reviewData.profilePictureUrl ? (
          <img
            src={reviewData.profilePictureUrl}
            alt={reviewData.reviewerName}
            className="w-12 h-12 rounded-full"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = "none";
              const fallback = target.nextElementSibling as HTMLElement;
              if (fallback) fallback.style.display = "flex";
            }}
          />
        ) : (
          <div
            className={cn(
              "w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold",
              reviewData.profilePictureUrl && "hidden"
            )}
          >
            {reviewData.reviewerName[0]?.toUpperCase() || "U"}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 w-full">
            <div className={cn(styles.name, "min-w-0 flex-1")}>
              {reviewData.reviewerName || "Anonymous"}
            </div>
            {reviewData.verified && (
              <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded shrink-0">
                Verified
              </span>
            )}
          </div>
          <div className={styles.date}>{formatDate(reviewData.date)}</div>
          <div className={styles.rating}>{renderStars(reviewData.rating)}</div>
          {platform === "amazon" && reviewData.reviewTitle && (
            <div className={cn(platformStyles.amazon.title, "w-full")}>
              {reviewData.reviewTitle}
            </div>
          )}
        </div>
      </div>
      {reviewData.reviewText && (
        <div className={cn(styles.text, "w-full")}>{reviewData.reviewText}</div>
      )}
      {platform === "amazon" &&
        reviewData.helpfulVotes !== undefined &&
        reviewData.helpfulVotes > 0 && (
          <div className={cn(platformStyles.amazon.helpful, "w-full")}>
            {reviewData.helpfulVotes} people found this helpful
          </div>
        )}
    </div>
  );
};
