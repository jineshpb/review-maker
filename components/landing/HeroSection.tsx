"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { GlassButton } from "@/components/ui/glass-button";
import ToneGrid from "@/components/landing/ToneGrid";
import { useState, useEffect } from "react";
import Image from "next/image";

export const HeroSection = () => {
  const fullText =
    "I bought this car battery a few months ago, and overall, I'm quite satisfied. It fits perfectly in my vehicle and has been reliable so far, even in cold weather. The price was reasonable compared to other options I looked at. My only concern is that the connections could be a bit tighter, as they loosened slightly after installation";
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const handleToneGridClick = () => {
    if (isTyping) return; // Prevent multiple triggers
    setIsTyping(true);
    setDisplayedText("");
  };

  useEffect(() => {
    if (!isTyping) return;

    let currentIndex = 0;
    const typingInterval = setInterval(() => {
      if (currentIndex < fullText.length) {
        setDisplayedText(fullText.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        setIsTyping(false);
        clearInterval(typingInterval);
      }
    }, 30); // Adjust speed here (lower = faster)

    return () => clearInterval(typingInterval);
  }, [isTyping, fullText]);

  return (
    <section className="relative pt-32 pb-24 overflow-hidden">
      {/* Background blur effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1054px] h-[1054px] rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[807px] h-[807px] rounded-full bg-primary/5 blur-2xl" />
      </div>

      <div className=" mx-auto px-6 relative z-10">
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
            <Link href="/dashboard">
              TRY FOR FREE
              <ChevronRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </GlassButton>
        </div>
        <div className="absolute inset-0 pointer-events-none top-0  ">
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
        </div>

        {/* Hero Preview - App Screenshot */}
        <div className="mt-20 relative">
          <div className="relative mx-auto max-w-5xl">
            {/* Tone Control Grid */}
            <div className="absolute -bottom-8  left-[300px] w-[300px] h-[300px] z-10 drop-shadow-2xl/50">
              <ToneGrid onClick={handleToneGridClick} />
            </div>
            {/* Dashboard Preview - Dark Theme Glassmorphism */}
            <div className="backdrop-blur-[7.5px] bg-[rgba(5,5,5,0.9)] border-[0.75px] border-white/10 rounded-[22.5px] shadow-[0px_3.75px_7.5px_0px_rgba(0,0,0,0.05),0px_11.25px_22.5px_0px_rgba(0,0,0,0.05),0px_22.5px_45px_0px_rgba(0,0,0,0.1)] overflow-hidden mix-blend-screen">
              <div className="flex h-[627px]">
                {/* Sidebar */}
                <div className="bg-black/60 border-r border-white/10 p-[15px] w-[217px] flex flex-col justify-between">
                  {/* Logo */}
                  <div className="flex flex-col gap-[30px]">
                    <div className="flex gap-1 items-center p-1">
                      <span className="text-[14px] font-medium text-white/50 ">
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
                      <div className="flex flex-col gap-1">
                        <div className="bg-[rgba(201,100,66,0.3)] px-2 py-2 rounded-lg">
                          <p className="text-[12px] font-normal text-[#c96442] line-clamp-2">
                            I bought this car battery a few months ago, and
                            overall, I'm quite satisfied. It
                          </p>
                        </div>
                        <div className="px-2 py-2 rounded-lg relative">
                          <div className="absolute left-0 top-0 bottom-0 w-[2.25px] bg-white/20 blur-sm" />
                          <p className="text-[12px] font-normal text-white/70 line-clamp-2">
                            I recently visited Latina Mommy for a family event,
                            and I must say, it was an outstanding experience
                            from st
                          </p>
                        </div>
                        <div className="px-2 py-2 rounded-lg relative">
                          <div className="absolute left-0 top-0 bottom-0 w-[2.25px] bg-white/20 blur-sm" />
                          <p className="text-[12px] font-normal text-white/70 line-clamp-2">
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
                    <button className="flex items-center px-2 py-2 rounded-lg relative gap-2 justify-center">
                      <div className="w-4 h-4 bg-white/20 rounded" />
                      <span className="text-[10.5px] font-medium text-white/70 flex-1 text-left">
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
                    <p className="text-[10px] font-medium text-white/50 uppercase mb-2">
                      Choose Platform
                    </p>
                    <div className="flex gap-2">
                      {/* Google */}
                      <div className="bg-black/10 border-[0.75px] border-white/20 rounded-md p-1.5 flex gap-1.5 flex-1 items-center">
                        <div className="w-6 h-6 bg-blue-900 rounded-full flex items-center justify-center shrink-0">
                          <span className="text-[12px] font-bold text-white flex items-center justify-center">
                            G
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[9.75px] font-medium text-white text-left">
                            Google review
                          </p>
                          <p className="text-[9.75px] text-white/70">
                            Google map review style
                          </p>
                        </div>
                      </div>
                      {/* Amazon */}
                      <div className="bg-black/10 border-[0.75px] border-white/10 rounded-md p-1.5 flex gap-1.5 flex-1 items-center">
                        <div className="w-6 h-6 bg-orange-900 rounded-full flex items-center justify-center shrink-0">
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
                      <div className="bg-black/10 border-[0.75px] border-white/10 rounded-md p-1.5 flex gap-1.5 flex-1 items-center">
                        <div className="w-6 h-6 bg-green-900 rounded-full flex items-center justify-center shrink-0">
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
                    <div className="w-[262px] flex flex-col gap-2 ">
                      {/* AI Fill Button */}
                      <div className="border-[0.75px] border-white/10 rounded-md p-1.5 flex items-center gap-1.5 h-7">
                        <div className="w-3.5 h-3.5 bg-white/20 rounded" />
                        <span className="text-[9.75px] text-white flex-1">
                          Ai fill
                        </span>
                        <div className="w-[29px] h-4 bg-white/10 rounded" />
                      </div>
                    </div>

                    {/* Review Preview Card */}
                    <div className="flex-1 bg-black/10 border-[0.75px] border-white/10 rounded-md p-1.5 relative">
                      <div className="bg-black/10 border-[0.75px] border-white/10 rounded-md p-3">
                        {/* Reviewer Info */}
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-6 h-6 bg-blue-200/20 rounded-full flex items-center justify-center relative shrink-0">
                            <span className="text-[12px] font-bold text-white">
                              J
                            </span>
                            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-orange-200/20 rounded-full border border-black" />
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
                                className="w-3 h-3 bg-gray-200/20 rounded-sm"
                              />
                            ))}
                          </div>
                          <span className="text-[9.75px] text-white/70">
                            1 years ago
                          </span>
                        </div>

                        {/* Review Text */}
                        <p className="text-[12px] text-white/50 leading-[15px] ">
                          {displayedText || fullText}
                          {isTyping && (
                            <span className="inline-block w-0.5 h-3 bg-white/70 ml-0.5 animate-pulse" />
                          )}
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
