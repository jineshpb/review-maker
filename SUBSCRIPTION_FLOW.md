# Subscription Flow Documentation

## 🎯 Overview

This app uses **Razorpay Subscriptions** to manage recurring payments. The flow uses Razorpay Checkout with `subscription_id` to authenticate and activate subscriptions.

## ✅ Important: Razorpay Checkout IS Subscriptions

**Razorpay Checkout with `subscription_id` creates RECURRING subscriptions**, not one-time payments. This is the standard Razorpay method for subscriptions.

### How It Works:

1. **Create Subscription** → Backend creates a subscription in Razorpay
2. **Open Checkout** → Frontend opens Razorpay Checkout modal with `subscription_id`
3. **Customer Pays** → Payment authenticates the subscription
4. **Subscription Active** → Razorpay automatically charges recurring payments
5. **Webhooks Update Status** → Our webhook handler updates subscription status in database

## 📊 Complete Flow

```
User clicks "Subscribe" on /subscription page
     ↓
POST /api/subscription/create-checkout
     ↓
Backend creates Razorpay subscription (status: "created")
     ↓
Returns subscription_id to frontend
     ↓
Frontend opens Razorpay Checkout modal with subscription_id
     ↓
Customer completes payment in modal
     ↓
Razorpay authenticates subscription (status: "authenticated" → "active")
     ↓
Webhook: subscription.activated received
     ↓
Backend updates user_subscriptions table
     ↓
Redirect to /subscription/success
     ↓
Subscription is now active and will auto-renew
```

## 🔄 Subscription States

1. **created** - Subscription created but not authenticated yet
2. **authenticated** - Customer authorized (after first payment)
3. **active** - Subscription is active and charging
4. **cancelled** - Subscription cancelled
5. **paused** - Subscription paused

## 📍 Where Subscription Status is Tracked

### Backend APIs:

- **`GET /api/subscription/status`** - Get subscription + usage limits
- **`GET /api/subscription`** - Get subscription details only
- **`POST /api/subscription/create-checkout`** - Create new subscription

### Database:

- **`user_subscriptions` table** stores:
  - `tier`: "free" | "premium" | "enterprise"
  - `status`: "active" | "cancelled" | "expired"
  - `razorpay_subscription_id`: Razorpay subscription ID
  - `razorpay_customer_id`: Razorpay customer ID
  - `current_period_end`: When subscription renews/expires

### Frontend Display:

- **`/subscription` page** - Shows plans + current subscription status
- **`DraftsSidebar`** - Shows current tier in sidebar
- **`/subscription/success`** - Shows subscription details after activation

## 🎨 UI Features

### Subscription Page (`/subscription`):

- ✅ Shows all available plans (Premium/Enterprise, Monthly/Yearly)
- ✅ Displays current subscription status at top
- ✅ Highlights current active plan
- ✅ Disables "Subscribe" button for current plan
- ✅ Shows renewal/expiry date

### Sidebar (`DraftsSidebar`):

- ✅ Shows current tier (Free/Premium/Enterprise)
- ✅ "Upgrade" button links to `/subscription`

## 🔧 Webhook Events Handled

- `subscription.activated` - Subscription activated after payment
- `subscription.charged` - Recurring charge successful
- `subscription.updated` - Subscription details changed
- `subscription.cancelled` - Subscription cancelled
- `subscription.paused` - Subscription paused
- `subscription.resumed` - Subscription resumed
- `payment.failed` - Payment failed

## 🧪 Test Mode

In Razorpay test mode:
- Subscription links (`rzp.io` URLs) may not work until authenticated
- Use Razorpay Checkout (which we do) - it works reliably
- Test card: `4111 1111 1111 1111`

## 📚 Key Files

- **`app/api/subscription/create-checkout/route.ts`** - Creates subscription
- **`app/api/webhooks/razorpay/route.ts`** - Handles webhook events
- **`app/(dashboard)/subscription/page.tsx`** - Subscription selection UI
- **`lib/supabase/subscriptions.ts`** - Subscription utilities
- **`lib/razorpay/config.ts`** - Razorpay configuration

## ✅ Summary

**Razorpay Checkout with `subscription_id` = Recurring Subscriptions**

This is the correct and standard way to handle subscriptions in Razorpay. The checkout modal authenticates the subscription, and Razorpay handles all recurring charges automatically.

