import { createAuthenticatedClient } from "./server";
import { ensureUserExists } from "./users";
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
    storageBytes: 100 * 1024 * 1024, // 100MB
  },
  premium: {
    drafts: Infinity,
    screenshots: Infinity,
    storageBytes: 10 * 1024 * 1024 * 1024, // 10GB
  },
  enterprise: {
    drafts: Infinity,
    screenshots: Infinity,
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
      })
      .select()
      .single();

    return { data: newSubscription, error: insertError };
  }

  return { data, error };
}

/**
 * Get user's tier (defaults to "free" if no subscription)
 */
export async function getUserTier(
  request?: import("next/server").NextRequest
): Promise<SubscriptionTier> {
  const { data } = await getUserSubscription(request);
  // Type assertion needed until Supabase types are regenerated from actual database
  return ((data as any)?.tier as SubscriptionTier) || "free";
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

  const count = await getDraftCount(request);

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
 * Get draft count (internal helper)
 */
async function getDraftCount(request?: import("next/server").NextRequest) {
  const { supabase, userId } = await createAuthenticatedClient(request);

  // Debug: Log the query
  console.log("[getDraftCount] userId:", userId);

  // Type assertion needed until Supabase types are regenerated from actual database
  const { count, error } = await (supabase.from("drafts") as any)
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  // Debug: Log the result
  console.log("[getDraftCount] count:", count, "error:", error);

  // If count is null or undefined, return 0
  const finalCount = count ?? 0;
  console.log("[getDraftCount] finalCount:", finalCount);

  return finalCount;
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
 * Get user's usage and limits
 */
export async function getUserLimits(
  request?: import("next/server").NextRequest
) {
  const tier = await getUserTier(request);
  const limits = TIER_LIMITS[tier];

  const draftCount = await getDraftCount(request);
  const screenshotCount = await getScreenshotCount(request);

  // TODO: Calculate storage used from Supabase Storage
  const storageUsed = 0;

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
      storage: {
        max: limits.storageBytes === Infinity ? null : limits.storageBytes,
        used: storageUsed,
      },
    },
  };
}
