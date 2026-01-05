import { NextRequest, NextResponse } from "next/server";
import { createAuthenticatedClient } from "@/lib/supabase/server";
import { syncEntitlementsFromSubscription } from "@/lib/entitlements/init";

/**
 * POST /api/subscription/sync-entitlements
 * Manually sync entitlements from user_subscriptions table
 * Useful when entitlements get out of sync
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await createAuthenticatedClient(request);

    const result = await syncEntitlementsFromSubscription(userId);

    if (!result.success) {
      return NextResponse.json(
        {
          error: "Failed to sync entitlements",
          message: result.error || "Unknown error",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Entitlements synced successfully",
    });
  } catch (error) {
    console.error("Sync entitlements error:", error);

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
