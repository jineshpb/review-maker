# Validation Strategy - Review Screenshot App

## 📋 Summary

**What we're using:**

- ✅ **Zod** - For API request validation (already installed)
- ❌ **Drizzle ORM** - NOT needed (Supabase client is sufficient)
- ✅ **TypeScript types** - For compile-time type safety
- ✅ **PostgreSQL schema** - For database-level validation

## 🎯 Validation Layers

### 1. **Database Level (PostgreSQL/Supabase)**

- **Enforced by**: PostgreSQL schema
- **What it validates**: Data types, constraints, foreign keys, NOT NULL
- **Example**: `user_id TEXT NOT NULL` - database rejects NULL values
- **No code needed** - handled by Supabase

### 2. **TypeScript Types (Compile-time)**

- **Enforced by**: TypeScript compiler
- **What it validates**: Type safety during development
- **Example**: `reviewData: ReviewData` - ensures correct structure
- **Files**: `types/review.ts`, `types/database.ts`

### 3. **Zod Schemas (Runtime - API Routes)**

- **Enforced by**: Zod validation in API routes
- **What it validates**: Incoming request bodies, query params
- **Example**: Validates `POST /api/drafts` request body
- **Files**: `lib/validations/drafts.ts`, `lib/validations/screenshots.ts`

## 🔍 Why This Approach?

### ✅ Use Zod for API Routes

- **Runtime validation** - catches invalid data before it hits the database
- **Better error messages** - tells user exactly what's wrong
- **Type inference** - generates TypeScript types from schemas
- **Already installed** - no extra dependencies

### ❌ Don't Use Drizzle ORM

- **Not needed** - Supabase client is already a great ORM
- **Extra dependency** - adds complexity without benefit
- **Supabase types** - Auto-generated from database schema
- **Query builder** - Supabase client has excellent query builder

## 📝 Usage Examples

### API Route with Validation

```typescript
// app/api/drafts/route.ts
import { createDraftSchema } from "@/lib/validations";
import { z } from "zod";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body with Zod
    const validatedData = createDraftSchema.parse(body);

    // Now we know the data is valid
    const { platform, reviewData, name } = validatedData;

    // ... rest of logic
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", issues: error.errors },
        { status: 400 }
      );
    }
    // ... handle other errors
  }
}
```

### Type Safety Flow

```
Client sends request
  ↓
Zod validates (runtime) ← Catches invalid data
  ↓
TypeScript types (compile-time) ← Ensures correct structure
  ↓
Supabase client inserts
  ↓
PostgreSQL validates (database) ← Final safety net
```

## 🗂️ File Structure

```
lib/
├── validations/
│   ├── index.ts          # Central exports
│   ├── drafts.ts         # Draft validation schemas
│   └── screenshots.ts    # Screenshot validation schemas
```

## ✅ Benefits

1. **Multiple safety layers** - Database, TypeScript, Zod
2. **Better DX** - Clear error messages for developers
3. **Better UX** - Clear error messages for users
4. **Type safety** - Catch errors at compile-time
5. **Runtime safety** - Catch errors at API level
6. **No extra dependencies** - Using what we already have

## 🚫 What We're NOT Using

- **Drizzle ORM** - Supabase client is sufficient
- **Prisma** - Overkill for this project
- **Manual validation** - Zod is better
- **No validation** - Would be unsafe

## 📋 Next Steps

1. ✅ Create Zod schemas (done)
2. ⏳ Use in API routes (when we build them)
3. ⏳ Add validation to existing `/api/screenshot` route
4. ⏳ Create helper function for validation errors

## 💡 Best Practices

1. **Validate early** - In API routes, not in database
2. **Use discriminated unions** - For platform-specific validation
3. **Return clear errors** - Help users fix their mistakes
4. **Type inference** - Use `z.infer<>` for TypeScript types
5. **Reuse schemas** - Share between API routes and forms

---

**TL;DR**: Use Zod for API validation, skip Drizzle ORM, rely on Supabase client + PostgreSQL schema.
