"use client";

import { Button } from "@/components/ui/button";
import { Loader2, X, Check } from "lucide-react";
import { BillingOption, type BillingInterval } from "./BillingOption";
import { IoMdClose } from "react-icons/io";

export type PlanTier = "free" | "premium";

export interface PlanFeature {
  text: string;
}

export interface MonthlyPlan {
  price: string;
  interval: "month";
  features: string[];
}

export interface YearlyPlan {
  price: string;
  interval: "year";
  savings?: string;
  features: string[];
}

export interface PlanCardProps {
  name: string;
  tier: PlanTier;
  description: string;
  monthly: MonthlyPlan;
  yearly?: YearlyPlan;
  currentSubscription?: {
    tier: string;
    status: string;
    billing_interval?: string | null;
    current_period_end?: string | null;
  } | null;
  subscriptionLoading: boolean;
  subscriptionStatus?: "active" | "cancelled" | "expired" | null;
  subscriptionCurrentPeriodEnd?: string | null;
  subscriptionBillingInterval?: string | null;
  loading: string | null;
  onSubscribe: (tier: PlanTier, interval: BillingInterval) => void;
  onCancelSubscription?: () => void;
}

export const PlanCard = ({
  name,
  tier,
  description,
  monthly,
  yearly,
  currentSubscription,
  subscriptionLoading,
  subscriptionStatus,
  subscriptionCurrentPeriodEnd,
  subscriptionBillingInterval,
  loading,
  onSubscribe,
  onCancelSubscription,
}: PlanCardProps) => {
  // Check if this is the current ACTIVE plan (exclude cancelled subscriptions)
  // Cancelled subscriptions should show "Subscribe" to reactivate, not "Current Plan"
  const isCurrentPlan =
    !subscriptionLoading &&
    currentSubscription?.tier === tier &&
    subscriptionStatus === "active"; // Only show "Current" for active subscriptions

  const isMonthlyCurrent: boolean = Boolean(
    isCurrentPlan && subscriptionBillingInterval === "month"
  );
  const isYearlyCurrent: boolean = Boolean(
    isCurrentPlan && subscriptionBillingInterval === "year"
  );

  const showDowngradeButton =
    currentSubscription?.tier === "premium" &&
    tier === "free" &&
    subscriptionStatus === "active"; // Only show if subscription is active (not cancelled)

  const isLoading = (interval: BillingInterval) =>
    loading === `${tier}-${interval}`;

  return (
    <div
      className={`border rounded-xl p-4 relative bg-white ${
        isCurrentPlan ? "border-border border" : ""
      }`}
    >
      <div className="flex gap-2 justify-between">
        <div className="flex flex-col">
          <h2 className="text-2xl font-bold text-secondary-foreground">
            {name}
          </h2>
          <p className="text-muted-foreground mb-2 tracking-tight">
            {description}
          </p>
        </div>
        {isCurrentPlan && tier !== "premium" && (
          <div className="absolute -top-2 -right-2 bg-white border border-border text-xs font-semibold px-2 py-1 rounded">
            Current Plan
          </div>
        )}

        {showDowngradeButton && onCancelSubscription && (
          <Button
            onClick={onCancelSubscription}
            disabled={loading === "cancel"}
            variant="outline"
            className=""
            size="sm"
          >
            {loading === "cancel" ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Downgrading...
              </>
            ) : (
              <>
                <X className="mr-2 h-4 w-4" />
                Downgrade to Free
              </>
            )}
          </Button>
        )}
      </div>
      <div className="pb-2 flex gap-2">
        {subscriptionStatus === "cancelled" && tier === "premium" && (
          <div className="text-sm flex items-center gap-1 text-red-700">
            <IoMdClose />
            <span className="font-medium capitalize">{subscriptionStatus}</span>
          </div>
        )}
        {/* Period End / Renewal Date */}
        {subscriptionCurrentPeriodEnd && tier === "premium" && (
          <div className="text-sm text-muted-foreground">
            <span className="">
              {subscriptionStatus === "active"
                ? "Renews: "
                : subscriptionStatus === "cancelled" &&
                  new Date(subscriptionCurrentPeriodEnd) > new Date()
                ? "Access until "
                : "Expires: "}
            </span>
            <span className="font-medium">
              {new Date(subscriptionCurrentPeriodEnd).toLocaleDateString(
                undefined,
                {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                }
              )}
            </span>
          </div>
        )}
      </div>

      <div className="space-y-4 mb-6">
        {/* Monthly Plan */}
        {tier !== "free" && (
          <BillingOption
            interval="month"
            price={monthly.price}
            isCurrentPlan={isMonthlyCurrent}
            isLoading={isLoading("month")}
            onSubscribe={() => onSubscribe(tier, "month")}
            showPrice={true}
          />
        )}

        {/* Yearly Plan - Only show for premium */}
        {yearly && (
          <BillingOption
            interval="year"
            price={yearly.price}
            savings={yearly.savings}
            isCurrentPlan={isYearlyCurrent}
            isLoading={isLoading("year")}
            onSubscribe={() => onSubscribe(tier, "year")}
            showPrice={true}
            highlight={true}
          />
        )}
      </div>

      <ul className="space-y-2">
        {monthly.features.map((feature, idx) => (
          <li key={idx} className="flex items-center gap-2">
            <Check className="h-4 w-4 text-primary" />
            <span className="text-sm">{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
