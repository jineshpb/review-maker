import { NextRequest, NextResponse } from "next/server";
import { ensureUserExists } from "@/lib/supabase/users";
import { getUserSubscription } from "@/lib/supabase/subscriptions";

/**
 * GET /api/user/me
 * Get current authenticated user info and subscription
 *
 * For sign-in: Only checks subscription (user should already exist from webhook)
 * If user doesn't exist, returns 404 (user should be created via webhook on sign-up)
 *
 * Returns: { user, subscription }
 */
export async function GET(request: NextRequest) {
  try {
    const { createAuthenticatedClient } = await import("@/lib/supabase/server");
    const { supabase, userId } = await createAuthenticatedClient(request);

    // Get user (don't create - should exist from webhook)
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (userError) {
      if (userError.code === "PGRST116") {
        // User doesn't exist - should have been created by webhook
        // Fallback: create user (in case webhook failed)
        console.warn(`User ${userId} not found, creating as fallback`);
        const { data: fallbackUser, error: fallbackError } =
          await ensureUserExists(request);

        if (fallbackError) {
          return NextResponse.json(
            {
              error: "User not found",
              message:
                "User profile not found. Please sign up first or contact support.",
            },
            { status: 404 }
          );
        }

        // Continue with fallback user
        const { data: subscription } = await getUserSubscription(request);
        return NextResponse.json({
          user: fallbackUser,
          subscription: subscription || null,
        });
      }

      console.error("Error fetching user:", userError);
      return NextResponse.json(
        {
          error: "Failed to get user",
          message: userError.message,
        },
        { status: 500 }
      );
    }

    // Get subscription (only check, don't create - should exist from webhook)
    // But create if missing as fallback
    const { data: subscription, error: subError } = await supabase
      .from("user_subscriptions")
      .select("*")
      .eq("user_id", userId)
      .single();

    // If subscription doesn't exist, create it (fallback)
    if (subError && subError.code === "PGRST116") {
      console.warn(
        `Subscription not found for user ${userId}, creating as fallback`
      );
      const { data: newSubscription } = await getUserSubscription(request);
      return NextResponse.json({
        user,
        subscription: newSubscription || null,
      });
    }

    if (subError && subError.code !== "PGRST116") {
      console.error("Error fetching subscription:", subError);
    }

    if (subError && subError.code !== "PGRST116") {
      console.error("Error getting subscription:", subError);
      // Don't fail - subscription creation might have failed but user exists
      return NextResponse.json(
        {
          user,
          subscription: null,
          warning: "Subscription not available",
        },
        { status: 200 }
      );
    }

    return NextResponse.json({
      user,
      subscription: subscription || null,
    });
  } catch (error) {
    console.error("Get user me error:", error);

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
