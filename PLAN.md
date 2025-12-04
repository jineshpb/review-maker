# Review Screenshot Design Webapp - Planning Document

## 🎯 Project Overview

A web application that helps users design and create review screenshots (similar to Google Reviews screenshots). Users can create, customize, save, and manage review screenshots.

## 🛠️ Tech Stack Recommendation

### Frontend & Framework

- **Next.js 14** (App Router) - Server-side rendering, API routes, optimized performance
- **TypeScript** - Type safety and better developer experience
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/ui** - High-quality component library built on Radix UI

### Authentication

- **Clerk** - Modern authentication solution with pre-built UI components
  - Social logins (Google, GitHub, etc.)
  - User management
  - Session management

### Database & Backend

- **Supabase** (Recommended) ✅
  - Built on PostgreSQL (powerful relational database)
  - Built-in storage for images/screenshots
  - Real-time subscriptions (if needed)
  - Row Level Security (RLS) for data protection
  - Auto-generated REST API
  - Free tier is generous
  - Easy integration with Next.js

**Why Supabase over plain PostgreSQL?**

- Storage built-in (no need for separate S3 setup)
- Authentication integration (though we're using Clerk)
- Real-time capabilities
- Better DX with auto-generated types
- Simpler deployment

### Additional Libraries

- **html2canvas** - Convert review designs to images
- **react-hook-form** - Form handling
- **zod** - Schema validation
- **date-fns** - Date formatting

## 📊 Database Schema (Supabase/PostgreSQL)

### Tables

#### 1. `users` (managed by Clerk, but we'll sync)

- `id` (UUID, primary key) - Clerk user ID
- `email` (string)
- `username` (string, nullable)
- `avatar_url` (string, nullable)
- `created_at` (timestamp)
- `updated_at` (timestamp)

#### 2. `review_templates`

- `id` (UUID, primary key)
- `user_id` (UUID, foreign key → users.id, nullable) - NULL for system templates
- `name` (string) - Template name
- `platform` (string) - e.g., "google", "amazon", "yelp", "tripadvisor", "facebook", "trustpilot", "fiverr", "airbnb", "appstore", "playstore", "custom"
- `is_system_template` (boolean) - True for built-in platform templates
- `is_public` (boolean) - Can other users use this template?
- `template_data` (JSONB) - Store template configuration
  - Platform-specific styling
    - Colors (primary, secondary, accent)
    - Logo/branding assets
    - Font families and sizes
    - Layout structure
    - Component styles (stars, badges, etc.)
  - Customizable fields
    - Background color/image
    - Border radius
    - Shadow effects
    - Spacing
- `preview_image_url` (string, nullable) - Thumbnail for template selection
- `created_at` (timestamp)
- `updated_at` (timestamp)

#### 3. `review_screenshots`

- `id` (UUID, primary key)
- `user_id` (UUID, foreign key → users.id)
- `template_id` (UUID, foreign key → review_templates.id, nullable)
- `title` (string) - User-given name
- `review_data` (JSONB) - The actual review content
  - Reviewer name
  - Rating (1-5 stars)
  - Review text
  - Date
  - Profile picture URL
- `screenshot_url` (string) - Supabase storage URL
- `thumbnail_url` (string) - Smaller version for gallery
- `created_at` (timestamp)
- `updated_at` (timestamp)

#### 4. `saved_designs` (optional - for drafts)

- `id` (UUID, primary key)
- `user_id` (UUID, foreign key → users.id)
- `design_data` (JSONB) - Current editor state
- `is_published` (boolean)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### Storage Buckets (Supabase Storage)

- `screenshots` - Full resolution screenshots
- `thumbnails` - Thumbnail images for gallery view

## 🎨 Features Breakdown

### Core Features

#### 1. **Authentication** (Clerk)

- Sign up / Sign in
- Social authentication
- Protected routes
- User profile management

#### 2. **Dashboard**

- View all created screenshots
- Grid/list view toggle
- Search and filter
- Quick actions (edit, delete, download, share)

#### 3. **Review Editor** ⭐ **CORE FEATURE**

- **Platform Template Selection** (First step when creating a review)

  - **Popular Platform Templates** (Pre-built, ready to use):

    - **Google Reviews** - Classic Google Maps review style

      - Blue "G" logo
      - Star rating with "X years ago" timestamp
      - Profile picture circle
      - Verified purchase badge option
      - Google's signature blue accent colors (#4285F4)
      - Clean, minimal card design

    - **Amazon** - Product review style

      - "Verified Purchase" badge
      - Helpful votes counter ("X people found this helpful")
      - Product image placeholder
      - Amazon's orange accent (#FF9900)
      - Review title/headline field
      - "Top Review" badge option

    - **Yelp** - Restaurant/business review style

      - Yelp logo and branding
      - Check-in badges
      - Photo upload indicators
      - Yelp red accent color (#D32323)
      - Business category tags
      - "Elite" badge option

    - **TripAdvisor** - Travel review style

      - TripAdvisor green branding (#00AF87)
      - Travel date display
      - Room type (for hotels)
      - Traveler type badge (Family, Couples, Solo, Business)
      - Contribution level badge

    - **Facebook** - Social media review style

      - Facebook blue theme (#1877F2)
      - Like/comment indicators
      - Profile picture with name
      - Post-style layout
      - Reaction emojis

    - **Trustpilot** - Business review platform

      - Trustpilot green branding (#00B67A)
      - "Verified" badge
      - Service category
      - Professional layout
      - TrustScore display

    - **Fiverr** - Service marketplace review

      - Fiverr green accent (#1DBF73)
      - Service package info
      - Delivery time badge
      - "Level" seller badge

    - **Airbnb** - Accommodation review style

      - Airbnb red/pink branding (#FF385C)
      - Stay duration display
      - Property type indicator
      - Host response indicator

    - **App Store** - iOS app review style

      - Apple's design language
      - App version info
      - Device type indicator (iPhone, iPad)
      - iOS version compatibility

    - **Play Store** - Android app review style

      - Google Play green accent
      - Android version info
      - Device manufacturer/model
      - App version display

    - **Custom Template** - User-created templates
    - **Blank Canvas** - Start from scratch with full customization

- **Review Content Editor**

  - Reviewer name input
  - Star rating selector (1-5)
  - Review text (with character counter)
  - Review title/headline (for Amazon, etc.)
  - Date picker / "X time ago" format
  - Profile picture upload/URL
  - Platform-specific fields:
    - Verified badge toggle
    - Helpful votes count
    - Check-in/visit date
    - Travel type (TripAdvisor)
    - Service category
    - Product/service name

- **Design Customization** (Works on top of platform templates)

  - Background color/image
  - Font family, size, color
  - Layout options (card style, minimal, etc.)
  - Border radius
  - Shadow effects
  - Platform-specific styling preservation
  - Custom logo/branding override
  - Color scheme adjustments
  - Spacing and padding controls

- **Live Preview**
  - Real-time preview of the review
  - Platform-specific styling preview
  - Responsive view (mobile/desktop)
  - Export preview
  - Template comparison view

#### 4. **Screenshot Generation**

- Convert HTML/CSS design to image
- Multiple formats (PNG, JPG)
- Different resolutions
- Download functionality
- Save to Supabase storage

#### 5. **Gallery/Management**

- View all screenshots
- Organize by folders/tags (future)
- Bulk actions
- Share links (future)

### Future Enhancements

- Multiple reviews in one screenshot
- Batch generation
- Custom branding
- Export to PDF
- Social media sharing
- Templates marketplace
- Collaboration features

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────┐
│         Next.js App Router              │
├─────────────────────────────────────────┤
│                                         │
│  ┌──────────┐  ┌──────────┐           │
│  │  Pages   │  │  API     │           │
│  │  (App)   │  │  Routes  │           │
│  └──────────┘  └──────────┘           │
│       │            │                   │
│       └─────┬──────┘                   │
│             │                           │
│  ┌──────────▼──────────┐               │
│  │   Components &      │               │
│  │   Server Actions    │               │
│  └──────────┬──────────┘               │
│             │                           │
├─────────────┼───────────────────────────┤
│             │                           │
│  ┌──────────▼──────────┐               │
│  │      Clerk Auth     │               │
│  └──────────┬──────────┘               │
│             │                           │
│  ┌──────────▼──────────┐               │
│  │   Supabase Client   │               │
│  │   (PostgreSQL +     │               │
│  │    Storage)         │               │
│  └─────────────────────┘               │
└─────────────────────────────────────────┘
```

## 📁 Project Structure

```
screenshot-app/
├── app/
│   ├── (auth)/
│   │   ├── sign-in/
│   │   └── sign-up/
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   ├── editor/
│   │   └── gallery/
│   ├── api/
│   │   ├── screenshots/
│   │   └── templates/
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/              # Shadcn components
│   ├── editor/
│   │   ├── ReviewEditor.tsx
│   │   ├── PreviewPanel.tsx
│   │   ├── Toolbar.tsx
│   │   ├── PlatformSelector.tsx
│   │   └── TemplateCard.tsx
│   ├── templates/
│   │   ├── GoogleReview.tsx
│   │   ├── AmazonReview.tsx
│   │   ├── YelpReview.tsx
│   │   ├── TripAdvisorReview.tsx
│   │   ├── FacebookReview.tsx
│   │   └── [other platforms].tsx
│   ├── dashboard/
│   │   ├── ScreenshotCard.tsx
│   │   └── GalleryGrid.tsx
│   └── shared/
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   └── server.ts
│   ├── clerk.ts
│   └── utils.ts
├── types/
│   └── database.ts
├── hooks/
│   └── useScreenshot.ts
└── public/
```

## 🔐 Security Considerations

1. **Row Level Security (RLS)** in Supabase

   - Users can only access their own screenshots
   - Templates can be public or private

2. **API Route Protection**

   - Middleware to verify Clerk authentication
   - Validate user permissions

3. **Storage Security**
   - Signed URLs for private screenshots
   - Public URLs for shared screenshots

## 🚀 Implementation Steps

### Phase 1: Project Setup

1. ✅ Initialize Next.js with TypeScript
2. ✅ Configure Tailwind CSS
3. ✅ Set up Shadcn/ui components
4. ✅ Install dependencies

### Phase 2: Authentication

5. Set up Clerk
6. Create auth pages (sign-in/sign-up)
7. Add middleware for protected routes
8. Create user sync with Supabase

### Phase 3: Database Setup

9. Create Supabase project
10. Set up database schema
11. Configure RLS policies
12. Set up storage buckets
13. Generate TypeScript types

### Phase 4: Core Features

14. Create dashboard layout
15. **Build platform template components** (Google, Amazon, Yelp, etc.)
16. Create platform selector UI
17. Build review editor component with template integration
18. Implement preview panel with platform styling
19. Add screenshot generation (html2canvas)
20. Create gallery view

### Phase 5: Storage & API

19. Set up Supabase storage integration
20. Create API routes for CRUD operations
21. Implement file upload/download

### Phase 6: Polish

22. Add loading states
23. Error handling
24. Responsive design
25. Testing

## 📦 Key Dependencies

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "@clerk/nextjs": "^5.0.0",
    "@supabase/supabase-js": "^2.38.0",
    "@supabase/ssr": "^0.0.0",
    "html2canvas": "^1.4.1",
    "react-hook-form": "^7.48.0",
    "zod": "^3.22.0",
    "@hookform/resolvers": "^3.3.0",
    "date-fns": "^2.30.0",
    "lucide-react": "^0.294.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.1.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "typescript": "^5.0.0",
    "tailwindcss": "^3.3.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0"
  }
}
```

## 🎨 Platform Template Specifications

### Template Structure

Each platform template will include:

1. **Visual Design**

   - Authentic color scheme matching the platform
   - Typography (fonts, sizes, weights)
   - Layout structure (spacing, alignment)
   - Logo/branding elements
   - Icon styles

2. **Component Elements**

   - Star rating display (style varies by platform)
   - Profile picture placement and styling
   - Badge/verification indicators
   - Timestamp formatting
   - Platform-specific UI elements

3. **Data Fields**

   - Required fields (name, rating, text)
   - Platform-specific optional fields
   - Customizable metadata

4. **Responsive Design**
   - Mobile view optimization
   - Desktop view layout
   - Export dimensions

### Template Implementation

- Templates stored as React components
- JSON configuration for styling
- Easy to add new platforms
- Consistent API across all templates

### Platform Template Priority (MVP)

**Phase 1 (Must Have):**

1. ✅ Google Reviews
2. ✅ Amazon
3. ✅ Yelp

**Phase 2 (High Priority):** 4. TripAdvisor 5. Facebook 6. Trustpilot

**Phase 3 (Nice to Have):** 7. Fiverr 8. Airbnb 9. App Store 10. Play Store

### Template Selection UI

- Grid view of platform templates
- Search/filter by platform name
- Preview thumbnails
- "Most Popular" section
- Quick access to recently used templates

## 🎯 MVP Scope

**Minimum Viable Product:**

1. User authentication (Clerk)
2. **Platform template selection** (Google, Amazon, Yelp, etc.) ⭐
3. Create/edit review screenshots with platform-specific styling
4. Customization on top of templates (text, rating, colors)
5. Generate and download screenshot
6. Save to database
7. View saved screenshots in dashboard

**Nice to Have (Post-MVP):**

- Additional platform templates (TripAdvisor, Facebook, etc.)
- User-created custom templates
- Advanced styling options
- Multiple reviews per screenshot
- Sharing features
- Template marketplace

## ❓ Questions to Consider

1. **Free vs Paid Features?**

   - Limit on number of screenshots?
   - Watermark on free tier?

2. **Sharing Options?**

   - Public links?
   - Social media integration?

3. **Template System?**

   - User-created templates?
   - Template marketplace?

4. **Export Formats?**
   - PNG only or also JPG/PDF?

---

## ✅ Decision: Supabase vs PostgreSQL

**Recommendation: Supabase** ✅

**Reasons:**

- Built on PostgreSQL (same database engine)
- Built-in storage (no separate S3 setup needed)
- Better developer experience
- Free tier is generous
- Easier deployment
- Real-time capabilities if needed
- Auto-generated TypeScript types

**When to use plain PostgreSQL:**

- If you need more control over infrastructure
- If you're already using AWS/GCP
- If you need specific PostgreSQL extensions not in Supabase

For this project, **Supabase is the better choice** as it simplifies the stack while maintaining PostgreSQL's power.

---

Ready to proceed with implementation? Let me know if you'd like to adjust anything in this plan!
