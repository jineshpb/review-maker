# Vercel Environment Variables Checklist

Copy this checklist and fill in your production values in Vercel Dashboard.

## ✅ Required Environment Variables

### Clerk Authentication

- [ ] `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` = `pk_live_xxxxx`
- [ ] `CLERK_SECRET_KEY` = `sk_live_xxxxx`
- [ ] `CLERK_WEBHOOK_SECRET` = `whsec_xxxxx` (from Clerk webhook setup)
- [ ] `NEXT_PUBLIC_CLERK_SIGN_IN_URL` = `/sign-in`
- [ ] `NEXT_PUBLIC_CLERK_SIGN_UP_URL` = `/sign-up`
- [ ] `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` = `/dashboard`
- [ ] `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` = `/dashboard`

### Supabase (VPS)

- [ ] `NEXT_PUBLIC_SUPABASE_URL` = `https://your-vps-domain.com` (or IP)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` = `eyJhbGci...` (from Supabase dashboard)
- [ ] `SUPABASE_DIRECT_URL` = `https://your-vps-ip:5432` (optional)
- [ ] `SUPABASE_DASHBOARD_URL` = `https://your-vps-domain.com` (optional)

### Razorpay

- [ ] `RAZORPAY_KEY_ID` = `rzp_live_xxxxx`
- [ ] `RAZORPAY_KEY_SECRET` = `your_live_secret`
- [ ] `NEXT_PUBLIC_RAZORPAY_KEY_ID` = `rzp_live_xxxxx`
- [ ] `RAZORPAY_WEBHOOK_SECRET` = `your_webhook_secret`
- [ ] `RAZORPAY_PREMIUM_MONTHLY_PLAN_ID` = `plan_xxxxx`
- [ ] `RAZORPAY_PREMIUM_YEARLY_PLAN_ID` = `plan_xxxxx`
- [ ] `RAZORPAY_ENTERPRISE_MONTHLY_PLAN_ID` = `plan_xxxxx`
- [ ] `RAZORPAY_ENTERPRISE_YEARLY_PLAN_ID` = `plan_xxxxx`

### Inngest

- [ ] `INNGEST_EVENT_KEY` = `your_event_key`
- [ ] `INNGEST_SIGNING_KEY` = `your_signing_key`

### OpenAI

- [ ] `OPENAI_API_KEY` = `sk-xxxxx`

### App Configuration

- [ ] `NEXT_PUBLIC_APP_URL` = `https://your-vercel-domain.vercel.app`
- [ ] `SCREENSHOT_BACKEND_URL` = `https://your-vps-domain.com:3001` (or via reverse proxy)

## 📝 Notes

- All variables with `NEXT_PUBLIC_` prefix are exposed to the browser
- Never expose secrets (keys, secrets, tokens) with `NEXT_PUBLIC_` prefix
- Set variables for: **Production**, **Preview**, and **Development** environments
- After adding variables, redeploy the application

## 🔍 How to Add in Vercel

1. Go to: Vercel Dashboard → Your Project → Settings → Environment Variables
2. Click "Add New"
3. Enter variable name and value
4. Select environments (Production, Preview, Development)
5. Click "Save"
6. Redeploy: Deployments → ... → Redeploy
