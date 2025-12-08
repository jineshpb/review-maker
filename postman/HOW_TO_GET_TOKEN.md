# How to Get JWT Token for API Testing

## ✅ Easiest Method: Use the Test Page

I've created a test page for you!

### Step 1: Visit the Test Page

1. **Open your app**: `http://localhost:3000`
2. **Sign in** with Clerk
3. **Go to**: `http://localhost:3000/test-token`
4. **Click "Get JWT Token"**
5. **Copy the token**

### Step 2: Use in Postman

**Header**: `Authorization: Bearer YOUR_TOKEN_HERE`

## 🔧 Alternative Method: API Endpoint

### Step 1: Get Token via API

```bash
# Make sure you're logged in, then:
curl http://localhost:3000/api/get-token \
  -H "Cookie: __session=YOUR_SESSION_COOKIE"
```

This returns:

```json
{
  "token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userId": "user_xxx",
  "message": "Copy this token and use it in Postman..."
}
```

### Step 2: Use in Postman

**Header**: `Authorization: Bearer TOKEN_FROM_RESPONSE`

## 🧪 Test It

Once you have the token:

```bash
curl -X GET "http://localhost:3000/api/drafts" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

Should return your drafts!

## 📋 Quick Steps Summary

1. **Visit**: `http://localhost:3000/test-token` (while logged in)
2. **Click**: "Get JWT Token"
3. **Copy**: The token
4. **In Postman**: Add header `Authorization: Bearer TOKEN`
5. **Test**: Your API routes!

---

**Much easier than extracting cookies!** 🚀
