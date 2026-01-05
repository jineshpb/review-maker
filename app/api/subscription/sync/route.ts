import { NextRequest, NextResponse } from "next/server";
import { razorpay } from "@/lib/razorpay/config";
import { createAuthenticatedClient } from "@/lib/supabase/server";
import { initializePremiumUsageLimits } from "@/lib/entitlements/usage";

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
      razorpayStatus === "halted" ||
      razorpayStatus === "completed" // Completed = all cycles done, treat as cancelled
    ) {
      ourStatus = "cancelled";
    }

    // Extract tier and billing interval from subscription notes
    const tier = (razorpaySubscription.notes?.tier || "premium") as
      | "premium"
      | "enterprise";
    const billingInterval = razorpaySubscription.notes?.interval || null;
    const currentPeriodStart = razorpaySubscription.start_at
      ? new Date(razorpaySubscription.start_at * 1000).toISOString()
      : new Date().toISOString();
    const currentPeriodEnd = razorpaySubscription.current_end
      ? new Date(razorpaySubscription.current_end * 1000).toISOString()
      : null;

    // Update subscription in database
    await (supabase.from("user_subscriptions") as any).upsert({
      user_id: userId,
      tier,
      status: ourStatus,
      razorpay_subscription_id: razorpaySubscriptionId,
      current_period_start: currentPeriodStart,
      current_period_end: currentPeriodEnd,
      billing_interval: billingInterval,
    });

    // Update entitlements (SOURCE OF TRUTH for access)
    if (ourStatus === "active" && currentPeriodEnd) {
      // Get existing entitlement to preserve valid_until if it's later
      let existingEntitlement = null;
      try {
        const { data, error } = await (supabase.from("entitlements") as any)
          .select("valid_until")
          .eq("user_id", userId)
          .single();

        if (error && error.code !== "PGRST116") {
          console.error(
            `Error fetching existing entitlement for user ${userId}:`,
            error
          );
        } else if (data) {
          existingEntitlement = data;
        }
      } catch (err) {
        console.error(
          `Exception fetching existing entitlement for user ${userId}:`,
          err
        );
      }

      const existingValidUntil = existingEntitlement?.valid_until
        ? new Date(existingEntitlement.valid_until)
        : null;
      const newValidUntil = new Date(currentPeriodEnd);

      // Use max of existing and new period end (never lose days)
      const finalValidUntil =
        existingValidUntil && existingValidUntil > newValidUntil
          ? existingValidUntil
          : newValidUntil;

      const { error: entitlementError } = await (
        supabase.from("entitlements") as any
      ).upsert({
        user_id: userId,
        tier: tier.toUpperCase() as "PREMIUM" | "ENTERPRISE",
        valid_from: currentPeriodStart,
        valid_until: finalValidUntil.toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (entitlementError) {
        console.error(
          `❌ Failed to update entitlements for user ${userId}:`,
          entitlementError
        );
      } else {
        console.log(
          `✅ Entitlements synced for user ${userId} with tier ${tier.toUpperCase()}, valid until ${finalValidUntil.toISOString()}`
        );
      }

      // Initialize usage limits if not already set
      try {
        await initializePremiumUsageLimits(userId, 2000);
      } catch (usageError) {
        console.error(
          `❌ Failed to initialize usage limits for user ${userId}:`,
          usageError
        );
      }
    }

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
      entitlementsUpdated: ourStatus === "active" && currentPeriodEnd !== null,
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
