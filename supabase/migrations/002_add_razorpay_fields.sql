-- Migration: Add Razorpay fields to user_subscriptions table
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql

-- Add Razorpay columns (keeping Stripe columns for now in case of migration)
ALTER TABLE user_subscriptions 
ADD COLUMN IF NOT EXISTS razorpay_customer_id TEXT,
ADD COLUMN IF NOT EXISTS razorpay_subscription_id TEXT;

-- Add index for Razorpay customer lookups
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_razorpay_customer_id 
ON user_subscriptions(razorpay_customer_id);

CREATE INDEX IF NOT EXISTS idx_user_subscriptions_razorpay_subscription_id 
ON user_subscriptions(razorpay_subscription_id);

-- Optional: If you want to remove Stripe columns later, uncomment:
-- ALTER TABLE user_subscriptions 
-- DROP COLUMN IF EXISTS stripe_customer_id,
-- DROP COLUMN IF EXISTS stripe_subscription_id;

