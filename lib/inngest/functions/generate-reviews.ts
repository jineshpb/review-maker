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
    const { userId, userPrompt, platforms, draftId } = event.data;

    // Step 1: Generate reviews for each platform
    const generatedReviews = await step.run(
      "generate-reviews-for-platforms",
      async () => {
        const reviews: Record<string, any> = {};

        for (const platform of platforms) {
          // Generate platform-specific review using AI
          const review = await generateReviewForPlatform(platform, userPrompt);
          reviews[platform] = review;
        }

        return reviews;
      }
    );

    // Step 2: Save reviews to database
    const savedDrafts = await step.run("save-reviews-to-database", async () => {
      const supabase = createServerClient();
      const results: Array<{ platform: string; draftId: string }> = [];

      for (const [platform, reviewData] of Object.entries(generatedReviews)) {
        try {
          // If draftId provided, update existing draft
          if (draftId) {
            const { data, error } = await (supabase.from("drafts") as any)
              .update({
                review_data: reviewData,
                updated_at: new Date().toISOString(),
              })
              .eq("id", draftId)
              .eq("user_id", userId)
              .select()
              .single();

            if (error) throw error;
            results.push({ platform, draftId: data.id });
          } else {
            // Create new draft for this platform
            const { data, error } = await (supabase.from("drafts") as any)
              .insert({
                user_id: userId,
                platform,
                review_data: reviewData,
                name: `${
                  platform.charAt(0).toUpperCase() + platform.slice(1)
                } Review - ${new Date().toLocaleDateString()}`,
              })
              .select()
              .single();

            if (error) throw error;
            results.push({ platform, draftId: data.id });
          }
        } catch (error) {
          console.error(`Error saving draft for ${platform}:`, error);
          // Continue with other platforms even if one fails
        }
      }

      return results;
    });

    return {
      success: true,
      platforms: platforms,
      reviewsGenerated: Object.keys(generatedReviews).length,
      draftsSaved: savedDrafts.length,
      drafts: savedDrafts,
    };
  }
);

/**
 * Generate review content for a specific platform using AI
 */
async function generateReviewForPlatform(
  platform: ReviewPlatform,
  userPrompt: string
): Promise<any> {
  // TODO: Replace with actual AI API call (OpenAI, Anthropic, etc.)
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY not configured");
  }

  // Build platform-specific prompt
  const platformPrompt = buildPlatformPrompt(platform, userPrompt);

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
          content: `You are an expert at writing authentic ${platform} reviews. Generate realistic review content that matches the platform's style and includes all required fields.`,
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
  userPrompt: string
): string {
  const platformFields = getPlatformFields(platform);

  return `Generate a realistic ${platform} review based on this business information:

${userPrompt}

Requirements:
- Rating: ${platformFields.ratingRange || "1-5 stars"}
- Review text: ${platformFields.reviewTextLength || "50-300 words"}
- Style: ${platformFields.style || "authentic and natural"}
- Platform-specific fields: ${platformFields.requiredFields.join(", ")}

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
