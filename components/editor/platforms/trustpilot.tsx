import { renderStars, formatDate } from "../ReviewRenderer";
import type { TrustpilotReviewData } from "@/types/review";
import { LuUserRound } from "react-icons/lu";
import { CheckCircle2 } from "lucide-react";
import { IoMdCheckmark, IoMdStar } from "react-icons/io";
import { LiaThumbsUpSolid } from "react-icons/lia";
import { IoShareSocialOutline } from "react-icons/io5";
import { RiFlag2Line } from "react-icons/ri";

/**
 * Trustpilot Reviews template renderer
 *
 * Renders a Trustpilot-style review card with:
 * - Profile icon/avatar
 * - Reviewer name
 * - Star rating (Trustpilot green)
 * - Review title
 * - Date
 * - Verified badge (if verified)
 * - Review text
 */

const renderStarIcon = (isFilled: boolean) => {
  return (
    <div
      className={`${
        isFilled
          ? "bg-[#00b67a] border-[#00b67a]"
          : "bg-gray-200 border-gray-300"
      } border h-5 w-5 flex items-center justify-center`}
    >
      <IoMdStar
        className={`h-4 w-4 ${
          isFilled ? "text-white fill-white" : "text-gray-400 fill-gray-400"
        }`}
      />
    </div>
  );
};

const generateInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
};

export const renderTrustpilotReview = (data: TrustpilotReviewData) => {
  return (
    <div className="bg-white rounded-xl border border-gray-300 p-4 max-w-[600px] w-full" id="review-card">
      {/* Header Section: Profile Icon and Name */}
      <div className="flex items-center gap-3 mb-4">
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
            <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
              {generateInitials(data.reviewerName || "Anonymous")}
            </div>
          )}
        </div>

        {/* Reviewer Name and Verified Badge */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <div className="flex flex-col">
              <div className="font-medium text-gray-900 break-words">
                {data.reviewerName || "Anonymous"}
              </div>
              {/* Date */}
              <div className="">
                <div className="text-sm text-gray-600">
                  {formatDate(data.date)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rating and Title Section */}
      <div className="mb-3 ">
        <div className="flex items-center gap-2 mb-1">
          {/* Star Rating - Trustpilot green rectangle with white star */}
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <div key={star}>{renderStarIcon(star <= data.rating)}</div>
            ))}
          </div>

          {data.verified && (
            <div className="flex items-center gap-1 text-[#1a6820]">
              <IoMdCheckmark className="h-4 w-4" />

              <span className="text-x[16px] font-medium">Verified</span>
            </div>
          )}
        </div>
      </div>

      {/* Review Text */}
      {data.reviewText && (
        <div className="text-gray-800 text- leading-normal break-words mb-4">
          {data.reviewText}
        </div>
      )}

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 text-gray-500">
          <LiaThumbsUpSolid />
          <span className="text-sm">Useful</span>
          <span className="text-sm font-medium">
            {Math.floor(Math.random() * 1000)}
          </span>
        </div>
        <div className="flex items-center gap-1 text-gray-500">
          <IoShareSocialOutline />
          <span>Share</span>
        </div>
        <div className="flex items-center gap-1 text-gray-500">
          <RiFlag2Line />
        </div>
      </div>
    </div>
  );
};
