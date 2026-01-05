/**
 * Entitlements Usage Functions
 *
 * Handles AI credits management and usage tracking
 */

import { createServerClient } from "@/lib/supabase/server";

/**
 * Deduct AI credits from user
 *
 * @param userId - Clerk user ID
 * @param amount - Amount of credits to deduct (default: 1)
 * @returns Success status and new balance
 */
export async function deductAICredits(
  userId: string,
  amount: number = 1
): Promise<{ success: boolean; newBalance: number; error?: string }> {
  const supabase = createServerClient();

  // Get current credits
  const { data: current, error: fetchError } = await (
    supabase.from("usage_limits") as any
  )
    .select("ai_credits_remaining")
    .eq("user_id", userId)
    .single();

  if (fetchError) {
    return {
      success: false,
      newBalance: 0,
      error: `Failed to fetch credits: ${fetchError.message}`,
    };
  }

  const currentBalance = current?.ai_credits_remaining || 0;

  if (currentBalance < amount) {
    return {
      success: false,
      newBalance: currentBalance,
      error: `Insufficient credits. Required: ${amount}, Available: ${currentBalance}`,
    };
  }

  // Deduct credits
  const newBalance = currentBalance - amount;
  const { error: updateError } = await (supabase.from("usage_limits") as any)
    .update({
      ai_credits_remaining: newBalance,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);

  if (updateError) {
    return {
      success: false,
      newBalance: currentBalance,
      error: `Failed to deduct credits: ${updateError.message}`,
    };
  }

  return { success: true, newBalance };
}

/**
 * Refill AI credits (called on subscription renewal)
 *
 * @param userId - Clerk user ID
 * @param creditsToAdd - Amount of credits to add (default: monthly_limit)
 * @returns Success status and new balance
 */
export async function refillAICredits(
  userId: string,
  creditsToAdd?: number
): Promise<{ success: boolean; newBalance: number; error?: string }> {
  const supabase = createServerClient();

  // Get current limits
  const { data: current, error: fetchError } = await supabase
    .from("usage_limits")
    .select("ai_credits_remaining, monthly_limit")
    .eq("user_id", userId)
    .single();

  if (fetchError) {
    return {
      success: false,
      newBalance: 0,
      error: `Failed to fetch limits: ${fetchError.message}`,
    };
  }

  const monthlyLimit = current?.monthly_limit || 0;
  const currentBalance = current?.ai_credits_remaining || 0;
  const creditsToAddFinal = creditsToAdd ?? monthlyLimit;

  // Refill credits (cap at monthly_limit)
  const newBalance = Math.min(currentBalance + creditsToAddFinal, monthlyLimit);

  const { error: updateError } = await (supabase.from("usage_limits") as any)
    .update({
      ai_credits_remaining: newBalance,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);

  if (updateError) {
    return {
      success: false,
      newBalance: currentBalance,
      error: `Failed to refill credits: ${updateError.message}`,
    };
  }

  return { success: true, newBalance };
}

/**
 * Initialize usage limits for a new user (free tier)
 *
 * @param userId - Clerk user ID
 */
export async function initializeUsageLimits(userId: string): Promise<void> {
  const supabase = createServerClient();

  await (supabase.from("usage_limits") as any).upsert({
    user_id: userId,
    ai_credits_remaining: 0,
    monthly_limit: 0,
    refill_at: null,
    free_drafts_remaining: 2, // Free tier gets 2 drafts
  });
}

/**
 * Initialize usage limits for premium user
 *
 * @param userId - Clerk user ID
 * @param monthlyLimit - Monthly credit limit (default: 2000)
 */
export async function initializePremiumUsageLimits(
  userId: string,
  monthlyLimit: number = 2000
): Promise<void> {
  const supabase = createServerClient();

  await (supabase.from("usage_limits") as any).upsert({
    user_id: userId,
    ai_credits_remaining: monthlyLimit, // Give full month's credits upfront
    monthly_limit: monthlyLimit,
    refill_at: null, // Will be set when subscription renews
    free_drafts_remaining: 0, // Premium has unlimited drafts
  });
}
