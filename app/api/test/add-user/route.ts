import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

/**
 * Test endpoint to add a user to the users table
 * DELETE THIS BEFORE PRODUCTION!
 *
 * Usage: POST /api/test/add-user
 * Body: { email: "user@example.com", userId?: "user_xxx" }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, userId } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const supabase = createServerClient();
    const testUserId = userId || `user_test_${Date.now()}`;

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("*")
      .eq("id", testUserId)
      .single();

    if (existingUser) {
      return NextResponse.json({
        message: "User already exists",
        user: existingUser,
      });
    }

    // Create user record
    const { data: user, error: userError } = await supabase
      .from("users")
      .insert({
        id: testUserId,
        email: email,
        username: email.split("@")[0],
        avatar_url: null,
      })
      .select()
      .single();

    if (userError) {
      return NextResponse.json(
        { error: "Failed to create user", message: userError.message },
        { status: 500 }
      );
    }

    // Create free tier subscription
    const { data: subscription, error: subError } = await supabase
      .from("user_subscriptions")
      .insert({
        user_id: testUserId,
        tier: "free",
        status: "active",
      })
      .select()
      .single();

    return NextResponse.json({
      message: "User created successfully",
      user,
      subscription: subscription || { error: subError?.message },
    });
  } catch (error) {
    console.error("Add test user error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
