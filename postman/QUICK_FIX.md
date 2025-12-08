# Quick Fix for 401 Error

## ✅ Your Token Looks Valid!

Your token is a proper JWT (3 parts separated by dots). The issue is likely how it's being sent.

## 🔧 Step-by-Step Fix

### 1. In Postman - Use Cookie Header (NOT Authorization)

**Header Name**: `Cookie`  
**Header Value**: `__session=eyJhbGciOiJSUzI1NiIsImNhdCI6ImNsX0I3ZDRQRDExMUFBQSIsImtpZCI6Imluc18zNkt5azZPNGNmUGxwc2xSckNWS0RCOW1vWk8iLCJ0eXAiOiJKV1QifQ.eyJhenAiOiJodHRwOi8vbG9jYWxob3N0OjMwMDAiLCJleHAiOjE3NjUxMzA3MzQsImZ2YSI6WzksLTFdLCJpYXQiOjE3NjUxMzA2NzQsImlzcyI6Imh0dHBzOi8vb24tc2t1bmstMjUuY2xlcmsuYWNjb3VudHMuZGV2IiwibmJmIjoxNzY1MTMwNjY0LCJzaWQiOiJzZXNzXzM2V2xGeUxrQ2RWVVVVS3c0WWpwdkVaZHZIZiIsInN0cyI6ImFjdGl2ZSIsInN1YiI6InVzZXJfMzZLekNzT2dOcEhXM0FUMXQ1UTZ5blZQMUZSIiwidiI6Mn0.jCyJTZosbXrJGfXkiavgJZ_bz82V0n9u8IN_ECWq0cgyjYFfBFW77hEaXuJ62tmi3kpYx5i74HlNLMWsijD_gh7xjBQTwpkalmcPqOFjGoZkhBKTXNcIPyk60Uiylk3IuTBcA6TXWo_66WtOfGOCrE0b1LbKqAU96fFHXaGXwUFWuqbRrhehmob0BXpMgE0Qnev1xst2aO5tyBmb-_sokI7FNb3qOjMU5QZKB3ve2DaRrMBYq03S8ery37RhrKO6QVav6yuY-vfAacfXjdtpmuYLylTzXkvsDdnrT3R1Tsvr34MMiAdBNKD46TptiLtwkBI6nEqExRMdTGAJLriPjg`

**Important**:

- Header name must be exactly `Cookie` (capital C)
- Value must start with `__session=`
- No spaces around the `=`

### 2. Verify in Postman

1. Open your request in Postman
2. Go to **Headers** tab
3. Make sure you have:
   - Key: `Cookie`
   - Value: `__session=YOUR_TOKEN_HERE`
4. **Remove** any `Authorization` header if present
5. Click **Send**

### 3. Check Server Logs

Look at your Next.js dev server console. You should see:

- If cookie is received: No "Unauthorized" error
- If cookie is missing: "Unauthorized: User must be authenticated"

### 4. Test with cURL (Most Reliable)

```bash
curl -X GET "http://localhost:3000/api/drafts" \
  -H "Cookie: __session=eyJhbGciOiJSUzI1NiIsImNhdCI6ImNsX0I3ZDRQRDExMUFBQSIsImtpZCI6Imluc18zNkt5azZPNGNmUGxwc2xSckNWS0RCOW1vWk8iLCJ0eXAiOiJKV1QifQ.eyJhenAiOiJodHRwOi8vbG9jYWxob3N0OjMwMDAiLCJleHAiOjE3NjUxMzA3MzQsImZ2YSI6WzksLTFdLCJpYXQiOjE3NjUxMzA2NzQsImlzcyI6Imh0dHBzOi8vb24tc2t1bmstMjUuY2xlcmsuYWNjb3VudHMuZGV2IiwibmJmIjoxNzY1MTMwNjY0LCJzaWQiOiJzZXNzXzM2V2xGeUxrQ2RWVVVVS3c0WWpwdkVaZHZIZiIsInN0cyI6ImFjdGl2ZSIsInN1YiI6InVzZXJfMzZLekNzT2dOcEhXM0FUMXQ1UTZ5blZQMUZSIiwidiI6Mn0.jCyJTZosbXrJGfXkiavgJZ_bz82V0n9u8IN_ECWq0cgyjYFfBFW77hEaXuJ62tmi3kpYx5i74HlNLMWsijD_gh7xjBQTwpkalmcPqOFjGoZkhBKTXNcIPyk60Uiylk3IuTBcA6TXWo_66WtOfGOCrE0b1LbKqAU96fFHXaGXwUFWuqbRrhehmob0BXpMgE0Qnev1xst2aO5tyBmb-_sokI7FNb3qOjMU5QZKB3ve2DaRrMBYq03S8ery37RhrKO6QVav6yuY-vfAacfXjdtpmuYLylTzXkvsDdnrT3R1Tsvr34MMiAdBNKD46TptiLtwkBI6nEqExRMdTGAJLriPjg" \
  -v
```

The `-v` flag shows all headers. Check if the Cookie header is being sent.

## 🐛 Common Mistakes

### ❌ Wrong: Using Authorization Header

```
Authorization: Bearer eyJhbGci...
```

### ✅ Correct: Using Cookie Header

```
Cookie: __session=eyJhbGci...
```

### ❌ Wrong: Missing `__session=` prefix

```
Cookie: eyJhbGci...
```

### ✅ Correct: With `__session=` prefix

```
Cookie: __session=eyJhbGci...
```

## 🔍 Debug: Check What Clerk Sees

Add this temporary debug endpoint to see what Clerk receives:

```typescript
// app/api/debug/route.ts (temporary)
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { userId } = await auth();
  const cookies = request.headers.get("cookie");

  return NextResponse.json({
    userId,
    cookies: cookies || "No cookies",
    hasSessionCookie: cookies?.includes("__session") || false,
  });
}
```

Then test:

```bash
curl -X GET "http://localhost:3000/api/debug" \
  -H "Cookie: __session=YOUR_TOKEN" \
  -v
```

This will show if Clerk is receiving the cookie.

## ⚠️ Token Expiration

Your token has an expiration: `"exp":1765130734`

Check if it's expired:

```javascript
// In browser console
const token = "YOUR_TOKEN_HERE";
const payload = JSON.parse(atob(token.split(".")[1]));
const expDate = new Date(payload.exp * 1000);
console.log("Expires:", expDate);
console.log("Is expired?", expDate < new Date());
```

If expired, get a fresh token from browser.

---

**Still not working?** Share:

1. Postman request headers screenshot
2. Server console error message
3. Response from `/api/debug` endpoint
