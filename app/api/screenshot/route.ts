import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { reviewData, platform } = body;

    if (!reviewData || !platform) {
      return NextResponse.json(
        { error: "reviewData and platform are required" },
        { status: 400 }
      );
    }

    // Create preview URL with review data
    // This URL renders ReviewPreviewServer component (single source of truth)
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const previewUrl = `${baseUrl}/api/preview?platform=${encodeURIComponent(
      platform
    )}&data=${encodeURIComponent(JSON.stringify(reviewData))}`;

    // Call the Playwright screenshot server
    const screenshotResponse = await fetch("http://localhost:3001/screenshot", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: previewUrl,
        options: {
          width: 600,
          height: 800,
          fullPage: true,
        },
      }),
    });

    if (!screenshotResponse.ok) {
      const error = await screenshotResponse.json();
      return NextResponse.json(
        { error: "Screenshot server error", message: error.message },
        { status: screenshotResponse.status }
      );
    }

    // Get the image buffer
    const imageBuffer = await screenshotResponse.arrayBuffer();

    // Return the image
    return new NextResponse(imageBuffer, {
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": `attachment; filename="review-${Date.now()}.png"`,
      },
    });
  } catch (error) {
    console.error("Screenshot API error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate screenshot",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
