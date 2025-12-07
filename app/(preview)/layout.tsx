/**
 * Root layout for preview route group - completely replaces app/layout.tsx
 *
 * This layout ensures Playwright only captures the review component,
 * without the app navbar or other UI elements.
 *
 * Route group (preview) creates a separate layout tree that doesn't
 * inherit from app/layout.tsx, so no Header will render.
 */
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Review Preview",
};

export default async function PreviewRootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<Record<string, never>>;
}) {
  // Await params even though it's empty (required by Next.js type system)
  await params;

  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-white flex items-center justify-center p-8">
          {children}
        </div>
      </body>
    </html>
  );
}
