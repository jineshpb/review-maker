"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2, Check, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth, useUser } from "@clerk/nextjs";
import Script from "next/script";

export default function SubscriptionPage() {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);

  const handleSubscribe = async (
    tier: "premium" | "enterprise",
    interval: "month" | "year"
  ) => {
    if (!isSignedIn) {
      router.push("/sign-in");
      return;
    }

    try {
      setLoading(`${tier}-${interval}`);

      const response = await fetch("/api/subscription/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tier, interval }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create checkout");
      }

      if (data.subscriptionId) {
        // Use Razorpay Checkout for subscriptions (more reliable than subscription links)
        // Load Razorpay script if not already loaded
        if (typeof window !== "undefined" && !(window as any).Razorpay) {
          // Script will be loaded via Script component
          await new Promise((resolve) => {
            const checkRazorpay = setInterval(() => {
              if ((window as any).Razorpay) {
                clearInterval(checkRazorpay);
                resolve(true);
              }
            }, 100);
            // Timeout after 5 seconds
            setTimeout(() => {
              clearInterval(checkRazorpay);
              resolve(false);
            }, 5000);
          });
        }

        const Razorpay = (window as any).Razorpay;
        if (!Razorpay) {
          throw new Error("Razorpay SDK not loaded");
        }

        // Get Razorpay key from environment
        const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
        if (!razorpayKey) {
          throw new Error(
            "Razorpay key not configured. Please add NEXT_PUBLIC_RAZORPAY_KEY_ID to .env.local"
          );
        }

        // Open Razorpay Checkout with subscription
        const options = {
          key: razorpayKey,
          subscription_id: data.subscriptionId,
          name: "Screenshot App",
          description: `${
            tier.charAt(0).toUpperCase() + tier.slice(1)
          } Plan - ${interval === "month" ? "Monthly" : "Yearly"}`,
          handler: function (response: any) {
            console.log("✅ Payment successful:", response);
            // Payment successful - redirect to success page
            router.push(
              `/subscription/success?subscription_id=${data.subscriptionId}`
            );
          },
          prefill: {
            email: user?.emailAddresses?.[0]?.emailAddress || "",
            name: user?.fullName || user?.firstName || "",
          },
          theme: {
            color: "#6366f1",
          },
          modal: {
            ondismiss: function () {
              // User closed the modal
              setLoading(null);
              router.push("/subscription/cancel");
            },
          },
        };

        const rzp = new Razorpay(options);
        rzp.open();
      } else if (data.url || data.shortUrl) {
        // Fallback: Redirect to subscription link (may not work in test mode)
        console.warn(
          "Using subscription link (may not work in test mode until authenticated)"
        );
        window.location.href = data.url || data.shortUrl;
      } else {
        throw new Error("No checkout URL or subscription ID received");
      }
    } catch (error) {
      console.error("Subscription error:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to start subscription",
        variant: "destructive",
      });
      setLoading(null);
    }
  };

  // Fetch current subscription status
  useEffect(() => {
    const fetchSubscription = async () => {
      if (!isSignedIn) {
        setSubscriptionLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/subscription/status");
        const data = await response.json();
        if (response.ok && data.subscription) {
          setCurrentSubscription(data.subscription);
        }
      } catch (error) {
        console.error("Error fetching subscription:", error);
      } finally {
        setSubscriptionLoading(false);
      }
    };

    fetchSubscription();
  }, [isSignedIn]);

  const plans = [
    {
      name: "Premium",
      tier: "premium" as const,
      monthly: {
        price: "₹499",
        interval: "month",
        features: [
          "Unlimited drafts",
          "Unlimited screenshots",
          "10GB storage",
          "Priority support",
        ],
      },
      yearly: {
        price: "₹4,999",
        interval: "year",
        savings: "Save 17%",
        features: [
          "Unlimited drafts",
          "Unlimited screenshots",
          "10GB storage",
          "Priority support",
        ],
      },
    },
    {
      name: "Enterprise",
      tier: "enterprise" as const,
      monthly: {
        price: "₹1,999",
        interval: "month",
        features: [
          "Everything in Premium",
          "Unlimited storage",
          "API access",
          "Dedicated support",
          "Custom branding",
        ],
      },
      yearly: {
        price: "₹19,999",
        interval: "year",
        savings: "Save 17%",
        features: [
          "Everything in Premium",
          "Unlimited storage",
          "API access",
          "Dedicated support",
          "Custom branding",
        ],
      },
    },
  ];

  return (
    <>
      {/* Load Razorpay Checkout script */}
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
      />
      <div className="min-h-screen bg-background py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
            <p className="text-muted-foreground text-lg">
              Upgrade to unlock unlimited features
            </p>

            {/* Current Subscription Status */}
            {!subscriptionLoading && currentSubscription && (
              <div className="mt-6 inline-block bg-muted border rounded-lg px-6 py-4">
                <div className="flex items-center gap-4">
                  <div className="text-left">
                    <p className="text-sm text-muted-foreground">
                      Current Plan
                    </p>
                    <p className="text-lg font-semibold capitalize">
                      {currentSubscription.tier} Plan
                    </p>
                  </div>
                  <div className="text-left">
                    <p className="text-sm text-muted-foreground">Status</p>
                    <p className="text-lg font-semibold capitalize">
                      {currentSubscription.status === "active" ? (
                        <span className="text-green-600">Active</span>
                      ) : (
                        <span className="text-orange-600">
                          {currentSubscription.status}
                        </span>
                      )}
                    </p>
                  </div>
                  {currentSubscription.current_period_end && (
                    <div className="text-left">
                      <p className="text-sm text-muted-foreground">
                        {currentSubscription.status === "active"
                          ? "Renews"
                          : "Expires"}
                      </p>
                      <p className="text-lg font-semibold">
                        {new Date(
                          currentSubscription.current_period_end
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {plans.map((plan) => (
              <div
                key={plan.tier}
                className="border rounded-lg p-8 bg-card hover:shadow-lg transition-shadow"
              >
                <h2 className="text-2xl font-bold mb-2">{plan.name}</h2>
                <p className="text-muted-foreground mb-6">
                  Perfect for{" "}
                  {plan.tier === "premium" ? "professionals" : "teams"}
                </p>

                <div className="space-y-4 mb-6">
                  {/* Monthly Plan */}
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="text-3xl font-bold">
                          {plan.monthly.price}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          per month
                        </div>
                      </div>
                      <Button
                        onClick={() => handleSubscribe(plan.tier, "month")}
                        disabled={
                          loading === `${plan.tier}-month` ||
                          (currentSubscription?.tier === plan.tier &&
                            currentSubscription?.status === "active")
                        }
                        variant={
                          currentSubscription?.tier === plan.tier &&
                          currentSubscription?.status === "active"
                            ? "secondary"
                            : "default"
                        }
                        className="ml-4"
                      >
                        {loading === `${plan.tier}-month` ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : currentSubscription?.tier === plan.tier &&
                          currentSubscription?.status === "active" ? (
                          <>
                            <Check className="mr-2 h-4 w-4" />
                            Current
                          </>
                        ) : (
                          "Subscribe"
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Yearly Plan */}
                  <div className="border rounded-lg p-4 border-primary">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <div className="text-3xl font-bold">
                            {plan.yearly.price}
                          </div>
                          {plan.yearly.savings && (
                            <span className="text-sm bg-primary text-primary-foreground px-2 py-1 rounded">
                              {plan.yearly.savings}
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          per year
                        </div>
                      </div>
                      <Button
                        onClick={() => handleSubscribe(plan.tier, "year")}
                        disabled={
                          loading === `${plan.tier}-year` ||
                          (currentSubscription?.tier === plan.tier &&
                            currentSubscription?.status === "active")
                        }
                        variant={
                          currentSubscription?.tier === plan.tier &&
                          currentSubscription?.status === "active"
                            ? "secondary"
                            : "default"
                        }
                        className="ml-4"
                      >
                        {loading === `${plan.tier}-year` ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : currentSubscription?.tier === plan.tier &&
                          currentSubscription?.status === "active" ? (
                          <>
                            <Check className="mr-2 h-4 w-4" />
                            Current
                          </>
                        ) : (
                          "Subscribe"
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                <ul className="space-y-2">
                  {plan.monthly.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center text-sm text-muted-foreground">
            <p>All plans include a 14-day money-back guarantee</p>
            <p className="mt-2">
              Questions?{" "}
              <a
                href="mailto:support@example.com"
                className="text-primary hover:underline"
              >
                Contact support
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
