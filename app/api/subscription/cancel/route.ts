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
      await razorpay.subscriptions.cancel(razorpaySubscriptionId, {
        cancel_at_cycle_end: true, // Cancel at end of billing period
      });

      // Update subscription status in database
      await (supabase.from("user_subscriptions") as any)
        .update({
          status: "cancelled",
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId);

      return NextResponse.json({
        success: true,
        message:
          "Subscription cancelled successfully. You'll continue to have access until the end of your billing period.",
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

