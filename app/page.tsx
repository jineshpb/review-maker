import { auth } from "@clerk/nextjs/server";
import { ReviewEditor } from "@/components/editor/ReviewEditor";

import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

export default async function Home() {
  const { userId } = await auth();

  return (
    <div className=" mx-auto max-w-[1600px] mt-32 px-24 h-full">
      <div className="mb-8 text-left">
        <h1 className="text-4xl font-bold tracking-tight mb-2">
          Review Screenshot Design
        </h1>
        <p className="text-muted-foreground text-lg">
          Create authentic review screenshots for Google, Amazon, Yelp, and more
        </p>
      </div>

      <ReviewEditor isAuthenticated={!!userId} />
    </div>
  );
}
