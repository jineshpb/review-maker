import { NextRequest, NextResponse } from "next/server";
import { getScreenshotById, deleteScreenshotById } from "@/lib/supabase/screenshots";

/**
 * GET /api/screenshots/[id]
 * Fetch a single screenshot with signed URL
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Screenshot ID is required" },
        { status: 400 }
      );
    }

    const { data, error } = await getScreenshotById(id);

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "Screenshot not found" },
          { status: 404 }
        );
      }
      console.error("Error fetching screenshot:", error);
      return NextResponse.json(
        { error: "Failed to fetch screenshot", message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Get screenshot API error:", error);
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
 * DELETE /api/screenshots/[id]
 * Delete a screenshot (removes from storage + database)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Screenshot ID is required" },
        { status: 400 }
      );
    }

    const { error } = await deleteScreenshotById(id);

    if (error) {
      console.error("Error deleting screenshot:", error);
      return NextResponse.json(
        { error: "Failed to delete screenshot", message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Screenshot deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete screenshot API error:", error);
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

