/**
 * Shared review rendering utilities and router
 *
 * This file contains:
 * - Shared utility functions (renderStars, formatDate)
 * - Platform router that delegates to platform-specific renderers
 *
 * Platform renderers are in: components/editor/platforms/
 *
 * To add a new platform:
 * 1. Create components/editor/platforms/xxx.tsx with renderXxxReview()
 * 2. Import and add case in the switch statement below
 * 3. Done - no other files need changes
 */

import React from "react";
import { IoMdStar } from "react-icons/io";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import type {
  ReviewData,
  GoogleReviewData,
  AmazonReviewData,
  TrustpilotReviewData,
  TripAdvisorReviewData,
  AppStoreReviewData,
  AwardBadgeData,
} from "@/types/review";

// Import platform-specific renderers
import { renderGoogleReview } from "./platforms/google";
import { renderAmazonReview } from "./platforms/amazon";
import { renderTrustpilotReview } from "./platforms/trustpilot";
import { renderTripAdvisorReview } from "./platforms/tripadvisor";
import { renderAppStoreReview } from "./platforms/appstore";
import { renderAwardBadge } from "./platforms/awardbadge";
import { Star } from "lucide-react";
// Add more platform imports here:
// import { renderYelpReview } from "./platforms/yelp";

// Shared utility functions
export const renderStars = (
  rating: number,
  options?: {
    icon?: React.ReactElement; // Custom icon component (defaults to IoMdStar)
    size?: string; // e.g., "h-4 w-4" or "h-5 w-5"
    filledColor?: string; // e.g., "fill-yellow-400 text-yellow-400" or "fill-orange-400 text-orange-400"
    emptyColor?: string; // e.g., "text-gray-300"
  }
) => {
  const {
    icon,
    size = "h-5 w-5",
    filledColor = "fill-yellow-400 text-yellow-400",
    emptyColor = "text-gray-300",
  } = options || {};

  const StarIcon = icon || <IoMdStar />;

  return [1, 2, 3, 4, 5].map((star) => {
    const isFilled = star <= rating;
    const starClasses = cn(size, isFilled ? filledColor : emptyColor);

    return React.cloneElement(StarIcon as React.ReactElement<any>, {
      key: star,
      className: starClasses,
    });
  });
};

export const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 14) return "1 week ago";
    if (diffDays < 21) return "2 weeks ago";
    if (diffDays < 30) return "3 weeks ago";
    if (diffDays < 60) return "1 month ago";
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  } catch {
    return format(new Date(dateString), "MMM d, yyyy");
  }
};

// Main renderer function - single source of truth
export const renderReview = (platform: string, reviewData: ReviewData) => {
  switch (platform) {
    case "google":
      return renderGoogleReview(reviewData as GoogleReviewData);

    case "amazon":
      return renderAmazonReview(reviewData as AmazonReviewData);

    case "trustpilot":
      return renderTrustpilotReview(reviewData as TrustpilotReviewData);

    case "tripadvisor":
      return renderTripAdvisorReview(reviewData as TripAdvisorReviewData);

    case "appstore":
      return renderAppStoreReview(reviewData as AppStoreReviewData);

    case "awardbadge":
      return renderAwardBadge(reviewData as AwardBadgeData);

    // Add more platforms here:
    // case "yelp":
    //   return renderYelpReview(reviewData as YelpReviewData);

    default:
      return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 max-w-[500px] w-full ">
          <div className="text-gray-500 ">
            Template for {platform} coming soon
          </div>
        </div>
      );
  }
};

/**
 * Server component for Playwright screenshots
 *
 * Thin wrapper around renderReview - exported for convenience
 * Used by: app/api/preview/page.tsx
 */
interface ReviewPreviewServerProps {
  platform: string;
  reviewData: ReviewData;
}

export const ReviewPreviewServer = ({
  platform,
  reviewData,
}: ReviewPreviewServerProps) => {
  return renderReview(platform, reviewData);
};
