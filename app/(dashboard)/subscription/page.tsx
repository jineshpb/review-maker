"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { useAuth, useUser } from "@clerk/nextjs";
import Script from "next/script";
import Header from "@/components/Header";
import { IoArrowBack } from "react-icons/io5";
import {
  PlanCard,
  type PlanTier,
  type BillingInterval,
} from "@/components/subscription";
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
          handler: async function (response: any) {
            console.log("✅ Payment successful:", response);

            // Immediately sync subscription status from Razorpay after payment
            try {
              await fetch("/api/subscription/sync", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  subscriptionId: data.subscriptionId,
                }),
              });
              console.log("✅ Subscription status synced from Razorpay");
            } catch (syncError) {
              console.warn("⚠️ Failed to sync subscription status:", syncError);
              // Continue anyway - webhook will update it eventually
            }

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
        console.log("SubData", data);

        if (response.ok) {
          // Use entitlement as source of truth (not Razorpay subscription)
          // Entitlement is always present (initialized as FREE if missing)
          if (data.entitlement) {
            // Determine status based on entitlement tier and validity
            let status: "active" | "free" | "cancelled" | "expired" = "free";

            if (data.entitlement.tier === "free") {
              status = "active"; // Free tier is always active
            } else if (
              data.entitlement.tier === "premium" ||
              data.entitlement.tier === "enterprise"
            ) {
              // Premium/Enterprise: Check if valid_until is in the future
              if (data.entitlement.hasActivePremium) {
                status = "active";
              } else if (data.entitlement.validUntil) {
                // Has validUntil but it's expired
                status = "expired";
              } else {
                status = "cancelled";
              }
            }

            // Build subscription object from entitlement
            setCurrentSubscription({
              tier: data.entitlement.tier,
              status: status,
              current_period_end: data.entitlement.validUntil,
              billing_interval: data.subscription?.billing_interval || null,
              razorpay_subscription_id:
                data.subscription?.razorpay_subscription_id || null,
            });
          } else if (data.subscription) {
            // Fallback to subscription if entitlement not available (shouldn't happen)
            setCurrentSubscription(data.subscription);
          } else {
            // No entitlement or subscription - default to free tier
            setCurrentSubscription({
              tier: "free",
              status: "active",
              current_period_end: null,
              billing_interval: null,
              razorpay_subscription_id: null,
            });
          }

          // Get credit balance from usage limits (not subscription)
          if (data.usageLimits) {
            setCreditBalance(data.usageLimits.aiCreditsRemaining ?? 0);
          } else {
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
      tier: "free" as PlanTier,
      description: "Perfect for getting started",
      monthly: {
        price: "Free",
        interval: "month" as const,
        features: ["3 Drafts", "Unlimited screenshot downloads"],
      },
    },
    {
      name: "Premium",
      tier: "premium" as PlanTier,
      description: "Perfect for professionals",
      monthly: {
        price: "₹499",
        interval: "month" as const,
        features: [
          "Unlimited drafts",
          "Unlimited screenshot downloads",
          "Ai generation",
          "Priority support",
        ],
      },
      yearly: {
        price: "₹4,999",
        interval: "year" as const,
        savings: "Save 17%",
        features: [
          "Unlimited drafts",
          "Unlimited screenshot downloads",
          "Ai generation",
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
                onClick={() => router.push("/dashboard")}
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
                <PlanCard
                  key={plan.tier}
                  name={plan.name}
                  tier={plan.tier}
                  description={plan.description}
                  monthly={plan.monthly}
                  yearly={plan.yearly}
                  currentSubscription={currentSubscription}
                  subscriptionStatus={
                    currentSubscription?.status as
                      | "active"
                      | "cancelled"
                      | "expired"
                  }
                  subscriptionCurrentPeriodEnd={
                    currentSubscription?.current_period_end
                  }
                  subscriptionBillingInterval={
                    currentSubscription?.billing_interval
                  }
                  loading={loading}
                  onSubscribe={handleSubscribe}
                  onCancelSubscription={
                    plan.tier === "free" ? handleCancelSubscription : undefined
                  }
                />
              ))}
            </div>
          </div>

          <div className="mt-12 text-center text-sm text-muted-foreground">
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
