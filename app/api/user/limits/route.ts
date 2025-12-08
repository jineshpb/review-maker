import { NextRequest, NextResponse } from "next/server";
import { getUserLimits } from "@/lib/supabase/subscriptions";

/**
 * GET /api/user/limits
 * Get current user's tier and usage
 * Returns: { tier, limits: { drafts, screenshots, storage } }
 */
export async function GET(request: NextRequest) {
  try {
    const limits = await getUserLimits(request);

    return NextResponse.json(limits);
  } catch (error) {
    console.error("Get user limits API error:", error);
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
