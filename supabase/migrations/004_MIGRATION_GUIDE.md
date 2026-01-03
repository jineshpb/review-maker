# Migration 004: Credit System - Step by Step Guide

## ✅ Pre-Migration Checklist

- [ ] Backup your database (Supabase Dashboard → Settings → Database → Backups)
- [ ] Verify you're in the correct Supabase project
- [ ] Ensure you have admin access to the SQL Editor

## 🚀 Running the Migration

### Step 1: Open Supabase SQL Editor

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor** (left sidebar)
3. Click **New Query**

### Step 2: Copy Migration SQL

Copy the entire contents of `004_add_credit_system.sql` file.

### Step 3: Run the Migration

1. Paste the SQL into the SQL Editor
2. Click **Run** (or press `Ctrl+Enter` / `Cmd+Enter`)
3. Wait for execution to complete (should take a few seconds)

### Step 4: Verify Migration Success

Run these verification queries:

```sql
-- Check if credits_balance column exists
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'user_subscriptions'
AND column_name = 'credits_balance';

-- Check if credit_transactions table exists
SELECT table_name
FROM information_schema.tables
WHERE table_name = 'credit_transactions';

-- Check if credit_pack_purchases table exists
SELECT table_name
FROM information_schema.tables
WHERE table_name = 'credit_pack_purchases';

-- Check if functions exist
SELECT routine_name
FROM information_schema.routines
WHERE routine_name IN ('add_credits_to_user', 'deduct_credits_from_user');
```

Expected results:

- ✅ `credits_balance` column should exist
- ✅ `credit_transactions` table should exist
- ✅ `credit_pack_purchases` table should exist
- ✅ Both functions should exist

### Step 5: Test the Functions (Optional)

Test the helper functions:

```sql
-- Test adding credits (replace 'test_user_id' with a real user ID)
SELECT add_credits_to_user(
  'test_user_id',
  10,
  'bonus',
  'test',
  'test_ref',
  'Test credit addition',
  '{"test": true}'::jsonb
);

-- Check balance
SELECT credits_balance
FROM user_subscriptions
WHERE user_id = 'test_user_id';

-- Test deducting credits
SELECT deduct_credits_from_user(
  'test_user_id',
  1,
  'usage',
  'screenshot',
  'test_screenshot',
  'Test screenshot',
  '{"screenshot_id": "test"}'::jsonb
);

-- Check balance again
SELECT credits_balance
FROM user_subscriptions
WHERE user_id = 'test_user_id';
```

## 🔍 What This Migration Does

1. **Adds `credits_balance` column** to `user_subscriptions` table
2. **Creates `credit_transactions` table** for audit trail
3. **Creates `credit_pack_purchases` table** for purchase tracking
4. **Creates helper functions**:
   - `add_credits_to_user()` - Safely add credits
   - `deduct_credits_from_user()` - Safely deduct credits
5. **Initializes free tier users** with 10 credits

## ⚠️ Important Notes

- **Safe to run multiple times** - Uses `IF NOT EXISTS` clauses
- **No data loss** - Only adds new columns/tables, doesn't modify existing data
- **Existing users** - Free tier users will get 10 credits automatically
- **Rollback** - If needed, you can manually drop the new tables/columns

## 🐛 Troubleshooting

### Error: "column already exists"

- This is safe to ignore - the migration uses `IF NOT EXISTS`
- The column was already added

### Error: "table already exists"

- This is safe to ignore - the migration uses `IF NOT EXISTS`
- The table was already created

### Error: "function already exists"

- Drop and recreate:

```sql
DROP FUNCTION IF EXISTS add_credits_to_user(TEXT, INTEGER, TEXT, TEXT, TEXT, TEXT, JSONB);
DROP FUNCTION IF EXISTS deduct_credits_from_user(TEXT, INTEGER, TEXT, TEXT, TEXT, TEXT, JSONB);
```

- Then re-run the migration

## ✅ Post-Migration

After successful migration:

1. ✅ Update TypeScript types (already done in `types/database.ts`)
2. ✅ Test credit operations in your app
3. ✅ Verify existing users have correct credit balances

## 📝 Next Steps

After migration:

1. Update API routes to use credit system
2. Update UI to show credit balance
3. Implement credit pack purchase flow
4. Add credit deduction on screenshot/AI generation
