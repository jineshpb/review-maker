"use client";

import { Button } from "@/components/ui/button";
import { Loader2, Check } from "lucide-react";

export type BillingInterval = "month" | "year";

export interface BillingOptionProps {
  interval: BillingInterval;
  price: string;
  savings?: string;
  isCurrentPlan: boolean;
  isLoading: boolean;
  onSubscribe: () => void;
  showPrice?: boolean;
  highlight?: boolean;
}

export const BillingOption = ({
  interval,
  price,
  savings,
  isCurrentPlan,
  isLoading,
  onSubscribe,
  showPrice = true,
  highlight = false,
}: BillingOptionProps) => {
  const intervalLabel = interval === "month" ? "per month" : "per year";

  return (
    <div
      className={`border rounded-lg p-4 relative   ${
        highlight ? "border-primary" : ""
      }`}
    >
      {isCurrentPlan && (
        <div className="absolute -top-2 -right-2 bg-white border border-border text-xs font-semibold px-2 py-1 rounded">
          Current Plan
        </div>
      )}
      <div className="flex items-center justify-between mb-2">
        {showPrice && (
          <div>
            <div className="flex items-center gap-2">
              <div className="text-3xl font-bold">{price}</div>
              {savings && (
                <span className="text-sm font-semibold text-primary px-1 py-0 rounded">
                  {savings}
                </span>
              )}
            </div>
            <div className="text-sm text-muted-foreground">{intervalLabel}</div>
          </div>
        )}
        <Button
          onClick={onSubscribe}
          disabled={isLoading || isCurrentPlan}
          variant={
            isCurrentPlan ? "secondary" : highlight ? "default" : "outline"
          }
          className="ml-4 cursor-pointer"
          size="sm"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : isCurrentPlan ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              Current
            </>
          ) : (
            "Subscribe"
          )}
        </Button>
      </div>
    </div>
  );
};
