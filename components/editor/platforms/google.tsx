import { Star } from "lucide-react";
import { renderStars, formatDate } from "../ReviewRenderer";
import type { GoogleReviewData } from "@/types/review";

/**
 * Google Reviews template renderer
 *
 * Renders a Google-style review card with:
 * - Profile picture with Local Guide badge
 * - Reviewer name and Local Guide status
 * - Star rating and date
 * - "NEW" badge (optional)
 * - Review text
 */
export const renderGoogleReview = (data: GoogleReviewData) => {
  const localGuideLevel = data.localGuideLevel || 0;
  const numberOfReviews = data.numberOfReviews || 0;
  const numberOfPhotos = data.numberOfPhotos || 0;
  const hasLocalGuide = localGuideLevel > 0;

  return (
    <div
      className="bg-white overflow-hidden rounded-lg shadow-sm border border-gray-200 p-4 max-w-[500px] w-full"
      id="review-card"
    >
      {/* Header Section */}
      <div className="flex items-start gap-3 mb-3">
        {/* Profile Picture with Local Guide Badge */}
        <div className="relative shrink-0">
          {data.profilePictureUrl ? (
            <img
              src={data.profilePictureUrl}
              alt={data.reviewerName}
              className="w-12 h-12 rounded-full"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
                const fallback = target.nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = "flex";
              }}
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
              {data.reviewerName[0]?.toUpperCase() || "U"}
            </div>
          )}
          {/* Local Guide Badge Icon (inset at bottom-right) */}
          {hasLocalGuide && (
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center border-2 border-white">
              <Star className="h-3 w-3 fill-white text-white" />
            </div>
          )}
        </div>

        {/* Name and Local Guide Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="font-medium text-gray-900 break-words">
                {data.reviewerName || "Anonymous"}
              </div>
              {hasLocalGuide && (
                <div className="text-xs text-gray-600 mt-0.5 break-words">
                  Local Guide
                  {numberOfReviews > 0 && ` · ${numberOfReviews} reviews`}
                  {numberOfPhotos > 0 && ` · ${numberOfPhotos} photos`}
                </div>
              )}
            </div>
            {/* Three dots menu (optional) */}
            <button className="text-gray-400 hover:text-gray-600 shrink-0">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Rating Section */}
      <div className="flex items-center gap-3 mb-2">
        <div className="flex gap-0.5">{renderStars(data.rating)}</div>
        <span className="text-sm text-gray-500">{formatDate(data.date)}</span>
        {data.isNew && (
          <span className="text-xs font-medium text-gray-900 border border-gray-300 px-2 py-0.5 rounded">
            NEW
          </span>
        )}
      </div>

      {/* Review Text */}
      {data.reviewText && (
        <div className="text-gray-700 text-sm leading-relaxed break-words mt-2">
          {data.reviewText}
        </div>
      )}
    </div>
  );
};
