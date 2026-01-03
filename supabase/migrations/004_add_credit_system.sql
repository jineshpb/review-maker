-- Migration: Add Credit System Tables
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql
-- 
-- This migration adds support for credit-based purchases (credit packs)
-- Subscriptions will be added later (marked as "coming soon")

-- ============================================================================
-- 1. ADD CREDITS BALANCE TO USER_SUBSCRIPTIONS
-- ============================================================================
-- Add credits_balance column to track user's current credit balance
-- This is a simple approach - credits are stored directly on user_subscriptions

ALTER TABLE user_subscriptions 
ADD COLUMN IF NOT EXISTS credits_balance INTEGER DEFAULT 0 NOT NULL;

-- Add comment
COMMENT ON COLUMN user_subscriptions.credits_balance IS 'Current credit balance for the user. Credits are used for screenshots and AI generation.';

-- ============================================================================
-- 2. CREDIT TRANSACTIONS TABLE
-- ============================================================================
-- Track all credit additions and deductions for audit trail
-- This provides full history of credit usage

CREATE TABLE IF NOT EXISTS credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL, -- Clerk user ID
  amount INTEGER NOT NULL, -- Positive = credit added, Negative = credit used
  balance_after INTEGER NOT NULL, -- Balance after this transaction
  transaction_type TEXT NOT NULL, -- 'purchase', 'usage', 'refund', 'expiration', 'bonus'
  reference_id TEXT, -- Reference to purchase, screenshot, etc.
  reference_type TEXT, -- 'credit_pack', 'screenshot', 'ai_generate', etc.
  description TEXT, -- Human-readable description
  metadata JSONB, -- Additional data (pack tier, screenshot ID, etc.)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_created_at ON credit_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_type ON credit_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_reference ON credit_transactions(reference_id, reference_type);

-- Add comment
COMMENT ON TABLE credit_transactions IS 'Audit trail of all credit transactions (additions and deductions)';

-- ============================================================================
-- 3. CREDIT PACK PURCHASES TABLE
-- ============================================================================
-- Track credit pack purchases (one-time purchases)
-- Links to payment provider (Razorpay) and credit transactions

