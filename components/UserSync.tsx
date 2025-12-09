"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";

/**
 * Client component that syncs user to Supabase after sign-up/sign-in
 *
 * This is a simpler alternative to webhooks for local development.
 * Just add this component to your dashboard or protected pages.
 */
export const UserSync = () => {
  const { isSignedIn, user } = useUser();

  console.log("isSignedIn", isSignedIn);
  console.log("user", user);

  useEffect(() => {
    if (isSignedIn && user) {
      // Sync user to Supabase (creates user + subscription if needed)
      fetch("/api/user/me")
        .then((res) => res.json())
        .then((data) => {
          if (data.user) {
            console.log("✅ User synced:", data.user.id);
          }
        })
        .catch((error) => {
          console.error("Error syncing user:", error);
        });
    }
  }, [isSignedIn, user]);

  // This component doesn't render anything
  return null;
};
