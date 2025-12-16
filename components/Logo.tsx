import React from "react";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
  gradient?: {
    from?: string;
    via?: string;
    to?: string;
  };
}

export const Logo = ({
  className,
  width = 32,
  height = 32,
  gradient,
}: LogoProps) => {
  const gradientId = `logo-gradient-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 168 76"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("", className)}
    >
      <defs>
        {gradient ? (
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={gradient.from || "currentColor"} />
            {gradient.via && <stop offset="50%" stopColor={gradient.via} />}
            <stop offset="100%" stopColor={gradient.to || "currentColor"} />
          </linearGradient>
        ) : null}
      </defs>
      <path
        d="M57 0C64.7643 7.62725e-07 71.9837 2.33019 78 6.32715C84.0163 2.33019 91.2357 0 99 0H130C150.987 1.28852e-06 168 17.0132 168 38C168 58.9868 150.987 76 130 76H99C91.2355 76 84.0164 73.669 78 69.6719C71.9836 73.669 64.7645 76 57 76H36C15.0132 76 0 58.9868 0 38C0 17.0132 15.0132 0 36 0H57ZM34.5 10C20.969 10 10 22.536 10 38C10 53.464 20.969 66 34.5 66C48.031 66 59 53.464 59 38C59 22.536 48.031 10 34.5 10ZM96.5 10C82.969 10 72 22.536 72 38C72 53.464 82.969 66 96.5 66C110.031 66 121 53.464 121 38C121 22.536 110.031 10 96.5 10Z"
        fill={gradient ? `url(#${gradientId})` : "currentColor"}
      />
    </svg>
  );
};
