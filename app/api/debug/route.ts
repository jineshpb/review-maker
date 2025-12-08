import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * Debug endpoint to check Clerk authentication
 * DELETE THIS FILE BEFORE PRODUCTION!
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await auth();
    const { userId, sessionId, getToken } = authResult;
    const cookies = request.headers.get("cookie");

    // Try to get JWT token
    let jwtToken = null;
    try {
      jwtToken = await getToken();
    } catch (e) {
      // Token not available
    }

    // Check for __session cookie specifically
    const sessionCookie = cookies
      ?.split(";")
      .find((c) => c.trim().startsWith("__session="));

    // Decode token to check expiration
    let tokenInfo = null;
    if (sessionCookie) {
      try {
        const tokenValue = sessionCookie.split("=")[1];
        const parts = tokenValue.split(".");
        if (parts.length === 3) {
          const payload = JSON.parse(
            Buffer.from(parts[1], "base64").toString("utf-8")
          );
          const expDate = new Date(payload.exp * 1000);
          const now = new Date();
          tokenInfo = {
            userId: payload.sub,
            expires: expDate.toISOString(),
            isExpired: expDate < now,
            issuer: payload.iss,
            sessionId: payload.sid,
          };
        }
      } catch (e) {
        tokenInfo = { error: "Failed to decode token" };
      }
    }

    return NextResponse.json(
      {
        authenticated: !!userId,
        userId: userId || null,
        sessionId: sessionId || null,
        jwtToken: jwtToken || null,
        jwtTokenPreview: jwtToken ? `${jwtToken.substring(0, 50)}...` : null,
        hasCookies: !!cookies,
        cookieCount: cookies?.split(";").length || 0,
        hasSessionCookie: !!sessionCookie,
        sessionCookieLength: sessionCookie?.split("=")[1]?.length || 0,
        sessionCookiePreview: sessionCookie
          ? `${sessionCookie.split("=")[1]?.substring(0, 50)}...`
          : null,
        tokenInfo,
        allCookies: cookies || "No cookies",
        headers: {
          cookie: cookies || "No cookie header",
          authorization:
            request.headers.get("authorization") || "No auth header",
        },
        clerkConfig: {
          hasPublishableKey: !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
          hasSecretKey: !!process.env.CLERK_SECRET_KEY,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
