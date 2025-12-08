# Storage & Drafts Plan - Review Screenshot App

## 📊 Database Schema

### 1. `drafts` Table

Store user drafts (work-in-progress reviews before screenshot generation).

```sql
CREATE TABLE drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL, -- Clerk user ID
  platform TEXT NOT NULL, -- 'google', 'amazon', 'tripadvisor', etc.
  review_data JSONB NOT NULL, -- Full ReviewData object (all platform-specific fields)
  name TEXT, -- Optional draft name (defaults to "Untitled Draft")
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Indexes for performance
  CONSTRAINT drafts_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_drafts_user_id ON drafts(user_id);
CREATE INDEX idx_drafts_updated_at ON drafts(updated_at DESC);
```

**Fields:**

- `id`: UUID primary key
- `user_id`: Clerk user ID (TEXT, since Clerk uses string IDs)
- `platform`: Platform identifier (google, amazon, etc.)
- `review_data`: JSONB containing full `ReviewData` object
- `name`: Optional user-friendly name (e.g., "Google Review Draft 1")
- `created_at`: Timestamp
- `updated_at`: Auto-updated timestamp

### 2. `saved_screenshots` Table

Store generated screenshots (when user clicks "Save" after generating image).

```sql
CREATE TABLE saved_screenshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  draft_id UUID REFERENCES drafts(id) ON DELETE SET NULL, -- Optional: link to draft if saved from draft
  platform TEXT NOT NULL,
  review_data JSONB NOT NULL, -- ReviewData at time of screenshot
  screenshot_url TEXT NOT NULL, -- Supabase Storage URL
  thumbnail_url TEXT, -- Optional: smaller version for gallery
  name TEXT, -- User-given name (defaults to platform + date)
  file_size INTEGER, -- Size in bytes
  width INTEGER, -- Image dimensions
  height INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT saved_screenshots_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_saved_screenshots_user_id ON saved_screenshots(user_id);
CREATE INDEX idx_saved_screenshots_created_at ON saved_screenshots(created_at DESC);
```

**Fields:**

- `id`: UUID primary key
- `user_id`: Clerk user ID
- `draft_id`: Optional link to original draft
- `platform`: Platform identifier
- `review_data`: ReviewData snapshot
- `screenshot_url`: Supabase Storage path
- `thumbnail_url`: Optional thumbnail
- `name`: User-friendly name
- `file_size`, `width`, `height`: Image metadata
- Timestamps

### 3. `user_subscriptions` Table (Premium Tier)

Track user subscription status and limits.

```sql
CREATE TABLE user_subscriptions (
  user_id TEXT PRIMARY KEY, -- Clerk user ID
  tier TEXT NOT NULL DEFAULT 'free', -- 'free', 'premium', 'enterprise'
  stripe_customer_id TEXT, -- If using Stripe
  stripe_subscription_id TEXT,
  status TEXT DEFAULT 'active', -- 'active', 'cancelled', 'expired'
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT user_subscriptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

## 🗂️ Supabase Storage Buckets

### 1. `screenshots` Bucket

- **Purpose**: Store full-resolution screenshot images
- **Path Structure**: `{user_id}/{screenshot_id}.png`
- **Public**: No (private, signed URLs)
- **File Size Limit**: 10MB per file
- **Allowed MIME Types**: `image/png`, `image/jpeg`

### 2. `thumbnails` Bucket (Optional)

- **Purpose**: Store smaller thumbnails for gallery view
- **Path Structure**: `{user_id}/{screenshot_id}_thumb.png`
- **Public**: No
- **File Size Limit**: 1MB per file

## 💎 Premium Tier Limits

### Free Tier

- **Drafts**: 5 drafts max
- **Screenshots**: 10 saved screenshots max
- **Storage**: 100MB total
- **Watermark**: Optional (configurable)

### Premium Tier ($9.99/month)

- **Drafts**: Unlimited
- **Screenshots**: Unlimited
- **Storage**: 10GB total
- **Watermark**: No watermark
- **Priority Support**: Yes
- **Custom Branding**: Yes (future feature)

### Enterprise Tier (Custom pricing)

- Everything in Premium
- Custom storage limits
- API access
- White-label options

## 🔐 Row Level Security (RLS) Policies

### `drafts` Table

```sql
-- Users can only see their own drafts
CREATE POLICY "Users can view own drafts"
  ON drafts FOR SELECT
  USING (auth.uid()::text = user_id);

-- Users can insert their own drafts
CREATE POLICY "Users can insert own drafts"
  ON drafts FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

-- Users can update their own drafts
CREATE POLICY "Users can update own drafts"
  ON drafts FOR UPDATE
  USING (auth.uid()::text = user_id);

