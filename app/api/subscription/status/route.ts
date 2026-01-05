import { NextRequest, NextResponse } from "next/server";
import {
  getUserSubscription,
  getUserLimits,
} from "@/lib/supabase/subscriptions";
import { createAuthenticatedClient } from "@/lib/supabase/server";
import {
  getUserEntitlement,
  getUserUsageLimits,
  hasPremiumAccess,
} from "@/lib/entitlements/access";
import { ensureEntitlementExists } from "@/lib/entitlements/init";

/**
 * GET /api/subscription/status
 * Get current user's subscription status, tier, and usage limits
 *
 * Returns:
 * {
 *   subscription: { tier, status, razorpay_customer_id, razorpay_subscription_id, ... },
 *   limits: {
 *     tier: "free" | "premium" | "enterprise",
 *     limits: {
 *       drafts: { max: number | null, used: number },
 *       screenshots: { max: number | null, used: number },
 *       aiFills: { max: number | null, used: number },
 *       storage: { max: number | null, used: number }
 *     }
 *   }
 * }
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await createAuthenticatedClient(request);

    // Ensure user has entitlement (creates free tier if missing)
    try {
      await ensureEntitlementExists(userId);
    } catch (initError) {
      console.error("Error ensuring entitlement exists:", initError);
      // Continue anyway - will handle null entitlement below
    }

    // Get entitlement (SOURCE OF TRUTH for access)
    const entitlement = await getUserEntitlement(userId);
    const hasActivePremium = entitlement
      ? await hasPremiumAccess(userId)
      : false;

    // Get subscription details (Razorpay tracking - for reference only)
    // NOTE: Webhooks update entitlements when payment is processed
    const { data: subscription, error: subError } = await getUserSubscription(
      request
    );

    if (subError && subError.code !== "PGRST116") {
      console.error("Error fetching subscription:", subError);
      // Don't fail - entitlement is the source of truth
    }

    // Get usage limits (from entitlements system)
    const usageLimits = await getUserUsageLimits(userId);

    // Get legacy limits (for backward compatibility)
    const limits = await getUserLimits(request);

    // Build response with entitlement info
    // If entitlement is null, create a default FREE entitlement response
    const response = {
      subscription: subscription || null,
      entitlement: entitlement
        ? {
            tier: entitlement.tier.toLowerCase(),
            validUntil: entitlement.valid_until,
            validFrom: entitlement.valid_from,
            hasActivePremium,
          }
        : {
            tier: "free",
            validUntil: null,
            validFrom: new Date().toISOString(),
            hasActivePremium: false,
          },
      usageLimits: usageLimits
        ? {
            aiCreditsRemaining: usageLimits.ai_credits_remaining,
            monthlyLimit: usageLimits.monthly_limit,
            refillAt: usageLimits.refill_at,
            freeDraftsRemaining: usageLimits.free_drafts_remaining,
          }
        : {
            aiCreditsRemaining: 0,
            monthlyLimit: 0,
            refillAt: null,
            freeDraftsRemaining: 2, // Free tier gets 2 drafts
          },
      limits, // Legacy format for backward compatibility
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Get subscription status error:", error);

    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json(
        { error: "Unauthorized", message: "You must be logged in" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
