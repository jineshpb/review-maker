# Review Screenshot Designer

A Next.js web application that helps users design and create authentic review screenshots for popular platforms like Google, Amazon, Yelp, and more.

## 🚀 Features

- **Platform Templates**: Pre-built templates for popular review platforms (Google, Amazon, Yelp, TripAdvisor, etc.)
- **Customization**: Customize colors, fonts, layouts, and more
- **Screenshot Generation**: Convert designs to high-quality images
- **User Authentication**: Secure authentication with Clerk
- **Dashboard**: Manage and organize your review screenshots

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 (with oklch colors)
- **Authentication**: Clerk
- **Database**: Supabase (PostgreSQL)
- **UI Components**: Shadcn/ui
- **Screenshot**: html2canvas

## 📦 Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd screenshot-app
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
   - Copy `.env.example` to `.env.local`
   - Fill in your Clerk and Supabase credentials

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔧 Environment Variables

Create a `.env.local` file with the following variables:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## 📁 Project Structure

```
screenshot-app/
├── app/
│   ├── (auth)/          # Authentication pages
│   ├── (dashboard)/     # Protected dashboard pages
│   ├── api/             # API routes
│   ├── globals.css      # Global styles
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Home page
├── components/          # React components
├── lib/                 # Utility functions and clients
├── types/               # TypeScript type definitions
└── public/              # Static assets
```

## 🚧 Development Status

This project is currently in development. Core features are being implemented.

## 📝 License

ISC

