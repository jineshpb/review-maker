"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";
import { useMemo, useState } from "react";
import CountUp from "react-countup";

export interface AIGenerationCardProps {
  className?: string;
}

export const AIGenerationCard = ({ className }: AIGenerationCardProps) => {
  const [isProgressActive, setIsProgressActive] = useState(false);

  const radius = 70;
  const circumference = useMemo(() => 2 * Math.PI * radius, [radius]);
  const baseProgress = 0.5;
  const progress = isProgressActive ? 1 : baseProgress;
  const strokeDashoffset = circumference * (1 - progress);

  const handleProgressEnter = () => setIsProgressActive(true);
  const handleProgressLeave = () => setIsProgressActive(false);
  const handleProgressFocus = () => setIsProgressActive(true);
  const handleProgressBlur = () => setIsProgressActive(false);
  const handleProgressKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (
    event
  ) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    setIsProgressActive(true);
  };

  return (
    <div
      className={cn(
        "relative border border-white/10 rounded-[20px] p-[30px] flex flex-col gap-2 items-start justify-end overflow-hidden",
        "bg-linear-to-b from-white/10 to-white/0",
        "min-h-[465px]",
        className
      )}
    >
      {/* Layered Cards with Progress Ring */}
      <div className="absolute inset-0 flex items-center justify-center ">
        <div className="relative w-full h-full max-w-[558px] mt-24  ">
          <Image
            src="/ai-pencil.svg"
            alt="ai-generation"
            width={100}
            height={204}
            className="object-cover absolute top-[120px] left-[50px] z-10"
          />
          <div className="absolute inset-0 top-0 left-1/2 -translate-x-1/2">
            <div className="absolute left-1/2 -translate-x-1/2 top-0 w-[223px] h-[148px] bg-white/10 border border-white/10 rounded-lg backdrop-blur-sm hover:bg-white/20 transition-all duration-300 hover:scale-105" />
            <div className="absolute left-1/2 -translate-x-1/2 top-[10px] w-[249px] h-[148px] bg-white/10 border border-white/10 rounded-lg backdrop-blur-sm hover:bg-white/20 hover:scale-105 transition-all duration-300" />
            <div
              className="absolute left-1/2 -translate-x-1/2 top-[24px] w-[275px] h-[148px] bg-white/10 border border-white/10 rounded-lg backdrop-blur-sm hover:bg-white/20 transition-all duration-300 hover:scale-105"
              style={{
                backgroundImage: "url('/pattern.png')",
                backgroundRepeat: "repeat",
                backgroundSize: "auto",
                opacity: 0.5,
              }}
            />
          </div>

          {/* Progress Ring */}
          <div
            className="absolute right-[30px] top-[84px] w-[150px] h-[150px] outline-none"
            tabIndex={0}
            role="img"
            aria-label="AI generation progress"
            onMouseEnter={handleProgressEnter}
            onMouseLeave={handleProgressLeave}
            onFocus={handleProgressFocus}
            onBlur={handleProgressBlur}
            onKeyDown={handleProgressKeyDown}
          >
            {/* Outer Ring */}
            <svg
              width="150"
              height="150"
              viewBox="0 0 150 150"
              className="absolute inset-0"
            >
              <circle
                cx="75"
                cy="75"
                r={radius}
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="2"
              />
              {/* Progress Arc (animates 50% -> 100%) */}
              <circle
                cx="75"
                cy="75"
                r={radius}
                fill="none"
                stroke="rgba(255,255,255,0.3)"
                strokeWidth="2"
                strokeDasharray={circumference}
                transform="rotate(-90 75 75)"
                className="transition-[stroke-dashoffset] duration-700 ease-out"
                style={{ strokeDashoffset }}
              />
            </svg>
            {/* Inner Circle */}
            <div className="absolute inset-[12px] rounded-full bg-card/20 border-5 border-white/10 backdrop-blur-sm flex gap-2 items-center justify-center ">
              {/* Arrow */}
              <div className="w-[25px] h-[25px] ">
                <Image
                  src="/arrow.svg"
                  alt="arrow"
                  width={50}
                  height={50}
                  className="object-cover"
                />
              </div>

              {/* Percentage Text */}
              <span className="text-2xl font-medium tracking-tight text-white/50">
                {isProgressActive ? (
                  <CountUp
                    start={baseProgress * 100}
                    end={100}
                    duration={0.7}
                    suffix="%"
                  />
                ) : (
                  `${Math.round(baseProgress * 100)}%`
                )}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Text Content - Positioned at bottom */}
      <div className="relative z-10 flex flex-col gap-2 items-start justify-end max-w-[360px] mt-auto">
        <h3 className="text-[20px] font-medium leading-[30px] text-white">
          AI-Powered Generation
        </h3>
        <p className="text-[16px] font-normal leading-[24px] text-white/70">
          Use AI to generate realistic review content tailored to your business.
        </p>
      </div>
    </div>
  );
};
