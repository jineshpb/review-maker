import { z } from "zod";
import { reviewDataSchema } from "./drafts";

/**
 * Zod schemas for screenshot validation
 */

// Screenshot creation schema
export const createScreenshotSchema = z.object({
  draftId: z.string().uuid().optional(),
  platform: z.enum([
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
  ]),
  reviewData: reviewDataSchema,
  name: z.string().optional(),
  // Note: imageBlob is handled separately (FormData or base64)
});

export type CreateScreenshotInput = z.infer<typeof createScreenshotSchema>;
