# Credit System Database Schema

## Overview

This document describes the database schema for the credit-based system. The system supports **credit packs** (one-time purchases) and will support **subscriptions** in the future (marked as "coming soon").

## Schema Changes

### 1. `user_subscriptions` Table (Expanded)

**New Fields:**
- `credits_balance` (INTEGER, NOT NULL, DEFAULT 0) - Current credit balance for the user
- `ai_fills_available` (INTEGER, NOT NULL, DEFAULT 3) - AI fills available (from previous migration)

**Existing Fields:**
- `tier` - Subscription tier (free/premium/enterprise) - **Parked for subscriptions (coming soon)**
- `stripe_customer_id` - Payment provider customer ID
- `stripe_subscription_id` - Payment provider subscription ID
- `status` - Subscription status
- `current_period_end` - Subscription period end date

### 2. `credit_transactions` Table (New)

**Purpose:** Audit trail of all credit additions and deductions

**Fields:**
- `id` (UUID, PRIMARY KEY)
- `user_id` (TEXT, NOT NULL) - Clerk user ID
- `amount` (INTEGER, NOT NULL) - Positive = credit added, Negative = credit used
- `balance_after` (INTEGER, NOT NULL) - Balance after this transaction
- `transaction_type` (TEXT, NOT NULL) - 'purchase', 'usage', 'refund', 'expiration', 'bonus'
- `reference_id` (TEXT, NULLABLE) - Reference to purchase, screenshot, etc.
- `reference_type` (TEXT, NULLABLE) - 'credit_pack', 'screenshot', 'ai_generate', etc.
- `description` (TEXT, NULLABLE) - Human-readable description
- `metadata` (JSONB, NULLABLE) - Additional data (pack tier, screenshot ID, etc.)
- `created_at` (TIMESTAMPTZ, DEFAULT NOW())

**Indexes:**
- `idx_credit_transactions_user_id` - Fast user lookups
- `idx_credit_transactions_created_at` - Chronological queries
- `idx_credit_transactions_type` - Filter by transaction type
- `idx_credit_transactions_reference` - Lookup by reference

### 3. `credit_pack_purchases` Table (New)

**Purpose:** Track credit pack purchases (one-time purchases)

**Fields:**
- `id` (UUID, PRIMARY KEY)
- `user_id` (TEXT, NOT NULL) - Clerk user ID
- `pack_id` (TEXT, NOT NULL) - Credit pack ID from config (e.g., 'credit_starter')
- `pack_tier` (TEXT, NOT NULL) - 'starter', 'small', 'medium', 'large', 'xlarge'
- `credits_amount` (INTEGER, NOT NULL) - Base credits in pack
- `bonus_credits` (INTEGER, NOT NULL, DEFAULT 0) - Bonus credits (if any)
- `total_credits` (INTEGER, NOT NULL) - credits_amount + bonus_credits
- `price` (INTEGER, NOT NULL) - Price paid (in smallest currency unit)
- `currency` (TEXT, NOT NULL, DEFAULT 'INR') - 'INR' or 'USD'
- `razorpay_order_id` (TEXT, NULLABLE) - Razorpay order ID
- `razorpay_payment_id` (TEXT, NULLABLE) - Razorpay payment ID
- `payment_status` (TEXT, NOT NULL, DEFAULT 'pending') - 'pending', 'completed', 'failed', 'refunded'
- `credit_transaction_id` (UUID, NULLABLE) - Reference to credit_transactions table
- `expires_at` (TIMESTAMPTZ, NULLABLE) - NULL = never expires
- `created_at` (TIMESTAMPTZ, DEFAULT NOW())
- `updated_at` (TIMESTAMPTZ, DEFAULT NOW())

**Indexes:**
- `idx_credit_pack_purchases_user_id` - User purchase history
- `idx_credit_pack_purchases_pack_id` - Pack analytics
- `idx_credit_pack_purchases_payment_status` - Payment tracking
- `idx_credit_pack_purchases_razorpay_order_id` - Payment lookup
- `idx_credit_pack_purchases_created_at` - Chronological queries

## Database Functions

### `add_credits_to_user()`

Safely add credits to user balance and create transaction record.

**Parameters:**
- `p_user_id` (TEXT) - User ID
- `p_amount` (INTEGER) - Amount to add (positive)
- `p_transaction_type` (TEXT) - Transaction type
- `p_reference_type` (TEXT, optional) - Reference type
- `p_reference_id` (TEXT, optional) - Reference ID
- `p_description` (TEXT, optional) - Description
- `p_metadata` (JSONB, optional) - Additional metadata

**Returns:** UUID of created transaction

**Usage:**
```sql
SELECT add_credits_to_user(
  'user_123',
  100,
  'purchase',
  'credit_pack',
  'credit_starter',
  'Starter Pack Purchase',
  '{"pack_tier": "starter"}'::jsonb
);
```

### `deduct_credits_from_user()`

Safely deduct credits from user balance if sufficient credits exist.

**Parameters:** Same as `add_credits_to_user()`

**Returns:** BOOLEAN (true if successful, false if insufficient credits)

**Usage:**
```sql
SELECT deduct_credits_from_user(
  'user_123',
  1,
  'usage',
  'screenshot',
  'screenshot_456',
  'Screenshot generation',
  '{"screenshot_id": "screenshot_456"}'::jsonb
);
```

## Migration

Run migration `004_add_credit_system.sql` in Supabase SQL Editor:

1. Adds `credits_balance` column to `user_subscriptions`
2. Creates `credit_transactions` table
3. Creates `credit_pack_purchases` table
4. Creates helper functions for credit management
5. Initializes credits for existing free tier users (10 credits)

## Credit Flow

### Purchasing a Credit Pack

1. User selects a credit pack (e.g., "Starter Pack" - 20 credits)
2. Create order in Razorpay
3. On successful payment:
   - Create record in `credit_pack_purchases`
   - Call `add_credits_to_user()` to add credits
   - Link purchase to transaction via `credit_transaction_id`

### Using Credits

1. User generates screenshot or uses AI
2. Check if user has enough credits (`credits_balance >= required_credits`)
3. Call `deduct_credits_from_user()` to deduct credits
4. If successful, proceed with action
5. Transaction record created automatically

### Free Tier Credits

- Free tier users get 10 credits on signup
- Credits are stored in `credits_balance` field
- No expiration (for now)

## TypeScript Types

All types are defined in `types/database.ts`:

- `Database["public"]["Tables"]["user_subscriptions"]["Row"]` - Includes `credits_balance`
- `Database["public"]["Tables"]["credit_transactions"]["Row"]` - Transaction type
- `Database["public"]["Tables"]["credit_pack_purchases"]["Row"]` - Purchase type

## Notes

- **Subscriptions are parked** - The `tier` field in `user_subscriptions` is kept for future use but subscriptions are marked as "coming soon" in the UI
- **Credit packs are active** - Users can purchase credit packs immediately
- **Free tier** - Gets 10 credits on signup (stored in `credits_balance`)
- **No expiration** - Credits don't expire by default (`expires_at` is NULL)
- **Audit trail** - All credit changes are tracked in `credit_transactions` table

