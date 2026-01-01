import { formatDate } from "../ReviewRenderer";
import type { TripAdvisorReviewData } from "@/types/review";
import { LuUserRound } from "react-icons/lu";
import { ThumbsUp } from "lucide-react";
import { format } from "date-fns";
import { PiUserFill } from "react-icons/pi";

/**
 * TripAdvisor Reviews template renderer
 *
 * Renders a TripAdvisor-style review card with:
 * - Profile picture
 * - Reviewer name and contribution level
 * - Green circle rating (5 circles)
 * - Review title (green, bold)
 * - Review text
 * - Visit details (month, year, travel type)
 * - Written date
 * - Helpful button with count
 */
export const renderTripAdvisorReview = (data: TripAdvisorReviewData) => {
  // Format date for TripAdvisor: "Written 4 December 2025"
  const formatWrittenDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return `Written ${format(date, "d MMMM yyyy")}`;
    } catch {
      return formatDate(dateString);
    }
  };

  // Generate initials for avatar fallback
  const generateInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatVisitedDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "MMMM yyyy");
    } catch {
      return formatDate(dateString);
    }
  };

  // Render green circles for rating (TripAdvisor uses circles, not stars)
  const renderRatingCircles = (rating: number) => {
    return [1, 2, 3, 4, 5].map((circle) => (
      <div
        key={circle}
        className={`h-4 w-4 rounded-full ${
          circle <= rating ? "bg-[#00AF87]" : "bg-gray-300"
        }`}
      />
    ));
  };

  return (
    <div
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 max-w-[600px] w-full min-w-[600px]"
      id="review-card"
    >
      {/* Header Section: Profile Picture, Name, and Rating */}
      <div className="flex items-center gap-3 mb-6 ">
        {/* Profile Picture */}
        <div className="shrink-0">
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
            <div className="w-9 h-9 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-semibold text-sm overflow-hidden">
              <PiUserFill className="w-8 h-8 text-gray-400 mt-2" />
            </div>
          )}
        </div>

        {/* Reviewer Name, Contributions, and Rating */}
        <div className="flex-1 min-w-0">
          <div className="font-medium text-gray-900 break-words">
            {data.reviewerName || "Anonymous"}
          </div>
          <div className="text-sm text-gray-800">
            {Math.floor(Math.random() * 10)} contributions
          </div>
        </div>
      </div>
      {/* Green Circle Rating */}
      <div className="flex gap-[2px] items-center mb-2">
        {renderRatingCircles(data.rating)}
      </div>

      {/* Review Title - Green, Bold */}
      {data.reviewTitle && (
        <div className="mb-2">
          <h3 className="font-medium  text-base break-words">
            {data.reviewTitle}
          </h3>
        </div>
      )}

      {/* Review Text */}
      {data.reviewText && (
        <div className="text-gray-700 text-sm leading-relaxed break-words mb-4">
          {data.reviewText}
        </div>
      )}

      <div className="flex items-center justify-between mb-4 mt-3">
        {/* Visit Details and Written Date */}
        <div className="space-y-1 text-xs">
          {/* Visit Details */}
          <div className="text-sm text-gray-800 flex items-center">
            Visited
            <span className="font-bold ml-2">
              {formatVisitedDate(data.date)}
            </span>
            <span className="text-gray-600 ml-1">
              Travelled with {Math.random() > 0.5 ? "Family" : "Friends"}
            </span>
          </div>
          <div className="text-sm text-gray-600">
            {formatWrittenDate(data.date)}
          </div>
        </div>

        {/* Helpful Button */}
        <div className="flex items-center gap-4 ">
          <button className="flex items-center gap-2 rounded-full px-4 py-1.5 border border-gray-600">
            <ThumbsUp className="h-4 w-4" />
            <span className="text-sm font-medium">
              Helpful {data.helpfulVotes ? `(${data.helpfulVotes})` : "(0)"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
