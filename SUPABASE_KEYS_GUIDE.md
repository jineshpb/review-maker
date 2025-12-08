# How to Get Supabase Service Role Key

## 🔑 Required Environment Variables

You need these 3 Supabase keys:

1. **`NEXT_PUBLIC_SUPABASE_URL`** - Your Supabase project URL
2. **`NEXT_PUBLIC_SUPABASE_ANON_KEY`** - Public anonymous key (safe to expose)
3. **`SUPABASE_SERVICE_ROLE_KEY`** - Service role key (⚠️ KEEP SECRET!)

## 📍 Where to Find Them in Supabase

### Step 1: Go to Supabase Dashboard

1. Visit [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project (or create one if you haven't)

### Step 2: Navigate to Settings

1. Click on **Settings** (gear icon) in the left sidebar
2. Click on **API** in the settings menu

### Step 3: Copy Your Keys

You'll see a page with:

```
Project URL: https://xxxxxxxxxxxxx.supabase.co
anon public: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
service_role: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Copy these values:**

1. **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
2. **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. **service_role** → `SUPABASE_SERVICE_ROLE_KEY` ⚠️ **KEEP THIS SECRET!**

## 📝 Add to `.env.local`

Create or update `.env.local` in your project root:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Clerk (you already have these)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
CLERK_SECRET_KEY=your_clerk_secret
```

## ⚠️ Security Notes

### Service Role Key is DANGEROUS

- **Never commit** to git (already in `.gitignore`)
- **Never expose** to client-side code
- **Never share** publicly
- **Only use** in server-side code (API routes, server components)

### Why We Need It

Since we're using Clerk (not Supabase Auth), we need the Service Role Key to:

- Bypass Row Level Security (RLS)
- Perform server-side operations
- Access all tables (we manually validate `user_id`)

## 🔍 Verify Your Setup

After adding the keys, restart your dev server:

```bash
npm run dev
```

The app should start without errors. If you see:

```
SUPABASE_SERVICE_ROLE_KEY is missing. Add it to your .env.local file.
```

Then the key isn't being read correctly. Check:

1. File is named `.env.local` (not `.env`)
2. Keys are on separate lines
3. No quotes around the values (unless they contain spaces)
4. Restart the dev server after adding keys

## 🎯 Quick Checklist

- [ ] Created Supabase project
- [ ] Copied Project URL → `NEXT_PUBLIC_SUPABASE_URL`
- [ ] Copied anon public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Copied service_role key → `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Added all to `.env.local`
- [ ] Restarted dev server
- [ ] No errors in console

---

**Need help?** The Service Role Key is in: **Supabase Dashboard → Settings → API → service_role**
