import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { auth } from "@clerk/nextjs/server";
import type { Database } from "@/types/database";
import type { NextRequest } from "next/server";
import { getUserIdFromRequest } from "@/lib/clerk/auth";

/**
 * Creates a Supabase client with Service Role Key
 *
 * This bypasses RLS (Row Level Security) since we're using Clerk for auth.
 * We'll manually validate user_id in all queries.
 *
 * ⚠️ IMPORTANT: Only use this server-side, never expose Service Role Key to client!
 */
export function createServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL is missing.\n\n" +
        "Add it to your .env.local file:\n" +
        "   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co"
    );
  }

  if (!serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is missing.\n\n" +
        "To get it:\n" +
        "1. Go to Supabase Dashboard → Settings → API\n" +
        "2. Copy the 'service_role' key (NOT the 'anon public' key)\n" +
        "3. Add it to your .env.local file:\n" +
        "   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here\n\n" +
        "⚠️ IMPORTANT: Keep this key secret! Never commit it to git."
    );
  }

  // Priority: DIRECT_URL > DASHBOARD_URL > SUPABASE_URL
  const directUrl = process.env.SUPABASE_DIRECT_URL;
  const dashboardUrl = process.env.SUPABASE_DASHBOARD_URL;

  let urlToUse: string;
  if (directUrl) {
    urlToUse = directUrl.trim().replace(/\/$/, "");
    console.log(
      `🔗 Creating Supabase client with DIRECT URL: ${urlToUse.substring(
        0,
        50
      )}...`
    );
    console.log(`   ⚡ Using direct connection (bypassing Cloudflare)`);
  } else if (dashboardUrl) {
    urlToUse = dashboardUrl.trim().replace(/\/$/, "");
    console.log(
      `🔗 Creating Supabase client with DASHBOARD URL: ${urlToUse.substring(
        0,
        50
      )}...`
    );
    console.log(`   📊 Using dashboard URL (may be different from API URL)`);
  } else {
    urlToUse = supabaseUrl.trim().replace(/\/$/, "");
    console.log(
      `🔗 Creating Supabase client with URL: ${urlToUse.substring(0, 50)}...`
    );
  }

  try {
    const client = createSupabaseClient<Database>(
      urlToUse,
      serviceRoleKey.trim(),
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    return client;
  } catch (error) {
    console.error("❌ Error creating Supabase client:", error);
    throw new Error(
      `Failed to create Supabase client: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

/**
 * Gets the current Clerk user ID
 * Throws error if not authenticated
 *
 * Supports both cookie-based auth and JWT token in Authorization header
 */
export async function getCurrentUserId(request?: NextRequest): Promise<string> {
  let userId: string | null = null;

  if (request) {
    // Try to get from request (supports both cookies and JWT tokens)
    userId = await getUserIdFromRequest(request);
  } else {
    // Fallback to cookie-based auth
    const authResult = await auth();
    userId = authResult.userId;
  }

  if (!userId) {
    throw new Error("Unauthorized: User must be authenticated");
  }

  return userId;
}

/**
 * Creates a Supabase client and validates Clerk authentication
 * Returns both the client and the user ID
 *
 * @param request - Optional NextRequest to support JWT token authentication
 */
export async function createAuthenticatedClient(request?: NextRequest) {
  const userId = await getCurrentUserId(request);
  const supabase = createServerClient();

  return { supabase, userId };
}
