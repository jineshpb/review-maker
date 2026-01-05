/**
 * Cleanup Script: Cancel All Razorpay Subscriptions
 *
 * ⚠️ DANGER: This will cancel ALL Razorpay subscriptions and reset users to free tier
 *
 * Usage:
 * 1. Set ADMIN_CLEANUP_TOKEN in .env.local (or use default "dev-cleanup-token")
 * 2. Run: curl -X POST http://localhost:3000/api/admin/cleanup-subscriptions \
 *          -H "Authorization: Bearer dev-cleanup-token"
 *
 * Or use this script directly (requires Node.js):
 * npx tsx scripts/cleanup-subscriptions.ts
 */

import { createServerClient } from "../lib/supabase/server";
import { razorpay } from "../lib/razorpay/config";

async function cleanupSubscriptions() {
  console.log("🧹 Starting subscription cleanup...\n");

  const supabase = createServerClient();
  const results = {
    subscriptionsFound: 0,
    cancelled: 0,
    errors: [] as string[],
  };

  try {
    // Get all users with Razorpay subscriptions
    const { data: subscriptions, error: fetchError } = await (
      supabase.from("user_subscriptions") as any
    )
      .select("user_id, razorpay_subscription_id, tier")
      .not("razorpay_subscription_id", "is", null);

    if (fetchError) {
      console.error("❌ Failed to fetch subscriptions:", fetchError);
      process.exit(1);
    }

    if (!subscriptions || subscriptions.length === 0) {
      console.log("✅ No subscriptions found. Nothing to clean up.");
      return;
    }

    results.subscriptionsFound = subscriptions.length;
    console.log(`📋 Found ${subscriptions.length} subscription(s) to cancel\n`);

    // Cancel each subscription
    for (const sub of subscriptions) {
      const userId = sub.user_id;
      const subscriptionId = sub.razorpay_subscription_id;

      if (!subscriptionId) continue;

      try {
        console.log(`🔄 Processing user ${userId}...`);

        // Cancel subscription in Razorpay
        const cancelResponse = await fetch(
          `https://api.razorpay.com/v1/subscriptions/${subscriptionId}/cancel`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Basic ${Buffer.from(
                `${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`
              ).toString("base64")}`,
            },
            body: JSON.stringify({
              cancel_at_cycle_end: false, // Cancel immediately
            }),
          }
        );

        if (!cancelResponse.ok) {
          const errorData = await cancelResponse.json().catch(() => ({}));
          throw new Error(
            errorData.error?.description || "Failed to cancel subscription"
          );
        }

        // Clean up user_subscriptions - reset to free tier
        await (supabase.from("user_subscriptions") as any)
          .update({
            tier: "free",
            status: "cancelled",
            razorpay_subscription_id: null,
            razorpay_customer_id: null,
            current_period_end: null,
            current_period_start: null,
            cancelled_at: new Date().toISOString(),
            billing_interval: null,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", userId);

        // Reset entitlements to FREE tier
        await (supabase.from("entitlements") as any).upsert({
          user_id: userId,
          tier: "FREE",
          valid_from: new Date().toISOString(),
          valid_until: null, // NULL for free tier
          updated_at: new Date().toISOString(),
        });

        // Reset usage_limits to free tier defaults
        await (supabase.from("usage_limits") as any).upsert({
          user_id: userId,
          ai_credits_remaining: 0,
          monthly_limit: 0,
          refill_at: null,
          free_drafts_remaining: 2, // Free tier gets 2 drafts
          updated_at: new Date().toISOString(),
        });

        results.cancelled++;
        console.log(
          `  ✅ Cancelled subscription ${subscriptionId} for user ${userId}\n`
        );
      } catch (error: any) {
        const errorMessage = `User ${userId}: ${
          error?.message || "Unknown error"
        }`;
        results.errors.push(errorMessage);
        console.error(`  ❌ Error: ${errorMessage}\n`);
      }
    }

    // Summary
    console.log("\n" + "=".repeat(50));
    console.log("📊 Cleanup Summary:");
    console.log(`   Found: ${results.subscriptionsFound} subscription(s)`);
    console.log(`   Cancelled: ${results.cancelled} subscription(s)`);
    console.log(`   Errors: ${results.errors.length} error(s)`);

    if (results.errors.length > 0) {
      console.log("\n❌ Errors:");
      results.errors.forEach((error) => console.log(`   - ${error}`));
    }

    console.log("=".repeat(50));
    console.log("\n✅ Cleanup completed!");
  } catch (error) {
    console.error("❌ Fatal error:", error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  cleanupSubscriptions()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("❌ Script failed:", error);
      process.exit(1);
    });
}

export { cleanupSubscriptions };
