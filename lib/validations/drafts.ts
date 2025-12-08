import { z } from "zod";
import type { ReviewData } from "@/types/review";

/**
 * Zod schemas for draft validation
 *
 * Used in API routes to validate incoming requests
 */

// Base review data schema (common fields)
const baseReviewDataSchema = z.object({
  reviewerName: z.string().min(1, "Reviewer name is required"),
  rating: z.number().int().min(1).max(5),
  reviewText: z.string(),
  date: z.string(), // ISO date string
  profilePictureUrl: z.string(), // Can be empty string or URL
});

// Platform-specific schemas
const googleReviewDataSchema = baseReviewDataSchema.extend({
  platform: z.literal("google"),
  localGuideLevel: z.number().int().min(0).max(10).optional(),
  numberOfReviews: z.number().int().min(0).optional(),
  numberOfPhotos: z.number().int().min(0).optional(),
  isNew: z.boolean().optional(),
});

const amazonReviewDataSchema = baseReviewDataSchema.extend({
  platform: z.literal("amazon"),
  reviewTitle: z.string().min(1, "Review title is required"),
  verified: z.boolean(),
  helpfulVotes: z.number().int().min(0).optional(),
  location: z.string().optional(),
  productDetails: z.string().optional(),
});

const trustpilotReviewDataSchema = baseReviewDataSchema.extend({
  platform: z.literal("trustpilot"),
  reviewTitle: z.string().min(1, "Review title is required"),
  verified: z.boolean(),
});

const tripadvisorReviewDataSchema = baseReviewDataSchema.extend({
  platform: z.literal("tripadvisor"),
  reviewTitle: z.string().min(1, "Review title is required"),
  helpfulVotes: z.number().int().min(0).optional(),
  contributionLevel: z.string().optional(),
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
  reviewData: reviewDataSchema,
  name: z.string().optional(),
});

// Draft update schema
export const updateDraftSchema = z.object({
  reviewData: reviewDataSchema.optional(),
  name: z.string().optional(),
});

// Type exports for use in API routes
export type CreateDraftInput = z.infer<typeof createDraftSchema>;
export type UpdateDraftInput = z.infer<typeof updateDraftSchema>;
