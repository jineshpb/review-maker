-- Migration: Create Entitlements System
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql
-- 
-- This migration creates the entitlements system as the source of truth for user access
-- Separates subscription management (Razorpay) from access control (entitlements)

-- ============================================================================
-- ENTITLEMENTS TABLE (Source of Truth for Access)
-- ============================================================================
-- This is the SINGLE SOURCE OF TRUTH for user access
-- Never check Razorpay status directly - always check entitlements table

CREATE TABLE IF NOT EXISTS entitlements (
  user_id TEXT PRIMARY KEY,
  tier TEXT NOT NULL CHECK (tier IN ('FREE', 'PREMIUM', 'ENTERPRISE')),
  valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  valid_until TIMESTAMPTZ, -- NULL for free tier (never expires)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_entitlements_user_id ON entitlements(user_id);
CREATE INDEX IF NOT EXISTS idx_entitlements_valid_until ON entitlements(valid_until);
CREATE INDEX IF NOT EXISTS idx_entitlements_tier ON entitlements(tier);

COMMENT ON TABLE entitlements IS 'Source of truth for user access. Never check Razorpay status - always check this table. Access = tier = PREMIUM AND valid_until > NOW()';

-- ============================================================================
-- USAGE_LIMITS TABLE (AI Credits & Usage Tracking)
-- ============================================================================
-- Track AI credits and usage limits separately from entitlements

CREATE TABLE IF NOT EXISTS usage_limits (
  user_id TEXT PRIMARY KEY,
  ai_credits_remaining INTEGER NOT NULL DEFAULT 0,
  monthly_limit INTEGER NOT NULL DEFAULT 0, -- Credits per month for premium (2000)
  refill_at TIMESTAMPTZ, -- Next refill date (when subscription renews)
  free_drafts_remaining INTEGER NOT NULL DEFAULT 2, -- For free tier
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_usage_limits_user_id ON usage_limits(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_limits_refill_at ON usage_limits(refill_at);

COMMENT ON TABLE usage_limits IS 'Track AI credits and usage limits. Premium gets 2000 credits/month, refilled on subscription renewal.';

-- ============================================================================
-- NOTE: We're reusing user_subscriptions table instead of creating subscriptions table
-- ============================================================================
-- The existing user_subscriptions table already tracks current subscription state
-- When user resubscribes, we simply update user_subscriptions with new subscription ID
-- No need for separate subscriptions table - keeps it simple!

-- ============================================================================
-- ADD MISSING COLUMNS TO user_subscriptions (for backward compatibility)
-- ============================================================================

ALTER TABLE user_subscriptions
ADD COLUMN IF NOT EXISTS current_period_start TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ;

-- Update current_period_start from created_at if null
UPDATE user_subscriptions
SET current_period_start = created_at
WHERE current_period_start IS NULL AND created_at IS NOT NULL;

-- ============================================================================
-- MIGRATE EXISTING DATA
-- ============================================================================

-- Migrate entitlements from user_subscriptions
-- Free tier: valid_until = NULL (never expires)
-- Premium/Enterprise: valid_until = current_period_end
INSERT INTO entitlements (user_id, tier, valid_from, valid_until)
SELECT 
  user_id,
  UPPER(tier) as tier,
  COALESCE(created_at, NOW()) as valid_from,
  CASE 
    WHEN UPPER(tier) = 'FREE' THEN NULL
    WHEN current_period_end IS NOT NULL THEN current_period_end
    ELSE NULL
  END as valid_until
FROM user_subscriptions
ON CONFLICT (user_id) DO NOTHING;

-- Migrate usage limits from user_subscriptions
-- Map ai_fills_available to ai_credits_remaining
INSERT INTO usage_limits (user_id, ai_credits_remaining, monthly_limit, free_drafts_remaining)
SELECT 
  user_id,
  COALESCE(ai_fills_available, 0) as ai_credits_remaining,
  CASE 
    WHEN UPPER(tier) IN ('PREMIUM', 'ENTERPRISE') THEN 2000 -- Premium gets 2000/month
    ELSE 0
  END as monthly_limit,
  CASE 
    WHEN UPPER(tier) = 'FREE' THEN 2 -- Free tier gets 2 drafts
    ELSE 0
  END as free_drafts_remaining
FROM user_subscriptions
ON CONFLICT (user_id) DO NOTHING;

-- ============================================================================
-- NOTE: No need to migrate to subscriptions table
-- ============================================================================
-- We're keeping user_subscriptions as-is for Razorpay subscription tracking
-- The entitlements table is the source of truth for access, not user_subscriptions

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================================

-- Create trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_entitlements_updated_at 
  BEFORE UPDATE ON entitlements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_usage_limits_updated_at 
  BEFORE UPDATE ON usage_limits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- HELPER FUNCTION: Check Premium Access
-- ============================================================================
-- SQL function to check if user has premium access
-- Usage: SELECT has_premium_access('user_id');

CREATE OR REPLACE FUNCTION has_premium_access(p_user_id TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  v_tier TEXT;
  v_valid_until TIMESTAMPTZ;
BEGIN
  SELECT tier, valid_until INTO v_tier, v_valid_until
  FROM entitlements
  WHERE user_id = p_user_id;
  
  IF v_tier IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Free tier: no premium access
  IF v_tier = 'FREE' THEN
    RETURN FALSE;
  END IF;
  
  -- Premium/Enterprise: Check if valid_until is in the future
  IF v_tier IN ('PREMIUM', 'ENTERPRISE') THEN
    IF v_valid_until IS NULL THEN
      RETURN FALSE; -- Should have valid_until for paid tiers
    END IF;
    RETURN v_valid_until > NOW();
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION has_premium_access IS 'Check if user has premium access. Returns true if tier is PREMIUM/ENTERPRISE and valid_until > NOW()';

-- ============================================================================
-- HELPER FUNCTION: Check AI Generation Access
-- ============================================================================
-- SQL function to check if user can generate AI content
-- Usage: SELECT can_generate_ai('user_id');

CREATE OR REPLACE FUNCTION can_generate_ai(p_user_id TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  v_has_access BOOLEAN;
  v_credits_remaining INTEGER;
BEGIN
  -- First check if user has premium access
  v_has_access := has_premium_access(p_user_id);
  
  IF NOT v_has_access THEN
    RETURN FALSE;
  END IF;
  
  -- Check if user has credits remaining
  SELECT ai_credits_remaining INTO v_credits_remaining
  FROM usage_limits
  WHERE user_id = p_user_id;
  
  RETURN COALESCE(v_credits_remaining, 0) > 0;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION can_generate_ai IS 'Check if user can generate AI content. Requires premium access AND credits remaining > 0';

