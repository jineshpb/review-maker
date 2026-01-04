"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2 } from "lucide-react";
import Link from "next/link";

export default function SubscriptionSuccessPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<any>(null);

  useEffect(() => {
    // Check subscription status and sync from Razorpay if needed
    const checkSubscription = async () => {
      try {
        // Get subscription ID from URL params
        const params = new URLSearchParams(window.location.search);
        const subscriptionId = params.get("subscription_id");

        // If we have subscription ID, sync from Razorpay first
        if (subscriptionId) {
          try {
            await fetch("/api/subscription/sync", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ subscriptionId }),
            });
            console.log("✅ Subscription synced from Razorpay");
          } catch (syncError) {
            console.warn("⚠️ Failed to sync subscription:", syncError);
            // Continue anyway - status endpoint will also try to sync
          }
        }

        // Then fetch updated status
        const response = await fetch("/api/subscription/status");
        const data = await response.json();

        if (data.subscription) {
          setSubscription(data.subscription);
        }
      } catch (error) {
        console.error("Error checking subscription:", error);
      } finally {
        setLoading(false);
      }
    };

    checkSubscription();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full mx-4">
        <div className="bg-card border rounded-lg p-8 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Subscription Activated!</h1>
          <p className="text-muted-foreground mb-6">
            Your {subscription?.tier || "premium"} subscription is now active.
          </p>

          {subscription && (
            <div className="bg-muted rounded-lg p-4 mb-6 text-left">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-muted-foreground">Plan:</span>
                <span className="font-semibold capitalize">
                  {subscription.tier}
                </span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-muted-foreground">Status:</span>
                <span className="font-semibold capitalize">
                  {subscription.status}
                </span>
              </div>
              {subscription.current_period_end && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Renews:</span>
                  <span className="text-sm">
                    {new Date(
                      subscription.current_period_end
                    ).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-4">
            <Button
              onClick={() => router.push("/dashboard")}
              className="flex-1"
            >
              Go to Dashboard
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/subscription")}
            >
              Manage Subscription
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
