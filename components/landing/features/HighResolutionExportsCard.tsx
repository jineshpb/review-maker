"use client";

import { cn } from "@/lib/utils";

export interface HighResolutionExportsCardProps {
  className?: string;
}

export const HighResolutionExportsCard = ({
  className,
}: HighResolutionExportsCardProps) => {
  return (
    <div
      className={cn(
        "relative border border-white/10 rounded-[20px] p-[30px] flex flex-col gap-2 items-start justify-end overflow-hidden",
        "bg-linear-to-b from-white/10 to-white/0",
        "min-h-[465px]",
        "md:col-span-2",
        className
      )}
    >
      {/* Visual Content Area - Three Stacked Cards */}
      <div className="absolute inset-0 flex items-start justify-center ">
        <div className="relative w-full h-full max-w-[720px] mt-8 max-h-[280px]  flex items-center justify-center group  ">
          {/* Card 3 - Back Layer (rightmost) */}
          <div className=" absolute left-1/2 -translate-x-1/4  top-8 hover:skew-6 skew-0 group-hover:skew-6 w-[295px] h-[148px] bg-card/30 border border-white/10 rounded-lg backdrop-blur-sm transition-all duration-300 ">
            {/* Content lines */}
            <div className="p-4 flex flex-col gap-2">
              <div className="h-2 w-[148px] bg-white/20 rounded" />
              <div className="h-2 w-[128px] bg-white/20 rounded" />
              <div className="h-2 w-[168px] bg-white/20 rounded mt-auto" />
            </div>
          </div>

          {/* Card 2 - Middle Layer */}
          <div className=" hover:skew-6 group-hover:skew-6 absolute left-1/2 -translate-x-1/2 top-16 w-[295px] h-[148px] bg-card/40 border border-white/10 rounded-lg backdrop-blur-sm transition-all duration-300">
            {/* Content lines */}
            <div className="p-4 flex flex-col gap-2">
              <div className="h-2 w-[148px] bg-white/20 rounded" />
              <div className="h-2 w-[128px] bg-white/20 rounded" />
              <div className="h-2 w-[168px] bg-white/20 rounded mt-auto" />
            </div>
          </div>

          {/* Card 1 - Front Layer (leftmost) */}
          <div className=" hover:skew-6 group-hover:skew-6 absolute left-1/2 -translate-x-3/4 top-24 w-[295px] h-[148px] bg-card/50 border border-white/10 rounded-lg backdrop-blur-sm transition-all duration-300">
            {/* Content lines */}
            <div className="p-4 flex flex-col gap-2">
              <div className="h-3 w-[96px] bg-white/30 rounded" />
              <div className="h-2 w-[148px] bg-white/20 rounded mt-2" />
              <div className="h-2 w-[128px] bg-white/20 rounded" />
              <div className="h-2 w-[168px] bg-white/20 rounded mt-auto" />
            </div>
          </div>

          {/* Wavy Divider Line */}
          <div
            className="absolute bottom-0 left-0 right-0 h-[2px]"
            style={{
              background:
                "linear-gradient(to right, transparent 0%, rgba(255,255,255,0.1) 20%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0.1) 80%, transparent 100%)",
              clipPath: "path('M 0,2 Q 180,0 360,2 T 720,2')",
            }}
          />
        </div>
      </div>

      {/* Text Content - Positioned at bottom */}
      <div className="relative z-10 flex flex-col gap-2 items-start justify-end max-w-[360px] mt-auto">
        <h3 className="text-[20px] font-medium leading-[30px] text-white">
          High resolution exports
        </h3>
        <p className="text-[16px] font-normal leading-[24px] text-white/70">
          Export at 2x or retina quality
        </p>
      </div>
    </div>
  );
};
