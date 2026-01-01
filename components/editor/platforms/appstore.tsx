import { formatDate } from "../ReviewRenderer";
import type { AppStoreReviewData } from "@/types/review";
import { format } from "date-fns";
import { AwardBadge } from "../AwardBadge";
import { platformDefaults } from "../platformDefaults";

// Custom star rendering for App Store - solid black for filled, filled grey for empty
const renderAppStoreStars = (rating: number) => {
  return [1, 2, 3, 4, 5].map((star) => {
    const isFilled = star <= rating;
    return (
      <svg
        key={star}
        className="h-5 w-5"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path
          d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
          className={isFilled ? "text-black" : "text-gray-400"}
        />
      </svg>
    );
  });
};

/**
 * App Store Reviews template renderer
 *
 * Renders an App Store-style review card with:
 * - Bold headline/title at the top
 * - Star rating (solid black stars for filled, filled grey for empty)
 * - Date and reviewer name on the same line
 * - Review text in lighter grey
 * - White card with rounded corners
 */
export const renderAppStoreReview = (data: AppStoreReviewData) => {
  // Format date for App Store style: "26 Nov" (short format)
  const formatAppStoreDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "d MMM");
    } catch {
      return formatDate(dateString);
    }
  };

  return (
    <div
      className="bg-white rounded-4xl shadow-sm border border-gray-200 p-8 max-w-[600px] w-full"
      id="review-card"
    >
      {/* Award Badge */}
      {data.awardBadge &&
        (() => {
          const awardBadgeDefaults = platformDefaults.awardbadge as {
            textColor?: string;
            laurelWreathColor?: string;
          };
          return (
            <AwardBadge
              heading={data.awardBadge.heading}
              content={data.awardBadge.content}
              textColor={
                data.awardBadge.textColor || awardBadgeDefaults.textColor
              }
              laurelWreathColor={
                data.awardBadge.laurelWreathColor ||
                awardBadgeDefaults.laurelWreathColor
              }
            />
          );
        })()}

      {/* Review Title/Headline - Bold black text */}
      {data.reviewTitle && (
        <h3 className="font-semibold text-gray-900 text-[20px] mb-5 break-words">
          {data.reviewTitle}
        </h3>
      )}

      {/* Rating, Date, and Reviewer Name Section */}
      <div className="flex items-center gap-3 mb-3">
        {/* Star Rating - App Store uses solid black for filled, filled grey for empty */}
        <div className="flex gap-0.5 items-center">
          {renderAppStoreStars(data.rating)}
        </div>

        {/* Date and Reviewer Name - on the same line */}
        <div className="flex items-center gap-2 text-[16px] text-gray-500">
          <span>{formatAppStoreDate(data.date)}</span>
          <span className="text-gray-400">·</span>
          <span className="break-words">
            {data.reviewerName || "Anonymous"}
          </span>
        </div>
      </div>

      {/* Review Text - Lighter grey */}
      {data.reviewText && (
        <div className="text-gray-500 text-[18px] leading-relaxed break-words">
          {data.reviewText}
        </div>
      )}
    </div>
  );
};
