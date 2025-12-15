import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GlassButton } from "@/components/ui/glass-button";
import { PlatformCard } from "@/components/landing/features/PlatformCard";
import { AIGenerationCard } from "@/components/landing/features/AIGenerationCard";
import { CustomizableTemplatesCard } from "@/components/landing/features/CustomizableTemplatesCard";
import { HighResolutionExportsCard } from "@/components/landing/features/HighResolutionExportsCard";
import { ArrowUp, ChevronRight } from "lucide-react";
import Image from "next/image";
import LandingHeader from "@/components/landing/landingHeader";
import { HeroSection } from "@/components/landing/HeroSection";

// Features Section Component
const FeaturesSection = () => {
  return (
    <section className="relative py-44 overflow-hidden">
      {/* Background blur */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none top-0 opacity-40 ">
        <Image
          src="/circle.png"
          alt="Circle"
          width={400}
          height={400}
          className="absolute inset-0 object-cover top-0 left-1/2 z-10 w-[800px] h-[800px] -translate-x-[400px] translate-y-[180px]  blur-3xl"
        />

        <div className="absolute top-[200px] left-1/2 -translate-x-1/2 w-[1054px] h-[1054px] rounded-full bg-linear-to-br from-[#D97757] to-[#EF4444] blur-3xl " />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <h2 className="text-5xl md:text-6xl font-bold text-center mb-20 bg-linear-to-br from-white to-white/10 bg-clip-text text-transparent tracking-tight">
          Features
        </h2>

        <div className="grid md:grid-cols-2 xl:grid-cols-5 gap-8 max-w-7xl mx-auto">
          {/* Feature 1: Multiple Platforms */}
          <div className="xl:col-span-3">
            <PlatformCard />
          </div>

          {/* Feature 2: AI-Powered Generation */}
          <div className="xl:col-span-2">
            <AIGenerationCard />
          </div>

          {/* Feature 3: Customizable Templates */}
          <div className="xl:col-span-2">
            <CustomizableTemplatesCard />
          </div>

          {/* Feature 4: High Resolution Exports */}
          <div className="xl:col-span-3">
            <HighResolutionExportsCard />
          </div>
        </div>
      </div>
    </section>
  );
};

// CTA Section Component
const CTASection = () => {
  return (
    <section className="relative overflow-hidden w-full h-full !mx-0  py-40">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1054px] h-[1054px] rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className=" mx-auto px-6 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-medium tracking-tighter  bg-linear-to-br from-white to-white/10 bg-clip-text text-transparent leading-tight ">
            Ready to get started ?
          </h2>
          <p className="text-xl text-white/50 tracking-tight mb-10">
            Create your first review screenshot in minutes. <br /> No credit
            card required.
          </p>
          <GlassButton asChild className="group">
            <Link href="/sign-up">
              START FREE TRIAL
              <ChevronRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </GlassButton>
        </div>
      </div>
    </section>
  );
};

// Footer Section Component
const FooterSection = () => {
  return (
    <footer className="border-t border-white/10 flex flex-col items-center justify-center">
      <div className="text-center overflow-hidden font-bold w-full text-white/10 text-[40px] lg:text-[100px] xl:text-[200px] tracking-tighter bg-linear-to-br mt-8 from-white/20 to-black bg-clip-text">
        ReviewPicasso
      </div>
      <div className="container mx-auto px-6 py-16">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Logo */}
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Image
                src="/logo.svg"
                alt="Logo"
                width={32}
                height={32}
                className="grayscale"
              />
              <span className="text-lg font-semibold bg-linear-to-br tracking-tight from-white via-white/90 to-white/10 bg-clip-text text-transparent">
                ReviewPicasso
              </span>
            </Link>
          </div>

          {/* Products */}
          <div>
            <h4 className="font-semibold mb-4 text-white/10">Products</h4>
            <ul className="space-y-2 text-sm text-white/50">
              <li>
                <Link href="/dashboard" className="hover:text-white">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/subscription" className="hover:text-foreground">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold mb-4 text-white/10">Company</h4>
            <ul className="space-y-2 text-sm text-white/50">
              <li>
                <Link href="#" className="hover:text-white">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-foreground">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold mb-4 text-white/10">Resources</h4>
            <ul className="space-y-2 text-sm text-white/50">
              <li>
                <Link href="#" className="hover:text-white">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-foreground">
                  Support
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-white/10">
            © 2025 ReviewPicasso. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-sm text-white/10">
            <Link href="#" className="hover:text-white/10">
              Terms of Service
            </Link>
            <span>•</span>
            <Link href="#" className="hover:text-white/10">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

// Main Home Component
export default function Home() {
  return (
    <div className="min-h-screen bg-linear-to-b from-black to-black/90">
      <LandingHeader />

      <HeroSection />
      <FeaturesSection />
      <CTASection />
      <FooterSection />

      {/* Scroll to top button */}
    </div>
  );
}
