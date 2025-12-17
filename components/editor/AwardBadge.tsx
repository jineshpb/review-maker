import { LaurelWreath } from "./LaurelWreath";
import { platformDefaults } from "./platformDefaults";

// Award Badge Component with customizable text, colors, heading, and content
export interface AwardBadgeProps {
  heading: string;
  content?: string;
  textColor?: string;
  laurelWreathColor?: string;
  className?: string;
}

// Helper to check if a value is a hex color or gradient
const isHexOrGradient = (value: string): boolean => {
  return value.startsWith("#") || value.startsWith("linear-gradient");
};

const awardBadgeDefaults = platformDefaults.awardbadge as {
  textColor?: string;
  laurelWreathColor?: string;
};

export const AwardBadge = ({
  heading,
  content,
  textColor = awardBadgeDefaults.textColor || "",
  laurelWreathColor = awardBadgeDefaults.laurelWreathColor || "",
  className = "",
}: AwardBadgeProps) => {
  // Determine if we should use inline styles or Tailwind classes
  const useInlineText = textColor ? isHexOrGradient(textColor) : false;
  const useInlineLaurel = laurelWreathColor
    ? isHexOrGradient(laurelWreathColor)
    : false;

  const textStyle = useInlineText ? { color: textColor } : undefined;
  const laurelStyle = useInlineLaurel
    ? { color: laurelWreathColor }
    : undefined;

  return (
    <div className={`rounded-2xl p-6 relative overflow-hidden ${className}`}>
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center">
        {/* Heading with laurels */}
        <div className="flex items-center justify-center gap-3">
          <LaurelWreath
            className={`${
              !useInlineLaurel ? laurelWreathColor : "text-gray-700"
            } h-20 w-20`}
            style={laurelStyle}
          />

          <div>
            <h2
              className={`${
                !useInlineText ? textColor : "text-gray-700"
              } font-semibold text-[20px] tracking-tight`}
              style={textStyle}
            >
              {heading}
            </h2>
            {/* Content text */}
            {content && (
              <p
                className={`${
                  !useInlineText ? textColor : "text-gray-700"
                } text-sm opacity-90`}
                style={textStyle}
              >
                {content}
              </p>
            )}
          </div>

          <LaurelWreath
            className={`${
              !useInlineLaurel ? laurelWreathColor : "text-gray-700"
            } h-20 w-20 scale-x-[-1]`}
            style={laurelStyle}
          />
        </div>
      </div>
    </div>
  );
};
