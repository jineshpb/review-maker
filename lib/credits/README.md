# Credit System Configuration

This is the **CENTRAL SOURCE OF TRUTH** for all credit plans, pricing, and limits in the application.

## 📁 File Structure

```
lib/credits/
├── config.ts    # Main configuration file (EDIT THIS)
├── types.ts     # Type exports
├── index.ts     # Module exports
└── README.md    # This file
```

## 🎯 Quick Start

### Changing Prices

Edit `config.ts` and update the `price` field (in smallest currency unit - paise for INR):

```typescript
// Example: Change Starter Pack price to ₹10.00
[CreditPackTier.STARTER]: {
  // ...
  price: 1000, // ₹10.00 (was ₹5.00)
  // ...
}
```

### Adding a New Credit Pack

Add a new entry to `CREDIT_PACKS`:

```typescript
[CreditPackTier.NEW_TIER]: {
  id: "credit_new_tier",
  type: PlanType.CREDIT_PACK,
  tier: CreditPackTier.NEW_TIER,
  name: "New Pack",
  description: "Description here",
  credits: 50,
  bonusCredits: 10,
  price: 2000, // ₹20.00
  currency: "INR",
  expiresInDays: null,
}
```

### Changing Credits Per Action

Update `CREDITS_PER_ACTION`:

```typescript
export const CREDITS_PER_ACTION = {
  SCREENSHOT: 1, // Change to 2 to make screenshots cost 2 credits
  AI_GENERATE: 2,
  // ...
} as const;
```

## 📊 Plan Structure

### Credit Packs (One-time Purchase)

- **Starter**: 20 credits for ₹5.00
- **Small**: 75 credits (+5 bonus) for ₹15.00
- **Medium**: 200 credits (+25 bonus) for ₹35.00
- **Large**: 500 credits (+100 bonus) for ₹80.00
- **XL**: 1000 credits (+250 bonus) for ₹150.00

### Subscriptions (Recurring)

- **Free**: 10 credits/month (free)
- **Starter**: 100 credits/month for ₹12/month
- **Pro**: 500 credits/month for ₹49/month
- **Enterprise**: 2000 credits/month for ₹199/month

All subscriptions available monthly or yearly (yearly saves 2 months).

## 🔧 Usage Examples

### Get a Credit Pack

```typescript
import { getCreditPackByTier, CreditPackTier } from "@/lib/credits";

const starterPack = getCreditPackByTier(CreditPackTier.STARTER);
console.log(starterPack.name); // "Starter Pack"
console.log(starterPack.credits); // 20
```

### Get Subscription Plan

```typescript
import {
  getSubscriptionPlan,
  SubscriptionTier,
  BillingInterval,
} from "@/lib/credits";

const proMonthly = getSubscriptionPlan(
  SubscriptionTier.PRO,
  BillingInterval.MONTHLY
);
```

### Check Credits for Action

```typescript
import { hasEnoughCredits, CREDITS_PER_ACTION } from "@/lib/credits";

const userCredits = 5;
if (hasEnoughCredits(userCredits, "SCREENSHOT")) {
  // User can generate screenshot
}
```

### Format Price for Display

```typescript
import { formatPrice } from "@/lib/credits";

const price = formatPrice(500, "INR"); // "₹5.00"
```

## 🎨 Best Practices

1. **Always edit `config.ts`** - This is the single source of truth
2. **Use helper functions** - Don't access config objects directly
3. **Type safety** - Use the exported types for type safety
4. **Test changes** - After changing prices, test checkout flows

## 📝 Notes

- Prices are stored in smallest currency unit (paise for INR, cents for USD)
- Credit packs never expire by default (`expiresInDays: null`)
- Subscriptions support credit rollover (limits defined per tier)
- Free tier gets 10 credits per month (resets monthly)

## 🔄 Migration from Old System

If migrating from the old tier-based system (`lib/supabase/subscriptions.ts`):

1. Keep both systems temporarily
2. Map old tiers to new credit system
3. Migrate users gradually
4. Update API endpoints to use new credit system
