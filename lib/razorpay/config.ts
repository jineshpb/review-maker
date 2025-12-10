import Razorpay from "razorpay";

if (!process.env.RAZORPAY_KEY_ID) {
  throw new Error(
    "RAZORPAY_KEY_ID is missing.\n\n" +
      "Add it to your .env.local file:\n" +
      "   RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx\n\n" +
      "Get your keys from: https://dashboard.razorpay.com/app/keys"
  );
}

if (!process.env.RAZORPAY_KEY_SECRET) {
  throw new Error(
    "RAZORPAY_KEY_SECRET is missing.\n\n" +
      "Add it to your .env.local file:\n" +
      "   RAZORPAY_KEY_SECRET=your_secret_key_here\n\n" +
      "Get your keys from: https://dashboard.razorpay.com/app/keys"
  );
}

if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID) {
  throw new Error(
    "NEXT_PUBLIC_RAZORPAY_KEY_ID is missing.\n\n" +
      "Add it to your .env.local file:\n" +
      "   NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx\n\n" +
      "This should be the same as RAZORPAY_KEY_ID"
  );
}

// Initialize Razorpay
export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const RAZORPAY_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

// Subscription plan IDs (create these in Razorpay Dashboard)
// Format: { tier: { interval: plan_id } }
export const RAZORPAY_PLAN_IDS = {
  premium: {
    monthly: process.env.RAZORPAY_PREMIUM_MONTHLY_PLAN_ID || "",
    yearly: process.env.RAZORPAY_PREMIUM_YEARLY_PLAN_ID || "",
  },
  enterprise: {
    monthly: process.env.RAZORPAY_ENTERPRISE_MONTHLY_PLAN_ID || "",
    yearly: process.env.RAZORPAY_ENTERPRISE_YEARLY_PLAN_ID || "",
  },
} as const;
