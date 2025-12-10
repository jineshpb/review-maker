# Razorpay Integration Setup Guide

## 📋 Prerequisites

1. Razorpay account: https://razorpay.com/signup
2. Razorpay API keys (test mode for development)

## 🔧 Setup Steps

### 1. Install Razorpay Package

```bash
npm install razorpay
```

✅ Already installed!

### 2. Get Razorpay API Keys

1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com)
2. Navigate to **Settings** → **API Keys**
3. Copy:
   - **Key ID** (starts with `rzp_test_` for test, `rzp_live_` for production)
   - **Key Secret** (keep this secret!)

### 3. Add Environment Variables

Add to `.env.local`:

```env
# Razorpay Keys
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_secret_key_here
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx

# Razorpay Webhook Secret (get after setting up webhook)
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_here

# Razorpay Plan IDs (create plans in Razorpay Dashboard)
RAZORPAY_PREMIUM_MONTHLY_PLAN_ID=plan_xxxxxxxxxxxxx
RAZORPAY_PREMIUM_YEARLY_PLAN_ID=plan_xxxxxxxxxxxxx
RAZORPAY_ENTERPRISE_MONTHLY_PLAN_ID=plan_xxxxxxxxxxxxx
RAZORPAY_ENTERPRISE_YEARLY_PLAN_ID=plan_xxxxxxxxxxxxx

# App URL (for redirects)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Create Plans in Razorpay

1. Go to **Subscriptions** → **Plans** in Razorpay Dashboard
2. Click **Create Plan**
3. Create plans:

   - **Premium Monthly**: ₹X/month, recurring monthly
   - **Premium Yearly**: ₹Y/year, recurring yearly
   - **Enterprise Monthly**: ₹Z/month, recurring monthly
   - **Enterprise Yearly**: ₹W/year, recurring yearly

4. Copy the **Plan ID** for each (starts with `plan_`)
5. Add them to `.env.local`

### 5. Update Database Schema

You need to add Razorpay fields to your `user_subscriptions` table:

```sql
-- Add Razorpay columns (if Stripe columns exist, you can keep both or migrate)
ALTER TABLE user_subscriptions
ADD COLUMN IF NOT EXISTS razorpay_customer_id TEXT,
ADD COLUMN IF NOT EXISTS razorpay_subscription_id TEXT;

-- Optional: Keep Stripe columns for migration period
-- ALTER TABLE user_subscriptions
-- DROP COLUMN stripe_customer_id,
-- DROP COLUMN stripe_subscription_id;
```

### 6. Set Up Razorpay Webhook

#### For Local Development with Traefik:

1. **Configure Traefik Reverse Proxy** (see `TRAEFIK_WEBHOOK_SETUP.md` for details)

   - Set up router pointing to `localhost:3000`
   - Configure SSL certificate (Let's Encrypt)
   - Ensure domain points to your server

2. **Alternative: Use ngrok** (if not using Traefik):

   ```bash
   ngrok http 3000
   ```

3. Go to **Settings** → **Webhooks** in Razorpay Dashboard
4. Click **Add New Webhook**
5. Enter URL:
   - With Traefik: `https://your-domain.com/api/webhooks/razorpay`
   - With ngrok: `https://your-ngrok-url.ngrok.io/api/webhooks/razorpay`
6. Select events:
   - `subscription.activated`
   - `subscription.charged`
   - `subscription.updated`
   - `subscription.cancelled`
   - `subscription.paused`
   - `subscription.resumed`
   - `payment.failed`
7. Copy **Webhook Secret** and add to `.env.local`

#### For Production:

1. Go to **Settings** → **Webhooks** in Razorpay Dashboard
2. Click **Add New Webhook**
3. Enter URL: `https://your-domain.com/api/webhooks/razorpay`
4. Select the same events as above
5. Copy **Webhook Secret** and add to production environment variables

## 🚀 Usage

### Create Subscription Checkout

```typescript
const response = await fetch("/api/subscription/create-checkout", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    tier: "premium", // or "enterprise"
    interval: "month", // or "year"
  }),
});

const { url, shortUrl } = await response.json();
// Redirect user to url or shortUrl
window.location.href = url;
```

### Check Subscription Status

```typescript
const response = await fetch("/api/subscription/status");
const { subscription, limits } = await response.json();
console.log(subscription.tier); // "free" | "premium" | "enterprise"
```

## 📝 API Endpoints

### `POST /api/subscription/create-checkout`

Creates Razorpay Subscription Link for checkout

**Body:**

```json
{
  "tier": "premium",
  "interval": "month"
}
```

**Response:**

```json
{
  "subscriptionId": "sub_xxx",
  "shortUrl": "https://rzp.io/xxx",
  "url": "https://rzp.io/xxx"
}
```

### `POST /api/webhooks/razorpay`

Handles Razorpay webhook events (automatic)

## 🔒 Security Notes

- ✅ Never expose secret keys to client
- ✅ Always verify webhook signatures using HMAC SHA256
- ✅ Use environment variables for all keys
- ✅ Test with Razorpay test mode first

## 🧪 Testing

Use Razorpay test cards:

- **Success**: `4111 1111 1111 1111`
- **Decline**: `4000 0000 0000 0002`
- Use any future expiry date and CVV

## 📚 Resources

- [Razorpay Docs](https://razorpay.com/docs/)
- [Razorpay Subscriptions API](https://razorpay.com/docs/api/payments/subscriptions/)
- [Razorpay Webhooks](https://razorpay.com/docs/webhooks/)

## 🔄 Migration from Stripe (if needed)

If you were using Stripe before:

1. Keep both `stripe_*` and `razorpay_*` columns during migration
2. Update existing subscriptions manually or via migration script
3. Remove Stripe columns after migration is complete
