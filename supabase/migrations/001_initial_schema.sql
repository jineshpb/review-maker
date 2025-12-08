-- Migration: Initial Schema for Review Screenshot App
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql

-- ============================================================================
-- 1. DRAFTS TABLE
-- ============================================================================
-- Store user drafts (work-in-progress reviews before screenshot generation)

CREATE TABLE IF NOT EXISTS drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL, -- Clerk user ID (TEXT since Clerk uses string IDs)
  platform TEXT NOT NULL, -- 'google', 'amazon', 'tripadvisor', etc.
  review_data JSONB NOT NULL, -- Full ReviewData object (all platform-specific fields)
  name TEXT, -- Optional draft name (defaults to "Untitled Draft")
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_drafts_user_id ON drafts(user_id);
CREATE INDEX IF NOT EXISTS idx_drafts_updated_at ON drafts(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_drafts_platform ON drafts(platform);

-- ============================================================================
-- 2. SAVED_SCREENSHOTS TABLE
-- ============================================================================
-- Store generated screenshots (when user clicks "Save" after generating image)

CREATE TABLE IF NOT EXISTS saved_screenshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL, -- Clerk user ID
  draft_id UUID REFERENCES drafts(id) ON DELETE SET NULL, -- Optional: link to draft if saved from draft
  platform TEXT NOT NULL, -- Platform identifier
  review_data JSONB NOT NULL, -- ReviewData at time of screenshot
  screenshot_url TEXT NOT NULL, -- Supabase Storage URL
  thumbnail_url TEXT, -- Optional: smaller version for gallery
  name TEXT, -- User-given name (defaults to platform + date)
  file_size INTEGER, -- Size in bytes
  width INTEGER, -- Image dimensions
  height INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_saved_screenshots_user_id ON saved_screenshots(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_screenshots_created_at ON saved_screenshots(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_saved_screenshots_platform ON saved_screenshots(platform);
CREATE INDEX IF NOT EXISTS idx_saved_screenshots_draft_id ON saved_screenshots(draft_id);

-- ============================================================================
-- 3. USER_SUBSCRIPTIONS TABLE
-- ============================================================================
-- Track user subscription status and limits

CREATE TABLE IF NOT EXISTS user_subscriptions (
  user_id TEXT PRIMARY KEY, -- Clerk user ID
  tier TEXT NOT NULL DEFAULT 'free', -- 'free', 'premium', 'enterprise'
  stripe_customer_id TEXT, -- If using Stripe
  stripe_subscription_id TEXT,
  status TEXT DEFAULT 'active', -- 'active', 'cancelled', 'expired'
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for status queries
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);

-- ============================================================================
-- 4. USERS TABLE (Optional - for Clerk user sync)
-- ============================================================================
-- This table can be used to sync Clerk user data to Supabase
-- Useful for foreign key constraints and user management

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY, -- Clerk user ID
  email TEXT NOT NULL,
  username TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for email lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ============================================================================
-- 5. FOREIGN KEY CONSTRAINTS (Optional - if you want referential integrity)
-- ============================================================================
-- Note: These are optional since we're using Clerk (TEXT user_id)
-- Uncomment if you want to enforce referential integrity

-- ALTER TABLE drafts 
--   ADD CONSTRAINT drafts_user_id_fkey 
--   FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- ALTER TABLE saved_screenshots 
--   ADD CONSTRAINT saved_screenshots_user_id_fkey 
--   FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- ALTER TABLE user_subscriptions 
--   ADD CONSTRAINT user_subscriptions_user_id_fkey 
--   FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- ============================================================================
-- 6. TRIGGERS FOR UPDATED_AT
-- ============================================================================
-- Auto-update updated_at timestamp on row updates

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to all tables
CREATE TRIGGER update_drafts_updated_at BEFORE UPDATE ON drafts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_saved_screenshots_updated_at BEFORE UPDATE ON saved_screenshots
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_subscriptions_updated_at BEFORE UPDATE ON user_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 7. COMMENTS (Documentation)
-- ============================================================================

COMMENT ON TABLE drafts IS 'User drafts for work-in-progress review designs';
COMMENT ON TABLE saved_screenshots IS 'Generated screenshot images saved by users';
COMMENT ON TABLE user_subscriptions IS 'User subscription tiers and limits';
COMMENT ON TABLE users IS 'Synced Clerk user data';

COMMENT ON COLUMN drafts.user_id IS 'Clerk user ID (TEXT)';
COMMENT ON COLUMN saved_screenshots.user_id IS 'Clerk user ID (TEXT)';
COMMENT ON COLUMN user_subscriptions.user_id IS 'Clerk user ID (TEXT)';

