import { NextRequest, NextResponse } from "next/server";
import { razorpay } from "@/lib/razorpay/config";
import { createServerClient } from "@/lib/supabase/server";
import crypto from "crypto";

/**
 * POST /api/webhooks/razorpay
 * Handle Razorpay webhook events
 *
 * Events handled:
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
      case "subscription.activated": {
        const subscription = event.payload.subscription.entity;
        const clerkUserId = subscription.notes?.clerk_user_id;
        const tier = subscription.notes?.tier as "premium" | "enterprise";

        if (!clerkUserId) {
          console.error("No clerk_user_id in subscription notes");
          break;
        }

        // Extract billing interval from subscription notes
        const billingInterval = subscription.notes?.interval || null;

        // Update user subscription in Supabase
        await (supabase.from("user_subscriptions") as any).upsert({
          user_id: clerkUserId,
          tier,
          razorpay_customer_id: subscription.customer_id,
          razorpay_subscription_id: subscription.id,
          status: subscription.status === "active" ? "active" : "cancelled",
          current_period_end: new Date(
            subscription.current_end * 1000
          ).toISOString(),
          billing_interval: billingInterval, // Save billing interval
          ai_fills_available: 999999, // Premium/Enterprise get effectively unlimited
        });

        console.log(`✅ Subscription activated for user ${clerkUserId}`);
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

        // Update period end
        await (supabase.from("user_subscriptions") as any).upsert({
          user_id: existingSub.user_id,
          status: "active",
          current_period_end: new Date(
            (subscription.current_end || 0) * 1000
          ).toISOString(),
        });

        console.log(`✅ Payment succeeded for user ${existingSub.user_id}`);
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

        const tier = subscription.notes?.tier || "premium";
        const billingInterval = subscription.notes?.interval || null;

        await (supabase.from("user_subscriptions") as any).upsert({
          user_id: existingSub.user_id,
          tier,
          status: subscription.status === "active" ? "active" : "cancelled",
          current_period_end: new Date(
            subscription.current_end * 1000
          ).toISOString(),
          billing_interval: billingInterval, // Save billing interval
        });

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

        // Downgrade to free tier
        await (supabase.from("user_subscriptions") as any).upsert({
          user_id: existingSub.user_id,
          tier: "free",
          status: "cancelled",
          razorpay_subscription_id: null,
        });

        console.log(
          `✅ Subscription cancelled for user ${existingSub.user_id}`
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
