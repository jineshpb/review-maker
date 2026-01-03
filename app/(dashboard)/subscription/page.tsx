"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2, Check, Coins, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth, useUser } from "@clerk/nextjs";
import Script from "next/script";
import Header from "@/components/Header";
import { IoArrowBack } from "react-icons/io5";
// Credit config kept for future use
// import {
//   getAllCreditPacks,
//   getTotalCreditsForPack,
//   formatPrice,
//   type CreditPackPlan,
// } from "@/lib/credits";

export default function SubscriptionPage() {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);
  const [creditBalance, setCreditBalance] = useState<number | null>(null);

  const handleCancelSubscription = async () => {
    if (!isSignedIn) {
      router.push("/sign-in");
      return;
    }

    if (
      !confirm(
        "Are you sure you want to cancel your subscription? You'll continue to have access until the end of your billing period."
      )
    ) {
      return;
    }

    try {
      setLoading("cancel");

      const response = await fetch("/api/subscription/cancel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to cancel subscription");
      }

      toast({
        title: "Subscription Cancelled",
        description:
          "Your subscription has been cancelled. You'll continue to have access until the end of your billing period.",
      });

      // Refresh subscription status
      const statusResponse = await fetch("/api/subscription/status");
      const statusData = await statusResponse.json();
      if (statusResponse.ok && statusData.subscription) {
        setCurrentSubscription(statusData.subscription);
        setCreditBalance(statusData.subscription.credits_balance ?? 0);
      }
    } catch (error) {
      console.error("Cancel subscription error:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to cancel subscription",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  const handleSubscribe = async (
    tier: "premium" | "free",
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

  // Fetch current subscription status and credit balance
  useEffect(() => {
    const fetchSubscription = async () => {
      if (!isSignedIn) {
        setSubscriptionLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/subscription/status");
        const data = await response.json();
        if (response.ok) {
          if (data.subscription) {
            setCurrentSubscription(data.subscription);
            // Get credit balance from subscription
            setCreditBalance(data.subscription.credits_balance ?? 0);
          } else {
            // User exists but no subscription - default to 0 credits
            setCreditBalance(0);
          }
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
      name: "Free",
      tier: "free" as const,
      monthly: {
        price: "Free",
        interval: "month",
        features: ["10 credits per month"],
      },
    },
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
  ];

  return (
    <>
      {/* Load Razorpay Checkout script */}
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
      />
      <Header HeaderType="subscription" />
      <div className="min-h-screen bg-background py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Subscriptions Section */}
          <div className="mb-8">
            <div className=" flex items-start gap-2 mb-8">
              <IoArrowBack
                className="text-primary h-6 w-6 m-2 cursor-pointer"
                onClick={() => router.back()}
              />
              <div className="flex flex-col">
                <h2 className="text-3xl font-bold mb-1 tracking-tight">
                  Choose Your Plan
                </h2>
                <p className="text-muted-foreground tracking-tight">
                  Upgrade to unlock unlimited features
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {plans.map((plan) => (
                <div
                  key={plan.tier}
                  className={`border rounded-xl p-4 relative bg-white ${
                    plan.tier === "free" ? "opacity-100" : ""
                  } ${
                    currentSubscription?.tier === plan.tier &&
                    currentSubscription?.status === "active"
                      ? "border-border border"
                      : ""
                  }`}
                >
                  <h2 className="text-2xl font-bold text-secondary-foreground ">
                    {plan.name}
                  </h2>
                  <p className="text-muted-foreground mb-6 tracking-tight">
                    {plan.tier === "free"
                      ? "Perfect for getting started"
                      : plan.tier === "premium"
                      ? "Perfect for professionals"
                      : "Perfect for teams"}
                  </p>

                  <div className="space-y-4 mb-6">
                    {/* Monthly Plan */}
                    <div className="border rounded-lg p-4 relative">
                      {!subscriptionLoading &&
                        currentSubscription &&
                        currentSubscription.tier === plan.tier &&
                        currentSubscription.status === "active" &&
                        currentSubscription.billing_interval === "month" && (
                          <div className="absolute -top-2 -right-2 bg-white border border-border text-xs font-semibold px-2 py-1 rounded">
                            Current Plan
                          </div>
                        )}
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <div className="text-3xl font-bold">
                            {plan.monthly.price}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            per month
                          </div>
                        </div>
                        {plan.tier === "free" ? (
                          currentSubscription?.tier === "premium" &&
                          currentSubscription?.status === "active" ? (
                            <Button
                              onClick={handleCancelSubscription}
                              disabled={loading === "cancel"}
                              variant="outline"
                              className="ml-4"
                              size="sm"
                            >
                              {loading === "cancel" ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Downgrading...
                                </>
                              ) : (
                                <>
                                  <X className="mr-2 h-4 w-4" />
                                  Downgrade to Free
                                </>
                              )}
                            </Button>
                          ) : (
                            <></>
                          )
                        ) : (
                          <Button
                            onClick={() =>
                              handleSubscribe(
                                plan.tier as "free" | "premium",
                                "month"
                              )
                            }
                            disabled={
                              loading === `${plan.tier}-month` ||
                              (currentSubscription?.tier === plan.tier &&
                                currentSubscription?.status === "active" &&
                                currentSubscription?.billing_interval ===
                                  "month")
                            }
                            variant={
                              currentSubscription?.tier === plan.tier &&
                              currentSubscription?.status === "active" &&
                              currentSubscription?.billing_interval === "month"
                                ? "secondary"
                                : "outline"
                            }
                            className="ml-4"
                            size="sm"
                          >
                            {loading === `${plan.tier}-month` ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Processing...
                              </>
                            ) : currentSubscription?.tier === plan.tier &&
                              currentSubscription?.status === "active" &&
                              currentSubscription?.billing_interval ===
                                "month" ? (
                              <>
                                <Check className="mr-2 h-4 w-4" />
                                Current
                              </>
                            ) : (
                              "Subscribe"
                            )}
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Yearly Plan - Only show for premium */}
                    {plan.yearly && (
                      <div className="border rounded-lg p-4 border-primary relative">
                        {!subscriptionLoading &&
                          currentSubscription &&
                          currentSubscription.tier === plan.tier &&
                          currentSubscription.status === "active" &&
                          currentSubscription.billing_interval === "year" && (
                            <div className="absolute -top-2 -right-2 bg-white border border-border text-xs font-semibold px-2 py-1 rounded">
                              Current Plan
                            </div>
                          )}
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
                            onClick={() =>
                              handleSubscribe(
                                plan.tier as "free" | "premium",
                                "year"
                              )
                            }
                            disabled={
                              loading === `${plan.tier}-year` ||
                              (currentSubscription?.tier === plan.tier &&
                                currentSubscription?.status === "active" &&
                                currentSubscription?.billing_interval ===
                                  "year")
                            }
                            variant={
                              currentSubscription?.tier === plan.tier &&
                              currentSubscription?.status === "active" &&
                              currentSubscription?.billing_interval === "year"
                                ? "secondary"
                                : "default"
                            }
                            className="ml-4"
                            size="sm"
                          >
                            {loading === `${plan.tier}-year` ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Processing...
                              </>
                            ) : currentSubscription?.tier === plan.tier &&
                              currentSubscription?.status === "active" &&
                              currentSubscription?.billing_interval ===
                                "year" ? (
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
                    )}
                  </div>

                  <ul className="space-y-2">
                    {plan.monthly.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-primary" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Show subscription details only for current active plan */}
                  {!subscriptionLoading &&
                    currentSubscription &&
                    currentSubscription.tier === plan.tier &&
                    currentSubscription.status === "active" && (
                      <div className="mt-4 pt-4 border-t space-y-2">
                        {currentSubscription.billing_interval && (
                          <div className="text-sm">
                            <span className="text-muted-foreground">
                              Billing:{" "}
                            </span>
                            <span className="font-medium capitalize">
                              {currentSubscription.billing_interval}ly
                            </span>
                          </div>
                        )}
                        {currentSubscription.current_period_end && (
                          <div className="text-sm">
                            <span className="text-muted-foreground">
                              {currentSubscription.status === "active"
                                ? "Renews: "
                                : "Expires: "}
                            </span>
                            <span className="font-medium">
                              {new Date(
                                currentSubscription.current_period_end
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                </div>
              ))}
            </div>
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
