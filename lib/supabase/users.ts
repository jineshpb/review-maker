import { createAuthenticatedClient } from "./server";
import { clerkClient } from "@clerk/nextjs/server";
import type { Database } from "@/types/database";
import type { NextRequest } from "next/server";

type UserInsert = Database["public"]["Tables"]["users"]["Insert"];

/**
 * Ensure user exists in users table
 * Creates user record if it doesn't exist, updates if it does
 * This should be called whenever a user authenticates
 */
export async function ensureUserExists(
  request?: NextRequest
): Promise<{ data: any; error: any }> {
  const { supabase, userId } = await createAuthenticatedClient(request);

  // Check if user already exists
  const { data: existingUser, error: fetchError } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  // If user exists, return it
  if (existingUser && !fetchError) {
    return { data: existingUser, error: null };
  }

  // If user doesn't exist, fetch from Clerk and create
  try {
    const clerk = await clerkClient();
    const clerkUser = await clerk.users.getUser(userId);

    const userData: UserInsert = {
      id: userId,
      email: clerkUser.emailAddresses[0]?.emailAddress || "",
      username: clerkUser.username || clerkUser.firstName || null,
      avatar_url: clerkUser.imageUrl || null,
    };

    const { data, error } = await supabase
      .from("users")
      .insert(userData as any)
      .select()
      .single();

    return { data, error };
  } catch (clerkError) {
    console.error("Error fetching user from Clerk:", clerkError);
    // Fallback: create user with minimal data
    const userData: UserInsert = {
      id: userId,
      email: "", // Will be empty if we can't fetch from Clerk
      username: null,
      avatar_url: null,
    };

    const { data, error } = await supabase
      .from("users")
      .insert(userData as any)
      .select()
      .single();

    return { data, error };
  }
}
