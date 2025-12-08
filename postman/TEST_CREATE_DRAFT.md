# Test Create Draft Endpoint

## 🧪 Quick Test

### 1. Get Your JWT Token

Visit: `http://localhost:3000/test-token` (while logged in)
Click "Get JWT Token" and copy it.

### 2. Test Create Draft

**Request:**

```bash
POST http://localhost:3000/api/drafts
Header: Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Body:**

```json
{
  "platform": "google",
  "reviewData": {
    "platform": "google",
    "reviewerName": "John Doe",
    "rating": 5,
    "reviewText": "Great service! Highly recommend.",
    "date": "2025-01-15T10:00:00Z",
    "profilePictureUrl": "https://via.placeholder.com/40",
    "localGuideLevel": 5,
    "numberOfReviews": 42,
    "numberOfPhotos": 8,
    "isNew": true
  },
  "name": "My First Draft"
}
```

## ✅ Expected Response (201 Created)

```json
{
  "data": {
    "id": "uuid-here",
    "user_id": "user_xxx",
    "platform": "google",
    "review_data": { ... },
    "name": "My First Draft",
    "created_at": "2025-01-15T10:00:00Z",
    "updated_at": "2025-01-15T10:00:00Z"
  }
}
```

## 🔍 Debug Steps

If you get an error:

1. **Check your limits**: `GET /api/user/limits`

   - Should show: `"used": 0` if you have no drafts

2. **List drafts**: `GET /api/drafts`

   - Should return: `{ "data": [] }` if empty

3. **Check authentication**: `GET /api/debug`
   - Should show: `"authenticated": true`

## 📋 Other Platform Examples

### Amazon

```json
{
  "platform": "amazon",
  "reviewData": {
    "platform": "amazon",
    "reviewerName": "Jane Smith",
    "rating": 4,
    "reviewText": "Good product, fast shipping.",
    "date": "2025-01-15T10:00:00Z",
    "profilePictureUrl": "https://via.placeholder.com/40",
    "title": "Great value",
    "verified": true,
    "helpfulVotes": 12
  }
}
```

### Trustpilot

```json
{
  "platform": "trustpilot",
  "reviewData": {
    "platform": "trustpilot",
    "reviewerName": "Bob Johnson",
    "rating": 5,
    "reviewText": "Excellent service!",
    "date": "2025-01-15T10:00:00Z",
    "profilePictureUrl": "https://via.placeholder.com/40"
  }
}
```

---

**Try it now!** 🚀
