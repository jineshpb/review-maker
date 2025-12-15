import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

export interface GlassButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  children: React.ReactNode;
}

const GlassButton = React.forwardRef<HTMLButtonElement, GlassButtonProps>(
  ({ className, asChild = false, children, ...props }, ref) => {
    const baseClasses = cn(
      "relative inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-opacity disabled:pointer-events-none disabled:opacity-50 outline-none",
      "backdrop-blur-[10px]",
      "bg-linear-to-b from-[rgba(61,66,68,0)] to-[rgba(158,170,176,0.62)]",
      "border border-gray-700",
      "text-white",
      "rounded-[10px]",
      "px-[20px] py-[8px]",
      "gap-3",
      "shadow-[0px_4px_4px_0px_rgba(0,0,0,0.05),0px_10px_10px_0px_rgba(0,0,0,0.1),0px_10px_40px_0px_rgba(255,255,255,0.15)]",
      "hover:opacity-90",
      // Inner shadow using CSS (works with asChild)
      "before:absolute before:inset-0 before:pointer-events-none before:rounded-[10px] before:shadow-[inset_0px_8px_10px_0px_rgba(246,249,255,0.2)] before:content-['']",
      className
    );

    if (asChild) {
      return (
        <Slot className={baseClasses} ref={ref} {...props}>
          {children}
        </Slot>
      );
    }

    return (
      <button className={baseClasses} ref={ref} {...props}>
        {children}
      </button>
    );
  }
);
GlassButton.displayName = "GlassButton";

export { GlassButton };
