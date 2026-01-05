# Entitlements System Implementation Plan

## 🎯 Overview

This plan introduces an **entitlements table** as the **source of truth** for user access, separating subscription management from access control. This solves subscription status sync issues and provides a clean, reliable access model.

## 📊 Architecture

```
┌─────────────────────┐
│  Razorpay          │
│  (Payment Source)  │
└──────────┬──────────┘
           │
           │ Webhooks
           ▼
┌─────────────────────┐
│ user_subscriptions  │  ← Subscription tracking (Razorpay sync)
│ (Payment Records)   │
└──────────┬──────────┘
           │
           │ Updates
           ▼
┌─────────────────────┐
│   entitlements      │  ← SOURCE OF TRUTH for access
│   (Access Control)  │
└──────────┬──────────┘
           │
           │ Checks
           ▼
┌─────────────────────┐
│  usage_limits       │  ← AI credits & usage tracking
│  (Resource Limits)  │
└─────────────────────┘
```

## 🗄️ Database Schema

### 1. Keep `user_subscriptions` Table (Razorpay Tracking)

**Purpose:** Track Razorpay subscription state (payment records)

**Fields (Current + New):**

- `user_id` (TEXT, PRIMARY KEY)
- `razorpay_subscription_id` (TEXT, nullable)
- `razorpay_customer_id` (TEXT, nullable)
- `plan` (TEXT) - NEW: 'MONTHLY' | 'YEARLY' (derived from billing_interval)
- `status` (TEXT) - 'ACTIVE' | 'CANCELLED' | 'EXPIRED'
- `current_period_start` (TIMESTAMPTZ) - NEW
- `current_period_end` (TIMESTAMPTZ) - EXISTS
- `cancelled_at` (TIMESTAMPTZ) - NEW
- `billing_interval` (TEXT) - EXISTS: 'month' | 'year'
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

**Note:** Keep existing fields like `tier`, `ai_fills_available`, `credits_balance` for backward compatibility during migration.

### 2. Create `entitlements` Table (NEW - Source of Truth)

**Purpose:** Single source of truth for user access. Never check Razorpay status directly.

**Fields:**

- `user_id` (TEXT, PRIMARY KEY)
- `tier` (TEXT, NOT NULL) - 'FREE' | 'PREMIUM' | 'ENTERPRISE'
- `valid_from` (TIMESTAMPTZ, NOT NULL, DEFAULT NOW())
- `valid_until` (TIMESTAMPTZ, NULLABLE) - NULL for free tier (never expires)
- `created_at` (TIMESTAMPTZ, DEFAULT NOW())
- `updated_at` (TIMESTAMPTZ, DEFAULT NOW())

**Access Rule:**

```sql
-- User has access if:
tier = 'PREMIUM' AND valid_until > NOW()
-- OR
tier = 'FREE' AND valid_until IS NULL
```

**Indexes:**

- `idx_entitlements_user_id` - Fast user lookups
- `idx_entitlements_valid_until` - Expiry checks
- `idx_entitlements_tier` - Tier-based queries

### 3. Create `usage_limits` Table (NEW - AI Credits)

**Purpose:** Track AI credits and usage limits separately from entitlements

**Fields:**

- `user_id` (TEXT, PRIMARY KEY)
- `ai_credits_remaining` (INTEGER, NOT NULL, DEFAULT 0)
- `monthly_limit` (INTEGER, NOT NULL, DEFAULT 0) - Credits per month for premium
- `refill_at` (TIMESTAMPTZ, NULLABLE) - Next refill date
- `free_drafts_remaining` (INTEGER, NOT NULL, DEFAULT 2) - For free tier
- `created_at` (TIMESTAMPTZ, DEFAULT NOW())
- `updated_at` (TIMESTAMPTZ, DEFAULT NOW())

**Indexes:**

- `idx_usage_limits_user_id` - Fast user lookups
- `idx_usage_limits_refill_at` - Refill scheduling

### 4. Create `subscriptions` Table (NEW - Subscription History)

**Purpose:** Track all subscription records (including cancelled ones)

**Fields:**

