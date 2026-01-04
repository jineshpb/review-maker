import { NextRequest, NextResponse } from "next/server";
import { getUserSubscription } from "@/lib/supabase/subscriptions";
import { razorpay } from "@/lib/razorpay/config";
import { createAuthenticatedClient } from "@/lib/supabase/server";

/**
 * POST /api/subscription/cancel
 * Cancel the current user's active subscription
 *
 * Returns: { success: boolean, message: string }
 */
export async function POST(request: NextRequest) {
  try {
    const { supabase, userId } = await createAuthenticatedClient(request);

    // Get current subscription
    const { data: subscription, error: subError } = await getUserSubscription(
      request
    );

    if (subError || !subscription) {
      return NextResponse.json(
        {
          error: "No active subscription found",
          message: "You don't have an active subscription to cancel",
        },
        { status: 404 }
      );
    }

    // Check if subscription is active
    if (subscription.status !== "active") {
      return NextResponse.json(
        {
          error: "Subscription not active",
          message: "Your subscription is not active",
        },
        { status: 400 }
      );
    }

    // Check if user has Razorpay subscription ID
    const razorpaySubscriptionId = (subscription as any)
      .razorpay_subscription_id;
    if (!razorpaySubscriptionId) {
      // If no Razorpay subscription ID, just update status in database
      await (supabase.from("user_subscriptions") as any)
        .update({
          status: "cancelled",
          tier: "free",
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId);

      return NextResponse.json({
        success: true,
        message: "Subscription cancelled successfully",
      });
    }

    // Cancel subscription in Razorpay
    try {
      // Use direct API call since SDK signature may vary
      // Cancel at end of billing period (cancel_at_cycle_end: true)
      const cancelResponse = await fetch(
        `https://api.razorpay.com/v1/subscriptions/${razorpaySubscriptionId}/cancel`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${Buffer.from(
              `${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`
            ).toString("base64")}`,
          },
          body: JSON.stringify({
            cancel_at_cycle_end: true, // Cancel at end of billing period
          }),
        }
      );

      if (!cancelResponse.ok) {
        const errorData = await cancelResponse.json().catch(() => ({}));
        throw new Error(
          errorData.error?.description || "Failed to cancel subscription"
        );
      }

      // IMPORTANT: Set status to "cancelled" but keep tier as "premium" until period ends
      // When cancel_at_cycle_end is true, Razorpay keeps subscription as "active"
      // until current_period_end, then it becomes "cancelled"
      // The user has paid until current_period_end, so they should keep premium access
      // We mark status as "cancelled" to indicate cancellation is requested
      // But tier stays "premium" until current_period_end passes
      // The webhook (subscription.cancelled) will downgrade tier to "free" when period ends
      await (supabase.from("user_subscriptions") as any)
        .update({
          status: "cancelled", // Mark as cancelled (cancellation requested)
          // Keep tier as "premium" - user still has premium access until period end
          // Access checking logic should verify: tier === "premium" AND (status === "active" OR (status === "cancelled" AND current_period_end > now))
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId);

      // Get current_period_end for the response message
      const currentPeriodEnd = (subscription as any).current_period_end;
      const periodEndDate = currentPeriodEnd
        ? new Date(currentPeriodEnd).toLocaleDateString()
        : "the end of your billing period";

      return NextResponse.json({
        success: true,
        message: `Subscription cancelled successfully. You'll continue to have premium access until ${periodEndDate}.`,
        current_period_end: currentPeriodEnd,
      });
    } catch (razorpayError: any) {
      console.error("Razorpay cancel error:", razorpayError);
      return NextResponse.json(
        {
          error: "Failed to cancel subscription",
          message:
            razorpayError?.error?.description ||
            "Failed to cancel subscription in payment provider",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Cancel subscription error:", error);

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
