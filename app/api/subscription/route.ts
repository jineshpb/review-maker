import { NextRequest, NextResponse } from "next/server";
import { getUserSubscription } from "@/lib/supabase/subscriptions";

/**
 * GET /api/subscription
 * Get current user's subscription details
 *
 * Returns:
 * {
 *   subscription: {
 *     user_id: string,
 *     tier: "free" | "premium" | "enterprise",
 *     status: "active" | "cancelled" | "expired",
 *     stripe_customer_id: string | null,
 *     stripe_subscription_id: string | null,
 *     current_period_end: string | null,
 *     created_at: string,
 *     updated_at: string
 *   }
 * }
 */
export async function GET(request: NextRequest) {
  try {
    const { data: subscription, error: subError } = await getUserSubscription(
      request
    );

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

    return NextResponse.json({
      subscription: subscription || null,
    });
  } catch (error) {
    console.error("Get subscription error:", error);

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
