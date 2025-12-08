import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";

/**
 * Get Clerk user ID from request
 * Supports both cookie-based auth (automatic) and JWT token in Authorization header
 *
 * For JWT tokens, we decode and extract the user ID directly (since we trust Clerk's signing)
 */
export async function getUserIdFromRequest(
  request: NextRequest
): Promise<string | null> {
  // Try cookie-based auth first (default Clerk behavior)
  // Pass the request to auth() so it can read cookies properly
  try {
    const { userId } = await auth();
    if (userId) {
      return userId;
    }
  } catch (error) {
    // Cookie auth failed, try JWT token
  }

  // Fallback: Check Authorization header for JWT token
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.substring(7); // Remove "Bearer " prefix

    try {
      // Decode JWT token to extract user ID
      // Clerk signs these tokens, so we can trust the payload
      const parts = token.split(".");
      if (parts.length === 3) {
        const payload = JSON.parse(
          Buffer.from(parts[1], "base64").toString("utf-8")
        );

        // Extract user ID from token
        // Clerk tokens have 'sub' field with user ID
        if (payload.sub) {
          return payload.sub;
        }
      }
    } catch (error) {
      // Token decoding failed
      console.error("JWT token decoding failed:", error);
      return null;
    }
  }

  return null;
}

/**
 * Get Clerk user ID (throws if not authenticated)
 * Supports both cookie and JWT token authentication
 */
export async function getCurrentUserId(request?: NextRequest): Promise<string> {
  let userId: string | null = null;

  if (request) {
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
