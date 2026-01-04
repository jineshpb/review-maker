import { NextRequest, NextResponse } from "next/server";
import { razorpay } from "@/lib/razorpay/config";
import { createAuthenticatedClient } from "@/lib/supabase/server";

/**
 * POST /api/subscription/sync
 * Manually sync subscription status from Razorpay
 * Useful after payment success to immediately update status
 *
 * Body: { subscriptionId?: string } (optional - will use user's current subscription if not provided)
 */
export async function POST(request: NextRequest) {
  try {
    const { supabase, userId } = await createAuthenticatedClient(request);
    const body = await request.json().catch(() => ({}));
    const { subscriptionId } = body;

    // Get subscription ID from body or from user's current subscription
    let razorpaySubscriptionId = subscriptionId;

    if (!razorpaySubscriptionId) {
      // Get user's current subscription
      const { data: subscription } = await (
        supabase.from("user_subscriptions") as any
      )
        .select("razorpay_subscription_id")
        .eq("user_id", userId)
        .single();

      if (!subscription?.razorpay_subscription_id) {
        return NextResponse.json(
          {
            error: "No subscription found",
            message: "User does not have an active subscription",
          },
          { status: 404 }
        );
      }

      razorpaySubscriptionId = subscription.razorpay_subscription_id;
    }

    // Fetch subscription from Razorpay
    const razorpaySubscription = await razorpay.subscriptions.fetch(
      razorpaySubscriptionId
    );

    // Map Razorpay status to our status
    const razorpayStatus = razorpaySubscription.status;
    let ourStatus: "active" | "cancelled" | "pending" = "pending";

    if (razorpayStatus === "active" || razorpayStatus === "authenticated") {
      ourStatus = "active";
    } else if (
      razorpayStatus === "cancelled" ||
      razorpayStatus === "paused" ||
      razorpayStatus === "halted"
    ) {
      ourStatus = "cancelled";
    }

    // Extract tier and billing interval from subscription notes
    const tier = (razorpaySubscription.notes?.tier || "premium") as
      | "premium"
      | "enterprise";
    const billingInterval = razorpaySubscription.notes?.interval || null;

    // Update subscription in database
    await (supabase.from("user_subscriptions") as any).upsert({
      user_id: userId,
      tier,
      status: ourStatus,
      razorpay_subscription_id: razorpaySubscriptionId,
      current_period_end: razorpaySubscription.current_end
        ? new Date(razorpaySubscription.current_end * 1000).toISOString()
        : null,
      billing_interval: billingInterval,
    });

    console.log(
      `✅ Synced subscription ${razorpaySubscriptionId} from Razorpay: ${razorpayStatus} → ${ourStatus}`
    );

    return NextResponse.json({
      success: true,
      subscriptionId: razorpaySubscriptionId,
      razorpayStatus,
      ourStatus,
      tier,
      billingInterval,
    });
  } catch (error) {
    console.error("Sync subscription error:", error);

    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json(
        { error: "Unauthorized", message: "You must be logged in" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to sync subscription",
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}

