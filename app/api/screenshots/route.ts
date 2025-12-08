import { NextRequest, NextResponse } from "next/server";
import { createScreenshotSchema } from "@/lib/validations";
import { getUserScreenshots, saveScreenshot } from "@/lib/supabase/screenshots";
import { canCreateScreenshot } from "@/lib/supabase/subscriptions";

/**
 * GET /api/screenshots
 * Fetch all saved screenshots for the current user
 * Query params: ?platform=google&limit=20&offset=0
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const platform = searchParams.get("platform") || undefined;
    const limit = searchParams.get("limit")
      ? parseInt(searchParams.get("limit")!)
      : undefined;
    const offset = searchParams.get("offset")
      ? parseInt(searchParams.get("offset")!)
      : undefined;

    const { data, error } = await getUserScreenshots(platform, limit, offset);

    if (error) {
      console.error("Error fetching screenshots:", error);
      return NextResponse.json(
        { error: "Failed to fetch screenshots", message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: data || [] });
  } catch (error) {
    console.error("Screenshots API error:", error);
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
 * POST /api/screenshots
 * Save screenshot (after generation)
 * Body: { draftId?, platform, reviewData, imageBlob (base64 or FormData), name? }
 */
export async function POST(request: NextRequest) {
  try {
    // Check if user can create more screenshots (premium tier limit)
    const canCreate = await canCreateScreenshot();
    if (!canCreate) {
      return NextResponse.json(
        {
          error: "Screenshot limit reached",
          message:
            "You've reached your screenshot limit. Upgrade to premium for unlimited screenshots.",
        },
        { status: 403 }
      );
    }

    // Parse request body
    const contentType = request.headers.get("content-type");
    let body: any;
    let imageBlob: Blob | Buffer;

    if (contentType?.includes("application/json")) {
      // JSON with base64 image
      body = await request.json();
      const { imageBase64, ...rest } = body;

      if (!imageBase64) {
        return NextResponse.json(
          { error: "imageBase64 is required" },
          { status: 400 }
        );
      }

      // Convert base64 to blob
      const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");
      imageBlob = buffer;

      // Validate rest of the body
      const validationResult = createScreenshotSchema.safeParse(rest);
      if (!validationResult.success) {
        return NextResponse.json(
          {
            error: "Validation failed",
            issues: validationResult.error.issues,
          },
          { status: 400 }
        );
      }

      body = validationResult.data;
    } else if (contentType?.includes("multipart/form-data")) {
      // FormData with file
      const formData = await request.formData();
      const imageFile = formData.get("image") as File;
      const draftId = formData.get("draftId") as string | null;
      const platform = formData.get("platform") as string;
      const reviewData = JSON.parse(formData.get("reviewData") as string);
      const name = formData.get("name") as string | null;

      if (!imageFile) {
        return NextResponse.json(
          { error: "image file is required" },
          { status: 400 }
        );
      }

      const arrayBuffer = await imageFile.arrayBuffer();
      imageBlob = Buffer.from(arrayBuffer);
      body = { draftId, platform, reviewData, name };

      // Validate
      const validationResult = createScreenshotSchema.safeParse(body);
      if (!validationResult.success) {
        return NextResponse.json(
          {
            error: "Validation failed",
            issues: validationResult.error.issues,
          },
          { status: 400 }
        );
      }

      body = validationResult.data;
    } else {
      return NextResponse.json(
        {
          error: "Unsupported content type",
          message: "Use application/json with base64 or multipart/form-data",
        },
        { status: 400 }
      );
    }

    const { draftId, platform, reviewData, name } = body;

    // Get image dimensions (optional, for metadata)
    let width: number | undefined;
    let height: number | undefined;
    let fileSize: number | undefined;

    try {
      // Try to get dimensions from blob
      if (imageBlob instanceof Buffer) {
        fileSize = imageBlob.length;
        // For now, we'll set dimensions later or skip
        // You could use sharp or jimp to get actual dimensions
      } else if (imageBlob instanceof Blob) {
        fileSize = imageBlob.size;
      }
    } catch (e) {
      // Ignore dimension extraction errors
    }

    // Save screenshot
    const { data, error } = await saveScreenshot(
      {
        draft_id: draftId || null,
        platform,
        review_data: reviewData as any,
        name: name || null,
        file_size: fileSize || null,
        width: width || null,
        height: height || null,
        thumbnail_url: null,
      },
      imageBlob,
      request
    );

    if (error) {
      console.error("Error saving screenshot:", error);
      return NextResponse.json(
        { error: "Failed to save screenshot", message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error("Save screenshot API error:", error);
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
