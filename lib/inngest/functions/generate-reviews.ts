import { inngest } from "@/lib/inngest/client";
import { createServerClient } from "@/lib/supabase/server";
import type { ReviewPlatform } from "@/types/database";

interface GenerateReviewsEvent {
  name: "review/ai.generate";
  data: {
    userId: string;
    userPrompt: string; // Business info/prompt from user
    platforms: ReviewPlatform[]; // Platforms to generate reviews for
    draftId?: string; // Optional: if updating existing draft
    tone?: {
      concise: number; // -1 to 1, where -1 is most concise, 1 is most expanded
      positive: number; // -1 to 1, where -1 is most negative, 1 is most positive
    };
  };
}

/**
 * Inngest function: Generate and save platform-specific reviews using AI
 *
 * This function has two steps:
 * 1. Generate: Takes user prompt and generates unique review content for each platform
 * 2. Save: Writes generated reviews to database as drafts
 */
export const generatePlatformReviews = inngest.createFunction(
  {
    id: "generate-platform-reviews",
    name: "Generate and Save Platform-Specific Reviews",
    retries: 2, // Retry twice on failure
  },
  { event: "review/ai.generate" },
  async ({ event, step }) => {
    const { userId, userPrompt, platforms, draftId, tone } = event.data;

    // Step 1: Generate ONE review (reuse across platforms for cost efficiency)
    // Use the first platform for field structure, but content will be reused
    const primaryPlatform = platforms[0];

    const generatedReview = await step.run("generate-review", async () => {
      // Generate ONE review using the primary platform for field structure
      // The same content will be reused across all platforms (realistic behavior)
      const review = await generateReviewForPlatform(
        primaryPlatform,
        userPrompt,
        tone
      );
      return review;
    });

    // Step 2: Save review to database
    // If draftId provided, update existing draft (single draft, not per platform)
    // If no draftId, create one draft for the primary platform
    const savedDraft = await step.run("save-review-to-database", async () => {
      const supabase = createServerClient();

      try {
        // If draftId provided, update existing draft
        if (draftId) {
          const { data, error } = await (supabase.from("drafts") as any)
            .update({
              review_data: generatedReview,
              updated_at: new Date().toISOString(),
            })
            .eq("id", draftId)
            .eq("user_id", userId)
            .select()
            .single();

          if (error) throw error;
          return { platform: primaryPlatform, draftId: data.id };
        } else {
          // Create new draft for the primary platform
          const { data, error } = await (supabase.from("drafts") as any)
            .insert({
              user_id: userId,
              platform: primaryPlatform,
              review_data: generatedReview,
              name: `${
                primaryPlatform.charAt(0).toUpperCase() +
                primaryPlatform.slice(1)
              } Review - ${new Date().toLocaleDateString()}`,
            })
            .select()
            .single();

          if (error) throw error;
          return { platform: primaryPlatform, draftId: data.id };
        }
      } catch (error) {
        console.error(`Error saving draft:`, error);
        throw error;
      }
    });

    return {
      success: true,
      platform: primaryPlatform,
      reviewGenerated: true,
      draftSaved: savedDraft,
    };
  }
);

/**
 * Generate review content for a specific platform using AI
 */
