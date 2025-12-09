import { NextRequest, NextResponse } from "next/server";
import { ensureUserExists } from "@/lib/supabase/users";
import { getUserSubscription } from "@/lib/supabase/subscriptions";

/**
 * POST /api/user/sync
 * Sync user data on first login or whenever needed
 * 
 * This endpoint:
 * 1. Ensures user exists in users table (creates from Clerk if needed)
 * 2. Ensures user has a free tier subscription (creates if missing)
 * 
 * Returns: { user, subscription }
 * 
 * Usage: Call this after user signs in or on app load
 */
export async function POST(request: NextRequest) {
  try {
    // Ensure user exists (creates from Clerk if needed)
    const { data: user, error: userError } = await ensureUserExists(request);

    if (userError) {
      console.error("Error ensuring user exists:", userError);
      return NextResponse.json(
        {
          error: "Failed to sync user",
          message: userError.message || "Could not create/update user",
        },
        { status: 500 }
      );
    }

    // Ensure subscription exists (creates free tier if missing)
    const { data: subscription, error: subError } = await getUserSubscription(request);

    if (subError) {
      console.error("Error getting/creating subscription:", subError);
      // Don't fail the request if subscription creation fails
      // User was created successfully, subscription can be retried
      return NextResponse.json(
        {
          user,
          subscription: null,
          warning: "User synced but subscription creation failed",
          error: subError.message,
        },
        { status: 200 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "User synced successfully",
      user,
      subscription,
    });
  } catch (error) {
    console.error("Sync user error:", error);
    
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json(
        { error: "Unauthorized", message: "You must be logged in" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/user/sync
 * Get current user info and subscription (without creating)
 * 
 * Returns: { user, subscription }
 */
export async function GET(request: NextRequest) {
  try {
    const { createAuthenticatedClient } = await import("@/lib/supabase/server");
    const { supabase, userId } = await createAuthenticatedClient(request);

    // Get user
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (userError) {
      if (userError.code === "PGRST116") {
        // User doesn't exist, return 404
        return NextResponse.json(
          {
            error: "User not found",
            message: "User profile not found. Please sync your account first.",
          },
          { status: 404 }
        );
      }
      
      console.error("Error fetching user:", userError);
      return NextResponse.json(
        {
          error: "Failed to fetch user",
          message: userError.message,
        },
        { status: 500 }
      );
    }

    // Get subscription
    const { data: subscription, error: subError } = await supabase
      .from("user_subscriptions")
      .select("*")
      .eq("user_id", userId)
      .single();

    // Subscription not found is OK (will be created on sync)
    if (subError && subError.code !== "PGRST116") {
      console.error("Error fetching subscription:", subError);
    }

    return NextResponse.json({
      user,
      subscription: subscription || null,
    });
  } catch (error) {
    console.error("Get user sync error:", error);
    
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json(
        { error: "Unauthorized", message: "You must be logged in" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

