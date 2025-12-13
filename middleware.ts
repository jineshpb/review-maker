import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Define protected routes that require authentication
const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/subscription(.*)",
]);

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks(.*)", // Webhooks have their own verification
  "/api/preview(.*)", // Preview endpoint is public
  "/api/inngest(.*)", // Inngest webhook endpoint
]);

export default clerkMiddleware(async (auth, req) => {
  // Protect page routes (not API routes - they handle their own auth)
  const isApiRoute = req.nextUrl.pathname.startsWith("/api");

  if (!isPublicRoute(req) && !isApiRoute && isProtectedRoute(req)) {
    // Protect dashboard and subscription pages
    await auth.protect();
  }
  // API routes are not protected here - they handle auth in their route handlers
  // This allows auth() to work in API routes by setting up the auth context
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes (to set up auth context)
    "/(api|trpc)(.*)",
  ],
};
