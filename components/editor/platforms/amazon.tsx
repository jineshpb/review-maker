import { renderStars, formatDate } from "../ReviewRenderer";
import type { AmazonReviewData } from "@/types/review";
import { format } from "date-fns";
import { LuUserRound } from "react-icons/lu";

/**
 * Amazon Reviews template renderer
 *
 * Renders an Amazon-style review card with:
 * - Profile icon/avatar
 * - Reviewer name
 * - Star rating and review title
 * - Date and location ("Reviewed in [country] on [date]")
 * - Product details (optional)
 * - Verified Purchase badge
 * - Review text
 * - Helpful button and Report link
 */
export const renderAmazonReview = (data: AmazonReviewData) => {
  // Format date for Amazon style: "Reviewed in India on 23 October 2025"
  const formatAmazonDate = (dateString: string, location?: string) => {
    try {
      const date = new Date(dateString);
      const formattedDate = format(date, "d MMMM yyyy");
      if (location) {
        return `Reviewed in ${location} on ${formattedDate}`;
      }
      return `Reviewed on ${formattedDate}`;
    } catch {
      return formatDate(dateString);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 max-w-[600px] w-full">
      {/* Header Section: Profile Icon and Name */}
      <div className="flex items-center gap-3 mb-3 ">
        {/* Profile Icon/Avatar */}
        <div className="shrink-0">
          {data.profilePictureUrl ? (
            <img
              src={data.profilePictureUrl}
              alt={data.reviewerName}
              className="w-10 h-10 rounded-full"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
                const fallback = target.nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = "flex";
              }}
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center ">
              <LuUserRound className="w-6 h-6 text-gray-100" />
            </div>
          )}
        </div>

        {/* Reviewer Name */}
        <div className="flex-1 min-w-0">
          <div className="font-medium text-gray-900 break-words">
            {data.reviewerName || "Anonymous"}
          </div>
        </div>
      </div>

      {/* Rating and Title Section */}
      <div className="">
        <div className="flex items-center gap-2 mb-1">
          {/* Star Rating - using shared renderStars utility with Amazon orange color */}
          <div className="flex -space-x-1">
            {renderStars(data.rating, {
              size: "h-5 w-5",
              filledColor: "fill-orange-400 text-orange-400",
              emptyColor: "text-gray-300",
            })}
          </div>
          {/* Review Title */}
          <span className="font-bold text-gray-900 text-sm">
            {data.reviewTitle || "Review"}
          </span>
        </div>
      </div>

      <div className="mb-2">
        {/* Metadata Section: Date, Location, Product Details */}
        <div className="flex items-center gap-2">
          {/* Date and Location */}
          <div className="text-sm text-gray-600">
            {formatAmazonDate(data.date, data.location)}
          </div>

          {/* Product Details */}
          {data.productDetails && (
            <div className="text-xs text-gray-600">{data.productDetails}</div>
          )}
        </div>

        {/* Verified Purchase Badge */}

        {data.verified && (
          <div className="inline-block  ">
            <span className="text-xs font-bold text-orange-800 ">
              Verified Purchase
            </span>
          </div>
        )}
      </div>

      {/* Review Text */}
      {data.reviewText && (
        <div className="text-gray-700 text-sm leading-relaxed break-words mb-4">
          {data.reviewText}
        </div>
      )}

      {/* Action Buttons: Helpful and Report */}
      <div className="flex items-center gap-3  border-gray-200">
        <button className="text-xs text-gray-600 hover:text-gray-900 border border-gray-300 rounded-full px-3 py-1.5 hover:bg-gray-50 transition-colors">
          Helpful
        </button>
        <span className="text-gray-300">|</span>
        <button className="text-xs text-gray-600 hover:text-gray-900 hover:underline">
          Report
        </button>
        {data.helpfulVotes !== undefined && data.helpfulVotes > 0 && (
          <span className="text-xs text-gray-500 ml-auto">
            {data.helpfulVotes} people found this helpful
          </span>
        )}
      </div>
    </div>
  );
};
