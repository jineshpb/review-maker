# Test Add User from Postman

## 🚀 Simple API Endpoint Test

### Request Setup

**Method:** `POST`  
**URL:** `http://localhost:3000/api/test/add-user`

### Headers

**Only this header is needed:**

```
Content-Type: application/json
```

**You DON'T need to pass Supabase credentials** - they're already configured server-side!

### Body (JSON)

```json
{
  "email": "forembeepay@gmail.com"
}
```

**Optional:** Specify a user ID:

```json
{
  "email": "forembeepay@gmail.com",
  "userId": "user_36KzCsOgNpHW3AT1t5Q6ynVP1FR"
}
```

## ✅ Expected Response

```json
{
  "message": "User created successfully",
  "user": {
    "id": "user_test_1234567890",
    "email": "forembeepay@gmail.com",
    "username": "forembeepay",
    "avatar_url": null,
    "created_at": "2025-01-15T10:00:00Z",
    "updated_at": "2025-01-15T10:00:00Z"
  },
  "subscription": {
    "user_id": "user_test_1234567890",
    "tier": "free",
    "status": "active",
    ...
  }
}
```

## 📋 Step-by-Step in Postman

1. **Create new request**

   - Method: `POST`
   - URL: `http://localhost:3000/api/test/add-user`

2. **Add header**

   - Key: `Content-Type`
   - Value: `application/json`

3. **Add body**

   - Select: `Body` tab
   - Select: `raw`
   - Select: `JSON` (from dropdown)
   - Paste:
     ```json
     {
       "email": "forembeepay@gmail.com"
     }
     ```

4. **Click Send**

## 🔍 Why No Supabase Credentials?

The API endpoint runs **server-side** and automatically reads:

- `NEXT_PUBLIC_SUPABASE_URL` from `.env.local`
- `SUPABASE_SERVICE_ROLE_KEY` from `.env.local`

These are **never exposed** to the client (Postman) - they stay secure on your server!

## ⚠️ Important

- **No authentication needed** for this test endpoint (it's a test route)
- **Supabase credentials stay server-side** (secure!)
- **Make sure your Next.js dev server is running** (`npm run dev`)

---

**That's it! Just send the email in the body!** 🚀
