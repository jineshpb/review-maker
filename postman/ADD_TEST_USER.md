# Add Test User

## 🧪 Method 1: API Endpoint (Easiest)

### Request

```bash
POST http://localhost:3000/api/test/add-user
Content-Type: application/json
```

### Body

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

### Expected Response

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

## 🔧 Method 2: Node.js Script

### Install tsx (if not already installed)

```bash
npm install -D tsx
```

### Run the script

```bash
npx tsx scripts/add-test-user.ts forembeepay@gmail.com
```

**Or with a specific user ID:**

```bash
npx tsx scripts/add-test-user.ts forembeepay@gmail.com user_36KzCsOgNpHW3AT1t5Q6ynVP1FR
```

### Output

```
📝 Adding test user...
   Email: forembeepay@gmail.com
   User ID: user_test_1234567890

✅ User created successfully!
   User: { id: '...', email: '...', ... }

✅ Free tier subscription created!
   Subscription: { user_id: '...', tier: 'free', ... }

🎉 Done!
```

## 📋 What It Does

1. **Creates user record** in `users` table
2. **Creates free tier subscription** in `user_subscriptions` table
3. **Uses test user ID** format: `user_test_${timestamp}` (or provided ID)

## ⚠️ Important Notes

- **Test endpoint**: `/api/test/add-user` should be deleted before production!
- **Script**: `scripts/add-test-user.ts` is for development/testing only
- **User ID**: If you want to use a real Clerk user ID, pass it as the second argument

---

**Use Method 1 (API endpoint) for quick testing!** 🚀
