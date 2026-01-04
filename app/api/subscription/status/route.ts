import { NextRequest, NextResponse } from "next/server";
import {
  getUserSubscription,
  getUserLimits,
} from "@/lib/supabase/subscriptions";
import { razorpay } from "@/lib/razorpay/config";
import { createAuthenticatedClient } from "@/lib/supabase/server";

/**
 * Sync subscription status from Razorpay API
 * This ensures status is up-to-date even if webhooks are delayed
 */
async function syncSubscriptionFromRazorpay(
  subscriptionId: string,
  userId: string,
  request: NextRequest
) {
  try {
    const subscription = await razorpay.subscriptions.fetch(subscriptionId);
    const { supabase } = await createAuthenticatedClient(request);

    // Map Razorpay status to our status
    const razorpayStatus = subscription.status;
    let ourStatus: "active" | "cancelled" | "pending" = "pending";

    if (razorpayStatus === "active" || razorpayStatus === "authenticated") {
      ourStatus = "active";
    } else if (
      razorpayStatus === "cancelled" ||
      razorpayStatus === "halted" ||
      razorpayStatus === "expired"
    ) {
      ourStatus = "cancelled";
    }

    // Extract tier and billing interval from subscription notes
    const tier = (subscription.notes?.tier || "premium") as
      | "premium"
      | "enterprise";
    const billingInterval = subscription.notes?.interval || null;

    // Update subscription in database
    await (supabase.from("user_subscriptions") as any).upsert({
      user_id: userId,
      tier,
      status: ourStatus,
      razorpay_subscription_id: subscriptionId,
      current_period_end: subscription.current_end
        ? new Date(subscription.current_end * 1000).toISOString()
        : null,
      billing_interval: billingInterval,
    });

    console.log(
      `✅ Synced subscription ${subscriptionId} from Razorpay: ${razorpayStatus} → ${ourStatus}`
    );

    return ourStatus;
  } catch (error) {
    console.error(
      `❌ Failed to sync subscription ${subscriptionId} from Razorpay:`,
      error
    );
    return null;
  }
}

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
    // Get subscription details
    let { data: subscription, error: subError } = await getUserSubscription(
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

    // If subscription exists and has Razorpay subscription ID, sync status from Razorpay
    // This ensures status is up-to-date even if webhooks are delayed or missed
    if (
      subscription &&
      (subscription as any).razorpay_subscription_id &&
      ((subscription as any).status === "pending" ||
        !(subscription as any).status)
    ) {
      const { userId } = await createAuthenticatedClient(request);
      const syncedStatus = await syncSubscriptionFromRazorpay(
        (subscription as any).razorpay_subscription_id,
        userId,
        request
      );

      // If sync was successful, refetch subscription to get updated status
      if (syncedStatus) {
        const { data: updatedSubscription } = await getUserSubscription(
          request
        );
        if (updatedSubscription) {
          subscription = updatedSubscription;
        }
      }
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
