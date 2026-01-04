import { createAuthenticatedClient } from "./server";
import { ensureUserExists } from "./users";
import { getDraftCount } from "./drafts";
import type { Database } from "@/types/database";

type UserSubscription =
  Database["public"]["Tables"]["user_subscriptions"]["Row"];
type SubscriptionInsert =
  Database["public"]["Tables"]["user_subscriptions"]["Insert"];

export type SubscriptionTier = "free" | "premium" | "enterprise";

/**
 * Tier limits configuration
 */
export const TIER_LIMITS = {
  free: {
    drafts: 2,
    screenshots: 10,
    aiFills: 3, // 3 free AI fills for free tier
    storageBytes: 100 * 1024 * 1024, // 100MB
  },
  premium: {
    drafts: Infinity,
    screenshots: Infinity,
    aiFills: Infinity, // Unlimited AI fills for premium
    storageBytes: 10 * 1024 * 1024 * 1024, // 10GB
  },
  enterprise: {
    drafts: Infinity,
    screenshots: Infinity,
    aiFills: Infinity, // Unlimited AI fills for enterprise
    storageBytes: Infinity,
  },
} as const;

/**
 * Get user's subscription tier
 * Creates a free tier subscription if none exists
 * Also ensures user exists in users table
 */
export async function getUserSubscription(
  request?: import("next/server").NextRequest
) {
  const { supabase, userId } = await createAuthenticatedClient(request);

  // Ensure user exists in users table first
  await ensureUserExists(request);

  let { data, error } = await supabase
    .from("user_subscriptions")
    .select("*")
    .eq("user_id", userId)
    .single();

  // If no subscription exists, create a free tier one
  if (error && error.code === "PGRST116") {
    // Type assertion needed until Supabase types are regenerated from actual database
    const { data: newSubscription, error: insertError } = await (
      supabase.from("user_subscriptions") as any
    )
      .insert({
        user_id: userId,
        tier: "free",
        status: "active",
        ai_fills_available: 3, // Free tier gets 3 AI fills
      })
      .select()
      .single();

    return { data: newSubscription, error: insertError };
  }

  return { data, error };
}

/**
 * Get user's tier (defaults to "free" if no subscription)
 *
 * IMPORTANT: If subscription is cancelled but current_period_end hasn't passed,
 * user still has access to their paid tier until the period ends.
 */
export async function getUserTier(
  request?: import("next/server").NextRequest
): Promise<SubscriptionTier> {
  const { data } = await getUserSubscription(request);

  if (!data) return "free";

  const subscription = data as any;
  const tier = subscription.tier as SubscriptionTier;
  const status = subscription.status;
  const currentPeriodEnd = subscription.current_period_end;

  // If subscription is cancelled but period hasn't ended, user still has access
  if (status === "cancelled" && currentPeriodEnd) {
    const periodEndDate = new Date(currentPeriodEnd);
    const now = new Date();

    // If period hasn't ended yet, user still has access to their tier
    if (periodEndDate > now) {
      return tier; // Return their paid tier (premium/enterprise)
    }

    // Period has ended, downgrade to free
    return "free";
  }

  // For active subscriptions, return their tier
  if (status === "active") {
    return tier;
  }

  // Default to free for any other status
  return "free";
}

/**
 * Check if user can create more drafts
 */
export async function canCreateDraft(
  request?: import("next/server").NextRequest
): Promise<boolean> {
  const tier = await getUserTier(request);
  const limit = TIER_LIMITS[tier].drafts;

  if (limit === Infinity) return true;

  const { count } = await getDraftCount();

  // Debug logging
  console.log(
    "[canCreateDraft] tier:",
    tier,
    "limit:",
    limit,
    "count:",
    count,
    "canCreate:",
    count < limit
  );

  return count < limit;
}

/**
 * Check if user can create more screenshots
 */
export async function canCreateScreenshot(
  request?: import("next/server").NextRequest
): Promise<boolean> {
  const tier = await getUserTier(request);
  const limit = TIER_LIMITS[tier].screenshots;

  if (limit === Infinity) return true;

  const { count } = await getScreenshotCount(request);
  return count < limit;
}

/**
 * Get screenshot count (internal helper)
 */
async function getScreenshotCount(request?: import("next/server").NextRequest) {
  const { supabase, userId } = await createAuthenticatedClient(request);
  // Type assertion needed until Supabase types are regenerated from actual database
  const { count } = await (supabase.from("saved_screenshots") as any)
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);
  return count || 0;
}

/**
 * Get AI fills available count from user_subscriptions
 */
async function getAIFillsAvailable(
  request?: import("next/server").NextRequest
) {
  const { supabase, userId } = await createAuthenticatedClient(request);
  const { data, error } = await supabase
    .from("user_subscriptions")
    .select("ai_fills_available")
    .eq("user_id", userId)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("Error fetching AI fills available:", error);
    return 0;
  }

  return (data as any)?.ai_fills_available ?? 0;
}

/**
 * Check if user can use AI fill
 */
export async function canUseAIFill(
  request?: import("next/server").NextRequest
): Promise<boolean> {
  const available = await getAIFillsAvailable(request);

  console.log("[canUseAIFill] available:", available, "canUse:", available > 0);

  return available > 0;
}

/**
 * Decrement AI fills available count
 */
export async function decrementAIFillsAvailable(
  request?: import("next/server").NextRequest
): Promise<{ success: boolean; error?: any }> {
  const { supabase, userId } = await createAuthenticatedClient(request);

  // Ensure user subscription exists
  await ensureUserExists(request);

  // Get current available count
  const currentAvailable = await getAIFillsAvailable(request);

  // Only decrement if > 0 (prevent going negative)
  const newAvailable = Math.max(0, currentAvailable - 1);

  // Decrement
  const { error } = await (supabase.from("user_subscriptions") as any)
    .update({
      ai_fills_available: newAvailable,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);

  if (error) {
    console.error("Error decrementing AI fills available:", error);
    return { success: false, error };
  }

  return { success: true };
}

/**
 * Get user's usage and limits
 */
export async function getUserLimits(
  request?: import("next/server").NextRequest
) {
  const tier = await getUserTier(request);
  const limits = TIER_LIMITS[tier];

  const { count: draftCount } = await getDraftCount();
  const screenshotCount = await getScreenshotCount(request);
  const aiFillsAvailable = await getAIFillsAvailable(request);

  // TODO: Calculate storage used from Supabase Storage
  const storageUsed = 0;

  // Calculate AI fills used from available (for display)
  const aiFillsMax = limits.aiFills === Infinity ? null : limits.aiFills;
  const aiFillsUsed =
    aiFillsMax !== null ? Math.max(0, aiFillsMax - aiFillsAvailable) : 0;

  return {
    tier,
    limits: {
      drafts: {
        max: limits.drafts === Infinity ? null : limits.drafts,
        used: draftCount,
      },
      screenshots: {
        max: limits.screenshots === Infinity ? null : limits.screenshots,
        used: screenshotCount,
      },
      aiFills: {
        max: aiFillsMax,
        used: aiFillsUsed,
        available: aiFillsAvailable, // Also return available for UI
      },
      storage: {
        max: limits.storageBytes === Infinity ? null : limits.storageBytes,
        used: storageUsed,
      },
    },
  };
}
