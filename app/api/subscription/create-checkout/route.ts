import { NextRequest, NextResponse } from "next/server";
import { razorpay, RAZORPAY_PLAN_IDS } from "@/lib/razorpay/config";
import { createAuthenticatedClient } from "@/lib/supabase/server";
import { getUserSubscription } from "@/lib/supabase/subscriptions";

/**
 * POST /api/subscription/create-checkout
 * Create Razorpay Subscription Link for subscription
 *
 * Body: { tier: "premium" | "enterprise", interval: "month" | "year" }
 *
 * Returns: { subscriptionId, shortUrl }
 */
export async function POST(request: NextRequest) {
  try {
    console.log("📥 Create checkout request received");
    const { supabase, userId } = await createAuthenticatedClient(request);
    console.log("✅ User authenticated:", userId);

    const body = await request.json();
    console.log("📦 Request body:", JSON.stringify(body, null, 2));
    const { tier, interval = "month" } = body;

    // Validate tier
    if (tier !== "premium" && tier !== "enterprise") {
      return NextResponse.json(
        {
          error: "Invalid tier",
          message: "Tier must be 'premium' or 'enterprise'",
        },
        { status: 400 }
      );
    }

    // Validate interval
    if (interval !== "month" && interval !== "year") {
      return NextResponse.json(
        {
          error: "Invalid interval",
          message: "Interval must be 'month' or 'year'",
        },
        { status: 400 }
      );
    }

    // Check if user already has an active paid subscription
    const { data: existingSubscription } = await getUserSubscription(request);

    if (existingSubscription) {
      const sub = existingSubscription as any;
      // Check if user already has premium/enterprise subscription
      if (
        sub.tier !== "free" &&
        sub.status === "active" &&
        sub.razorpay_subscription_id
      ) {
        console.log(
          `⚠️ User ${userId} already has active ${sub.tier} subscription: ${sub.razorpay_subscription_id}`
        );
        return NextResponse.json(
          {
            error: "Already subscribed",
            message: `You already have an active ${sub.tier} subscription. Please manage it from your account settings or cancel it before subscribing to a new plan.`,
            existingSubscription: {
              tier: sub.tier,
              status: sub.status,
              subscriptionId: sub.razorpay_subscription_id,
            },
          },
          { status: 400 }
        );
      }
    }

    let customerId = (existingSubscription as any)?.razorpay_customer_id;

    // Get user email from Supabase
    const { data: user } = await (supabase.from("users") as any)
      .select("email, username")
      .eq("id", userId)
      .single();

    if (!customerId) {
      // Create Razorpay customer
      const customer = await razorpay.customers.create({
        name: user?.username || user?.email || "User",
        email: user?.email || undefined,
        notes: {
          clerk_user_id: userId,
        },
      });

      customerId = customer.id;

      // Save customer ID to database
      await (supabase.from("user_subscriptions") as any).upsert({
        user_id: userId,
        razorpay_customer_id: customerId,
      });
    }

    // Get plan ID
    const priceKey =
      interval === "month" ? "monthly" : ("yearly" as "monthly" | "yearly");
    const planId =
      RAZORPAY_PLAN_IDS[tier as keyof typeof RAZORPAY_PLAN_IDS][priceKey];

    console.log(`🔍 Looking for plan: ${tier} ${interval} (${priceKey})`);
    console.log(`📋 Plan ID: ${planId || "NOT FOUND"}`);

    if (!planId) {
      console.error(`❌ Plan ID not configured for ${tier} ${interval}`);
      return NextResponse.json(
        {
          error: "Plan not configured",
          message: `Plan ID for ${tier} ${interval} is not configured. Please add RAZORPAY_${tier.toUpperCase()}_${interval.toUpperCase()}_PLAN_ID to .env.local`,
        },
        { status: 500 }
      );
    }

    // Create subscription
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // Build subscription payload
    const subscriptionPayload: any = {
      plan_id: planId,
      customer_notify: 1,
      total_count: interval === "month" ? 12 : 1, // 12 months for monthly, 1 year for yearly
      notes: {
        clerk_user_id: userId,
        tier,
        interval,
      },
    };

    // Add customer_id if we have one
    if (customerId) {
      subscriptionPayload.customer_id = customerId;
    }

    console.log(
      "🚀 Creating subscription with payload:",
      JSON.stringify(subscriptionPayload, null, 2)
    );

    let subscriptionData;
    try {
      subscriptionData = await razorpay.subscriptions.create(
        subscriptionPayload
      );
      console.log("✅ Subscription created:", subscriptionData.id);
    } catch (subError) {
      console.error("❌ Razorpay subscription creation failed:", subError);
      throw subError; // Re-throw to be caught by outer catch
    }

    // Create subscription link (for checkout)
    // Razorpay subscriptions need a separate subscription link to be created for checkout
    let checkoutUrl: string | null = null;

    try {
      // First, check if subscription object has short_url directly
      console.log(
        "📋 Subscription data:",
        JSON.stringify(subscriptionData, null, 2)
      );

      // Check all possible fields
      const subData = subscriptionData as any;
      checkoutUrl =
        subData.short_url ||
        subData.shortUrl ||
        subData.url ||
        subData.checkout_url ||
        subData.hosted_url ||
        null;

      if (checkoutUrl) {
        console.log("✅ Found URL in subscription object:", checkoutUrl);
      } else {
        console.log(
          "ℹ️ No URL in subscription object, will create subscription link"
        );
      }

      // If no URL in subscription, try fetching or creating subscription link
      if (!checkoutUrl) {
        console.log(
          "🔗 No URL in subscription object, checking for existing links..."
        );

        // First, try to fetch existing subscription links
        try {
          const fetchLinksResponse = await fetch(
            `https://api.razorpay.com/v1/subscriptions/${subscriptionData.id}/links`,
            {
              method: "GET",
              headers: {
                Authorization: `Basic ${Buffer.from(
                  `${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`
                ).toString("base64")}`,
              },
            }
          );

          if (fetchLinksResponse.ok) {
            const linksData = await fetchLinksResponse.json();
            console.log(
              "📋 Existing subscription links:",
              JSON.stringify(linksData, null, 2)
            );

            // Check if there are any existing links
            if (linksData.items && linksData.items.length > 0) {
              const existingLink = linksData.items[0];
              checkoutUrl =
                existingLink.short_url ||
                existingLink.shortUrl ||
                existingLink.url ||
                null;
              if (checkoutUrl) {
                console.log(
                  "✅ Found existing subscription link:",
                  checkoutUrl
                );
              }
            }
          }
        } catch (fetchError) {
          console.log(
            "ℹ️ Could not fetch existing links (this is OK if none exist):",
            fetchError
          );
        }

        // If still no URL, create a new subscription link
        if (!checkoutUrl) {
          console.log(
            "🔗 Creating new subscription link for:",
            subscriptionData.id
          );

          // Create subscription link via direct HTTP call
          // According to Razorpay docs: https://razorpay.com/docs/api/payments/subscriptions/subscription-link
          const linkPayload: any = {
            subscription_id: subscriptionData.id,
          };

          // Add notify_info if email is available
          if (user?.email) {
            linkPayload.notify_info = {
              notify_email: user.email,
            };
          }

          // Add notes
          linkPayload.notes = {
            clerk_user_id: userId,
            tier,
            interval,
          };

          console.log(
            "📤 Subscription link payload:",
            JSON.stringify(linkPayload, null, 2)
          );

          const linkResponse = await fetch(
            `https://api.razorpay.com/v1/subscription_links`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Basic ${Buffer.from(
                  `${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`
                ).toString("base64")}`,
              },
              body: JSON.stringify(linkPayload),
            }
          );

          const responseText = await linkResponse.text();
          console.log(
            "📥 Subscription link response status:",
            linkResponse.status
          );
          console.log("📥 Subscription link response body:", responseText);

          if (linkResponse.ok) {
            let linkData;
            try {
              linkData = JSON.parse(responseText);
            } catch (e) {
              console.error(
                "❌ Failed to parse subscription link response:",
                e
              );
              linkData = null;
            }

            if (linkData) {
              console.log(
                "✅ Subscription link created:",
                JSON.stringify(linkData, null, 2)
              );

              // Try all possible field names for the checkout URL
              checkoutUrl =
                linkData.short_url ||
                linkData.shortUrl ||
                linkData.url ||
                linkData.checkout_url ||
                linkData.hosted_url ||
                null;

              console.log("🔗 Extracted checkout URL:", checkoutUrl);

              // Validate URL format - should be rzp.io format
              if (checkoutUrl) {
                if (checkoutUrl.includes("api.razorpay.com")) {
                  console.error(
                    "❌ Got API URL instead of checkout URL - this is not a valid checkout page"
                  );
                  console.error("❌ Invalid URL:", checkoutUrl);
                  checkoutUrl = null; // Reject invalid URL
                } else if (!checkoutUrl.startsWith("https://rzp.io/")) {
                  console.warn(`⚠️ Unexpected URL format: ${checkoutUrl}`);
                  console.warn(
                    "⚠️ Expected format: https://rzp.io/i/xxx or https://rzp.io/xxx"
                  );
                } else {
                  console.log("✅ Valid checkout URL format:", checkoutUrl);
                }
              } else {
                console.warn("⚠️ No checkout URL found in response");
                console.warn("⚠️ Available fields:", Object.keys(linkData));
              }
            }
          } else {
            let errorData;
            try {
              errorData = JSON.parse(responseText);
            } catch {
              errorData = { message: responseText };
            }
            console.error("❌ Failed to create subscription link:", errorData);
            console.error("❌ Response status:", linkResponse.status);
          }
        }
      }
    } catch (linkError) {
      console.error("Error creating subscription link:", linkError);
      // Continue anyway - subscription is created, user can access via Razorpay dashboard
    }

    // Save subscription ID and interval to database (will be updated via webhook)
    await (supabase.from("user_subscriptions") as any).upsert({
      user_id: userId,
      razorpay_subscription_id: subscriptionData.id,
      razorpay_customer_id: customerId,
      billing_interval: interval, // Save billing interval
    });

    // Validate checkout URL before returning
    if (
      checkoutUrl &&
      checkoutUrl.includes("api.razorpay.com/v1/t/subscriptions/")
    ) {
      console.error(
        "❌ Invalid checkout URL format detected - this will cause redirect issues"
      );
      checkoutUrl = null; // Don't return invalid URL
    }

    // Return response - include subscription ID even if link creation failed
    const subscriptionStatus = (subscriptionData as any).status || "unknown";

    if (!checkoutUrl) {
      console.warn(
        `⚠️ No valid checkout URL generated for subscription ${subscriptionData.id}`
      );
      console.warn(
        "⚠️ User will need to complete payment via Razorpay dashboard or contact support"
      );
    } else if (subscriptionStatus === "created") {
      console.warn(
        `⚠️ Subscription is in "created" status - hosted page may not be available until authenticated`
      );
      console.warn(
        "⚠️ This is normal in test mode - subscription will be authenticated after first payment"
      );
    }

    return NextResponse.json({
      subscriptionId: subscriptionData.id,
      shortUrl: checkoutUrl,
      url: checkoutUrl, // For compatibility
      subscriptionStatus: subscriptionStatus,
      // If no URL, provide Razorpay dashboard link
      dashboardUrl: checkoutUrl
        ? null
        : `https://dashboard.razorpay.com/app/subscriptions/${subscriptionData.id}`,
      message: checkoutUrl
        ? subscriptionStatus === "created"
          ? "Subscription created. The checkout link may require authentication - if it doesn't work, try again in a few moments or use Razorpay Checkout integration."
          : "Checkout link created successfully"
        : "Subscription created but checkout link unavailable. Please complete payment via Razorpay dashboard or contact support.",
      warning:
        checkoutUrl && subscriptionStatus === "created"
          ? "Subscription is in 'created' status. In test mode, the hosted page may not be immediately available until authenticated. This is normal behavior."
          : checkoutUrl
          ? null
          : "Checkout URL not available - subscription link creation may have failed. Please use Razorpay dashboard to complete payment.",
      // Note about test mode
      testModeNote: process.env.RAZORPAY_KEY_ID?.startsWith("rzp_test_")
        ? "Test mode: Subscription links may have limitations. Consider using Razorpay Checkout integration for more reliable authentication."
        : null,
    });
  } catch (error) {
    console.error("Create checkout error:", error);
    console.error("Error details:", JSON.stringify(error, null, 2));

    // Handle Razorpay API errors
    if (error && typeof error === "object" && "error" in error) {
      const razorpayError = error as any;
      return NextResponse.json(
        {
          error: "Razorpay API error",
          message:
            razorpayError.error?.description ||
            razorpayError.error?.message ||
            JSON.stringify(razorpayError.error),
          details: razorpayError.error,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to create checkout session",
        message: error instanceof Error ? error.message : String(error),
        details: error,
      },
      { status: 500 }
    );
  }
}
