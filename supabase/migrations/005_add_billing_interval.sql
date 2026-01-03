-- Migration: Add billing_interval column to user_subscriptions table
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql
--
-- This migration adds billing_interval to track whether subscription is monthly or yearly

-- ============================================================================
-- ADD BILLING_INTERVAL COLUMN
-- ============================================================================

ALTER TABLE user_subscriptions 
ADD COLUMN IF NOT EXISTS billing_interval TEXT; -- 'month' or 'year'

-- Add comment
COMMENT ON COLUMN user_subscriptions.billing_interval IS 'Billing interval for subscription: "month" for monthly, "year" for yearly. NULL for free tier.';

-- Set default for existing free tier subscriptions (they don't have an interval)
UPDATE user_subscriptions
SET billing_interval = NULL
WHERE tier = 'free' AND billing_interval IS NULL;