- `id` (UUID, PRIMARY KEY)
- `user_id` (TEXT, NOT NULL)
- `razorpay_subscription_id` (TEXT, UNIQUE, NOT NULL)
- `plan` (TEXT, NOT NULL) - 'MONTHLY' | 'YEARLY'
- `status` (TEXT, NOT NULL) - 'ACTIVE' | 'CANCELLED' | 'EXPIRED'
- `current_period_start` (TIMESTAMPTZ)
- `current_period_end` (TIMESTAMPTZ)
- `cancelled_at` (TIMESTAMPTZ, NULLABLE)
- `created_at` (TIMESTAMPTZ, DEFAULT NOW())
- `updated_at` (TIMESTAMPTZ, DEFAULT NOW())

**Indexes:**

- `idx_subscriptions_user_id` - User subscription history
- `idx_subscriptions_razorpay_id` - Razorpay lookup
- `idx_subscriptions_status` - Status queries

## 🔄 Migration Strategy

### Phase 1: Create New Tables

1. Create `entitlements` table
2. Create `usage_limits` table
3. Add missing columns to `user_subscriptions` (`current_period_start`, `cancelled_at`)
4. Migrate existing data from `user_subscriptions` to `entitlements` and `usage_limits`

### Phase 2: Update Application Logic

1. Update access checks to use `entitlements` table
2. Update webhook handlers to update `entitlements`
3. Update subscription creation to update `entitlements`
4. Update cancellation logic

### Phase 3: Cleanup

1. Keep `user_subscriptions` for backward compatibility
2. Gradually migrate all logic to new tables
3. Eventually deprecate `user_subscriptions` (optional)

## 📝 Implementation Steps

### Step 1: Database Migration

**File:** `006_create_entitlements_system.sql`

```sql
-- ============================================================================
-- ENTITLEMENTS TABLE (Source of Truth for Access)
-- ============================================================================

CREATE TABLE IF NOT EXISTS entitlements (
  user_id TEXT PRIMARY KEY,
  tier TEXT NOT NULL CHECK (tier IN ('FREE', 'PREMIUM', 'ENTERPRISE')),
  valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  valid_until TIMESTAMPTZ NULLABLE, -- NULL for free tier (never expires)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_entitlements_user_id ON entitlements(user_id);
CREATE INDEX idx_entitlements_valid_until ON entitlements(valid_until);
CREATE INDEX idx_entitlements_tier ON entitlements(tier);

-- ============================================================================
-- USAGE_LIMITS TABLE (AI Credits & Usage Tracking)
-- ============================================================================

CREATE TABLE IF NOT EXISTS usage_limits (
  user_id TEXT PRIMARY KEY,
  ai_credits_remaining INTEGER NOT NULL DEFAULT 0,
  monthly_limit INTEGER NOT NULL DEFAULT 0, -- Credits per month for premium
  refill_at TIMESTAMPTZ NULLABLE, -- Next refill date
  free_drafts_remaining INTEGER NOT NULL DEFAULT 2, -- For free tier
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_usage_limits_user_id ON usage_limits(user_id);
CREATE INDEX idx_usage_limits_refill_at ON usage_limits(refill_at);

-- ============================================================================
-- NOTE: Reusing user_subscriptions table (no separate subscriptions table)
-- ============================================================================
-- We'll keep using user_subscriptions for Razorpay subscription tracking
-- When user resubscribes, we simply update user_subscriptions with new subscription ID

-- ============================================================================
-- MIGRATE EXISTING DATA
-- ============================================================================

-- Migrate entitlements from user_subscriptions
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
INSERT INTO usage_limits (user_id, ai_credits_remaining, monthly_limit, free_drafts_remaining)
SELECT
  user_id,
  COALESCE(ai_fills_available, 0) as ai_credits_remaining,
  CASE
    WHEN UPPER(tier) IN ('PREMIUM', 'ENTERPRISE') THEN 2000
    ELSE 0
  END as monthly_limit,
  CASE
    WHEN UPPER(tier) = 'FREE' THEN 2
    ELSE 0
  END as free_drafts_remaining
FROM user_subscriptions
ON CONFLICT (user_id) DO NOTHING;

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
```

### Step 2: Create Helper Functions

**File:** `lib/entitlements/access.ts`