-- Users can delete their own drafts
CREATE POLICY "Users can delete own drafts"
  ON drafts FOR DELETE
  USING (auth.uid()::text = user_id);
```

**Note**: Since we're using Clerk (not Supabase Auth), we'll need to:

1. Use Service Role Key for server-side operations
2. Or create a custom RLS function that validates Clerk user ID

### `saved_screenshots` Table

```sql
-- Similar policies as drafts
CREATE POLICY "Users can view own screenshots"
  ON saved_screenshots FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own screenshots"
  ON saved_screenshots FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own screenshots"
  ON saved_screenshots FOR UPDATE
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own screenshots"
  ON saved_screenshots FOR DELETE
  USING (auth.uid()::text = user_id);
```

### Storage Bucket Policies

```sql
-- Users can upload to their own folder
CREATE POLICY "Users can upload own screenshots"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'screenshots' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can read their own screenshots
CREATE POLICY "Users can read own screenshots"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'screenshots' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can delete their own screenshots
CREATE POLICY "Users can delete own screenshots"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'screenshots' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );
```

## 🛠️ API Routes

### 1. `/api/drafts` (GET, POST)

**GET `/api/drafts`**

- Fetch all drafts for current user
- Query params: `?platform=google` (optional filter)
- Returns: Array of draft objects

**POST `/api/drafts`**

- Create new draft
- Body: `{ platform, reviewData, name? }`
- Returns: Created draft object
- **Check limit**: Free tier max 5 drafts

### 2. `/api/drafts/[id]` (GET, PUT, DELETE)

**GET `/api/drafts/[id]`**

- Fetch single draft by ID
- Returns: Draft object

**PUT `/api/drafts/[id]`**

- Update draft
- Body: `{ reviewData, name? }`
- Returns: Updated draft object

**DELETE `/api/drafts/[id]`**

- Delete draft
- Returns: Success message

### 3. `/api/screenshots` (GET, POST)

**GET `/api/screenshots`**

- Fetch all saved screenshots for current user
- Query params: `?platform=google&limit=20&offset=0`
- Returns: Array of screenshot objects with signed URLs

**POST `/api/screenshots`**

- Save screenshot (after generation)
- Body: `{ draftId?, platform, reviewData, imageBlob, name? }`
- Process:
  1. Upload image to Supabase Storage
  2. Generate thumbnail (optional)
  3. Create record in `saved_screenshots` table
  4. Delete draft if `draftId` provided (optional)
- Returns: Created screenshot object
- **Check limit**: Free tier max 10 screenshots

### 4. `/api/screenshots/[id]` (GET, DELETE)

**GET `/api/screenshots/[id]`**

- Fetch single screenshot with signed URL
- Returns: Screenshot object

**DELETE `/api/screenshots/[id]`**

- Delete screenshot
- Also deletes file from Storage
- Returns: Success message

### 5. `/api/user/limits` (GET)

**GET `/api/user/limits`**

- Get current user's tier and usage
- Returns:
  ```json
  {
    "tier": "free" | "premium" | "enterprise",
    "limits": {
      "drafts": { "max": 5, "used": 3 },
      "screenshots": { "max": 10, "used": 7 },
      "storage": { "max": 100000000, "used": 45000000 } // bytes
    }
  }
  ```

## 🔄 Implementation Flow

### Draft Save Flow

```
User edits review → Click "Save Draft"
  → POST /api/drafts
  → Check user tier & draft count
  → If under limit: Insert into drafts table
  → Return success + draft ID
  → Update UI (show "Draft saved" toast)
```

### Screenshot Save Flow

```
User generates screenshot → Click "Save Screenshot"
  → POST /api/screenshots
  → Check user tier & screenshot count
  → Upload image blob to Supabase Storage
  → Create record in saved_screenshots table
  → (Optional) Generate thumbnail
  → Return success + screenshot ID
  → Update UI (show "Screenshot saved" toast)
```

### Draft Load Flow

```
User opens dashboard → Fetch drafts
  → GET /api/drafts
  → Display list of drafts
  → User clicks draft → Load into editor
  → GET /api/drafts/[id]
  → Populate ReviewEditor with draft data
