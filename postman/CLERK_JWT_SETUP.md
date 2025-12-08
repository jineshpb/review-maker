# Using Clerk JWT Tokens for API Testing

## ✅ Better Solution: Use JWT Tokens!

Instead of extracting cookies, you can use **JWT tokens** directly from Clerk. This is much easier for API testing.

## 🔑 How to Get JWT Token

### Option 1: From Your App (Easiest)

Add this to any page component to get the token:

```typescript
// In a React component
import { useAuth } from "@clerk/nextjs";

const { getToken } = useAuth();

// Get the token
const token = await getToken();
console.log("JWT Token:", token);
```

Copy the token from console and use it in Postman.

### Option 2: From Clerk Dashboard

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your application
3. Go to **Users** → Find your user
4. Go to **Sessions** tab
5. Find active session → **Copy Session Token**

## 🧪 Using in Postman

### Method 1: Authorization Header (Recommended!)

**Header Name**: `Authorization`  
**Header Value**: `Bearer YOUR_JWT_TOKEN_HERE`

Example:
```
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Method 2: Cookie Header (Still Works)

**Header Name**: `Cookie`  
**Header Value**: `__session=YOUR_TOKEN_HERE`

## ✅ Updated Code

I've updated the API routes to support **both**:
- ✅ Cookie-based auth (automatic, for browser)
- ✅ JWT token in Authorization header (for Postman)

The code now:
1. Tries cookie auth first
2. Falls back to JWT token in `Authorization: Bearer` header
3. Extracts user ID from token payload

## 🧪 Test It

### With JWT Token (Authorization Header)

```bash
curl -X GET "http://localhost:3000/api/drafts" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### With Cookie (Still Works)

```bash
curl -X GET "http://localhost:3000/api/drafts" \
  -H "Cookie: __session=YOUR_TOKEN"
```

## 📋 Quick Steps

1. **Get JWT token** from your app (console.log) or Clerk Dashboard
2. **In Postman**, use `Authorization: Bearer TOKEN` header
3. **Test your API** - should work now!

---

**This is much easier than extracting cookies!** 🚀

