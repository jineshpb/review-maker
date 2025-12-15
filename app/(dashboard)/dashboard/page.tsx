import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/DashboardLayout";
import { UserSync } from "@/components/UserSync";
import { getUserSubscription } from "@/lib/supabase/subscriptions";

export default async function DashboardPage() {
  const { userId } = await auth();

  const subscriptionData = await getUserSubscription();
  // console.log("@@subscriptionData", subscriptionData);

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="h-screen bg-white flex flex-col">
      {/* Sync user to Supabase on page load (creates user + subscription if needed) */}
      <UserSync />

      <div className="flex-1 overflow-hidden">
        <DashboardLayout
          isAuthenticated={true}
          subscriptionData={subscriptionData.data}
        />
      </div>
    </div>
  );
}
