# API Routes Summary

## ✅ All API Routes Created

### 1. Drafts API (`/api/drafts`)

#### `GET /api/drafts`
- **Purpose**: Fetch all drafts for current user
- **Query Params**: `?platform=google` (optional filter)
- **Response**: Array of draft objects
- **Auth**: Required (Clerk)

#### `POST /api/drafts`
- **Purpose**: Create a new draft
- **Body**: `{ platform, reviewData, name? }`
- **Validation**: Zod schema validation
- **Limit Check**: Free tier max 5 drafts
- **Response**: Created draft object
- **Auth**: Required (Clerk)

### 2. Draft by ID API (`/api/drafts/[id]`)

#### `GET /api/drafts/[id]`
- **Purpose**: Fetch single draft by ID
- **Response**: Draft object
- **Auth**: Required (Clerk, validates ownership)

#### `PUT /api/drafts/[id]`
- **Purpose**: Update existing draft
- **Body**: `{ reviewData?, name? }`
- **Validation**: Zod schema validation
- **Response**: Updated draft object
- **Auth**: Required (Clerk, validates ownership)

#### `DELETE /api/drafts/[id]`
- **Purpose**: Delete draft
- **Response**: Success message
- **Auth**: Required (Clerk, validates ownership)

### 3. Screenshots API (`/api/screenshots`)

#### `GET /api/screenshots`
- **Purpose**: Fetch all saved screenshots for current user
- **Query Params**: `?platform=google&limit=20&offset=0`
- **Response**: Array of screenshot objects
- **Auth**: Required (Clerk)

#### `POST /api/screenshots`
- **Purpose**: Save screenshot (after generation)
- **Content Types**:
  - `application/json` with `imageBase64` field
  - `multipart/form-data` with `image` file
- **Body**: `{ draftId?, platform, reviewData, name? }` + image
- **Validation**: Zod schema validation
- **Limit Check**: Free tier max 10 screenshots
- **Process**:
  1. Upload image to Supabase Storage
  2. Create record in `saved_screenshots` table
  3. Return screenshot object with URL
- **Response**: Created screenshot object
- **Auth**: Required (Clerk)

### 4. Screenshot by ID API (`/api/screenshots/[id]`)

#### `GET /api/screenshots/[id]`
- **Purpose**: Fetch single screenshot with URL
- **Response**: Screenshot object
- **Auth**: Required (Clerk, validates ownership)

#### `DELETE /api/screenshots/[id]`
- **Purpose**: Delete screenshot
- **Process**:
  1. Delete file from Supabase Storage
  2. Delete record from database
- **Response**: Success message
- **Auth**: Required (Clerk, validates ownership)

### 5. User Limits API (`/api/user/limits`)

#### `GET /api/user/limits`
- **Purpose**: Get current user's tier and usage
- **Response**:
  ```json
  {
    "tier": "free" | "premium" | "enterprise",
    "limits": {
      "drafts": { "max": 5, "used": 3 },
      "screenshots": { "max": 10, "used": 7 },
      "storage": { "max": 100000000, "used": 45000000 }
    }
  }
  ```
- **Auth**: Required (Clerk)

## 🔧 Features Implemented

### ✅ Authentication
- All routes require Clerk authentication
- Automatic user validation via `createAuthenticatedClient()`
- Manual `user_id` checks in all queries

### ✅ Validation
- Zod schema validation for all request bodies
- Clear error messages for validation failures
- Type-safe request/response handling

### ✅ Limit Checking
- Premium tier limits enforced
- Free tier: 5 drafts, 10 screenshots
- Premium tier: Unlimited
- Clear error messages when limits reached

### ✅ Error Handling
- Consistent error response format
- Proper HTTP status codes
- Detailed error messages for debugging
- Unauthorized error handling

### ✅ Storage Integration
- Supabase Storage upload/download
- Automatic file path generation (`user_id/screenshot_id.png`)
- Signed URLs for private access
- Automatic cleanup on delete

## 📁 Files Created

### API Routes
- `app/api/drafts/route.ts` - Drafts CRUD
- `app/api/drafts/[id]/route.ts` - Single draft operations
- `app/api/screenshots/route.ts` - Screenshots CRUD
- `app/api/screenshots/[id]/route.ts` - Single screenshot operations
- `app/api/user/limits/route.ts` - User limits

### Utility Functions
- `lib/supabase/drafts.ts` - Draft database operations
- `lib/supabase/screenshots.ts` - Screenshot database operations
- `lib/supabase/storage.ts` - Storage upload/download helpers
- `lib/supabase/subscriptions.ts` - Tier/limit checking

## 🧪 Testing the API

### Example: Create Draft
```bash
curl -X POST http://localhost:3000/api/drafts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "platform": "google",
    "reviewData": {
      "platform": "google",
      "reviewerName": "John Doe",
      "rating": 5,
      "reviewText": "Great service!",
      "date": "2024-01-15"
    },
    "name": "My Google Review"
  }'
```

### Example: Save Screenshot (JSON with base64)
```bash
curl -X POST http://localhost:3000/api/screenshots \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "platform": "google",
    "reviewData": { ... },
    "imageBase64": "data:image/png;base64,iVBORw0KGgo..."
  }'
```

### Example: Get User Limits
```bash
curl http://localhost:3000/api/user/limits \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🚀 Next Steps

1. ✅ API routes created
2. ⏳ Test API routes with Postman/curl
3. ⏳ Integrate into frontend components
4. ⏳ Add "Save Draft" button to ReviewEditor
5. ⏳ Add "Save Screenshot" button to ReviewPreview
6. ⏳ Create dashboard views for drafts/screenshots

---

**All API routes are ready to use!** 🎉

