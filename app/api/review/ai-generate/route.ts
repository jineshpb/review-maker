import { NextRequest, NextResponse } from "next/server";
import { inngest } from "@/lib/inngest/client";
import { createAuthenticatedClient } from "@/lib/supabase/server";
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
    const { userPrompt, platforms, draftId } = body;

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

    // Trigger Inngest workflow
    const eventId = await inngest.send({
      name: "review/ai.generate",
      data: {
        userId,
        userPrompt,
        platforms: platforms as ReviewPlatform[],
        draftId: draftId || undefined,
      },
    });

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

