"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GlassButton } from "@/components/ui/glass-button";
import { PlatformCard } from "@/components/landing/features/PlatformCard";
import { AIGenerationCard } from "@/components/landing/features/AIGenerationCard";
import { CustomizableTemplatesCard } from "@/components/landing/features/CustomizableTemplatesCard";
import { HighResolutionExportsCard } from "@/components/landing/features/HighResolutionExportsCard";
import { ChevronRight, ArrowUp } from "lucide-react";
import Image from "next/image";

// Navigation Component
const Navigation = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-linear-to-b from-black to-black/90 backdrop-blur-sm border-b border-white/10">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-12 h-6 bg-primary rounded border border-white/10" />
            <span className="text-lg font-semibold">ReviewPicasso</span>
          </Link>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link href="/sign-in">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/sign-up">Get Started</Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

// Hero Section Component
const HeroSection = () => {
  return (
    <section className="relative pt-32 pb-24 overflow-hidden">
      {/* Background blur effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1054px] h-[1054px] rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[807px] h-[807px] rounded-full bg-primary/5 blur-2xl" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-6xl md:text-7xl font-medium tracking-tighter mb-6 bg-linear-to-r from-white via-white/90 to-white/10 bg-clip-text text-transparent">
            High quality review screenshots <br /> in seconds
          </h1>
          <p className="text-xl text-white/50 tracking-tight mb-10 max-w-xl mx-auto">
            Get high quality, visually accurate testimonial screenshots for your
            product, service, business or for yourself, Using our award winning
            review generator. Use AI to write if you are stuck
          </p>
          <GlassButton asChild className="group">
            <Link href="/sign-up">
              TRY FOR FREE
              <ChevronRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </GlassButton>
        </div>

        {/* Hero Preview - App Screenshot */}
        <div className="mt-20 relative">
          <div className="relative mx-auto max-w-5xl">
            {/* Dashboard Preview - Dark Theme Glassmorphism */}
            <div className="backdrop-blur-[7.5px] bg-[rgba(5,5,5,0.9)] border-[0.75px] border-white/10 rounded-[22.5px] shadow-[0px_3.75px_7.5px_0px_rgba(0,0,0,0.05),0px_11.25px_22.5px_0px_rgba(0,0,0,0.05),0px_22.5px_45px_0px_rgba(0,0,0,0.1)] overflow-hidden mix-blend-screen">
              <div className="flex h-[627px]">
                {/* Sidebar */}
                <div className="bg-black/60 border-r border-white/10 p-[15px] w-[217px] flex flex-col justify-between">
                  {/* Logo */}
                  <div className="flex flex-col gap-[30px]">
                    <div className="flex gap-1 items-center p-1">
                      <div className="w-[50px] h-[25.85px] bg-primary rounded" />
                      <span className="text-[18px] font-bold text-white tracking-[-0.9px]">
                        ReviewPicasso
                      </span>
                    </div>

                    {/* Drafts Menu */}
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[12px] text-[#e9e6dc]">
                          Drafts
                        </span>
                        <button className="backdrop-blur-[10px] bg-white/2 border border-white/10 px-4 py-1.5 rounded-lg text-[14px] font-medium text-white shadow-[0px_1px_22px_0px_rgba(255,255,255,0.1)]">
                          New draft
                        </button>
                      </div>

                      {/* Draft Items */}
                      <div className="flex flex-col gap-2">
                        <div className="bg-[rgba(201,100,66,0.3)] px-5 py-2.5 rounded-lg">
                          <p className="text-[10.5px] font-medium text-[#c96442] line-clamp-2">
                            I bought this car battery a few months ago, and
                            overall, I'm quite satisfied. It
                          </p>
                        </div>
                        <div className="px-5 py-2.5 rounded-lg relative">
                          <div className="absolute left-0 top-0 bottom-0 w-[2.25px] bg-white/20 blur-sm" />
                          <p className="text-[10.5px] font-medium text-white/70 line-clamp-2">
                            I recently visited Latina Mommy for a family event,
                            and I must say, it was an outstanding experience
                            from st
                          </p>
                        </div>
                        <div className="px-5 py-2.5 rounded-lg relative">
                          <div className="absolute left-0 top-0 bottom-0 w-[2.25px] bg-white/20 blur-sm" />
                          <p className="text-[10.5px] font-medium text-white/70 line-clamp-2">
                            I had an amazing experience at this Indian
                            restaurant! The ambiance was warm and inviting,
                            perfect for a cozy dinner. The staff was friendly
                            and attentive, making sure we had e
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Premium Plan Button */}
                  <div className="flex flex-col gap-3">
                    <div className="h-[0.75px] bg-white/10 rounded" />
                    <button className="flex items-center gap-2 px-4 py-2 rounded-lg relative">
                      <div className="w-4 h-4 bg-white/20 rounded" />
                      <span className="text-[10.5px] font-medium text-white/70 flex-1">
                        Premium plan
                      </span>
                      <div className="absolute left-0 top-0 bottom-0 w-[2.25px] bg-white/20 blur-sm" />
                    </button>
                  </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 p-[15px] flex flex-col gap-[15px] relative">
                  {/* Background Pattern */}
                  <div
                    className="absolute inset-0 opacity-20 pointer-events-none"
                    style={{
                      backgroundImage:
                        "repeating-linear-gradient(0deg, transparent, transparent 60px, rgba(255,255,255,0.03) 60px, rgba(255,255,255,0.03) 61px)",
                      backgroundSize: "71px 61px",
                    }}
                  />

                  {/* Header */}
                  <div className="flex items-center justify-between relative z-10">
                    <div className="backdrop-blur-[7.5px] px-2 py-1 rounded-full text-[9.75px] font-medium text-white">
                      Car battery shop
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Theme Toggle */}
                      <div className="backdrop-blur-[10px] bg-black/60 border border-white/10 p-0.5 rounded-full flex gap-1.5">
                        <div className="w-[21px] h-[21px] bg-black/60 border border-white/10 rounded-full flex items-center justify-center">
                          <div className="w-3 h-3 bg-white/20 rounded-full" />
                        </div>
                        <div className="w-[21px] h-[21px] bg-black/60 border border-white/10 rounded-full flex items-center justify-center">
                          <div className="w-3 h-3 bg-white rounded-full" />
                        </div>
                      </div>
                      {/* Avatar */}
                      <div className="w-[37.5px] h-[37.5px] rounded-full bg-white/10 border border-white/10" />
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="h-[0.75px] bg-white/10 rounded relative z-10" />

                  {/* Platform Selector */}
                  <div className="relative z-10">
                    <p className="text-[16px] font-medium text-[#e5e5e2] uppercase mb-2">
                      Choose Platform
                    </p>
                    <div className="flex gap-2">
                      {/* Google */}
                      <div className="bg-black/10 border-[0.75px] border-white/10 rounded-md p-1.5 flex gap-1.5 flex-1">
                        <div className="w-6 h-6 bg-[#08f] rounded-full flex items-center justify-center shrink-0">
                          <span className="text-[12px] font-bold text-white">
                            G
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[9.75px] font-medium text-white">
                            Google review
                          </p>
                          <p className="text-[9.75px] text-white/70">
                            Google map review style
                          </p>
                        </div>
                      </div>
                      {/* Amazon */}
                      <div className="bg-black/10 border-[0.75px] border-white/10 rounded-md p-1.5 flex gap-1.5 flex-1">
                        <div className="w-6 h-6 bg-[#ff8d28] rounded-full flex items-center justify-center shrink-0">
                          <span className="text-[12px] font-bold text-white">
                            A
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[9.75px] font-medium text-white">
                            Amazon
                          </p>
                          <p className="text-[9.75px] text-white/70">
                            Product review style
                          </p>
                        </div>
                      </div>
                      {/* Trustpilot */}
                      <div className="bg-black/10 border-[0.75px] border-white/10 rounded-md p-1.5 flex gap-1.5 flex-1">
                        <div className="w-6 h-6 bg-[#34c759] rounded-full flex items-center justify-center shrink-0">
                          <span className="text-[12px] font-bold text-white">
                            T
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[9.75px] font-medium text-white">
                            Trustpilot
                          </p>
                          <p className="text-[9.75px] text-white/70">
                            Business review platform
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="h-[0.75px] bg-white/10 rounded relative z-10" />

                  {/* AI Fill & Review Preview */}
                  <div className="flex gap-[15px] flex-1 relative z-10">
                    {/* AI Fill Section */}
                    <div className="w-[262px] flex flex-col gap-2">
                      {/* AI Fill Button */}
                      <div className="border-[0.75px] border-white/10 rounded-md p-1.5 flex items-center gap-1.5 h-7">
                        <div className="w-3.5 h-3.5 bg-white/20 rounded" />
                        <span className="text-[9.75px] text-white flex-1">
                          Ai fill
                        </span>
                        <div className="w-[29px] h-4 bg-white/10 rounded" />
                      </div>

                      {/* Tone Control Grid */}
                      <div
                        className="flex-1 border border-white/10 rounded-lg p-2 relative aspect-square"
                        style={{
                          background:
                            "linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.1) 100%), linear-gradient(90deg, rgba(222, 217, 213, 0.1) 0%, rgba(222, 217, 213, 0.1) 100%)",
                        }}
                      >
                        {/* Labels */}
                        <div className="absolute inset-0 pointer-events-none">
                          <p className="absolute top-2 left-1/2 -translate-x-1/2 text-[9.75px] font-medium text-[#929292]">
                            Positive
                          </p>
                          <p
                            className="absolute left-2 top-1/2 -translate-y-1/2 text-[9.75px] font-medium text-[#929292]"
                            style={{
                              writingMode: "vertical-rl",
                              textOrientation: "mixed",
                            }}
                          >
                            Concise
                          </p>
                          <p
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-[9.75px] font-medium text-[#929292]"
                            style={{
                              writingMode: "vertical-rl",
                              textOrientation: "mixed",
                            }}
                          >
                            Expanded
                          </p>
                          <p className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[9.75px] font-medium text-[#929292]">
                            Negative
                          </p>
                        </div>
                        {/* Grid Lines */}
                        <div className="absolute inset-0">
                          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/10 -translate-x-1/2" />
                          <div className="absolute top-1/2 left-0 right-0 h-px bg-white/10 -translate-y-1/2" />
                        </div>
                        {/* Puck */}
                        <div className="absolute left-[123px] top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-[#ac7f5e] border border-white rounded-full shadow-lg" />
                      </div>
                    </div>

                    {/* Review Preview Card */}
                    <div className="flex-1 bg-black/10 border-[0.75px] border-white/10 rounded-md p-1.5 relative">
                      <div className="bg-black/10 border-[0.75px] border-white/10 rounded-md p-3">
                        {/* Reviewer Info */}
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-6 h-6 bg-[#08f] rounded-full flex items-center justify-center relative shrink-0">
                            <span className="text-[12px] font-bold text-white">
                              J
                            </span>
                            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-[#ff8d28] rounded-full border border-black" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[9.75px] font-medium text-white">
                              John Doe
                            </p>
                            <p className="text-[9.75px] text-white/70">
                              Local guide - 42 reviews - 8 photos
                            </p>
                          </div>
                          <div className="w-[18px] h-[18px] bg-white/10 rounded" />
                        </div>

                        {/* Rating & Date */}
                        <div className="flex items-center gap-1.5 mb-3">
                          <div className="flex gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <div
                                key={i}
                                className="w-3 h-3 bg-yellow-400 rounded-sm"
                              />
                            ))}
                          </div>
                          <span className="text-[9.75px] text-white/70">
                            1 years ago
                          </span>
                        </div>

                        {/* Review Text */}
                        <p className="text-[9.75px] text-white/70 leading-[15px]">
                          I bought this car battery a few months ago, and
                          overall, I'm quite satisfied. It fits perfectly in my
                          vehicle and has been reliable so far, even in cold
                          weather. The price was reasonable compared to other
                          options I looked at. My only concern is that the
                          connections could be a bit tighter, as they loosened
                          slightly after installation
                        </p>
                      </div>

                      {/* Download Button */}
                      <button className="absolute bottom-2 right-2 backdrop-blur-[10px] bg-white/2 border border-white/10 px-4 py-1.5 rounded-lg text-[14px] font-medium text-white shadow-[0px_1px_22px_0px_rgba(255,255,255,0.1)]">
                        Download
                      </button>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="h-[0.75px] bg-white/10 rounded relative z-10" />

                  {/* Inner Shadow */}
                  <div className="absolute inset-0 pointer-events-none shadow-[inset_0px_37.5px_75px_0px_rgba(255,255,255,0.15)]" />
                </div>
              </div>
            </div>

            {/* Floating elements */}
            <div className="absolute -right-8 top-1/4 w-36 h-36 rounded-full bg-primary/20 blur-xl" />
            <div className="absolute -left-8 bottom-1/4 w-28 h-28 rounded-full bg-primary/10 blur-xl" />
          </div>
        </div>
      </div>
    </section>
  );
};

