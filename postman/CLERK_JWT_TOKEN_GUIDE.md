# Using Clerk JWT Tokens for API Testing

## 🎯 Better Approach: Use JWT Tokens from Clerk

Instead of extracting cookies, you can use **JWT tokens** that Clerk generates. This is more reliable for API testing.

## 🔑 How to Get JWT Token from Clerk

### Option 1: From Clerk Dashboard (Recommended)

1. **Go to Clerk Dashboard**: [https://dashboard.clerk.com](https://dashboard.clerk.com)
2. **Select your application**
3. **Go to**: **API Keys** or **JWT Templates**
4. **Create a JWT Template** (if needed):
   - Name: `api-testing`
   - Token lifetime: `1 hour` (or as needed)
   - Claims: Include `sub` (user ID)
5. **Generate token** for a specific user
6. **Copy the token**

### Option 2: From Your App (Programmatic)

You can also get the token from your app's frontend:

```typescript
// In your React component
import { useAuth } from "@clerk/nextjs";

const { getToken } = useAuth();

// Get the token
const token = await getToken();
console.log("JWT Token:", token);
```

Then use this token in Postman.

## 🧪 Using JWT Token in Postman

### Method 1: Authorization Header (Easier!)

**Header Name**: `Authorization`  
**Header Value**: `Bearer YOUR_JWT_TOKEN_HERE`

Example:

```
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Method 2: Cookie Header (Still Works)

**Header Name**: `Cookie`  
**Header Value**: `__session=YOUR_TOKEN_HERE`

## ✅ Updated API Routes

I've updated the API routes to support **both**:

- ✅ Cookie-based auth (automatic, for browser)
- ✅ JWT token in Authorization header (for Postman/testing)

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

1. **Get JWT token** from Clerk Dashboard or your app
2. **In Postman**, use `Authorization: Bearer TOKEN` header
3. **Test your API** - should work now!

---

**This is much easier than extracting cookies!** 🚀
