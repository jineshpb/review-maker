# Entitlements System Flow

## 🎯 Complete User Journey

### 1. User Clicks "Subscribe"

```
User → Subscription Page → Clicks "Subscribe" → /api/subscription/create-checkout
```

**What happens:**

- ✅ Check `entitlements` table (NOT Razorpay) for active subscription
- ✅ If user has `valid_until > NOW()` → Block (already has active premium)
- ✅ If no active entitlement → Create Razorpay subscription
- ✅ Save subscription ID to `user_subscriptions` (status: "pending")
- ✅ Return checkout URL to user

**Key Point:** We check `entitlements.valid_until`, not Razorpay status!

---

### 2. User Completes Payment

```
User → Razorpay Payment Page → Completes Payment → Redirects to /subscription/success?subscription_id=xxx
```

**What happens:**

- ✅ Razorpay processes payment
- ✅ Razorpay sends webhook to `/api/webhooks/razorpay` (async)
- ✅ Razorpay redirects user to success page

---

### 3. Webhook Updates Entitlements (Async)

```
Razorpay → Webhook → /api/webhooks/razorpay → subscription.activated
```

**What happens:**

- ✅ Webhook receives `subscription.activated` event
- ✅ Updates `user_subscriptions` table (Razorpay tracking)
- ✅ **Updates `entitlements` table** (SOURCE OF TRUTH):
  - Sets `tier = "PREMIUM"`
  - Sets `valid_until = subscription.current_end`
  - Uses `max(existing_valid_until, new_period_end)` if resubscribing
- ✅ Initializes `usage_limits` (2000 AI credits)
- ✅ User now has premium access!

**Key Point:** Entitlements table is updated, user has access immediately!

---

### 4. Success Page Checks Entitlements

```
Success Page → /api/subscription/status → Checks entitlements → Updates UI
```

**What happens:**

- ✅ Success page loads
- ✅ Calls `/api/subscription/status` API
- ✅ API checks `entitlements` table (not Razorpay!)
- ✅ If `entitlements.valid_until > NOW()` → Show "Active"
- ✅ If webhook hasn't arrived yet → Show "Processing..." (poll or wait)
- ✅ Updates UI with subscription details

**Key Point:** UI checks `entitlements.valid_until`, not Razorpay status!

---

### 5. User Uses Premium Features

```
User → Tries Premium Feature → Check entitlements → Allow/Deny
```

**What happens:**

- ✅ Feature checks `hasPremiumAccess(userId)` function
- ✅ Function queries `entitlements` table:
  ```sql
  SELECT tier, valid_until FROM entitlements WHERE user_id = ?
  -- Returns: tier = 'PREMIUM', valid_until = '2024-12-31'
  ```
- ✅ If `tier = 'PREMIUM' AND valid_until > NOW()` → Allow ✅
- ✅ If `tier = 'FREE' OR valid_until < NOW()` → Deny ❌

**Key Point:** All access checks use `entitlements` table, never Razorpay!

---

### 6. Subscription Renewal (Monthly/Yearly)

```
Razorpay → Automatic Payment → subscription.charged webhook
```

**What happens:**

- ✅ Razorpay charges user automatically
- ✅ Webhook receives `subscription.charged` event
- ✅ Updates `entitlements.valid_until` (extends access)
- ✅ Refills AI credits (2000 credits)
- ✅ User continues to have premium access

---

### 7. User Cancels Subscription

```
User → Clicks "Cancel" → /api/subscription/cancel → Razorpay API
```

**What happens:**

- ✅ User clicks cancel
- ✅ API calls Razorpay: `cancel_at_cycle_end: true`
- ✅ Updates `user_subscriptions.status = "cancelled"`
- ✅ **DOES NOT update entitlements** (user keeps access until period ends!)
- ✅ Webhook receives `subscription.cancelled` (when period ends)
- ✅ Expiry job checks `entitlements.valid_until < NOW()`
- ✅ Downgrades to FREE when period expires

**Key Point:** Cancellation doesn't revoke access immediately - user keeps access until `valid_until`!

---

## 🔄 Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ 1. USER CLICKS SUBSCRIBE                                    │
│    → Check entitlements.valid_until > NOW()                │
│    → If no active entitlement → Create Razorpay subscription│
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. USER COMPLETES PAYMENT                                   │
│    → Razorpay processes payment                             │
│    → Redirects to /subscription/success                    │
│    → Webhook sent (async)                                   │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┴──────────────┐
        │                             │
        ▼                             ▼
┌──────────────────┐         ┌──────────────────────┐
│ 3. SUCCESS PAGE  │         │ 4. WEBHOOK (ASYNC)   │
│                  │         │                      │
│ → Poll status    │         │ → subscription.     │
│ → Check          │         │   activated         │
│   entitlements   │         │ → Update            │
│ → Show UI        │         │   entitlements       │
│                  │         │ → Initialize        │
│                  │         │   usage_limits       │
└──────────────────┘         └──────────────────────┘
        │                             │
        └──────────────┬──────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. USER HAS PREMIUM ACCESS                                  │
│    → All checks use entitlements.valid_until               │
│    → Features check hasPremiumAccess()                      │
│    → UI shows subscription status from entitlements         │
└─────────────────────────────────────────────────────────────┘
```

---

## 📋 Key Rules

1. **Entitlements are Source of Truth**

   - Never check Razorpay status for access
   - Always check `entitlements.valid_until > NOW()`

2. **Webhook Updates Entitlements**

   - `subscription.activated` → Creates/updates entitlements
   - `subscription.charged` → Extends `valid_until`, refills credits
   - `subscription.cancelled` → Does NOT update entitlements (keeps access)

3. **Cancellation Doesn't Revoke Access**

   - User keeps access until `valid_until` expires
   - Expiry job downgrades when period ends

4. **Resubscription Extends Access**

   - Uses `max(existing_valid_until, new_period_end)`
   - Never loses unused days

5. **UI Checks Entitlements**
   - Success page checks `entitlements` table
   - Subscription page checks `entitlements` table
   - All access checks use `entitlements` table

---

## 🔍 How to Check Access

### In Code:

```typescript
import {
  hasPremiumAccess,
  getUserTierFromEntitlements,
} from "@/lib/entitlements/access";

// Check if user has premium access
const hasAccess = await hasPremiumAccess(userId);
// Returns: true if tier = PREMIUM AND valid_until > NOW()

// Get user's tier
const tier = await getUserTierFromEntitlements(userId);
// Returns: "FREE" | "PREMIUM" | "ENTERPRISE"
```

### In SQL:

```sql
-- Check premium access
SELECT has_premium_access('user_id');
-- Returns: true/false

-- Check AI generation access
SELECT can_generate_ai('user_id');
-- Returns: true/false (requires premium + credits > 0)
```

---

## ⚠️ Important Notes

- **Webhooks are async** - May take a few seconds to arrive
- **Success page should poll** - If webhook hasn't arrived, wait and retry
- **Never check Razorpay directly** - Always use entitlements table
- **Cancellation is delayed** - User keeps access until period ends