```typescript
/**
 * Check if user has premium access
 * SOURCE OF TRUTH: Check entitlements table, NOT Razorpay status
 */
export async function hasPremiumAccess(userId: string): Promise<boolean> {
  const { supabase } = createServerClient();

  const { data } = await supabase
    .from("entitlements")
    .select("tier, valid_until")
    .eq("user_id", userId)
    .single();

  if (!data) return false;

  // Free tier: valid_until is NULL (never expires)
  if (data.tier === "FREE") return false;

  // Premium/Enterprise: Check if valid_until is in the future
  if (data.tier === "PREMIUM" || data.tier === "ENTERPRISE") {
    if (!data.valid_until) return false; // Should have valid_until for paid tiers
    return new Date(data.valid_until) > new Date();
  }

  return false;
}

/**
 * Get user's current tier
 */
export async function getUserTier(
  userId: string
): Promise<"FREE" | "PREMIUM" | "ENTERPRISE"> {
  const { supabase } = createServerClient();

  const { data } = await supabase
    .from("entitlements")
    .select("tier")
    .eq("user_id", userId)
    .single();

  return (data?.tier as "FREE" | "PREMIUM" | "ENTERPRISE") || "FREE";
}

/**
 * Check if user can generate AI content
 */
export async function canGenerateAI(userId: string): Promise<boolean> {
  const hasAccess = await hasPremiumAccess(userId);
  if (!hasAccess) return false;

  const { supabase } = createServerClient();

  const { data } = await supabase
    .from("usage_limits")
    .select("ai_credits_remaining")
    .eq("user_id", userId)
    .single();

  return (data?.ai_credits_remaining || 0) > 0;
}
```

### Step 3: Update Webhook Handler

**File:** `app/api/webhooks/razorpay/route.ts`

**Key Changes:**

1. On `subscription.activated`: Update `entitlements` table
2. On `subscription.charged`: Refill AI credits
3. On `subscription.cancelled`: Don't downgrade entitlement immediately (keep until period ends)
4. Create/update `subscriptions` table for history

### Step 4: Update Subscription Creation

**File:** `app/api/subscription/create-checkout/route.ts`

**Key Changes:**

1. Check `entitlements` table for active subscriptions (not Razorpay)
2. After creating Razorpay subscription, don't update entitlements yet
3. Wait for webhook to update entitlements

### Step 5: Update Cancellation Logic

**File:** `app/api/subscription/cancel/route.ts`

**Key Changes:**

1. Cancel in Razorpay with `cancel_at_cycle_end: true`
2. Update `subscriptions` table: `status = 'CANCELLED'`, `cancelled_at = NOW()`
3. **DO NOT** update `entitlements` table (keep access until period ends)

### Step 6: Create Expiry Check Job

**File:** `lib/entitlements/expiry.ts`

```typescript
/**
 * Check and downgrade expired premium subscriptions
 * Run this periodically (cron job or on-demand)
 */
export async function checkAndDowngradeExpired(): Promise<void> {
  const { supabase } = createServerClient();

  // Find expired premium entitlements
  const { data: expired } = await supabase
    .from("entitlements")
    .select("user_id")
    .eq("tier", "PREMIUM")
    .lt("valid_until", new Date().toISOString());

  if (!expired || expired.length === 0) return;

  // Downgrade to free
  for (const entitlement of expired) {
    await supabase
      .from("entitlements")
      .update({
        tier: "FREE",
        valid_until: null,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", entitlement.user_id);

    // Reset AI credits
    await supabase
      .from("usage_limits")
      .update({
        ai_credits_remaining: 0,
        monthly_limit: 0,
        refill_at: null,
      })
      .eq("user_id", entitlement.user_id);
  }
}
```

### Step 7: Update Re-Subscription Logic

**Key Rule:** When user resubscribes after cancellation:

- Use `max(existing_valid_until, new_period_end)`
- Never reset time
- Never stack unused days

```typescript
// In webhook handler: subscription.activated
const { data: existingEntitlement } = await supabase
  .from("entitlements")
  .select("valid_until")
  .eq("user_id", userId)
  .single();

const newPeriodEnd = new Date(subscription.current_end * 1000);
const existingValidUntil = existingEntitlement?.valid_until
  ? new Date(existingEntitlement.valid_until)
  : null;

// Use max of existing and new period end
const finalValidUntil =
  existingValidUntil && existingValidUntil > newPeriodEnd
    ? existingValidUntil
    : newPeriodEnd;

await supabase.from("entitlements").upsert({
  user_id: userId,
  tier: "PREMIUM",
  valid_until: finalValidUntil.toISOString(),
  updated_at: new Date().toISOString(),
});
```

