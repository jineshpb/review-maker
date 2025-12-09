import { z } from "zod";
import type { ReviewData } from "@/types/review";

/**
 * Zod schemas for draft validation
 *
 * Used in API routes to validate incoming requests
 */

// Base review data schema (common fields)
// More lenient for drafts - allow empty/incomplete data
const baseReviewDataSchema = z.object({
  reviewerName: z.string().default(""), // Allow empty for drafts
  rating: z.number().int().min(1).max(5).default(5),
  reviewText: z.string().default(""),
  date: z.string().default(() => new Date().toISOString().split("T")[0]), // Default to today
  profilePictureUrl: z.string().default(""),
});

// Platform-specific schemas (lenient for drafts)
const googleReviewDataSchema = baseReviewDataSchema.extend({
  platform: z.literal("google"),
  localGuideLevel: z.number().int().min(0).max(10).optional().default(0),
  numberOfReviews: z.number().int().min(0).optional().default(0),
  numberOfPhotos: z.number().int().min(0).optional().default(0),
  isNew: z.boolean().optional().default(false),
});

const amazonReviewDataSchema = baseReviewDataSchema.extend({
  platform: z.literal("amazon"),
  reviewTitle: z.string().default(""), // Allow empty for drafts
  verified: z.boolean().default(false),
  helpfulVotes: z.number().int().min(0).optional().default(0),
  location: z.string().optional(),
  productDetails: z.string().optional(),
});

const trustpilotReviewDataSchema = baseReviewDataSchema.extend({
  platform: z.literal("trustpilot"),
  reviewTitle: z.string().default(""), // Allow empty for drafts
  verified: z.boolean().default(false),
});

const tripadvisorReviewDataSchema = baseReviewDataSchema.extend({
  platform: z.literal("tripadvisor"),
  reviewTitle: z.string().default(""), // Allow empty for drafts
  helpfulVotes: z.number().int().min(0).optional().default(0),
  contributionLevel: z.string().optional().default(""),
});

// Union type for all platforms
export const reviewDataSchema = z.discriminatedUnion("platform", [
  googleReviewDataSchema,
  amazonReviewDataSchema,
  trustpilotReviewDataSchema,
  tripadvisorReviewDataSchema,
  // Add more platforms as needed
  baseReviewDataSchema.extend({
    platform: z.enum([
      "yelp",
      "facebook",
      "fiverr",
      "airbnb",
      "appstore",
      "playstore",
    ]),
  }),
]) as z.ZodType<ReviewData>;

// Draft creation schema
// More lenient - allow partial/incomplete data for drafts (work-in-progress)
export const createDraftSchema = z.object({
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
  reviewData: z.any(), // Accept any structure for drafts - they're work-in-progress
  name: z.string().optional().nullable(),
});

// Draft update schema
export const updateDraftSchema = z.object({
  reviewData: reviewDataSchema.optional(),
  name: z.string().optional(),
});

// Type exports for use in API routes
export type CreateDraftInput = z.infer<typeof createDraftSchema>;
export type UpdateDraftInput = z.infer<typeof updateDraftSchema>;
