import { ReviewPreviewServer } from "@/components/editor/ReviewRenderer";
import type { ReviewData } from "@/types/review";

/**
 * Preview page route for Playwright screenshots
 *
 * This page renders the ReviewPreviewServer component with all styles.
 * Playwright visits this URL to capture screenshots.
 *
 * Single source of truth: ReviewRenderer component
 * - Add new platforms by updating platforms/ folder
 * - No code duplication
 * - Scales to 100+ platforms
 */
export default async function PreviewPage({
  searchParams,
}: {
  searchParams: Promise<{ platform?: string; data?: string }>;
}) {
  const params = await searchParams;
  const platform = params.platform || "google";
  let reviewData: ReviewData;

  try {
    const dataParam = params.data;
    reviewData = dataParam
      ? (JSON.parse(decodeURIComponent(dataParam)) as ReviewData)
      : ({
          platform: platform as any,
          reviewerName: "",
          rating: 5,
          reviewText: "",
          date: new Date().toISOString().split("T")[0],
          profilePictureUrl: "",
        } as ReviewData);
  } catch {
    reviewData = {
      platform: platform as any,
      reviewerName: "",
      rating: 5,
      reviewText: "",
      date: new Date().toISOString().split("T")[0],
      profilePictureUrl: "",
    } as ReviewData;
  }

  return <ReviewPreviewServer platform={platform} reviewData={reviewData} />;
}
