import { NextRequest, NextResponse } from "next/server";
import { razorpay } from "@/lib/razorpay/config";
import { createServerClient } from "@/lib/supabase/server";
import {
  initializePremiumUsageLimits,
  refillAICredits,
} from "@/lib/entitlements/usage";
import crypto from "crypto";

/**
 * POST /api/webhooks/razorpay
 * Handle Razorpay webhook events
 *
 * Events handled:
 * - subscription.authenticated: Customer authorized subscription (first payment)
 * - subscription.activated: Activate subscription
 * - subscription.charged: Payment successful
 * - subscription.updated: Update subscription
 * - subscription.cancelled: Cancel subscription
 * - subscription.paused: Pause subscription
 * - subscription.resumed: Resume subscription
 * - payment.failed: Payment failed
 */
export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("x-razorpay-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  // Verify webhook signature
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("RAZORPAY_WEBHOOK_SECRET is not set");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(body)
    .digest("hex");

  if (signature !== expectedSignature) {
    console.error("Webhook signature verification failed");
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(body);
  const supabase = createServerClient();

  try {
    switch (event.event) {
      case "subscription.authenticated":
      case "subscription.activated": {
        const subscription = event.payload.subscription.entity;
        const clerkUserId = subscription.notes?.clerk_user_id;
        // Extract tier from notes, fallback to "premium" if not found
        const tier = (subscription.notes?.tier || "premium") as
          | "premium"
          | "enterprise";

        if (!clerkUserId) {
          console.error("No clerk_user_id in subscription notes");
          break;
        }

        // Extract billing interval from subscription notes
        const billingInterval = subscription.notes?.interval || null;
        const currentPeriodEnd = new Date(
          subscription.current_end * 1000
        ).toISOString();
        const currentPeriodStart = subscription.current_start
          ? new Date(subscription.current_start * 1000).toISOString()
          : new Date().toISOString();

        // Map Razorpay status to our status
        // "authenticated" means customer authorized, should be treated as "active"
        // "active" means subscription is active and charging
        // "completed" means all billing cycles finished (shouldn't happen with recurring subscriptions)
        const razorpayStatus = subscription.status;
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

        // Update user_subscriptions (Razorpay tracking)
        await (supabase.from("user_subscriptions") as any).upsert({
          user_id: clerkUserId,
          tier,
          razorpay_customer_id: subscription.customer_id,
          razorpay_subscription_id: subscription.id,
          status: ourStatus,
          current_period_start: currentPeriodStart,
          current_period_end: currentPeriodEnd,
          billing_interval: billingInterval,
          ai_fills_available: 999999, // Keep for backward compatibility
        });

        // Update entitlements (SOURCE OF TRUTH for access)
        // Check if user already has an entitlement with valid_until in the future
        let existingEntitlement = null;
        try {
          const { data, error } = await (supabase.from("entitlements") as any)
            .select("valid_until")
            .eq("user_id", clerkUserId)
            .single();

          if (error && error.code !== "PGRST116") {
            // PGRST116 = no rows found, which is fine
            console.error(
              `Error fetching existing entitlement for user ${clerkUserId}:`,
              error
            );
          } else if (data) {
            existingEntitlement = data;
          }
        } catch (err) {
          console.error(
            `Exception fetching existing entitlement for user ${clerkUserId}:`,
            err
          );
        }

        const existingValidUntil = existingEntitlement?.valid_until
          ? new Date(existingEntitlement.valid_until)
          : null;
        const newValidUntil = new Date(currentPeriodEnd);

        // Use max of existing and new period end (never lose days on resubscription)
        const finalValidUntil =
          existingValidUntil && existingValidUntil > newValidUntil
            ? existingValidUntil
            : newValidUntil;

        // Upsert entitlement
        const { error: entitlementError } = await (
          supabase.from("entitlements") as any
        ).upsert({
          user_id: clerkUserId,
          tier: tier.toUpperCase() as "PREMIUM" | "ENTERPRISE",
          valid_from: currentPeriodStart,
          valid_until: finalValidUntil.toISOString(),
          updated_at: new Date().toISOString(),
        });

        if (entitlementError) {
          console.error(
            `❌ Failed to update entitlements for user ${clerkUserId}:`,
            entitlementError
          );
          // Don't break - continue to initialize usage limits
        } else {
          console.log(
            `✅ Entitlements updated for user ${clerkUserId} with tier ${tier.toUpperCase()}, valid until ${finalValidUntil.toISOString()}`
          );
        }

        // Initialize usage limits for premium (2000 credits/month)
        try {
          await initializePremiumUsageLimits(clerkUserId, 2000);
          console.log(`✅ Usage limits initialized for user ${clerkUserId}`);
        } catch (usageError) {
          console.error(
            `❌ Failed to initialize usage limits for user ${clerkUserId}:`,
            usageError
          );
        }

        console.log(
          `✅ Subscription activated for user ${clerkUserId} with tier ${tier}, valid until ${finalValidUntil.toISOString()}`
        );
        break;
      }

      case "subscription.charged": {
        const payment = event.payload.payment.entity;
        const subscriptionId = payment.subscription_id;

        if (!subscriptionId) break;

        // Get subscription from Razorpay
        const subscription = await razorpay.subscriptions.fetch(subscriptionId);

        // Find user by subscription ID
        const { data: existingSub } = await (
          supabase.from("user_subscriptions") as any
        )
          .select("user_id")
          .eq("razorpay_subscription_id", subscriptionId)
          .single();

        if (!existingSub) {
          console.error(`No subscription found for ${subscriptionId}`);
          break;
        }

        // Extract tier and billing interval from subscription notes, with fallbacks
        const tier = (subscription.notes?.tier || "premium") as
          | "premium"
          | "enterprise";
        const billingInterval = subscription.notes?.interval || null;
        const currentPeriodEnd = subscription.current_end
          ? new Date(subscription.current_end * 1000).toISOString()
          : null;

        // Update user_subscriptions (Razorpay tracking)
        await (supabase.from("user_subscriptions") as any).upsert({
          user_id: existingSub.user_id,
          tier,
          status: "active",
          current_period_end: currentPeriodEnd,
          billing_interval: billingInterval,
        });

        // Update entitlements valid_until (extend access)
        if (currentPeriodEnd) {
          let existingEntitlement = null;
          try {
            const { data, error } = await (supabase.from("entitlements") as any)
              .select("valid_until")
              .eq("user_id", existingSub.user_id)
              .single();

            if (error && error.code !== "PGRST116") {
              console.error(
                `Error fetching existing entitlement for user ${existingSub.user_id}:`,
                error
              );
            } else if (data) {
              existingEntitlement = data;
            }
          } catch (err) {
            console.error(
              `Exception fetching existing entitlement for user ${existingSub.user_id}:`,
              err
            );
          }

          const existingValidUntil = existingEntitlement?.valid_until
            ? new Date(existingEntitlement.valid_until)
            : null;
          const newValidUntil = new Date(currentPeriodEnd);

          // Use max of existing and new period end
          const finalValidUntil =
            existingValidUntil && existingValidUntil > newValidUntil
              ? existingValidUntil
              : newValidUntil;

          const { error: entitlementError } = await (
            supabase.from("entitlements") as any
          ).upsert({
            user_id: existingSub.user_id,
            tier: tier.toUpperCase() as "PREMIUM" | "ENTERPRISE",
            valid_until: finalValidUntil.toISOString(),
            updated_at: new Date().toISOString(),
          });

          if (entitlementError) {
            console.error(
              `❌ Failed to update entitlements for user ${existingSub.user_id}:`,
              entitlementError
            );
          } else {
            console.log(
              `✅ Entitlements updated for user ${
                existingSub.user_id
              }, valid until ${finalValidUntil.toISOString()}`
            );
          }
        }

        // Refill AI credits on payment (invoice.paid equivalent)
        await refillAICredits(existingSub.user_id);

        console.log(
          `✅ Payment succeeded for user ${existingSub.user_id}, credits refilled`
        );
        break;
      }

      case "subscription.updated": {
        const subscription = event.payload.subscription.entity;
        const subscriptionId = subscription.id;

        // Find user by subscription ID
        const { data: existingSub } = await (
          supabase.from("user_subscriptions") as any
        )
          .select("user_id")
          .eq("razorpay_subscription_id", subscriptionId)
          .single();

        if (!existingSub) {
          console.error(`No subscription found for ${subscriptionId}`);
          break;
        }

        // Extract tier and billing interval from subscription notes, with fallbacks
        const tier = (subscription.notes?.tier || "premium") as
          | "premium"
          | "enterprise";
        const billingInterval = subscription.notes?.interval || null;
        const currentPeriodEnd = subscription.current_end
          ? new Date(subscription.current_end * 1000).toISOString()
          : null;

        // Update user_subscriptions (Razorpay tracking)
        await (supabase.from("user_subscriptions") as any).upsert({
          user_id: existingSub.user_id,
          tier,
          status: subscription.status === "active" ? "active" : "cancelled",
          current_period_end: currentPeriodEnd,
          billing_interval: billingInterval,
        });

        // Update entitlements if period changed
        if (currentPeriodEnd && subscription.status === "active") {
          await (supabase.from("entitlements") as any).upsert({
            user_id: existingSub.user_id,
            tier: tier.toUpperCase() as "PREMIUM" | "ENTERPRISE",
            valid_until: currentPeriodEnd,
            updated_at: new Date().toISOString(),
          });
        }

        console.log(`✅ Subscription updated for user ${existingSub.user_id}`);
        break;
      }

      case "subscription.cancelled": {
        const subscription = event.payload.subscription.entity;
        const subscriptionId = subscription.id;

        // Find user by subscription ID
        const { data: existingSub } = await (
          supabase.from("user_subscriptions") as any
        )
          .select("user_id")
          .eq("razorpay_subscription_id", subscriptionId)
          .single();

        if (!existingSub) {
          console.error(`No subscription found for ${subscriptionId}`);
          break;
        }

        // Update user_subscriptions (mark as cancelled, but keep subscription ID for reference)
        await (supabase.from("user_subscriptions") as any).upsert({
          user_id: existingSub.user_id,
          status: "cancelled",
          cancelled_at: new Date().toISOString(),
          // Keep tier and razorpay_subscription_id for reference
          // Don't set tier to "free" here - expiry job will handle downgrade
        });

        // IMPORTANT: DO NOT update entitlements here!
        // User keeps access until valid_until expires
        // The expiry job (checkAndDowngradeExpired) will handle downgrade when period ends

        console.log(
          `✅ Subscription cancelled for user ${existingSub.user_id} (access continues until period end)`
        );
        break;
      }

      case "subscription.paused": {
        const subscription = event.payload.subscription.entity;
        const subscriptionId = subscription.id;

        // Find user by subscription ID
        const { data: existingSub } = await (
          supabase.from("user_subscriptions") as any
        )
          .select("user_id")
          .eq("razorpay_subscription_id", subscriptionId)
          .single();

        if (!existingSub) break;

        await (supabase.from("user_subscriptions") as any).upsert({
          user_id: existingSub.user_id,
          status: "cancelled", // Treat paused as cancelled for now
        });

        console.log(`✅ Subscription paused for user ${existingSub.user_id}`);
        break;
      }

      case "subscription.resumed": {
        const subscription = event.payload.subscription.entity;
        const subscriptionId = subscription.id;

        // Find user by subscription ID
        const { data: existingSub } = await (
          supabase.from("user_subscriptions") as any
        )
          .select("user_id")
          .eq("razorpay_subscription_id", subscriptionId)
          .single();

        if (!existingSub) break;

        await (supabase.from("user_subscriptions") as any).upsert({
          user_id: existingSub.user_id,
          status: "active",
        });

        console.log(`✅ Subscription resumed for user ${existingSub.user_id}`);
        break;
      }

      case "payment.failed": {
        const payment = event.payload.payment.entity;
        const subscriptionId = payment.subscription_id;

        if (!subscriptionId) break;

        // Find user by subscription ID
        const { data: existingSub } = await (
          supabase.from("user_subscriptions") as any
        )
          .select("user_id")
          .eq("razorpay_subscription_id", subscriptionId)
          .single();

        if (!existingSub) break;

        // Optionally: Send notification or downgrade after grace period
        console.warn(`⚠️ Payment failed for user ${existingSub.user_id}`);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.event}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json(
      {
        error: "Webhook handler failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
