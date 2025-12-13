import { Inngest } from "inngest";

// Initialize Inngest client
// In production, eventKey and signingKey are required
// In development, they're optional (local dev server handles it)
const eventKey = process.env.INNGEST_EVENT_KEY;
const signingKey = process.env.INNGEST_SIGNING_KEY;

// Log configuration status (only in production to help debug)
if (process.env.NODE_ENV === "production") {
  if (!eventKey) {
    console.error(
      "⚠️ INNGEST_EVENT_KEY is missing! Inngest events will fail in production."
    );
  }
  if (!signingKey) {
    console.error(
      "⚠️ INNGEST_SIGNING_KEY is missing! Inngest webhook verification will fail."
    );
  }
}

export const inngest = new Inngest({
  id: "screenshot-app",
  name: "Screenshot App",
  // Only set these if they exist (required for production)
  ...(eventKey && { eventKey }),
  ...(signingKey && { signingKey }),
});
