# API Testing Guide

## 🔑 Getting Your Clerk Session Cookie

### Option 1: From Browser DevTools (Easiest) ✅

1. **Open your app** in browser: `http://localhost:3000`
2. **Sign in** with Clerk
3. **Open DevTools** (F12)
4. **Go to Application/Storage tab** → **Cookies** → `http://localhost:3000`
5. **Find cookie**: `__session` (NOT `__clerk_db_jwt`)
6. **Copy the entire cookie value** - this is your session token

**Important**: Use `__session` cookie, NOT `__clerk_db_jwt`!

### Option 2: From Network Tab (Alternative)

1. **Open DevTools** → **Network tab**
2. **Make any authenticated request** in your app (e.g., navigate to dashboard)
3. **Find the request** → **Headers** → **Request Headers**
4. **Look for**: `Cookie: __session=YOUR_TOKEN_HERE`
5. **Copy the entire `__session` value**

## 📥 Import Postman Collection

1. **Open Postman**
2. **Click Import** (top left)
3. **Select File** → Choose `Review Screenshot API.postman_collection.json`
4. **Set Variables**:
   - `baseUrl`: `http://localhost:3000`
   - `clerkSession`: Your `__session` cookie value (from browser)

## 🧪 Testing with Postman

### 1. Set Up Environment Variables

In Postman:

1. Click **Environments** (left sidebar)
2. Create new environment or use **Globals**
3. Add variables:
   - `baseUrl` = `http://localhost:3000`
   - `clerkSession` = `YOUR__SESSION_COOKIE_VALUE_HERE`

### 2. Configure Cookie Header

**Important**: Clerk reads from cookies, not Authorization headers!

In each request, add this header:

- **Header Name**: `Cookie`
- **Header Value**: `__session={{clerkSession}}`

Or set it globally in Postman:

1. Go to request → **Headers** tab
2. Add: `Cookie: __session={{clerkSession}}`

### 3. Test Drafts API

#### Get All Drafts

- **Method**: GET
- **URL**: `{{baseUrl}}/api/drafts`
- **Headers**:
  - `Cookie: __session={{clerkSession}}`

#### Create Draft

- **Method**: POST
- **URL**: `{{baseUrl}}/api/drafts`
- **Headers**:
  - `Cookie: __session={{clerkSession}}`
  - `Content-Type: application/json`
- **Body** (JSON):

```json
{
  "platform": "google",
  "reviewData": {
    "platform": "google",
    "reviewerName": "John Doe",
    "rating": 5,
    "reviewText": "Amazing service!",
    "date": "2024-01-15",
    "profilePictureUrl": "",
    "localGuideLevel": 5,
    "numberOfReviews": 127,
    "numberOfPhotos": 23,
    "isNew": false
  },
  "name": "My Google Review Draft"
}
```

### 4. Test Screenshots API

#### Save Screenshot (Base64)

- **Method**: POST
- **URL**: `{{baseUrl}}/api/screenshots`
- **Headers**:
  - `Cookie: __session={{clerkSession}}`
  - `Content-Type: application/json`
- **Body** (JSON):

```json
{
  "platform": "google",
  "reviewData": {
    "platform": "google",
    "reviewerName": "John Doe",
    "rating": 5,
    "reviewText": "Great service!",
    "date": "2024-01-15",
    "profilePictureUrl": ""
  },
  "name": "My Screenshot",
  "imageBase64": "data:image/png;base64,YOUR_BASE64_STRING_HERE"
}
```

**To get base64 from image:**

```javascript
// In browser console
const fileInput = document.createElement("input");
fileInput.type = "file";
fileInput.accept = "image/*";
fileInput.onchange = (e) => {
  const file = e.target.files[0];
  const reader = new FileReader();
  reader.onload = (e) => console.log(e.target.result);
  reader.readAsDataURL(file);
};
fileInput.click();
```

#### Save Screenshot (FormData)

- **Method**: POST
- **URL**: `{{baseUrl}}/api/screenshots`
- **Headers**: `Cookie: __session={{clerkSession}}`
- **Body** (form-data):
  - `image`: [Select File]
  - `platform`: `google`
  - `reviewData`: `{"platform":"google","reviewerName":"John Doe",...}`
  - `name`: `My Screenshot`

### 5. Test User Limits

#### Get Limits

- **Method**: GET
- **URL**: `{{baseUrl}}/api/user/limits`
- **Headers**: `Cookie: __session={{clerkSession}}`

**Expected Response:**

```json
{
  "tier": "free",
  "limits": {
    "drafts": { "max": 5, "used": 0 },
    "screenshots": { "max": 10, "used": 0 },
    "storage": { "max": 100000000, "used": 0 }
  }
}
```

## 🧪 Testing with cURL

