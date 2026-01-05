/**
 * Entitlements Access Functions
 *
 * These functions use the entitlements table as the SOURCE OF TRUTH for user access.
 * Never check Razorpay status directly - always use these functions.
 */

import { createServerClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

export type EntitlementTier = "FREE" | "PREMIUM" | "ENTERPRISE";

/**
 * Check if user has premium access
 * SOURCE OF TRUTH: Check entitlements table, NOT Razorpay status
 *
 * @param userId - Clerk user ID
 * @returns true if user has active premium/enterprise access
 */
export async function hasPremiumAccess(userId: string): Promise<boolean> {
  const supabase = createServerClient();

  const { data, error } = await (supabase.from("entitlements") as any)
    .select("tier, valid_until")
    .eq("user_id", userId)
    .single();

  // If no record found, return false
  if (!data || (error && error.code === "PGRST116")) {
    return false;
  }

  // If other error, log and return false
  if (error) {
    console.error("Error checking premium access:", error);
    return false;
  }

  // Free tier: no premium access
  if (data.tier === "FREE") return false;

  // Premium/Enterprise: Check if valid_until is in the future
  if (data.tier === "PREMIUM" || data.tier === "ENTERPRISE") {
    if (!data.valid_until) return false; // Should have valid_until for paid tiers
    return new Date(data.valid_until) > new Date();
  }

  return false;
}

/**
 * Get user's current tier from entitlements table
 *
 * @param userId - Clerk user ID
 * @returns User's tier (defaults to "FREE" if not found)
 */
export async function getUserTierFromEntitlements(
  userId: string
): Promise<EntitlementTier> {
  const supabase = createServerClient();

  const { data } = await (supabase.from("entitlements") as any)
    .select("tier")
    .eq("user_id", userId)
    .single();

  return (data?.tier as EntitlementTier) || "FREE";
}

/**
 * Get user's entitlement record
 *
 * @param userId - Clerk user ID
 * @returns Full entitlement record or null
 */
export async function getUserEntitlement(userId: string) {
  const supabase = createServerClient();

  const { data, error } = await (supabase.from("entitlements") as any)
    .select("*")
    .eq("user_id", userId)
    .single();

  // If no record found, return null (don't throw)
  if (error && error.code === "PGRST116") {
    return null;
  }

  // If other error, log but return null
  if (error) {
    console.error("Error fetching entitlement:", error);
    return null;
  }

  return data;
}

/**
 * Check if user can generate AI content
 * Requires: Premium access AND credits remaining > 0
 *
 * @param userId - Clerk user ID
 * @returns true if user can generate AI content
 */
export async function canGenerateAI(userId: string): Promise<boolean> {
  const hasAccess = await hasPremiumAccess(userId);
  if (!hasAccess) return false;

  const supabase = createServerClient();

  const { data } = await (supabase.from("usage_limits") as any)
    .select("ai_credits_remaining")
    .eq("user_id", userId)
    .single();

  return (data?.ai_credits_remaining || 0) > 0;
}

/**
 * Get user's usage limits
 *
 * @param userId - Clerk user ID
 * @returns Usage limits record or null
 */
export async function getUserUsageLimits(userId: string) {
  const supabase = createServerClient();

  const { data, error } = await (supabase.from("usage_limits") as any)
    .select("*")
    .eq("user_id", userId)
    .single();

  // If no record found, return null (don't throw)
  if (error && error.code === "PGRST116") {
    return null;
  }

  // If other error, log but return null
  if (error) {
    console.error("Error fetching usage limits:", error);
    return null;
  }

  return data;
}
