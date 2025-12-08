# Debugging Clerk Session Issues

## 🔍 The Problem

Clerk's `auth()` function reads from **cookies automatically**. You don't need to manually pass a session ID - it reads the `__session` cookie from the request.

## ✅ Correct Way to Get Session Cookie

### Method 1: Browser DevTools (Most Reliable)

1. **Open your app**: `http://localhost:3000`
2. **Sign in** with Clerk
3. **Open DevTools** (F12)
4. **Go to Application tab** → **Cookies** → `http://localhost:3000`
5. **Find `__session` cookie**
6. **Copy the ENTIRE value** (it's a long JWT string)

**Important**:

- Use `__session` (NOT `__clerk_db_jwt`)
- Copy the ENTIRE value (it's very long, starts with `eyJ...`)

### Method 2: Network Tab (Alternative)

1. **Open DevTools** → **Network tab**
2. **Navigate to dashboard** or any authenticated page
3. **Find any request** (e.g., `GET /dashboard`)
4. **Click on it** → **Headers tab**
5. **Scroll to "Request Headers"**
6. **Find**: `Cookie: __session=eyJ...`
7. **Copy the entire value after `__session=`**

## 🧪 Testing in Postman

### Step 1: Get Cookie Value

From browser DevTools, copy the `__session` cookie value.

### Step 2: Set in Postman

**Option A: Cookie Header (Recommended)**

```
Header Name: Cookie
Header Value: __session=YOUR_FULL_COOKIE_VALUE_HERE
```

**Option B: Postman Cookie Manager**

1. In Postman, click **Cookies** link (under Send button)
2. Add cookie:
   - Domain: `localhost`
   - Path: `/`
   - Name: `__session`
   - Value: `YOUR_FULL_COOKIE_VALUE_HERE`
3. Click **Save**

### Step 3: Test Request

```
GET http://localhost:3000/api/drafts
Headers:
  Cookie: __session=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 🐛 Common Issues

### Issue 1: Cookie Value is Truncated

**Symptom**: Cookie value looks incomplete or short

**Solution**:

- Make sure you copied the ENTIRE value
- Cookie values are usually 1000+ characters long
- They start with `eyJ` (base64 encoded JWT)

### Issue 2: Cookie Expired

**Symptom**: Works in browser but not in Postman

**Solution**:

- Cookies expire after some time
- Get a fresh cookie from browser
- Make sure you're logged in when copying

### Issue 3: Wrong Cookie Name

**Symptom**: Using `__clerk_db_jwt` instead of `__session`

**Solution**:

- Use `__session` cookie ONLY
- `__clerk_db_jwt` is for database access, not API auth

### Issue 4: Cookie Not Being Sent

**Symptom**: Still getting 401 even with correct cookie

**Solution**:

- Check Postman settings: **Settings** → **General** → Enable "Automatically follow redirects"
- Make sure cookie header format is correct: `Cookie: __session=VALUE`
- Try using Postman's Cookie Manager instead of manual header

## 🔍 Debugging Steps

### 1. Verify Cookie in Browser

```javascript
// Run in browser console (on your app page)
// Copy and paste this ENTIRE block:

const sessionCookie = document.cookie.split(";").find(function (c) {
  return c.trim().startsWith("__session=");
});

if (sessionCookie) {
  const value = sessionCookie.split("=")[1];
  console.log("✅ Cookie found!");
  console.log("Length:", value.length);
  console.log("First 50 chars:", value.substring(0, 50));
  console.log("Full value:", value);

  // Copy to clipboard
  navigator.clipboard
    .writeText(value)
    .then(function () {
      console.log("✅ Cookie copied to clipboard! Paste it in Postman.");
    })
    .catch(function () {
      console.log("❌ Could not copy. Manually copy the value above.");
    });
} else {
  console.log("❌ No __session cookie found. Make sure you are logged in.");
}
```

This will show your `__session` cookie and copy it to clipboard.

### 2. Check Clerk Middleware

Make sure `proxy.ts` (middleware) is configured correctly:

```typescript
// proxy.ts should have this
export default clerkMiddleware();
```

### 3. Test with cURL (More Reliable)

```bash
# Get cookie from browser, then:
curl -X GET "http://localhost:3000/api/drafts" \
  -H "Cookie: __session=YOUR_FULL_COOKIE_VALUE" \
  -v
```

The `-v` flag shows all headers being sent.

### 4. Check Server Logs

Look at your Next.js dev server console. You should see:

- If cookie is missing: Error about "Unauthorized"
- If cookie is invalid: Clerk validation errors

## 📋 Quick Checklist

- [ ] Signed in to app in browser
- [ ] Copied `__session` cookie (NOT `__clerk_db_jwt`)
- [ ] Copied ENTIRE cookie value (long string starting with `eyJ`)
- [ ] Cookie is fresh (not expired)
- [ ] Using `Cookie: __session=VALUE` header in Postman
- [ ] Next.js dev server is running
- [ ] Clerk middleware is configured

## 🎯 Quick Copy Script (Fixed)

Run this in your browser console to get and copy the cookie:

```javascript
(function () {
  const cookies = document.cookie.split(";");
  const sessionCookie = cookies.find(function (c) {
    return c.trim().startsWith("__session=");
  });

  if (sessionCookie) {
    const value = sessionCookie.split("=")[1];
    console.log("✅ Cookie found! Length:", value.length);
    console.log("First 50 chars:", value.substring(0, 50));

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(value).then(function () {
        console.log("✅ Cookie copied to clipboard!");
      });
    } else {
      console.log("Copy this value:", value);
    }
  } else {
    console.log("❌ No __session cookie. Make sure you are logged in.");
  }
})();
```

## 🎯 Alternative: Use Clerk's Test Mode

If you're still having issues, you can temporarily bypass auth for testing:

**⚠️ Only for development!**

```typescript
// lib/supabase/server.ts (temporary)
export async function getCurrentUserId(): Promise<string> {
  const { userId } = await auth();

  // TEMPORARY: For testing only
  if (!userId && process.env.NODE_ENV === "development") {
    return "test-user-id"; // Hardcode for testing
  }

  if (!userId) {
    throw new Error("Unauthorized: User must be authenticated");
  }

  return userId;
}
```

**Remove this before production!**

---

**Still stuck?** Share:

1. The cookie value length (should be 1000+ chars)
2. Postman request headers screenshot
3. Server console error message
