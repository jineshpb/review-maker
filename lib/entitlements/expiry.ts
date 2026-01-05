/**
 * Entitlements Expiry Functions
 *
 * Handles downgrading expired premium subscriptions to free tier
 */

import { createServerClient } from "@/lib/supabase/server";

/**
 * Check and downgrade expired premium subscriptions
 * Run this periodically (cron job or on-demand)
 *
 * Finds all premium entitlements where valid_until < NOW() and downgrades them to FREE
 */
export async function checkAndDowngradeExpired(): Promise<{
  downgraded: number;
  errors: string[];
}> {
  const { supabase } = createServerClient();
  const errors: string[] = [];

  // Find expired premium entitlements
  const { data: expired, error: fetchError } = await supabase
    .from("entitlements")
    .select("user_id")
    .in("tier", ["PREMIUM", "ENTERPRISE"])
    .lt("valid_until", new Date().toISOString());

  if (fetchError) {
    console.error("Error fetching expired entitlements:", fetchError);
    return { downgraded: 0, errors: [fetchError.message] };
  }

  if (!expired || expired.length === 0) {
    return { downgraded: 0, errors: [] };
  }

  let downgraded = 0;

  // Downgrade each expired entitlement
  for (const entitlement of expired) {
    try {
      // Update entitlement to FREE
      const { error: updateError } = await supabase
        .from("entitlements")
        .update({
          tier: "FREE",
          valid_until: null,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", entitlement.user_id);

      if (updateError) {
        errors.push(
          `Failed to downgrade ${entitlement.user_id}: ${updateError.message}`
        );
        continue;
      }

      // Reset AI credits
      const { error: creditsError } = await supabase
        .from("usage_limits")
        .update({
          ai_credits_remaining: 0,
          monthly_limit: 0,
          refill_at: null,
        })
        .eq("user_id", entitlement.user_id);

      if (creditsError) {
        errors.push(
          `Failed to reset credits for ${entitlement.user_id}: ${creditsError.message}`
        );
        // Don't fail the whole operation, just log the error
      }

      downgraded++;
      console.log(
        `✅ Downgraded expired entitlement for user ${entitlement.user_id}`
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      errors.push(`Error processing ${entitlement.user_id}: ${errorMessage}`);
    }
  }

  return { downgraded, errors };
}

/**
 * Check if a specific user's entitlement has expired
 *
 * @param userId - Clerk user ID
 * @returns true if entitlement is expired
 */
export async function isEntitlementExpired(userId: string): Promise<boolean> {
  const { supabase } = createServerClient();

  const { data } = await supabase
    .from("entitlements")
    .select("tier, valid_until")
    .eq("user_id", userId)
    .single();

  if (!data) return false;
  if (data.tier === "FREE") return false; // Free tier never expires
  if (!data.valid_until) return false; // Should have valid_until for paid tiers

  return new Date(data.valid_until) < new Date();
}
