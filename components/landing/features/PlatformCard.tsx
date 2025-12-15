"use client";

import { cn } from "@/lib/utils";

export interface PlatformCardProps {
  className?: string;
}

type HexagonIconProps = {
  className?: string;
  color?: string;
  brandName?: string;
};

const HexagonIcon = ({ className, color, brandName }: HexagonIconProps) => {
  return (
    <>
      {!brandName ? (
        <svg
          viewBox="0 0 542 475"
          xmlns="http://www.w3.org/2000/svg"
          className={cn("w-full h-full fill-current/30 ", className)}
          aria-hidden="true"
          focusable="false"
        >
          <path d="M145.453 0.5H396.359C403.326 0.500131 409.763 4.21689 413.246 10.25L538.699 227.541C542.183 233.574 542.183 241.008 538.699 247.041L413.246 464.332C409.763 470.365 403.326 474.082 396.359 474.082H145.453C138.486 474.082 132.049 470.365 128.565 464.332L3.1123 247.041C-0.370992 241.008 -0.370953 233.574 3.1123 227.541L128.565 10.25C132.049 4.21668 138.486 0.5 145.453 0.5Z" />
        </svg>
      ) : (
        <svg
          viewBox="0 0 542 475"
          xmlns="http://www.w3.org/2000/svg"
          className={cn("w-full h-full fill-current ", className)}
          aria-hidden="true"
          focusable="false"
          style={{
            backgroundImage: "url('/pattern.png')",
            backgroundRepeat: "repeat",
            backgroundSize: "auto",
            opacity: 0.5,
          }}
        >
          <path d="M145.453 0.5H396.359C403.326 0.500131 409.763 4.21689 413.246 10.25L538.699 227.541C542.183 233.574 542.183 241.008 538.699 247.041L413.246 464.332C409.763 470.365 403.326 474.082 396.359 474.082H145.453C138.486 474.082 132.049 470.365 128.565 464.332L3.1123 247.041C-0.370992 241.008 -0.370953 233.574 3.1123 227.541L128.565 10.25C132.049 4.21668 138.486 0.5 145.453 0.5Z" />
        </svg>
      )}
    </>
  );
};

// Hexagon dimensions
const HEXAGON_WIDTH = 131;
const HEXAGON_HEIGHT = 113;

function generateHexPositions({
  rows,
  cols,
  hexWidth,
  hexHeight,
  gap = 5,
  offsetLeft = 0,
  offsetTop = 0,
}: {
  rows: number;
  cols: number;
  hexWidth: number;
  hexHeight: number;
  gap?: number;
  offsetLeft?: number;
  offsetTop?: number;
}) {
  const positions: Array<{
    row: number;
    col: number;
    left: number;
    top: number;
  }> = [];

  // Base honeycomb spacing
  const xStep = hexWidth * 0.75 + gap;
  const yStep = hexHeight + gap;

  for (let col = 0; col < cols; col++) {
    for (let row = 0; row < rows; row++) {
      const left = offsetLeft + col * xStep;
      const top =
        offsetTop + row * yStep + (col % 2 === 1 ? (hexHeight + gap) / 2 : 0);

      positions.push({
        row,
        col,
        left,
        top,
      });
    }
  }

  return positions;
}

// Hexagon component with platform overlay
const HexagonPlatform = ({
  name,
  color,
  position,
}: {
  name?: string;
  color: string;
  position: { top: string; left: string };
}) => {
  const hexFillColor = name ? color : "rgba(255,255,255,0.12)";

  return (
    <div
      className="absolute "
      style={{
        top: position.top,
        left: position.left,
        transform: "translate(-50%, -50%)",
      }}
    >
      <div className="relative w-[131px] h-[113px]  text-white/10 hover:text-white/20 transition-all duration-300 ">
        {/* Hexagon Image */}
        <HexagonIcon
          color={"#ffffff20"}
          className=" transition-opacity duration-300"
          brandName={name}
        />
        {/* Platform Name Overlay */}
        {name ? (
          <>
            {name === "Google" ? (
              <span className="text-white/50 font-medium text-lg absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                {name}
              </span>
            ) : (
              <span className="text-lg font-medium text-white/50 tracking-tight absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                {name}
              </span>
            )}
          </>
        ) : (
          <></>
        )}

        {/* Color overlay for tinting */}
        {/* <div
          className="absolute inset-0 mix-blend-overlay opacity-30"
          style={{ backgroundColor: color }}
        /> */}
      </div>
    </div>
  );
};

export const PlatformCard = ({ className }: PlatformCardProps) => {
  const platforms = [
    { name: "Tripadvisor", color: "#34E0A1" },
    { name: "Trustpilot", color: "#00B67A" },
    { name: "Yelp", color: "#FF1A1A" },
    { name: "Google", color: "#4285F4" },
    { name: "Amazon", color: "#FF9900" },
    { name: "Apple", color: "#000000" },
    { name: "", color: "#000000" },
    { name: "", color: "#000000" },
    { name: "", color: "#000000" },
  ];

  // Generate honeycomb positions
  // Using a 3x5 grid (5 columns, 3 rows) to create honeycomb pattern
  // We'll filter to use only the positions we need for platforms
  const allPositions = generateHexPositions({
    rows: 2,
    cols: 5,
    hexWidth: HEXAGON_WIDTH,
    hexHeight: HEXAGON_HEIGHT,
    offsetLeft: 0,
    offsetTop: 0,
  });

  // Select positions for our 6 platforms in honeycomb pattern
  // Map: row 0: [center], row 1: [left, right], row 2: [left, right]
  const selectedIndices = [1, 3, 5, 6, 8, 4, 0, 2, 7]; // Indices for honeycomb pattern
  const positions = selectedIndices.map((idx) => ({
    top: allPositions[idx].top,
    left: allPositions[idx].left,
  }));

  return (
    <div
      className={cn(
        "relative border border-white/10 rounded-[20px] p-[30px] flex flex-col gap-2 items-start justify-end overflow-hidden",
        "bg-linear-to-b from-white/10 to-white/0",
        "",
        "min-h-[465px]",
        className
      )}
    >
      {/* Platform Hexagons - Honeycomb Pattern */}
      <div
        className="absolute inset-0 flex items-center justify-center  "
        style={{
          maskImage:
            "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.75) 25%, rgba(0,0,0,0) 75%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 25%, rgba(0,0,0,0.3) 75%, transparent 100%)",
        }}
      >
        <div className="relative w-full h-full max-w-[610px] max-h-[398px] ">
          {platforms.map((platform, index) => {
            const pos = positions[index];
            if (!pos) return null;

            return (
              <HexagonPlatform
                key={`hex-${index}`}
                name={platform.name || undefined}
                color={platform.color}
                position={{
                  top: `${pos.top}px`,
                  left: `${pos.left}px`,
                }}
              />
            );
          })}
        </div>
      </div>

      {/* Text Content - Positioned at bottom */}
      <div className="relative z-10 flex flex-col gap-2 items-start justify-end max-w-[360px] mt-auto">
        <h3 className="text-[20px] font-medium leading-[30px] text-white">
          Multiple platforms
        </h3>
        <p className="text-[16px] font-normal leading-[24px] text-white/70">
          Support for Google Reviews, Trustpilot, TripAdvisor, Amazon, and more.
        </p>
      </div>
    </div>
  );
};
