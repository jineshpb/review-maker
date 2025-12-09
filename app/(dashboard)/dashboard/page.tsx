import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/DashboardLayout";
import { UserSync } from "@/components/UserSync";
import { getUserSubscription } from "@/lib/supabase/subscriptions";

export default async function DashboardPage() {
  const { userId } = await auth();

  const subscriptionData = await getUserSubscription();
  console.log("@@subscriptionData", subscriptionData);

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] from-background via-background to-muted/20">
      {/* Sync user to Supabase on page load (creates user + subscription if needed) */}
      <UserSync />

      <DashboardLayout
        isAuthenticated={true}
        subscriptionData={subscriptionData.data}
      />
    </div>
  );
}
