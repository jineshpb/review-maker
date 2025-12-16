import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import Header from "@/components/Header";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title:
    "ReviewPicasso - Create Authentic Review Screenshots | Google, Trustpilot, Amazon",
  description:
    "Create authentic review screenshots for Google Reviews, Trustpilot, Amazon, TripAdvisor and more. AI-powered review generator with customizable templates. Free trial, no credit card required.",
  keywords: [
    "review screenshot",
    "review screenshot generator",
    "google review screenshot",
    "trustpilot screenshot",
    "amazon review screenshot",
    "tripadvisor screenshot",
    "fake review screenshot",
    "review mockup",
    "testimonial screenshot",
    "review design tool",
  ],
  openGraph: {
    title: "ReviewPicasso - Create Authentic Review Screenshots",
    description:
      "Create authentic review screenshots for Google Reviews, Trustpilot, Amazon, TripAdvisor and more. AI-powered review generator with customizable templates.",
    type: "website",
    // Add your actual URL when deployed
    // url: "https://reviewpicasso.com",
    // images: [{ url: "https://reviewpicasso.com/og-image.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "ReviewPicasso - Create Authentic Review Screenshots",
    description:
      "Create authentic review screenshots for Google Reviews, Trustpilot, Amazon, TripAdvisor and more.",
    // Add your Twitter handle when available
    // creator: "@reviewpicasso",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          {children}
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