// Features Section Component
const FeaturesSection = () => {
  return (
    <section className="relative py-44 overflow-hidden">
      {/* <Image
        src="/Blur.png"
        alt="Features Background"
        width={1000}
        height={1000}
        className="absolute inset-0 w-full h-full object-cover"
      /> */}

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
    <section className="relative py-24 overflow-hidden mt-20">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1054px] h-[1054px] rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className=" mx-auto px-6 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-medium tracking-tighter mb-2 bg-linear-to-br from-white to-white/10 bg-clip-text text-transparent leading-tight pb-2">
            Ready to get started ?
          </h2>
          <p className="text-xl text-white/50 tracking-tight mb-10">
            Create your first review screenshot in minutes. No credit card
            required.
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
    <footer className="border-t border-white/10">
      <div className="container mx-auto px-6 py-16">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Logo */}
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-12 h-6 bg-primary rounded" />
              <span className="text-lg font-semibold">ReviewPicasso</span>
            </Link>
          </div>

          {/* Products */}
          <div>
            <h4 className="font-semibold mb-4">Products</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/dashboard" className="hover:text-foreground">
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
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="#" className="hover:text-foreground">
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
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="#" className="hover:text-foreground">
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
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © 2024 ReviewPicasso. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="#" className="hover:text-foreground">
              Terms of Service
            </Link>
            <span>•</span>
            <Link href="#" className="hover:text-foreground">
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
      <Navigation />
      <HeroSection />
      <FeaturesSection />
      <CTASection />
      <FooterSection />

      {/* Scroll to top button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="fixed bottom-8 right-8 w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center"
        aria-label="Scroll to top"
      >
        <ArrowUp className="w-5 h-5" />
      </button>
    </div>
  );
}
