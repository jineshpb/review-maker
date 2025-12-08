# Supabase Database Setup

## 🚀 Quick Start

### Option 1: Run SQL in Supabase Dashboard (Recommended)

1. **Go to Supabase Dashboard**

   - Visit [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Select your project

2. **Open SQL Editor**

   - Click **SQL Editor** in the left sidebar
   - Click **New Query**

3. **Run Migrations**
   - Copy contents of `001_initial_schema.sql`
   - Paste into SQL Editor
   - Click **Run** (or press `Ctrl+Enter`)
   - Repeat for `002_storage_buckets.sql`

### Option 2: Use Supabase CLI (Advanced)

```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

## 📋 Migration Files

### `001_initial_schema.sql`

Creates all database tables:

- ✅ `drafts` - User drafts
- ✅ `saved_screenshots` - Generated screenshots
- ✅ `user_subscriptions` - Subscription tiers
- ✅ `users` - Clerk user sync (optional)
- ✅ Indexes for performance
- ✅ Triggers for `updated_at` timestamps

### `002_storage_buckets.sql`

Creates storage buckets:

- ✅ `screenshots` - Full-resolution images
- ✅ `thumbnails` - Smaller thumbnails (optional)
- ⚠️ Storage policies (won't work with Clerk, but set up for future)

## 🔍 Verify Setup

After running migrations, verify in Supabase Dashboard:

1. **Tables** - Go to **Table Editor**

   - Should see: `drafts`, `saved_screenshots`, `user_subscriptions`, `users`

2. **Storage** - Go to **Storage**

   - Should see: `screenshots` and `thumbnails` buckets

3. **Indexes** - Go to **Database** → **Indexes**
   - Should see indexes on `user_id`, `updated_at`, etc.

## ⚠️ Important Notes

### Storage Policies with Clerk

Since we're using Clerk (not Supabase Auth), the storage RLS policies won't work. We'll:

- Use **Service Role Key** for all storage operations
- Manually validate `user_id` in application code
- Generate **signed URLs** for secure access

### Foreign Key Constraints

The foreign key constraints are commented out because:

- Clerk uses TEXT user IDs (not UUIDs)
- We manually validate user ownership in queries
- Foreign keys would require syncing Clerk users to `users` table first

## 🔄 After Running Migrations

1. **Regenerate TypeScript Types** (Optional but recommended)

   ```bash
   npx supabase gen types typescript --project-id your-project-id > types/database.ts
   ```

2. **Test the Setup**
   - Try creating a draft via API
   - Check if tables are created correctly
   - Verify storage buckets exist

## 🐛 Troubleshooting

### Error: "relation already exists"

- Tables already exist - that's fine, migrations use `IF NOT EXISTS`
- You can safely re-run migrations

### Error: "permission denied"

- Make sure you're using the SQL Editor (has full permissions)
- Check that you're logged into the correct project

### Storage buckets not created

- Try creating them manually: **Storage** → **Create Bucket**
- Or run the SQL migration again

## 📚 Next Steps

After migrations are complete:

1. ✅ Tables created
2. ✅ Storage buckets created
3. ⏳ Test API routes
4. ⏳ Implement frontend integration

---

**Need help?** Check the main `STORAGE_PLAN.md` for detailed schema documentation.
