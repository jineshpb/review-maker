import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import { generatePlatformReviews } from "@/lib/inngest/functions/generate-reviews";

// Export the Inngest serve handler
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [generatePlatformReviews],
});
