# Stripe Integration Setup Guide

## 📋 Prerequisites

1. Stripe account: https://dashboard.stripe.com/register
2. Stripe API keys (test mode for development)

## 🔧 Setup Steps

### 1. Install Stripe Package

```bash
npm install stripe
npm install @stripe/stripe-js  # For client-side
```

### 2. Get Stripe API Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Developers** → **API keys**
3. Copy:
   - **Secret key** (starts with `sk_test_` for test, `sk_live_` for production)
   - **Publishable key** (starts with `pk_test_` for test, `pk_live_` for production)

### 3. Add Environment Variables

Add to `.env.local`:

```env
# Stripe Keys
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx

# Stripe Webhook Secret (get after setting up webhook)
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx

# Stripe Price IDs (create products/prices in Stripe Dashboard)
STRIPE_PREMIUM_MONTHLY_PRICE_ID=price_xxxxxxxxxxxxx
STRIPE_PREMIUM_YEARLY_PRICE_ID=price_xxxxxxxxxxxxx
STRIPE_ENTERPRISE_MONTHLY_PRICE_ID=price_xxxxxxxxxxxxx
STRIPE_ENTERPRISE_YEARLY_PRICE_ID=price_xxxxxxxxxxxxx

# App URL (for redirects)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Create Products & Prices in Stripe

1. Go to **Products** in Stripe Dashboard
2. Create products:

   - **Premium** - Monthly subscription
   - **Premium** - Yearly subscription
   - **Enterprise** - Monthly subscription
   - **Enterprise** - Yearly subscription

3. Copy the **Price ID** for each (starts with `price_`)
4. Add them to `.env.local`

### 5. Set Up Stripe Webhook

#### For Local Development (using Stripe CLI):

```bash
# Install Stripe CLI: https://stripe.com/docs/stripe-cli

# Login
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Copy the webhook secret (whsec_xxx) and add to .env.local
```

#### For Production:

1. Go to **Developers** → **Webhooks** in Stripe Dashboard
2. Click **Add endpoint**
3. Enter URL: `https://your-domain.com/api/webhooks/stripe`
4. Select events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy **Signing secret** (starts with `whsec_`)
6. Add to production environment variables

## 🚀 Usage

### Create Checkout Session

```typescript
const response = await fetch("/api/subscription/create-checkout", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    tier: "premium", // or "enterprise"
    interval: "month", // or "year"
  }),
});

const { url } = await response.json();
// Redirect user to url
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

Creates Stripe Checkout session for subscription

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
  "sessionId": "cs_test_xxx",
  "url": "https://checkout.stripe.com/..."
}
```

### `POST /api/webhooks/stripe`

Handles Stripe webhook events (automatic)

## 🔒 Security Notes

- ✅ Never expose secret keys to client
- ✅ Always verify webhook signatures
- ✅ Use environment variables for all keys
- ✅ Test with Stripe test mode first

## 🧪 Testing

Use Stripe test cards:

- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- Use any future expiry date and CVC

## 📚 Resources

- [Stripe Docs](https://stripe.com/docs)
- [Stripe Checkout](https://stripe.com/docs/payments/checkout)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)
