import { NextRequest, NextResponse } from "next/server";
import { createDraftSchema } from "@/lib/validations";
import {
  getUserDrafts,
  createDraft,
  getDraftCount,
} from "@/lib/supabase/drafts";
import { canCreateDraft } from "@/lib/supabase/subscriptions";
import { z } from "zod";

/**
 * GET /api/drafts
 * Fetch all drafts for the current user
 * Query params: ?platform=google (optional filter)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const platform = searchParams.get("platform") || undefined;

    const { data, error } = await getUserDrafts(platform, request);

    if (error) {
      console.error("Error fetching drafts:", error);
      return NextResponse.json(
        { error: "Failed to fetch drafts", message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: data || [] });
  } catch (error) {
    console.error("Drafts API error:", error);
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
 * POST /api/drafts
 * Create a new draft
 * Body: { platform, reviewData, name? }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body with Zod
    const validationResult = createDraftSchema.safeParse(body);
    if (!validationResult.success) {
      console.error("Validation failed:", validationResult.error.issues);
      console.error("Received body:", JSON.stringify(body, null, 2));
      return NextResponse.json(
        {
          error: "Validation failed",
          message: "Invalid draft data",
          issues: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const { platform, reviewData, name } = validationResult.data;

    // Check if user can create more drafts (premium tier limit)
    const canCreate = await canCreateDraft(request);
    if (!canCreate) {
      return NextResponse.json(
        {
          error: "Draft limit reached",
          message:
            "You've reached your draft limit. Upgrade to premium for unlimited drafts.",
        },
        { status: 403 }
      );
    }

    // Create draft
    const { data, error } = await createDraft(
      {
        platform,
        review_data: reviewData as any, // Type assertion needed until types are regenerated
        name: name || null,
      },
      request
    );

    if (error) {
      console.error("Error creating draft:", error);
      return NextResponse.json(
        { error: "Failed to create draft", message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error("Create draft API error:", error);
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
