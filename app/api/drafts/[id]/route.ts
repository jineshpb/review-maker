import { NextRequest, NextResponse } from "next/server";
import { getDraftById, updateDraft, deleteDraft } from "@/lib/supabase/drafts";
import { updateDraftSchema } from "@/lib/validations";

/**
 * GET /api/drafts/[id]
 * Fetch a single draft by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Draft ID is required" },
        { status: 400 }
      );
    }

    const { data, error } = await getDraftById(id);

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Draft not found" }, { status: 404 });
      }
      console.error("Error fetching draft:", error);
      return NextResponse.json(
        { error: "Failed to fetch draft", message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Get draft API error:", error);
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
 * PUT /api/drafts/[id]
 * Update an existing draft
 * Body: { reviewData?, name? }
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Draft ID is required" },
        { status: 400 }
      );
    }

    // Validate request body with Zod
    const validationResult = updateDraftSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          issues: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const updates: any = {};
    if (validationResult.data.reviewData) {
      updates.review_data = validationResult.data.reviewData;
    }
    if (validationResult.data.name !== undefined) {
      updates.name = validationResult.data.name || null;
    }

    // Update draft
    const { data, error } = await updateDraft(id, updates);

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Draft not found" }, { status: 404 });
      }
      console.error("Error updating draft:", error);
      return NextResponse.json(
        { error: "Failed to update draft", message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Update draft API error:", error);
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
 * DELETE /api/drafts/[id]
 * Delete a draft
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Draft ID is required" },
        { status: 400 }
      );
    }

    const { error } = await deleteDraft(id);

    if (error) {
      console.error("Error deleting draft:", error);
      return NextResponse.json(
        { error: "Failed to delete draft", message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Draft deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete draft API error:", error);
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