CREATE TABLE IF NOT EXISTS credit_pack_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL, -- Clerk user ID
  pack_id TEXT NOT NULL, -- Credit pack ID from config (e.g., 'credit_starter')
  pack_tier TEXT NOT NULL, -- 'starter', 'small', 'medium', 'large', 'xlarge'
  credits_amount INTEGER NOT NULL, -- Base credits in pack
  bonus_credits INTEGER DEFAULT 0 NOT NULL, -- Bonus credits (if any)
  total_credits INTEGER NOT NULL, -- credits_amount + bonus_credits
  price INTEGER NOT NULL, -- Price paid (in smallest currency unit)
  currency TEXT NOT NULL DEFAULT 'INR', -- 'INR' or 'USD'
  
  -- Payment tracking
  razorpay_order_id TEXT, -- Razorpay order ID
  razorpay_payment_id TEXT, -- Razorpay payment ID
  payment_status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'completed', 'failed', 'refunded'
  
  -- Credit transaction reference
  credit_transaction_id UUID REFERENCES credit_transactions(id) ON DELETE SET NULL,
  
  -- Expiration (if credits expire)
  expires_at TIMESTAMPTZ, -- NULL = never expires
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_credit_pack_purchases_user_id ON credit_pack_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_pack_purchases_pack_id ON credit_pack_purchases(pack_id);
CREATE INDEX IF NOT EXISTS idx_credit_pack_purchases_payment_status ON credit_pack_purchases(payment_status);
CREATE INDEX IF NOT EXISTS idx_credit_pack_purchases_razorpay_order_id ON credit_pack_purchases(razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_credit_pack_purchases_created_at ON credit_pack_purchases(created_at DESC);

-- Add comment
COMMENT ON TABLE credit_pack_purchases IS 'Records of credit pack purchases (one-time purchases)';

-- ============================================================================
-- 4. TRIGGER FOR UPDATED_AT ON CREDIT_PACK_PURCHASES
-- ============================================================================

CREATE TRIGGER update_credit_pack_purchases_updated_at BEFORE UPDATE ON credit_pack_purchases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 5. INITIALIZE CREDITS FOR EXISTING USERS
-- ============================================================================
-- Give free tier users their initial credits (from FREE_PLAN config: 10 credits)

UPDATE user_subscriptions
SET credits_balance = 10
WHERE tier = 'free' AND credits_balance = 0;

-- ============================================================================
-- 6. HELPER FUNCTION: ADD CREDITS TO USER
-- ============================================================================
-- Function to safely add credits and create transaction record
-- Usage: SELECT add_credits_to_user('user_id', 100, 'purchase', 'credit_pack', 'Pack purchase');

CREATE OR REPLACE FUNCTION add_credits_to_user(
  p_user_id TEXT,
  p_amount INTEGER,
  p_transaction_type TEXT,
  p_reference_type TEXT DEFAULT NULL,
  p_reference_id TEXT DEFAULT NULL,
  p_description TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_new_balance INTEGER;
  v_transaction_id UUID;
BEGIN
  -- Update user's credit balance
  UPDATE user_subscriptions
  SET credits_balance = credits_balance + p_amount,
      updated_at = NOW()
  WHERE user_id = p_user_id
  RETURNING credits_balance INTO v_new_balance;

  -- If user doesn't exist, create subscription record first
  IF NOT FOUND THEN
    INSERT INTO user_subscriptions (user_id, tier, status, credits_balance)
    VALUES (p_user_id, 'free', 'active', p_amount)
    ON CONFLICT (user_id) DO UPDATE
    SET credits_balance = user_subscriptions.credits_balance + p_amount,
        updated_at = NOW()
    RETURNING credits_balance INTO v_new_balance;
  END IF;

  -- Create transaction record
  INSERT INTO credit_transactions (
    user_id,
    amount,
    balance_after,
    transaction_type,
    reference_type,
    reference_id,
    description,
    metadata
  )
  VALUES (
    p_user_id,
    p_amount,
    v_new_balance,
    p_transaction_type,
    p_reference_type,
    p_reference_id,
    p_description,
    p_metadata
  )
  RETURNING id INTO v_transaction_id;

  RETURN v_transaction_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 7. HELPER FUNCTION: DEDUCT CREDITS FROM USER
-- ============================================================================
-- Function to safely deduct credits and create transaction record
-- Returns true if successful, false if insufficient credits

CREATE OR REPLACE FUNCTION deduct_credits_from_user(
  p_user_id TEXT,
  p_amount INTEGER,
  p_transaction_type TEXT,
  p_reference_type TEXT DEFAULT NULL,
  p_reference_id TEXT DEFAULT NULL,
  p_description TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_current_balance INTEGER;
  v_new_balance INTEGER;
  v_transaction_id UUID;
BEGIN
  -- Get current balance
  SELECT credits_balance INTO v_current_balance
  FROM user_subscriptions
  WHERE user_id = p_user_id;

  -- Check if user exists and has enough credits
  IF v_current_balance IS NULL THEN
    RETURN FALSE; -- User doesn't exist
  END IF;

  IF v_current_balance < p_amount THEN
    RETURN FALSE; -- Insufficient credits
  END IF;

  -- Deduct credits
  UPDATE user_subscriptions
  SET credits_balance = credits_balance - p_amount,
      updated_at = NOW()
  WHERE user_id = p_user_id
  RETURNING credits_balance INTO v_new_balance;

  -- Create transaction record
  INSERT INTO credit_transactions (
    user_id,
    amount,
    balance_after,
    transaction_type,
    reference_type,
    reference_id,
    description,
    metadata
  )
  VALUES (
    p_user_id,
    -p_amount, -- Negative amount for deduction
    v_new_balance,
    p_transaction_type,
    p_reference_type,
    p_reference_id,
    p_description,
    p_metadata
  )
  RETURNING id INTO v_transaction_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON FUNCTION add_credits_to_user IS 'Safely add credits to user balance and create transaction record';
COMMENT ON FUNCTION deduct_credits_from_user IS 'Safely deduct credits from user balance if sufficient credits exist. Returns true if successful.';

