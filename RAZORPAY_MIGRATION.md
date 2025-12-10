# Razorpay Migration Guide

## ✅ What's Been Done

1. ✅ Created Razorpay config (`lib/razorpay/config.ts`)
2. ✅ Updated checkout API (`app/api/subscription/create-checkout/route.ts`)
3. ✅ Created Razorpay webhook handler (`app/api/webhooks/razorpay/route.ts`)
4. ✅ Created database migration (`supabase/migrations/002_add_razorpay_fields.sql`)
5. ✅ Created setup guide (`RAZORPAY_SETUP.md`)

## 🔄 API Compatibility

The API routes remain the same - no frontend changes needed!

### Same Endpoints:

- `POST /api/subscription/create-checkout` - Now uses Razorpay
- `GET /api/subscription` - Returns subscription (works with Razorpay fields)
- `GET /api/subscription/status` - Returns subscription + limits

### Response Format:

Same response format, just different field names:

- `razorpay_customer_id` instead of `stripe_customer_id`
- `razorpay_subscription_id` instead of `stripe_subscription_id`

## 📊 Database Changes

The migration adds Razorpay columns while keeping Stripe columns (for migration period):

```sql
-- New columns added
razorpay_customer_id TEXT
razorpay_subscription_id TEXT

-- Old columns (kept for now)
stripe_customer_id TEXT
stripe_subscription_id TEXT
```

## 🚀 Next Steps

1. **Run Database Migration:**

   ```sql
   -- Run in Supabase SQL Editor
   -- See: supabase/migrations/002_add_razorpay_fields.sql
   ```

2. **Add Environment Variables:**

   ```env
   RAZORPAY_KEY_ID=rzp_test_xxx
   RAZORPAY_KEY_SECRET=xxx
   NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxx
   RAZORPAY_WEBHOOK_SECRET=xxx
   RAZORPAY_PREMIUM_MONTHLY_PLAN_ID=plan_xxx
   RAZORPAY_PREMIUM_YEARLY_PLAN_ID=plan_xxx
   RAZORPAY_ENTERPRISE_MONTHLY_PLAN_ID=plan_xxx
   RAZORPAY_ENTERPRISE_YEARLY_PLAN_ID=plan_xxx
   ```

3. **Create Plans in Razorpay Dashboard**

   - Premium Monthly
   - Premium Yearly
   - Enterprise Monthly
   - Enterprise Yearly

4. **Set Up Webhook:**

   - Add webhook endpoint in Razorpay Dashboard
   - URL: `https://your-domain.com/api/webhooks/razorpay`
   - Select subscription events

5. **Test:**
   - Use Razorpay test cards
   - Test subscription creation
   - Test webhook events

## 🔧 Optional: Remove Stripe Code

If you want to completely remove Stripe:

1. Delete `lib/stripe/config.ts`
2. Delete `app/api/webhooks/stripe/route.ts`
3. Remove Stripe columns from database:
   ```sql
   ALTER TABLE user_subscriptions
   DROP COLUMN stripe_customer_id,
   DROP COLUMN stripe_subscription_id;
   ```
4. Uninstall Stripe:
   ```bash
   npm uninstall stripe @stripe/stripe-js
   ```

## 📝 Notes

- Both Stripe and Razorpay columns exist in database (for migration safety)
- API routes work with Razorpay fields
- Frontend code doesn't need changes (same API endpoints)
- Webhook handler automatically updates subscriptions
