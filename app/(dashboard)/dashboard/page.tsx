import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ReviewEditor } from "@/components/editor/ReviewEditor";

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="min-h-screen  from-background via-background to-muted/20 mt-32">
      <div className="container mx-auto px-4 py-8 ">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight mb-2">
            Review Screenshot Designer
          </h1>
          <p className="text-muted-foreground text-lg">
            Create authentic review screenshots for Google, Amazon, Yelp, and
            more
          </p>
        </header>

        <ReviewEditor isAuthenticated={true} />
      </div>
    </div>
  );
}