### Get All Drafts

```bash
curl -X GET "http://localhost:3000/api/drafts" \
  -H "Cookie: __session=YOUR__SESSION_COOKIE_VALUE"
```

### Create Draft

```bash
curl -X POST "http://localhost:3000/api/drafts" \
  -H "Cookie: __session=YOUR__SESSION_COOKIE_VALUE" \
  -H "Content-Type: application/json" \
  -d '{
    "platform": "google",
    "reviewData": {
      "platform": "google",
      "reviewerName": "John Doe",
      "rating": 5,
      "reviewText": "Amazing service!",
      "date": "2024-01-15",
      "profilePictureUrl": ""
    },
    "name": "My Google Review Draft"
  }'
```

### Get Draft by ID

```bash
curl -X GET "http://localhost:3000/api/drafts/YOUR_DRAFT_ID" \
  -H "Cookie: __session=YOUR__SESSION_COOKIE_VALUE"
```

### Update Draft

```bash
curl -X PUT "http://localhost:3000/api/drafts/YOUR_DRAFT_ID" \
  -H "Cookie: __session=YOUR__SESSION_COOKIE_VALUE" \
  -H "Content-Type: application/json" \
  -d '{
    "reviewData": {
      "platform": "google",
      "reviewerName": "John Doe Updated",
      "rating": 4,
      "reviewText": "Updated review",
      "date": "2024-01-15",
      "profilePictureUrl": ""
    },
    "name": "Updated Draft"
  }'
```

### Delete Draft

```bash
curl -X DELETE "http://localhost:3000/api/drafts/YOUR_DRAFT_ID" \
  -H "Cookie: __session=YOUR__SESSION_COOKIE_VALUE"
```

### Get All Screenshots

```bash
curl -X GET "http://localhost:3000/api/screenshots?limit=20&offset=0" \
  -H "Cookie: __session=YOUR__SESSION_COOKIE_VALUE"
```

### Save Screenshot (Base64)

```bash
curl -X POST "http://localhost:3000/api/screenshots" \
  -H "Cookie: __session=YOUR__SESSION_COOKIE_VALUE" \
  -H "Content-Type: application/json" \
  -d '{
    "platform": "google",
    "reviewData": {
      "platform": "google",
      "reviewerName": "John Doe",
      "rating": 5,
      "reviewText": "Great!",
      "date": "2024-01-15",
      "profilePictureUrl": ""
    },
    "name": "My Screenshot",
    "imageBase64": "data:image/png;base64,YOUR_BASE64_STRING"
  }'
```

### Save Screenshot (FormData)

```bash
curl -X POST "http://localhost:3000/api/screenshots" \
  -H "Cookie: __session=YOUR__SESSION_COOKIE_VALUE" \
  -F "image=@/path/to/image.png" \
  -F "platform=google" \
  -F "reviewData={\"platform\":\"google\",\"reviewerName\":\"John Doe\",\"rating\":5,\"reviewText\":\"Great!\",\"date\":\"2024-01-15\",\"profilePictureUrl\":\"\"}" \
  -F "name=My Screenshot"
```

### Get User Limits

```bash
curl -X GET "http://localhost:3000/api/user/limits" \
  -H "Cookie: __session=YOUR__SESSION_COOKIE_VALUE"
```

## ✅ Expected Responses

### Success (200/201)

```json
{
  "data": { ... }
}
```

### Validation Error (400)

```json
{
  "error": "Validation failed",
  "issues": [
    {
      "path": ["reviewData", "rating"],
      "message": "Expected number, received string"
    }
  ]
}
```

### Unauthorized (401)

```json
{
  "error": "Unauthorized",
  "message": "You must be logged in"
}
```

### Limit Reached (403)

```json
{
  "error": "Draft limit reached",
  "message": "You've reached your draft limit. Upgrade to premium for unlimited drafts."
}
```

### Not Found (404)

```json
{
  "error": "Draft not found"
}
```

## 🐛 Troubleshooting

### "Unauthorized" Error

- ✅ **Use `__session` cookie, NOT `__clerk_db_jwt`**
- ✅ **Send as Cookie header, NOT Authorization Bearer**
- Check if cookie value is correct (copy entire value from browser)
- Make sure you're logged in
- Cookie might have expired - refresh and get a new one
- In Postman: Use `Cookie: __session=YOUR_VALUE` header

### "Validation failed" Error

- Check request body format
- Ensure all required fields are present
- Check data types match schema

### "Draft limit reached" Error

- You've hit the free tier limit (5 drafts)
- Delete some drafts or upgrade to premium

### Connection Refused

- Make sure Next.js dev server is running: `npm run dev`
- Check if port 3000 is correct

---

**Happy Testing!** 🚀
