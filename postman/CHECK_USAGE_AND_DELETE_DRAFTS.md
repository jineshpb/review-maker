# Check Usage & Delete Drafts

## ✅ Your Authentication is Working!

The error means you've reached the **free tier limit of 5 drafts**. Here's how to check and manage them:

## 📊 Check Your Current Usage

### Get Your Limits

```bash
GET http://localhost:3000/api/user/limits
Header: Authorization: Bearer YOUR_JWT_TOKEN
```

**Response:**

```json
{
  "tier": "free",
  "limits": {
    "drafts": {
      "max": 5,
      "used": 5 // ← You have 5 drafts
    },
    "screenshots": {
      "max": 10,
      "used": 0
    },
    "storage": {
      "max": 104857600,
      "used": 0
    }
  }
}
```

## 📋 List Your Drafts

### Get All Drafts

```bash
GET http://localhost:3000/api/drafts
Header: Authorization: Bearer YOUR_JWT_TOKEN
```

**Response:**

```json
{
  "data": [
    {
      "id": "uuid-1",
      "name": "Google Review Draft",
      "platform": "google",
      "created_at": "2025-01-15T10:00:00Z",
      ...
    },
    {
      "id": "uuid-2",
      "name": "Amazon Review",
      "platform": "amazon",
      ...
    }
    // ... up to 5 drafts
  ]
}
```

## 🗑️ Delete Drafts

### Delete a Single Draft

```bash
DELETE http://localhost:3000/api/drafts/{draft_id}
Header: Authorization: Bearer YOUR_JWT_TOKEN
```

**Example:**

```bash
DELETE http://localhost:3000/api/drafts/123e4567-e89b-12d3-a456-426614174000
Header: Authorization: Bearer YOUR_JWT_TOKEN
```

**Response:**

```json
{
  "message": "Draft deleted successfully"
}
```

## 🔄 Quick Workflow

1. **Check usage**: `GET /api/user/limits`
2. **List drafts**: `GET /api/drafts`
3. **Delete unwanted drafts**: `DELETE /api/drafts/{id}`
4. **Create new draft**: `POST /api/drafts` (should work now!)

## 💡 Tips

- **Free tier**: 5 drafts max
- **Delete old drafts** you don't need
- **Premium tier** (when implemented): Unlimited drafts

---

**Your API is working perfectly!** Just need to manage your drafts. 🚀