## 🎯 Access Control Rules

### Rule 1: Never Check Razorpay Status for Access

```typescript
// ❌ WRONG
const subscription = await razorpay.subscriptions.fetch(id);
if (subscription.status === "active") { ... }

// ✅ CORRECT
const entitlement = await getEntitlement(userId);
if (entitlement.tier === "PREMIUM" && entitlement.valid_until > now()) { ... }
```

### Rule 2: Entitlements are Source of Truth

- Access = `entitlement.valid_until > now()`
- Free tier: `valid_until IS NULL` (never expires)
- Premium: `valid_until` is set from Razorpay `current_end`

### Rule 3: Subscription Cancellation Doesn't Immediately Revoke Access

- Cancel subscription → Update `subscriptions.status = 'CANCELLED'`
- Keep `entitlements.valid_until` unchanged
- Expiry job will downgrade when `valid_until` passes

## 🔄 Webhook Event Handling

### `subscription.activated`

1. Create/update `subscriptions` table
2. Update `entitlements`: `tier = 'PREMIUM'`, `valid_until = current_end`
3. Initialize `usage_limits`: `ai_credits_remaining = 2000`, `monthly_limit = 2000`

### `subscription.charged` (Invoice Paid)

1. Update `subscriptions.current_period_end`
2. Update `entitlements.valid_until = current_end`
3. **Refill AI credits**: `ai_credits_remaining = min(remaining + monthly_limit, monthly_limit)`

### `subscription.cancelled`

1. Update `subscriptions`: `status = 'CANCELLED'`, `cancelled_at = NOW()`
2. **DO NOT** update `entitlements` (keep access until period ends)
3. Expiry job will handle downgrade later

### `subscription.updated`

1. Update `subscriptions` table
2. Update `entitlements.valid_until` if period changed

## 📋 Implementation Checklist

### Phase 1: Database Setup

- [ ] Create migration `006_create_entitlements_system.sql`
- [ ] Run migration in Supabase
- [ ] Verify data migration from `user_subscriptions`
- [ ] Update TypeScript types in `types/database.ts`

### Phase 2: Core Functions

- [ ] Create `lib/entitlements/access.ts` with helper functions
- [ ] Create `lib/entitlements/expiry.ts` for downgrade logic
- [ ] Create `lib/entitlements/usage.ts` for AI credits management
- [ ] Update `lib/supabase/subscriptions.ts` to use entitlements

### Phase 3: Webhook Updates

- [ ] Update `subscription.activated` handler
- [ ] Update `subscription.charged` handler (credit refill)
- [ ] Update `subscription.cancelled` handler
- [ ] Update `subscription.updated` handler

### Phase 4: API Updates

- [ ] Update `create-checkout` to check entitlements
- [ ] Update `cancel` route to not downgrade entitlements
- [ ] Update `status` route to use entitlements
- [ ] Update `sync` route to update entitlements

### Phase 5: Application Logic

- [ ] Update all access checks to use `hasPremiumAccess()`
- [ ] Update AI generation checks to use `canGenerateAI()`
- [ ] Update UI to show entitlement status
- [ ] Add expiry check job (cron or on-demand)

### Phase 6: Testing

- [ ] Test subscription creation → entitlement update
- [ ] Test cancellation → entitlement stays until expiry
- [ ] Test re-subscription → extends valid_until correctly
- [ ] Test expiry job → downgrades correctly
- [ ] Test AI credit refill on payment

## 🚨 Important Notes

1. **Entitlements are Source of Truth**: Never check Razorpay status for access decisions
2. **Cancellation Doesn't Revoke Access**: User keeps access until `valid_until`
3. **Re-Subscription Extends**: Use `max(existing, new)` to never lose days
4. **AI Credits Refill**: Only on `subscription.charged` (invoice paid), not on activation
5. **Expiry Job**: Run periodically to downgrade expired entitlements

## 🔮 Future Enhancements

- [ ] Grace period for failed payments (3-5 days)
- [ ] AI credit top-ups (₹99 → +500 credits)
- [ ] Higher tier (₹999 → 5,000 AI generations)
- [ ] Webhook audit log table
- [ ] Subscription analytics dashboard
