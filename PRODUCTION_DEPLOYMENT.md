# Production Deployment Guide

## 🏗️ Architecture

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│   Vercel    │──────│  Your VPS    │──────│   Your VPS   │
│  (Frontend) │      │  (Supabase)  │      │  (Backend)   │
│             │      │              │      │  Port 3001   │
└─────────────┘      └──────────────┘      └─────────────┘
```

- **Frontend**: Next.js app on Vercel
- **Database**: Supabase on your VPS
- **Screenshot Backend**: Express server on your VPS (port 3001)

## 📋 Pre-Deployment Checklist

### 1. Environment Variables for Vercel

Add these in Vercel Dashboard → Project Settings → Environment Variables:

#### Clerk (Authentication)

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxxxx
CLERK_SECRET_KEY=sk_live_xxxxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

#### Supabase (Database on VPS)

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-vps-domain.com
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_DIRECT_URL=https://your-vps-ip:5432  # Optional: direct connection
SUPABASE_DASHBOARD_URL=https://your-vps-domain.com  # Optional: dashboard URL
```

#### Razorpay (Payment Gateway)

```env
RAZORPAY_KEY_ID=rzp_live_xxxxx
RAZORPAY_KEY_SECRET=your_live_secret
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxxxx
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
RAZORPAY_PREMIUM_MONTHLY_PLAN_ID=plan_xxxxx
RAZORPAY_PREMIUM_YEARLY_PLAN_ID=plan_xxxxx
RAZORPAY_ENTERPRISE_MONTHLY_PLAN_ID=plan_xxxxx
RAZORPAY_ENTERPRISE_YEARLY_PLAN_ID=plan_xxxxx
```

#### Inngest (Workflow Orchestration)

```env
INNGEST_EVENT_KEY=your_event_key
INNGEST_SIGNING_KEY=your_signing_key
```

#### OpenAI (AI Generation)

```env
OPENAI_API_KEY=sk-xxxxx
```

#### App Configuration

```env
NEXT_PUBLIC_APP_URL=https://your-vercel-domain.vercel.app
```

### 2. Screenshot Backend Configuration (VPS)

Your screenshot backend needs to:

- Run on port 3001 (or configure in env)
- Be accessible from Vercel (public IP or domain)
- Accept POST requests to `/screenshot`
- Have CORS enabled (already configured in `screenshot-backend/src/server.ts`)

**Backend Setup on VPS:**

1. **Install Dependencies**

   ```bash
   cd screenshot-backend
   npm install
   ```

2. **Set Environment Variables**

   ```env
   PORT=3001
   NODE_ENV=production
   ```

3. **Run with PM2 (Recommended)**

   ```bash
   # Install PM2
   npm install -g pm2

   # Start backend
   pm2 start src/server.ts --name screenshot-backend --interpreter tsx

   # Save PM2 config
   pm2 save
   pm2 startup  # Follow instructions to enable auto-start
   ```

4. **Or Run with Node**

   ```bash
   # Build TypeScript
   npm run build

   # Start
   node dist/server.js
   ```

5. **Configure Firewall**

   ```bash
   # Allow port 3001 (if not using reverse proxy)
   sudo ufw allow 3001/tcp
   ```

6. **Or Use Reverse Proxy (Recommended)**
   - Set up Nginx/Traefik to proxy `/api/screenshot` → `localhost:3001`
   - Update `SCREENSHOT_BACKEND_URL` in Vercel to point to your domain

### 3. Database Migration

Run the migration on your VPS Supabase instance:

```sql
-- Run: supabase/migrations/003_add_ai_fills_tracking.sql
-- In Supabase SQL Editor on your VPS
```

### 4. Webhook Configuration

#### Clerk Webhooks

1. Go to Clerk Dashboard → Webhooks
2. Add endpoint: `https://your-vercel-domain.vercel.app/api/webhooks/clerk`
3. Subscribe to: `user.created`, `user.updated`
4. Copy webhook signing secret → Add to Vercel env: `CLERK_WEBHOOK_SECRET`

#### Razorpay Webhooks

1. Go to Razorpay Dashboard → Webhooks
2. Add endpoint: `https://your-vercel-domain.vercel.app/api/webhooks/razorpay`
3. Subscribe to events:
   - `subscription.activated`
   - `subscription.charged`
   - `subscription.updated`
   - `subscription.cancelled`
   - `subscription.paused`
   - `subscription.resumed`
   - `payment.failed`
