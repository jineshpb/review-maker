/**
 * Entitlements Initialization Functions
 *
 * Ensures all users have entitlement records (including free tier)
 */

import { createServerClient } from "@/lib/supabase/server";
import { initializeUsageLimits, initializePremiumUsageLimits } from "./usage";

/**
 * Initialize entitlement for a user (free tier by default)
 * Creates entitlement if it doesn't exist
 *
 * @param userId - Clerk user ID
 * @param tier - Tier to initialize (default: "FREE")
 */
export async function initializeEntitlement(
  userId: string,
  tier: "FREE" | "PREMIUM" | "ENTERPRISE" = "FREE"
): Promise<void> {
  const supabase = createServerClient();

  // Check if entitlement already exists
  const { data: existing, error: checkError } = await (
    supabase.from("entitlements") as any
  )
    .select("user_id")
    .eq("user_id", userId)
    .single();

  // If record exists (no error or error is not "not found"), don't overwrite
  if (existing || (checkError && checkError.code !== "PGRST116")) {
    // Already exists or there's a different error, don't overwrite
    return;
  }

  // Create entitlement
  await (supabase.from("entitlements") as any).upsert({
    user_id: userId,
    tier,
    valid_from: new Date().toISOString(),
    valid_until: tier === "FREE" ? null : undefined, // NULL for free tier
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  // Initialize usage limits
  await initializeUsageLimits(userId);
}

/**
 * Ensure user has entitlement (creates free tier if missing)
 * Called when checking subscription status
 *
 * @param userId - Clerk user ID
 */
export async function ensureEntitlementExists(userId: string): Promise<void> {
  const supabase = createServerClient();

  // Check if entitlement exists
  const { data: existing, error: checkError } = await (
    supabase.from("entitlements") as any
  )
    .select("user_id")
    .eq("user_id", userId)
    .single();

  // If no record found (PGRST116 = not found), initialize free tier
  if (!existing && checkError?.code === "PGRST116") {
    // No entitlement found - initialize free tier
    await initializeEntitlement(userId, "FREE");
  }
}

/**
 * Sync entitlements from user_subscriptions table
 * Useful when entitlements get out of sync with user_subscriptions
 *
 * @param userId - Clerk user ID
 */
export async function syncEntitlementsFromSubscription(
  userId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createServerClient();

  try {
    // Get user's subscription
    const { data: subscription, error: subError } = await (
      supabase.from("user_subscriptions") as any
    )
      .select("tier, status, current_period_start, current_period_end")
      .eq("user_id", userId)
      .single();

    if (subError && subError.code === "PGRST116") {
      // No subscription found - set to free tier
      await initializeEntitlement(userId, "FREE");
      return { success: true };
    }

    if (subError) {
      console.error("Error fetching subscription:", subError);
      return { success: false, error: subError.message };
    }

    const tier = (subscription.tier || "free").toUpperCase() as
      | "FREE"
      | "PREMIUM"
      | "ENTERPRISE";
    const status = subscription.status || "active";
    const currentPeriodStart =
      subscription.current_period_start || new Date().toISOString();
    const currentPeriodEnd = subscription.current_period_end || null;

    // If subscription is active and has a paid tier, update entitlements
    if (
      status === "active" &&
      (tier === "PREMIUM" || tier === "ENTERPRISE") &&
      currentPeriodEnd
    ) {
      // Get existing entitlement to preserve valid_until if it's later
      let existingEntitlement = null;
      try {
        const { data, error } = await (supabase.from("entitlements") as any)
          .select("valid_until")
          .eq("user_id", userId)
          .single();

        if (error && error.code !== "PGRST116") {
          console.error("Error fetching existing entitlement:", error);
        } else if (data) {
          existingEntitlement = data;
        }
      } catch (err) {
        console.error("Exception fetching existing entitlement:", err);
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

      // Update entitlements
      const { error: entitlementError } = await (
        supabase.from("entitlements") as any
      ).upsert({
        user_id: userId,
        tier,
        valid_from: currentPeriodStart,
        valid_until: finalValidUntil.toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (entitlementError) {
        console.error("Error updating entitlements:", entitlementError);
        return { success: false, error: entitlementError.message };
      }

      // Initialize usage limits for premium
      try {
        await initializePremiumUsageLimits(userId, 2000);
      } catch (usageError) {
        console.error("Error initializing usage limits:", usageError);
        // Don't fail - entitlements were updated
      }

      console.log(
        `✅ Synced entitlements for user ${userId}: ${tier} until ${finalValidUntil.toISOString()}`
      );
      return { success: true };
    } else {
      // Free tier or inactive subscription - set to free
      await initializeEntitlement(userId, "FREE");
      return { success: true };
    }
  } catch (error) {
    console.error("Error syncing entitlements:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
