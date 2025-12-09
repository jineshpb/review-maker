import { Webhook } from "svix";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

/**
 * POST /api/webhooks/clerk
 * Clerk webhook endpoint for user events
 *
 * Handles:
 * - user.created: Create user in Supabase + free tier subscription
 * - user.updated: Update user in Supabase
 *
 * Configure this URL in Clerk Dashboard → Webhooks
 */
export async function POST(request: NextRequest) {
  try {
    // Get the Svix headers for verification
    const headerPayload = await headers();
    const svix_id = headerPayload.get("svix-id");
    const svix_timestamp = headerPayload.get("svix-timestamp");
    const svix_signature = headerPayload.get("svix-signature");

    // If there are no headers, error out
    if (!svix_id || !svix_timestamp || !svix_signature) {
      return NextResponse.json(
        { error: "Error occurred -- no svix headers" },
        { status: 400 }
      );
    }

    // Get the body
    const payload = await request.json();
    const body = JSON.stringify(payload);

    // Get the webhook secret
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error("CLERK_WEBHOOK_SECRET is not set");
      return NextResponse.json(
        { error: "Webhook secret not configured" },
        { status: 500 }
      );
    }

    // Create a new Svix instance with your secret
    const wh = new Webhook(webhookSecret);

    let evt: any;

    // Verify the payload with the headers
    try {
      evt = wh.verify(body, {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      }) as any;
    } catch (err) {
      console.error("Error verifying webhook:", err);
      return NextResponse.json(
        { error: "Error occurred -- verification failed" },
        { status: 400 }
      );
    }

    // Handle the webhook
    const eventType = evt.type;
    const { id, email_addresses, username, first_name, image_url } = evt.data;

    console.log(`📥 Clerk webhook received: ${eventType} for user ${id}`);

    const supabase = createServerClient();

    if (eventType === "user.created") {
      // Create user in Supabase
      const userData = {
        id,
        email: email_addresses?.[0]?.email_address || "",
        username: username || first_name || null,
        avatar_url: image_url || null,
      };

      const { data: user, error: userError } = await supabase
        .from("users")
        .insert(userData as any)
        .select()
        .single();

      if (userError) {
        console.error("Error creating user:", userError);
        return NextResponse.json(
          {
            error: "Failed to create user",
            message: userError.message,
          },
          { status: 500 }
        );
      }

      // Create free tier subscription
      const { data: subscription, error: subError } = await (
        supabase.from("user_subscriptions") as any
      )
        .insert({
          user_id: id,
          tier: "free",
          status: "active",
        })
        .select()
        .single();

      if (subError) {
        console.error("Error creating subscription:", subError);
        // Don't fail - user was created, subscription can be retried
        return NextResponse.json(
          {
            success: true,
            message: "User created but subscription failed",
            user,
            subscriptionError: subError.message,
          },
          { status: 200 }
        );
      }

      console.log(`✅ User ${id} created with free tier subscription`);

      return NextResponse.json({
        success: true,
        message: "User and subscription created",
        user,
        subscription,
      });
    }

    if (eventType === "user.updated") {
      // Update user in Supabase
      const updateData: any = {};
      if (email_addresses?.[0]?.email_address) {
        updateData.email = email_addresses[0].email_address;
      }
      if (username || first_name) {
        updateData.username = username || first_name;
      }
      if (image_url) {
        updateData.avatar_url = image_url;
      }

      const { data: user, error: userError } = await (
        supabase.from("users") as any
      )
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (userError) {
        console.error("Error updating user:", userError);
        return NextResponse.json(
          {
            error: "Failed to update user",
            message: userError.message,
          },
          { status: 500 }
        );
      }

      console.log(`✅ User ${id} updated`);

      return NextResponse.json({
        success: true,
        message: "User updated",
        user,
      });
    }

    // Event type not handled
    return NextResponse.json({
      success: true,
      message: `Event ${eventType} received but not handled`,
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
