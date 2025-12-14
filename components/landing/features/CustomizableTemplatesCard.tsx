"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";

export interface CustomizableTemplatesCardProps {
  className?: string;
}

export const CustomizableTemplatesCard = ({
  className,
}: CustomizableTemplatesCardProps) => {
  return (
    <div
      className={cn(
        "relative border border-white/10 rounded-[20px] p-[30px] flex flex-col gap-2 items-start justify-end ",
        "bg-linear-to-b from-white/10 to-white/0",
        "min-h-[465px]",
        className
      )}
    >
      {/* Visual Content Area */}
      <div className="absolute inset-0 flex items-center justify-center  ">
        <div className="relative w-full h-full max-w-[336px] max-h-[199px] ">
          {/* Placeholder for video/template preview */}
          <div
            className="w-full h-full bg-white/10 border border-white/10 rounded-lg backdrop-blur-sm flex overflow-hidden justify-center group hover:bg-white/20 transition-all duration-300"
            style={{
              backgroundImage: "url('/pattern.png')",
              backgroundRepeat: "repeat",
              backgroundSize: "auto",
              opacity: 0.5,
            }}
          >
            <Image
              src="/icons.svg"
              alt="template"
              width={200}
              height={200}
              className=" self-start group-hover:translate-y-[-100px] transition-all duration-300  "
            />
          </div>
        </div>
      </div>

      {/* Text Content - Positioned at bottom */}
      <div className="relative z-10 flex flex-col gap-2 items-start justify-end max-w-[336px] mt-auto">
        <h3 className="text-[20px] font-medium leading-[30px] text-white">
          Customizable Templates
        </h3>
        <p className="text-[16px] font-normal leading-[24px] text-white/70">
          Customize ratings, dates, reviewer names, and review text to match
          your needs.
        </p>
      </div>
    </div>
  );
};
