import { NextRequest, NextResponse } from "next/server";
import { inngest } from "@/lib/inngest/client";
import { createAuthenticatedClient } from "@/lib/supabase/server";
import {
  canUseAIFill,
  decrementAIFillsAvailable,
} from "@/lib/supabase/subscriptions";
import type { ReviewPlatform } from "@/types/database";

/**
 * POST /api/review/ai-generate
 * Trigger AI review generation workflow
 *
 * Body: {
 *   userPrompt: string, // Business info/prompt
 *   platforms: ReviewPlatform[], // Platforms to generate for
 *   draftId?: string // Optional: update existing draft
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const { supabase, userId } = await createAuthenticatedClient(request);

    const body = await request.json();
    const { userPrompt, platforms, draftId, tone } = body;

    // Validate input
    if (!userPrompt || typeof userPrompt !== "string") {
      return NextResponse.json(
        { error: "userPrompt is required and must be a string" },
        { status: 400 }
      );
    }

    if (!platforms || !Array.isArray(platforms) || platforms.length === 0) {
      return NextResponse.json(
        { error: "platforms is required and must be a non-empty array" },
        { status: 400 }
      );
    }

    // Validate platforms
    const validPlatforms: ReviewPlatform[] = [
      "google",
      "amazon",
      "yelp",
      "tripadvisor",
      "facebook",
      "trustpilot",
      "fiverr",
      "airbnb",
      "appstore",
      "playstore",
    ];

    const invalidPlatforms = platforms.filter(
      (p) => !validPlatforms.includes(p as ReviewPlatform)
    );
    if (invalidPlatforms.length > 0) {
      return NextResponse.json(
        { error: `Invalid platforms: ${invalidPlatforms.join(", ")}` },
        { status: 400 }
      );
    }

    // Check if user can use AI fill (subscription limit check)
    const canUse = await canUseAIFill(request);
    if (!canUse) {
      return NextResponse.json(
        {
          error: "AI fill limit reached",
          message:
            "You've used all your free AI fills. Upgrade to premium for unlimited AI fills.",
        },
        { status: 403 }
      );
    }

    // Trigger Inngest workflow
    let sendResult;
    try {
      sendResult = await inngest.send({
        name: "review/ai.generate",
        data: {
          userId,
          userPrompt,
          platforms: platforms as ReviewPlatform[],
          draftId: draftId || undefined,
          tone: tone || undefined, // Optional tone values
        },
      });
    } catch (error) {
      console.error("Failed to send Inngest event:", error);

      // Check if it's an event key error
      if (
        error instanceof Error &&
        (error.message.includes("event key") ||
          error.message.includes("INNGEST_EVENT_KEY"))
      ) {
        return NextResponse.json(
          {
            error: "Inngest configuration error",
            message:
              "INNGEST_EVENT_KEY environment variable is missing or invalid. Please check your Vercel environment variables.",
          },
          { status: 500 }
        );
      }

      throw error; // Re-throw other errors
    }

    const eventId = Array.isArray(sendResult.ids)
      ? sendResult.ids[0]
      : sendResult.ids;

    // Decrement AI fills available count (only after successful event send)
    const decrementResult = await decrementAIFillsAvailable(request);
    if (!decrementResult.success) {
      console.error(
        "Failed to decrement AI fills available:",
        decrementResult.error
      );
      // Don't fail the request, just log the error
    }

    return NextResponse.json({
      success: true,
      eventId,
      message: "AI review generation started",
    });
  } catch (error) {
    console.error("Error triggering AI generation:", error);
    return NextResponse.json(
      {
        error: "Failed to trigger AI generation",
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}
