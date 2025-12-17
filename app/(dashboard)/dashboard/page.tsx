import { auth } from "@clerk/nextjs/server";
import { DashboardLayout } from "@/components/DashboardLayout";
import { UserSync } from "@/components/UserSync";
import { getUserSubscription } from "@/lib/supabase/subscriptions";

export default async function DashboardPage() {
  const { userId } = await auth();

  // Only fetch subscription if user is authenticated
  const subscriptionData = userId ? await getUserSubscription() : null;

  return (
    <div className="h-screen bg-white flex flex-col">
      {/* Sync user to Supabase on page load (only if authenticated) */}
      {userId && <UserSync />}

      <div className="flex-1 overflow-hidden">
        <DashboardLayout
          isAuthenticated={!!userId}
          subscriptionData={subscriptionData?.data || null}
        />
      </div>
    </div>
  );
}
