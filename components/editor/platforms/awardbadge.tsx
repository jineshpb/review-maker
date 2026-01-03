import { AwardBadge } from "../AwardBadge";
import type { AwardBadgeData } from "@/types/review";
import { platformDefaults } from "../platformDefaults";

/**
 * Award Badge template renderer
 *
 * Renders a customizable award badge with:
 * - Customizable heading and content
 * - Customizable text and background colors
 * - Optional laurel wreaths
 */
export const renderAwardBadge = (data: AwardBadgeData) => {
  const defaults = platformDefaults.awardbadge as AwardBadgeData;
  return (
    <div
      className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 max-w-[600px] w-full flex items-center justify-center"
      id="review-card"
    >
      <AwardBadge
        heading={data.heading || defaults.heading || ""}
        content={data.content || defaults.content || ""}
        textColor={data.textColor || defaults.textColor || ""}
        laurelWreathColor={
          data.laurelWreathColor || defaults.laurelWreathColor || ""
        }
        className="mb-0"
      />
    </div>
  );
};
