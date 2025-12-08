# Self-Hosted Supabase Setup

## ✅ Your Setup

You're using a **self-hosted Supabase instance** at:

- URL: `https://supabasekong-o8cog800s888gkk8wgkkoo8g.jdawg.xyz`

## 🔧 Connection Issues

If you're getting "no available server" errors:

### 1. **Use the API Endpoint Instead** (Recommended)

The API endpoint uses your Next.js server, which already has working Supabase connections:

```bash
POST http://localhost:3000/api/test/add-user
Content-Type: application/json

{
  "email": "forembeepay@gmail.com"
}
```

**Why this works better:**

- Uses your existing server configuration
- Already tested and working
- No need to parse .env.local manually

### 2. **Check Self-Hosted Instance**

Verify your Supabase instance is:

- ✅ Running and accessible
- ✅ URL is correct
- ✅ SSL certificate is valid (if using HTTPS)
- ✅ Network/firewall allows connections

### 3. **Test Connection**

Try accessing your Supabase URL in a browser:

```
https://supabasekong-o8cog800s888gkk8wgkkoo8g.jdawg.xyz
```

Should show Supabase dashboard or API info.

## 🚀 Quick Solution

**Just use the API endpoint** - it's easier and already working! 🎯

```bash
POST http://localhost:3000/api/test/add-user
```

---

**The API endpoint is the best option for self-hosted instances!** ✅
