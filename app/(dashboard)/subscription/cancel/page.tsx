"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";

export default function SubscriptionCancelPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full mx-4">
        <div className="bg-card border rounded-lg p-8 text-center">
          <XCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Subscription Cancelled</h1>
          <p className="text-muted-foreground mb-6">
            Your subscription setup was cancelled. No charges were made.
          </p>

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
              Try Again
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
