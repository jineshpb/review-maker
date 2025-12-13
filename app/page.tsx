import { auth } from "@clerk/nextjs/server";
import { ReviewEditor } from "@/components/editor/ReviewEditor";

import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { DashboardLayout } from "@/components/DashboardLayout";
import { UserSync } from "@/components/UserSync";
import { getUserSubscription } from "@/lib/supabase/subscriptions";
import { redirect } from "next/navigation";

export default async function Home() {
  const { userId } = await auth();

  const subscriptionData = await getUserSubscription();
  // console.log("@@subscriptionData", subscriptionData);

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-white ">
      <UserSync />

      <DashboardLayout
        isAuthenticated={true}
        subscriptionData={subscriptionData.data}
      />
    </div>
  );
}
