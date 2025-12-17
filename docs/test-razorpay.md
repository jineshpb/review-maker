# Razorpay API Testing Guide

## 🧪 Testing Checklist

### Prerequisites

- [ ] Razorpay API keys added to `.env.local`
- [ ] Next.js dev server running (`npm run dev`)
- [ ] User authenticated (signed in via Clerk)
- [ ] Database migration run (Razorpay columns added)

## 📝 Step 1: Verify Environment Variables

Check your `.env.local` has:

```env
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_secret_key
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
RAZORPAY_PREMIUM_MONTHLY_PLAN_ID=plan_xxxxxxxxxxxxx
RAZORPAY_PREMIUM_YEARLY_PLAN_ID=plan_xxxxxxxxxxxxx
```

## 🧪 Step 2: Test Subscription Checkout API

### Test 1: Create Checkout Session

**Using Browser Console (on your app):**

```javascript
// Open browser console on your app (F12)
fetch("/api/subscription/create-checkout", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    tier: "premium",
    interval: "month",
  }),
})
  .then((res) => res.json())
  .then((data) => {
    console.log("Checkout URL:", data.url);
    console.log("Subscription ID:", data.subscriptionId);
    // Open checkout URL
    if (data.url) {
      window.open(data.url, "_blank");
    }
  })
  .catch((err) => console.error("Error:", err));
```

**Using curl:**

```bash
curl -X POST http://localhost:3000/api/subscription/create-checkout \
  -H "Content-Type: application/json" \
  -H "Cookie: your-clerk-session-cookie" \
  -d '{"tier":"premium","interval":"month"}'
```

**Expected Response:**

```json
{
  "subscriptionId": "sub_xxxxxxxxxxxxx",
  "shortUrl": "https://rzp.io/xxxxx",
  "url": "https://rzp.io/xxxxx"
}
```

### Test 2: Test with Different Tiers

```javascript
// Premium Monthly
fetch("/api/subscription/create-checkout", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ tier: "premium", interval: "month" }),
});

// Premium Yearly
fetch("/api/subscription/create-checkout", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ tier: "premium", interval: "year" }),
});

// Enterprise Monthly
fetch("/api/subscription/create-checkout", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ tier: "enterprise", interval: "month" }),
});
```

## 🧪 Step 3: Test Subscription Status API

### Get Current Subscription

```javascript
fetch("/api/subscription/status")
  .then((res) => res.json())
  .then((data) => {
    console.log("Subscription:", data.subscription);
    console.log("Limits:", data.limits);
  });
```

**Expected Response:**

```json
{
  "subscription": {
    "user_id": "user_xxx",
    "tier": "free",
    "status": "active",
    "razorpay_customer_id": null,
    "razorpay_subscription_id": null
  },
  "limits": {
    "tier": "free",
    "limits": {
      "drafts": { "max": 5, "used": 0 },
      "screenshots": { "max": 10, "used": 0 }
    }
  }
}
```

## 🧪 Step 4: Test Webhook Endpoint

### Test 1: Check Webhook is Reachable

**With ngrok running:**

```bash
curl https://your-ngrok-url.ngrok-free.app/api/webhooks/razorpay
# Should return 400 (missing signature) - endpoint is working!
```

### Test 2: Simulate Webhook Event

Create a test webhook payload:

```javascript
// Test webhook payload (subscription.activated)
const testPayload = {
  event: "subscription.activated",
  payload: {
    subscription: {
      entity: {
        id: "sub_test123",
        status: "active",
        customer_id: "cust_test123",
        current_end: Math.floor(Date.now() / 1000) + 2592000, // 30 days from now
        notes: {
          clerk_user_id: "user_test123",
          tier: "premium",
          interval: "month",
        },
      },
    },
  },
};

// Generate signature (you'll need crypto)
const crypto = require("crypto");
const secret = "your_webhook_secret";
const signature = crypto
  .createHmac("sha256", secret)
  .update(JSON.stringify(testPayload))
  .digest("hex");

// Send test webhook
fetch("https://your-ngrok-url.ngrok-free.app/api/webhooks/razorpay", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-razorpay-signature": signature,
  },
  body: JSON.stringify(testPayload),
})
  .then((res) => res.json())
  .then((data) => console.log("Webhook response:", data));
```

### Test 3: Use Razorpay Dashboard Test

1. Go to Razorpay Dashboard → Webhooks
2. Click on your webhook
3. Click **Send Test Event**
4. Check ngrok dashboard for incoming request
5. Check Next.js terminal for logs

## 🔍 Step 5: Check Logs

### Next.js Server Logs

Watch your terminal where `npm run dev` is running:

```
✅ Subscription activated for user user_xxx
✅ Payment succeeded for user user_xxx
```

### Razorpay Dashboard

1. Go to **Subscriptions** → See created subscriptions
2. Go to **Customers** → See created customers
3. Go to **Webhooks** → See webhook delivery status

## 🐛 Common Issues & Fixes

### Issue 1: "RAZORPAY_KEY_ID is missing"

**Fix:** Add to `.env.local`:

```env
RAZORPAY_KEY_ID=rzp_test_xxx
RAZORPAY_KEY_SECRET=xxx
```

### Issue 2: "Plan ID not configured"

**Fix:** Create plans in Razorpay Dashboard and add to `.env.local`:

```env
RAZORPAY_PREMIUM_MONTHLY_PLAN_ID=plan_xxx
```

### Issue 3: "Unauthorized" error

**Fix:** Make sure you're signed in via Clerk

### Issue 4: Webhook signature verification fails

**Fix:** Check `RAZORPAY_WEBHOOK_SECRET` matches Razorpay dashboard

### Issue 5: Customer creation fails

**Fix:** Check user email exists in Supabase `users` table

## ✅ Success Indicators

- ✅ Checkout URL generated successfully
- ✅ Can open Razorpay checkout page
- ✅ Subscription created in Razorpay dashboard
- ✅ Customer created in Razorpay dashboard
- ✅ Webhook receives events
- ✅ Subscription updated in Supabase
- ✅ User tier updated in database

## 📊 Test Flow

1. **Create Checkout** → Get URL
2. **Open URL** → Complete payment (use test card)
3. **Check Razorpay** → Subscription created
4. **Check Webhook** → Event received
5. **Check Database** → Subscription updated
6. **Check API** → `/api/subscription/status` shows new tier

## 🎯 Quick Test Script

Save as `test-razorpay.js`:

```javascript
// Quick test script
async function testRazorpay() {
  console.log("🧪 Testing Razorpay API...\n");

  // Test 1: Create checkout
  console.log("1. Testing checkout creation...");
  const checkoutRes = await fetch(
    "http://localhost:3000/api/subscription/create-checkout",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tier: "premium", interval: "month" }),
    }
  );
  const checkoutData = await checkoutRes.json();
  console.log("✅ Checkout:", checkoutData);

  // Test 2: Get subscription status
  console.log("\n2. Testing subscription status...");
  const statusRes = await fetch(
    "http://localhost:3000/api/subscription/status"
  );
  const statusData = await statusRes.json();
  console.log("✅ Status:", statusData);

  console.log("\n✅ Tests complete!");
}

testRazorpay();
```

Run with Node.js (if you have fetch):

```bash
node test-razorpay.js
```
