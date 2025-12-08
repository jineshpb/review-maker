import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * Get JWT token for current user (for API testing)
 * DELETE THIS ENDPOINT BEFORE PRODUCTION!
 *
 * Usage: GET /api/get-token
 * Returns: { token: "your_jwt_token" }
 */
export async function GET(request: NextRequest) {
  try {
    const { getToken, userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Not authenticated", message: "You must be logged in" },
        { status: 401 }
      );
    }

    // Get the JWT token
    const token = await getToken();

    if (!token) {
      return NextResponse.json(
        { error: "Token not available", message: "Could not generate token" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      token,
      userId,
      message:
        "Copy this token and use it in Postman as: Authorization: Bearer TOKEN",
    });
  } catch (error) {
    console.error("Get token error:", error);
    return NextResponse.json(
      {
        error: "Failed to get token",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
