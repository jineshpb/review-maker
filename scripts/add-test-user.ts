/**
 * Test script to add a user to the users table
 * Run with: npx tsx scripts/add-test-user.ts
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve } from "path";

// Load environment variables from .env.local
try {
  const envFile = readFileSync(resolve(process.cwd(), ".env.local"), "utf-8");
  envFile.split("\n").forEach((line) => {
    // Skip comments and empty lines
    const trimmedLine = line.trim();
    if (!trimmedLine || trimmedLine.startsWith("#")) return;

    const equalIndex = trimmedLine.indexOf("=");
    if (equalIndex === -1) return;

    const key = trimmedLine.substring(0, equalIndex).trim();
    let value = trimmedLine.substring(equalIndex + 1).trim();

    // Remove quotes if present
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (key && value) {
      process.env[key] = value;
    }
  });
  console.log("✅ Loaded .env.local");
} catch (error) {
  console.warn("⚠️  Could not load .env.local, using process.env");
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log("\n🔍 Checking environment variables...");
console.log(
  `   NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? "✅ Set" : "❌ Missing"}`
);
console.log(
  `   SUPABASE_SERVICE_ROLE_KEY: ${
    supabaseServiceKey ? "✅ Set" : "❌ Missing"
  }`
);

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("\n❌ Missing Supabase environment variables!");
  console.error(
    "Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local"
  );
  process.exit(1);
}

// Validate URL format
if (!supabaseUrl.startsWith("http://") && !supabaseUrl.startsWith("https://")) {
  console.error("\n❌ Invalid Supabase URL format!");
  console.error("   URL should start with http:// or https://");
  console.error(`   Got: ${supabaseUrl}`);
  process.exit(1);
}

console.log(`   Supabase URL: ${supabaseUrl}`);
console.log(`   (Self-hosted instance detected)`);

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Test connection first
async function testConnection() {
  console.log("\n🔌 Testing Supabase connection...");
  console.log(`   Connecting to: ${supabaseUrl}`);

  try {
    // Try a simple query to test connection
    const { data, error } = await supabase.from("users").select("id").limit(1);

    if (error) {
      console.error("❌ Connection test failed!");
      console.error(`   Error code: ${error.code || "unknown"}`);
      console.error(`   Error message: ${error.message}`);
      console.error(`   Error details:`, error);

      // Provide helpful suggestions for self-hosted instances
      console.error("\n💡 Troubleshooting for self-hosted Supabase:");
      console.error("   1. Check if your Supabase instance is running");
      console.error("   2. Verify the URL is accessible from this machine");
      console.error("   3. Check if SSL certificate is valid (if using HTTPS)");
      console.error("   4. Try accessing the URL in a browser");
      console.error("   5. Check firewall/network settings");

      return false;
    }
    console.log("✅ Connection successful!");
    return true;
  } catch (error: any) {
    console.error("❌ Connection test failed with exception!");
    console.error(`   Error: ${error.message || error}`);
    console.error(`   Stack: ${error.stack}`);

    // Network-related errors
    if (
      error.message?.includes("ECONNREFUSED") ||
      error.message?.includes("ENOTFOUND")
    ) {
      console.error("\n💡 Network error detected:");
      console.error("   - Check if Supabase instance is running");
      console.error("   - Verify the URL is correct");
      console.error("   - Check DNS resolution");
    }

    return false;
  }
}

async function addTestUser(email: string, userId?: string) {
  // Generate a test user ID if not provided (format: user_xxxxx)
  const testUserId = userId || `user_test_${Date.now()}`;

  console.log(`\n📝 Adding test user...`);
  console.log(`   Email: ${email}`);
  console.log(`   User ID: ${testUserId}`);

  try {
    // Check if user already exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("*")
      .eq("id", testUserId)
      .single();

    if (existingUser) {
      console.log(`\n⚠️  User already exists with ID: ${testUserId}`);
      console.log(`   Existing user:`, existingUser);
      return { data: existingUser, error: null };
    }

    // Create user record
    const { data, error } = await supabase
      .from("users")
      .insert({
        id: testUserId,
        email: email,
        username: email.split("@")[0], // Use email prefix as username
        avatar_url: null,
      })
      .select()
      .single();

    if (error) {
      console.error(`\n❌ Error creating user:`, error);
      return { data: null, error };
    }

    console.log(`\n✅ User created successfully!`);
    console.log(`   User:`, data);

    // Also create a free tier subscription
    const { data: subscription, error: subError } = await supabase
      .from("user_subscriptions")
      .insert({
        user_id: testUserId,
        tier: "free",
        status: "active",
      })
      .select()
      .single();

    if (subError) {
      console.log(
        `\n⚠️  Subscription creation failed (might already exist):`,
        subError.message
      );
    } else {
      console.log(`\n✅ Free tier subscription created!`);
      console.log(`   Subscription:`, subscription);
    }

    return { data, error: null };
  } catch (error) {
    console.error(`\n❌ Unexpected error:`, error);
    return { data: null, error };
  }
}

// Main execution
async function main() {
  const email = process.argv[2] || "forembeepay@gmail.com";
  const userId = process.argv[3]; // Optional: pass user ID as second argument

  // Test connection first
  const connected = await testConnection();
  if (!connected) {
    console.error("\n❌ Cannot connect to Supabase. Please check:");
    console.error("   1. Your Supabase URL is correct");
    console.error("   2. Your Service Role Key is correct");
    console.error("   3. Your Supabase project is active");
    console.error("   4. Your internet connection is working");
    process.exit(1);
  }

  await addTestUser(email, userId);
}

main()
  .then(() => {
    console.log(`\n🎉 Done!`);
    process.exit(0);
  })
  .catch((error) => {
    console.error(`\n❌ Fatal error:`, error);
    process.exit(1);
  });
