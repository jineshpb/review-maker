import Link from "next/link";
import { Button } from "../ui/button";
import { auth } from "@clerk/nextjs/server";
import Image from "next/image";
import { GlassButton } from "../ui/glass-button";

// Navigation Component
const LandingHeader = async () => {
  const { userId } = await auth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-linear-to-b from-black to-black/90 backdrop-blur-sm border-b border-white/10">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.svg" alt="Logo" width={32} height={32} />
            <span className="text-lg font-semibold bg-linear-to-br tracking-tight from-white via-white/90 to-white/10 bg-clip-text text-transparent">
              ReviewPicasso
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <GlassButton asChild>
              <Link href="/sign-in">Sign In</Link>
            </GlassButton>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default LandingHeader;
