# Quick: Add Test User

## 🚀 Easiest Method: API Endpoint

```bash
POST http://localhost:3000/api/test/add-user
Content-Type: application/json

{
  "email": "forembeepay@gmail.com"
}
```

That's it! ✅

---

## 📋 What It Creates

1. ✅ User record in `users` table
2. ✅ Free tier subscription in `user_subscriptions` table

## 🔍 Verify It Worked

```bash
GET http://localhost:3000/api/user/limits
Header: Authorization: Bearer YOUR_JWT_TOKEN
```

Should show your user's limits!

---

**Use Postman or curl to test!** 🚀