async function generateReviewForPlatform(
  platform: ReviewPlatform,
  userPrompt: string,
  tone?: {
    concise: number;
    positive: number;
  }
): Promise<any> {
  // TODO: Replace with actual AI API call (OpenAI, Anthropic, etc.)
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY not configured");
  }

  // Build platform-specific prompt with tone
  const platformPrompt = buildPlatformPrompt(platform, userPrompt, tone);

  // Call OpenAI API
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini", // Use cheaper model for cost efficiency
      messages: [
        {
          role: "system",
          content: `You are an expert at writing authentic reviews. Generate realistic review content that can be used across multiple platforms. Include all required fields for ${platform} (for field structure), but write the content in a natural, authentic style that works well on any review platform.`,
        },
        {
          role: "user",
          content: platformPrompt,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${error}`);
  }

  const data = await response.json();
  const content = JSON.parse(data.choices[0].message.content);

  // Map AI response to platform-specific review data structure
  return mapAIResponseToReviewData(platform, content);
}

/**
 * Build platform-specific prompt for AI
 */
function buildPlatformPrompt(
  platform: ReviewPlatform,
  userPrompt: string,
  tone?: {
    concise: number;
    positive: number;
  }
): string {
  const platformFields = getPlatformFields(platform);

  // Build tone instructions
  let toneInstructions = "";
  if (tone) {
    const toneParts: string[] = [];

    // Concise vs Expanded
    if (tone.concise < -0.1) {
      const concisePercent = Math.round(Math.abs(tone.concise) * 100);
      toneParts.push(
        `Write in a concise style (${concisePercent}% concise - brief, to the point, minimal words)`
      );
    } else if (tone.concise > 0.1) {
      const expandedPercent = Math.round(Math.abs(tone.concise) * 100);
      toneParts.push(
        `Write in an expanded style (${expandedPercent}% expanded - detailed, thorough, comprehensive)`
      );
    }

    // Positive vs Negative
    if (tone.positive < -0.1) {
      const negativePercent = Math.round(Math.abs(tone.positive) * 100);
      toneParts.push(
        `Write a negative review (${negativePercent}% negative - critical, pointing out issues and problems)`
      );
    } else if (tone.positive > 0.1) {
      const positivePercent = Math.round(Math.abs(tone.positive) * 100);
      toneParts.push(
        `Write a positive review (${positivePercent}% positive - praising, highlighting strengths and benefits)`
      );
    } else {
      toneParts.push("Write a neutral review (balanced, objective)");
    }

    if (toneParts.length > 0) {
      toneInstructions = `\n\nTone Requirements:\n${toneParts.join("\n")}`;
    }
  }

  return `Generate a realistic review based on this business information. The review will be used across multiple platforms, so write it in a natural, authentic style that works well anywhere.

${userPrompt}

Requirements:
- Rating: ${platformFields.ratingRange || "1-5 stars"}
- Review text: ${platformFields.reviewTextLength || "50-300 words"}
- Style: ${platformFields.style || "authentic and natural"}
- Include all ${platform} fields (for structure): ${platformFields.requiredFields.join(
    ", "
  )}${toneInstructions}

Note: Write the review content in a universal style that works across platforms. The platform parameter is only used to determine which fields to include (like Local Guide level, verified badge, etc.), not to change the writing style.

Return JSON with all fields filled:
${JSON.stringify(platformFields.exampleStructure, null, 2)}`;
}

/**
 * Get platform-specific field requirements
 */
function getPlatformFields(platform: ReviewPlatform) {
  const baseFields = {
    ratingRange: "1-5 stars",
    reviewTextLength: "50-300 words",
    style: "authentic and natural",
  };

  switch (platform) {
    case "google":
      return {
        ...baseFields,
        requiredFields: [
          "reviewerName",
          "rating",
          "reviewText",
          "localGuideLevel",
          "numberOfReviews",
        ],
        exampleStructure: {
          reviewerName: "John Doe",
          rating: 5,
          reviewText: "Great service!...",
          date: "2024-01-15",
          profilePictureUrl: "",
          localGuideLevel: 5,
          numberOfReviews: 42,
          numberOfPhotos: 8,
          isNew: false,
        },
      };

    case "amazon":
      return {
        ...baseFields,
        requiredFields: [
          "reviewerName",
          "rating",
          "reviewTitle",
          "reviewText",
          "verified",
        ],
        exampleStructure: {
          reviewerName: "Jane Smith",
          rating: 4,
          reviewTitle: "Good product, minor issues",
          reviewText: "I bought this product...",
          date: "2024-01-15",
          profilePictureUrl: "",
          verified: true,
          helpfulVotes: 12,
          location: "United States",
        },
      };

    case "trustpilot":
      return {
        ...baseFields,
        requiredFields: ["reviewerName", "rating", "reviewTitle", "reviewText"],
        exampleStructure: {
          reviewerName: "Mike Johnson",
          rating: 5,
          reviewTitle: "Excellent service",
          reviewText: "I had a great experience...",
          date: "2024-01-15",
          profilePictureUrl: "",
          verified: true,
        },
      };

    case "tripadvisor":
      return {
        ...baseFields,
        requiredFields: [
          "reviewerName",
          "rating",
          "reviewTitle",
          "reviewText",
          "contributionLevel",
        ],
        exampleStructure: {
          reviewerName: "Sarah Williams",
          rating: 5,
          reviewTitle: "Amazing experience",
          reviewText: "We stayed here for...",
          date: "2024-01-15",
          profilePictureUrl: "",
          contributionLevel: "Level 6 Contributor",
        },
      };

    default:
      return {
        ...baseFields,
        requiredFields: ["reviewerName", "rating", "reviewText"],
        exampleStructure: {
          reviewerName: "Reviewer",
          rating: 5,
          reviewText: "Great experience...",
          date: "2024-01-15",
          profilePictureUrl: "",
        },
      };
  }
}

/**
 * Map AI response to platform-specific review data structure
 */
function mapAIResponseToReviewData(
  platform: ReviewPlatform,
  aiResponse: any
): any {
  // Ensure date is set
  const reviewData = {
    ...aiResponse,
    platform,
    date: aiResponse.date || new Date().toISOString().split("T")[0],
    profilePictureUrl: aiResponse.profilePictureUrl || "",
  };

  // Platform-specific defaults
  switch (platform) {
    case "google":
      return {
        ...reviewData,
        localGuideLevel: aiResponse.localGuideLevel || 0,
        numberOfReviews: aiResponse.numberOfReviews || 0,
        numberOfPhotos: aiResponse.numberOfPhotos || 0,
        isNew: aiResponse.isNew || false,
      };

    case "amazon":
      return {
        ...reviewData,
        verified: aiResponse.verified ?? true,
        helpfulVotes: aiResponse.helpfulVotes || 0,
        location: aiResponse.location || "",
      };

    case "trustpilot":
      return {
        ...reviewData,
        verified: aiResponse.verified ?? true,
      };

    case "tripadvisor":
      return {
        ...reviewData,
        contributionLevel: aiResponse.contributionLevel || "",
        helpfulVotes: aiResponse.helpfulVotes || 0,
      };

    default:
      return reviewData;
  }
}