```

## 📝 TypeScript Types

### Update `types/database.ts`

```typescript
export interface Database {
  public: {
    Tables: {
      // ... existing tables ...

      drafts: {
        Row: {
          id: string;
          user_id: string;
          platform: string;
          review_data: Json; // ReviewData
          name: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          platform: string;
          review_data: Json;
          name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          platform?: string;
          review_data?: Json;
          name?: string | null;
          updated_at?: string;
        };
      };

      saved_screenshots: {
        Row: {
          id: string;
          user_id: string;
          draft_id: string | null;
          platform: string;
          review_data: Json;
          screenshot_url: string;
          thumbnail_url: string | null;
          name: string | null;
          file_size: number | null;
          width: number | null;
          height: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          draft_id?: string | null;
          platform: string;
          review_data: Json;
          screenshot_url: string;
          thumbnail_url?: string | null;
          name?: string | null;
          file_size?: number | null;
          width?: number | null;
          height?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          draft_id?: string | null;
          platform?: string;
          review_data?: Json;
          screenshot_url?: string;
          thumbnail_url?: string | null;
          name?: string | null;
          file_size?: number | null;
          width?: number | null;
          height?: number | null;
          updated_at?: string;
        };
      };

      user_subscriptions: {
        Row: {
          user_id: string;
          tier: "free" | "premium" | "enterprise";
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          status: "active" | "cancelled" | "expired";
          current_period_end: string | null;
          created_at: string;
          updated_at: string;
        };
        // ... Insert/Update types ...
      };
    };
  };
}
```

## 🚀 Implementation Steps

### Phase 1: Database Setup

1. ✅ Create `drafts` table in Supabase
2. ✅ Create `saved_screenshots` table
3. ✅ Create `user_subscriptions` table
4. ✅ Set up Storage buckets (`screenshots`, `thumbnails`)
5. ✅ Configure RLS policies (or use Service Role for Clerk)
6. ✅ Update `types/database.ts` with new tables

### Phase 2: Utility Functions

1. ✅ Create `lib/supabase/drafts.ts` - Draft CRUD helpers
2. ✅ Create `lib/supabase/screenshots.ts` - Screenshot CRUD helpers
3. ✅ Create `lib/supabase/subscriptions.ts` - Tier/limit checking
4. ✅ Create `lib/supabase/storage.ts` - Storage upload helpers

### Phase 3: API Routes

1. ✅ `/api/drafts` - GET, POST
2. ✅ `/api/drafts/[id]` - GET, PUT, DELETE
3. ✅ `/api/screenshots` - GET, POST
4. ✅ `/api/screenshots/[id]` - GET, DELETE
5. ✅ `/api/user/limits` - GET

### Phase 4: Frontend Integration

1. ✅ Update `ReviewEditor` - Add "Save Draft" button
2. ✅ Update `ReviewPreview` - Add "Save Screenshot" button
3. ✅ Create `components/dashboard/DraftsList.tsx`
4. ✅ Create `components/dashboard/ScreenshotsList.tsx`
5. ✅ Update dashboard page to show drafts + screenshots

### Phase 5: Premium Tier

1. ✅ Add tier checking middleware
2. ✅ Show upgrade prompts when limits reached
3. ✅ Integrate Stripe (or payment provider)
4. ✅ Add subscription management UI

## 🔍 Key Considerations

### Clerk + Supabase Integration

Since we're using Clerk (not Supabase Auth), we need to:

1. **Server-side operations**: Use Service Role Key
2. **User validation**: Manually check `user_id` matches Clerk user
3. **RLS alternative**: Implement application-level checks instead of RLS

```typescript
// Example: lib/supabase/drafts.ts
export async function getUserDrafts(userId: string) {
  const supabase = createClient(); // Service role client
  const { data, error } = await supabase
    .from("drafts")
    .select("*")
    .eq("user_id", userId) // Manual check instead of RLS
    .order("updated_at", { ascending: false });

  return { data, error };
}
```

### Storage Upload Strategy

```typescript
// Upload screenshot to Supabase Storage
async function uploadScreenshot(userId: string, imageBlob: Blob) {
  const filePath = `${userId}/${uuidv4()}.png`;
  const { data, error } = await supabase.storage
    .from("screenshots")
    .upload(filePath, imageBlob, {
      contentType: "image/png",
      upsert: false,
    });

  return { data, error };
}
```

### Limit Checking

```typescript
// Check if user can create more drafts
async function canCreateDraft(userId: string): Promise<boolean> {
  const tier = await getUserTier(userId);
  const draftCount = await getDraftCount(userId);
  const limit = TIER_LIMITS[tier].drafts;

  return draftCount < limit;
}
```

## 📋 Next Steps

1. **Create SQL migration file** for tables
2. **Set up Storage buckets** in Supabase dashboard
3. **Create utility functions** for drafts/screenshots
4. **Build API routes** with limit checking
5. **Integrate into ReviewEditor** component
6. **Add dashboard views** for drafts and screenshots

Ready to implement? Let me know which phase you'd like to start with!
