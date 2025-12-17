# Clerk Webhook Setup Guide

## Overview

We use Clerk webhooks to automatically create users in Supabase when they sign up. This ensures:
- ✅ User created on sign-up (via webhook)
- ✅ Free tier subscription created on sign-up
- ✅ User updated when Clerk profile changes
- ✅ Sign-in only checks subscription (user already exists)

## Setup Steps

### 1. Get Webhook Secret

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your application
3. Go to **Webhooks** in the sidebar
4. Click **Add Endpoint**
5. Enter your webhook URL:
   ```
   https://your-domain.com/api/webhooks/clerk
   ```
   (For local development, use a tool like [ngrok](https://ngrok.com) to expose localhost)

### 2. Subscribe to Events

Select these events:
- ✅ `user.created` - Creates user + subscription
- ✅ `user.updated` - Updates user info

### 3. Copy Webhook Secret

After creating the endpoint, Clerk will show a **Signing Secret**. Copy it.

### 4. Add to Environment Variables

Add to your `.env.local`:
```env
CLERK_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

### 5. Restart Server

Restart your Next.js server to load the new environment variable.

## How It Works

### Sign-Up Flow
```
User signs up → Clerk creates user
     ↓
Clerk sends webhook → /api/webhooks/clerk
     ↓
Webhook creates user in Supabase
     ↓
Webhook creates free tier subscription
     ↓
User redirected to app
```

### Sign-In Flow
```
User signs in → Clerk authenticates
     ↓
App calls /api/user/me
     ↓
Checks if user exists (should exist from webhook)
     ↓
Checks subscription (creates if missing as fallback)
     ↓
Returns user + subscription
```

## API Endpoints

### `/api/webhooks/clerk` (POST)
- **Purpose**: Receives Clerk webhook events
- **Events**: `user.created`, `user.updated`
- **Actions**:
  - `user.created`: Creates user + free tier subscription
  - `user.updated`: Updates user info

### `/api/user/me` (GET)
- **Purpose**: Get current user info (for sign-in)
- **Behavior**: 
  - Checks if user exists (should exist from webhook)
  - Checks subscription (creates if missing as fallback)
  - Does NOT create user (webhook should have done that)

## Testing

### Test Webhook Locally

1. Install ngrok:
   ```bash
   npm install -g ngrok
   ```

2. Start your Next.js server:
   ```bash
   npm run dev
   ```

3. Expose localhost:
   ```bash
   ngrok http 3000
   ```

4. Use the ngrok URL in Clerk webhook settings:
   ```
   https://xxxxx.ngrok.io/api/webhooks/clerk
   ```

5. Test by signing up a new user

### Verify Webhook Works

1. Sign up a new user
2. Check your server logs for:
   ```
   📥 Clerk webhook received: user.created for user user_xxx
   ✅ User user_xxx created with free tier subscription
   ```
3. Check Supabase - user and subscription should exist

## Troubleshooting

### Webhook Not Firing

- ✅ Check webhook URL is correct
- ✅ Verify `CLERK_WEBHOOK_SECRET` is set
- ✅ Check Clerk dashboard for webhook delivery status
- ✅ Check server logs for errors

### User Not Created

- ✅ Check webhook is receiving events (check logs)
- ✅ Verify Supabase connection is working
- ✅ Check Supabase logs for errors
- ✅ Fallback: `/api/user/me` will create user if webhook failed

### Subscription Not Created

- ✅ Check webhook logs for subscription creation errors
- ✅ Verify `user_subscriptions` table exists
- ✅ Fallback: `/api/user/me` will create subscription if missing

## Fallback Behavior

If webhook fails:
- `/api/user/me` will create user as fallback
- `/api/user/me` will create subscription as fallback
- This ensures users can still use the app even if webhook fails

## Security

- ✅ Webhook signature verification using Svix
- ✅ Webhook secret stored in environment variables
- ✅ Only processes verified webhook events
- ✅ Server-side only (never exposed to client)

