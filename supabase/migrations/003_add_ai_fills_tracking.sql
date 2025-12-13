-- Migration: Add AI fills tracking to user_subscriptions table
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql

-- Remove old ai_fills_used column if it exists (from earlier version)
ALTER TABLE user_subscriptions 
DROP COLUMN IF EXISTS ai_fills_used;

-- Add ai_fills_available column to track remaining AI fills
-- Free tier: 3, Premium/Enterprise: 999999 (effectively unlimited)
ALTER TABLE user_subscriptions 
ADD COLUMN IF NOT EXISTS ai_fills_available INTEGER DEFAULT 3 NOT NULL;

-- Set existing free tier subscriptions to 3
UPDATE user_subscriptions 
SET ai_fills_available = 3 
WHERE tier = 'free' AND ai_fills_available IS NULL;

-- Set existing premium/enterprise subscriptions to effectively unlimited
UPDATE user_subscriptions 
SET ai_fills_available = 999999 
WHERE tier IN ('premium', 'enterprise') AND ai_fills_available IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN user_subscriptions.ai_fills_available IS 'Number of AI fills available to the user. Free tier: 3, Premium/Enterprise: 999999 (unlimited)';

