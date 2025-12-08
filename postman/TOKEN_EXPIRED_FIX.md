# Token Expired - Quick Fix

## 🔍 The Problem

Your debug response shows:
- ✅ Cookie is being sent
- ✅ Cookie is being received  
- ❌ But `authenticated: false`

**The token is EXPIRED!** Even though it expires in 2025, Clerk might be rejecting it for other reasons.

## ✅ Solution: Get a Fresh Token

### Step 1: Get Fresh Cookie from Browser

1. **Open your app**: `http://localhost:3000`
2. **Sign out** (if logged in)
3. **Sign in again** with Clerk
4. **Immediately** open DevTools (F12)
5. **Application** → **Cookies** → `http://localhost:3000`
6. **Copy the `__session` cookie value** (get it fresh!)

### Step 2: Use in Postman

**Header**: `Cookie: __session=FRESH_TOKEN_HERE`

### Step 3: Test Again

Hit `/api/debug` again and check:
- `authenticated: true` ✅
- `userId: "user_xxx"` ✅

## 🔍 Enhanced Debug Endpoint

I've updated `/api/debug` to show:
- Token expiration date
- If token is expired
- User ID from token
- Clerk configuration status

**Test it again** with a fresh token and check the `tokenInfo` field in the response.

## ⚠️ Why This Happens

1. **Token expires** - Sessions have expiration times
2. **Token invalidated** - If you signed out, token is invalid
3. **Token from different session** - Old browser session

## 🎯 Quick Test

After getting a fresh token, test:

```bash
curl -X GET "http://localhost:3000/api/debug" \
  -H "Cookie: __session=FRESH_TOKEN" \
  -v
```

Check the response:
- `tokenInfo.isExpired` should be `false`
- `authenticated` should be `true`
- `userId` should not be `null`

---

**Get a fresh token and try again!** 🚀

