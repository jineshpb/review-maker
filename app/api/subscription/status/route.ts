import { NextRequest, NextResponse } from "next/server";
import { getUserSubscription, getUserLimits } from "@/lib/supabase/subscriptions";

/**
 * GET /api/subscription/status
 * Get current user's subscription status, tier, and usage limits
 * 
 * Returns:
 * {
 *   subscription: { tier, status, stripe_customer_id, ... },
 *   limits: {
 *     tier: "free" | "premium" | "enterprise",
 *     limits: {
 *       drafts: { max: number | null, used: number },
 *       screenshots: { max: number | null, used: number },
 *       storage: { max: number | null, used: number }
 *     }
 *   }
 * }
 */
export async function GET(request: NextRequest) {
  try {
    // Get subscription details
    const { data: subscription, error: subError } = await getUserSubscription(request);

    if (subError && subError.code !== "PGRST116") {
      console.error("Error fetching subscription:", subError);
      return NextResponse.json(
        {
          error: "Failed to fetch subscription",
          message: subError.message,
        },
        { status: 500 }
      );
    }

    // Get usage limits
    const limits = await getUserLimits(request);

    return NextResponse.json({
      subscription: subscription || null,
      limits,
    });
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

