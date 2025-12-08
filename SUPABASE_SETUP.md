# Supabase Setup - Clerk + Supabase Integration

## ✅ Answer: Clerk is NOT a Deal Breaker!

**We're keeping Clerk** and using Supabase for database/storage. This is the best of both worlds.

## 🎯 What We've Set Up

### 1. **Supabase Server Client** (`lib/supabase/server.ts`)

- Uses **Service Role Key** (bypasses RLS since we use Clerk)
- Manual user validation with Clerk user IDs
- Helper functions: `getCurrentUserId()`, `createAuthenticatedClient()`

### 2. **Draft Management** (`lib/supabase/drafts.ts`)

- `getUserDrafts()` - Get all drafts for current user
- `getDraftById()` - Get single draft (with user validation)
- `createDraft()` - Create new draft
- `updateDraft()` - Update draft (with user validation)
- `deleteDraft()` - Delete draft (with user validation)
- `getDraftCount()` - Count drafts (for limit checking)

### 3. **Subscription Management** (`lib/supabase/subscriptions.ts`)

- `getUserSubscription()` - Get user's subscription tier
- `getUserTier()` - Get tier (defaults to "free")
- `canCreateDraft()` - Check if user can create more drafts
- `canCreateScreenshot()` - Check if user can create more screenshots
- `getUserLimits()` - Get usage and limits

### 4. **Database Types** (`types/database.ts`)

- Added `drafts` table types
- Added `saved_screenshots` table types
- Added `user_subscriptions` table types

## 🔧 How It Works

### Clerk Authentication Flow

```
User signs in → Clerk handles auth
  ↓
Clerk user ID → Used in Supabase queries
  ↓
Server operations → Service Role Key (bypasses RLS)
  ↓
Manual validation → Check user_id matches Clerk user
```

### Example Usage

```typescript
// In API route
import { createDraft } from "@/lib/supabase/drafts";
import { canCreateDraft } from "@/lib/supabase/subscriptions";

export async function POST(request: NextRequest) {
  // Check if user can create draft
  if (!(await canCreateDraft())) {
    return NextResponse.json(
      { error: "Draft limit reached. Upgrade to premium." },
      { status: 403 }
    );
  }

  // Create draft (user_id is automatically added)
  const { data, error } = await createDraft({
    platform: "google",
    review_data: reviewData,
    name: "My Draft",
  });

  return NextResponse.json({ data, error });
}
```

## 🔐 Security Considerations

### ✅ What We Get

1. **Clerk handles auth** - Secure, battle-tested
2. **Manual validation** - Explicit `user_id` checks in every query
3. **Service Role Key** - Only used server-side, never exposed
4. **Type safety** - TypeScript ensures correct usage

### ⚠️ Important Notes

1. **Always validate user_id** - Never trust client input
2. **Service Role Key** - Keep it secret, never expose to client
3. **Manual checks** - Must add `.eq('user_id', userId)` to every query

## 📋 Next Steps

### 1. Set Up Supabase Database

Run the SQL migrations from `STORAGE_PLAN.md`:

- Create `drafts` table
- Create `saved_screenshots` table
- Create `user_subscriptions` table
- Set up storage buckets

### 2. Environment Variables

Add to `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. Regenerate Types (After Database Setup)

Once tables are created in Supabase:

```bash
npx supabase gen types typescript --project-id your-project-id > types/database.ts
```

This will replace the manual type definitions with auto-generated ones from Supabase.

## 🚫 What We're NOT Using

- **Supabase Auth** - Using Clerk instead (better UX)
- **RLS Policies** - Using manual validation instead (more explicit)
- **Anon Key** - Using Service Role Key for server operations

## 💡 Why This Approach?

1. **Clerk is better for UX** - Pre-built components, better onboarding
2. **Manual validation is clearer** - Explicit checks, easier to debug
3. **Service Role Key is standard** - Common pattern for server-side operations
4. **No compromise** - Best auth (Clerk) + best database (Supabase)

---

**TL;DR**: Keep Clerk, use Supabase for data. Manual validation is fine and actually more explicit. Set up the database tables, then regenerate types from Supabase.