4. Copy webhook secret → Add to Vercel env: `RAZORPAY_WEBHOOK_SECRET`

#### Inngest Configuration

1. Go to Inngest Dashboard → Apps
2. Set **Serving URL**: `https://your-vercel-domain.vercel.app/api/inngest`
3. Functions will auto-sync on deployment

## 🚀 Deployment Steps

### Step 1: Prepare Vercel Project

1. **Connect Repository to Vercel**

   ```bash
   # Install Vercel CLI
   npm i -g vercel

   # Login
   vercel login

   # Link project
   vercel link
   ```

2. **Set Environment Variables**
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add all variables from checklist above
   - Set for: Production, Preview, Development

### Step 2: Deploy to Vercel

```bash
# Deploy to production
vercel --prod

# Or push to main branch (if auto-deploy enabled)
git push origin main
```

### Step 3: Verify Deployment

1. **Check Vercel Deployment**

   - Visit: `https://your-vercel-domain.vercel.app`
   - Check build logs for errors

2. **Test Authentication**

   - Sign up/Sign in should work
   - Check Clerk dashboard for user creation

3. **Test Database Connection**

   - Create a draft
   - Check Supabase on VPS for new records

4. **Test Screenshot Generation**

   - Generate a screenshot
   - Verify backend connection

5. **Test AI Generation**
   - Use AI fill feature
   - Check Inngest dashboard for function runs

## 🔧 Configuration Updates Needed

### Update Screenshot Backend URL

The screenshot API route uses `localhost:3001` by default. Update it:

**File: `app/api/screenshot/route.ts`**

```typescript
// Change from:
const screenshotResponse = await fetch("http://localhost:3001/screenshot", {

// To:
const backendUrl = process.env.SCREENSHOT_BACKEND_URL || "http://localhost:3001";
const screenshotResponse = await fetch(`${backendUrl}/screenshot`, {
```

**Add to Vercel Environment Variables:**

```env
SCREENSHOT_BACKEND_URL=https://your-vps-domain.com:3001
# Or if using reverse proxy:
SCREENSHOT_BACKEND_URL=https://your-vps-domain.com/api/screenshot
```

## 🔒 Security Checklist

- [ ] All secrets are in Vercel environment variables (not in code)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is server-only (not `NEXT_PUBLIC_`)
- [ ] `RAZORPAY_KEY_SECRET` is server-only
- [ ] `CLERK_SECRET_KEY` is server-only
- [ ] `OPENAI_API_KEY` is server-only
- [ ] Webhook secrets are configured
- [ ] CORS is configured on VPS for Vercel domain
- [ ] Supabase RLS policies are set (if using RLS)

## 🐛 Troubleshooting

### Issue: Database Connection Fails

- Check `NEXT_PUBLIC_SUPABASE_URL` points to your VPS
- Verify Supabase is accessible from internet
- Check firewall rules on VPS

### Issue: Screenshot Generation Fails

- Verify `SCREENSHOT_BACKEND_URL` is correct
- Check backend is running on VPS
- Verify port 3001 is accessible
- Check CORS settings on backend

### Issue: Webhooks Not Working

- Verify webhook URLs in provider dashboards
- Check webhook secrets match
- Check Vercel function logs for errors

### Issue: Inngest Functions Not Triggering

- Verify Inngest Serving URL in dashboard
- Check `INNGEST_EVENT_KEY` and `INNGEST_SIGNING_KEY` are set
- Check Inngest dashboard for function sync status

## 📝 Post-Deployment

1. **Monitor Logs**

   - Vercel: Dashboard → Logs
   - Supabase: Check query logs
   - Inngest: Dashboard → Functions

2. **Test All Features**

   - User signup/login
   - Draft creation/editing
   - Screenshot generation
   - AI fill generation
   - Subscription checkout
   - Webhook events

3. **Set Up Monitoring** (Optional)
   - Vercel Analytics
   - Error tracking (Sentry, etc.)
   - Uptime monitoring

## 🔄 Rollback Plan

If deployment fails:

1. **Revert Vercel Deployment**

   ```bash
   vercel rollback
   ```

2. **Or Revert Git Commit**

   ```bash
   git revert HEAD
   git push origin main
   ```

3. **Check Environment Variables**
   - Verify all required vars are set
   - Check for typos in values
