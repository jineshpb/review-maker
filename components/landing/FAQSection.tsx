"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    question: "How do I create review screenshots?",
    answer:
      "Creating review screenshots is simple with ReviewPicasso. Sign up for a free account, choose your platform (Google, Trustpilot, Amazon, etc.), customize the review content including rating, reviewer name, date, and review text. You can use our AI-powered generator to create realistic review content, or write your own. Once satisfied, download your high-resolution screenshot instantly.",
  },
  {
    question: "Why use ReviewPicasso for review screenshots?",
    answer:
      "ReviewPicasso offers authentic-looking review screenshots for multiple platforms with customizable templates, AI-powered content generation, and high-resolution exports. Perfect for marketing materials, presentations, mockups, or testing how reviews appear on different platforms. No design skills required - create professional review screenshots in minutes.",
  },
  {
    question: "What platforms are supported?",
    answer:
      "ReviewPicasso supports all major review platforms including Google Reviews, Trustpilot, TripAdvisor, Amazon Product Reviews, Yelp, Apple App Store, and more. Each platform template is designed to match the authentic look and feel of the original platform, ensuring your screenshots look realistic and professional.",
  },
  {
    question: "Can I customize the review content?",
    answer:
      "Yes! ReviewPicasso offers full customization options. You can edit the reviewer name, rating (1-5 stars), review date, review text, and even adjust the tone using our AI-powered tone control. Customize colors, fonts, and layout to match your brand or specific needs. All changes are reflected in real-time preview.",
  },
  {
    question: "How does the AI review generator work?",
    answer:
      "Our AI review generator uses advanced language models to create realistic review content based on your business description or prompts. Simply describe your business, product, or service, and our AI will generate authentic-sounding reviews. You can adjust the tone (positive/negative) and style (concise/expanded) using our interactive tone control grid.",
  },
  {
    question: "What resolution are the exported screenshots?",
    answer:
      "ReviewPicasso exports high-resolution screenshots suitable for professional use. All screenshots are exported at optimal quality for web use, presentations, and print materials. The exact resolution depends on the platform template, but all exports maintain crisp, clear quality perfect for any use case.",
  },
  {
    question: "Is there a free trial?",
    answer:
      "Yes! ReviewPicasso offers a free trial with no credit card required. You can create and download review screenshots immediately after signing up. Our free tier includes access to all platform templates and basic customization features. Upgrade to premium for advanced features like unlimited downloads and priority support.",
  },
  {
    question: "Can I use these screenshots commercially?",
    answer:
      "ReviewPicasso screenshots are designed for legitimate use cases such as marketing materials, presentations, mockups, and design projects. However, you should always comply with platform terms of service and local regulations. Never use screenshots to mislead customers or create fake reviews on actual platforms. Always use responsibly and ethically.",
  },
];

export const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  // Generate FAQPage schema for SEO
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <>
      {/* Schema markup for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <section className="relative py-44 overflow-hidden">
        {/* Background blur */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1054px] h-[1054px] rounded-full bg-primary/5 blur-3xl" />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-5xl md:text-6xl font-bold text-center mb-4 bg-linear-to-br from-white to-white/10 bg-clip-text text-transparent tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-white/50 text-center mb-16 tracking-tight">
              Everything you need to know about creating review screenshots
            </p>

            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="border border-white/10 rounded-lg bg-black/20 backdrop-blur-sm overflow-hidden transition-all duration-300 hover:border-white/20"
                >
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="w-full px-6 py-5 flex items-center justify-between text-left group"
                    aria-expanded={openIndex === index}
                  >
                    <h3 className="text-lg font-medium text-white pr-8 group-hover:text-white/90 transition-colors">
                      {faq.question}
                    </h3>
                    <ChevronDown
                      className={cn(
                        "w-5 h-5 text-white/50 shrink-0 transition-transform duration-300",
                        openIndex === index && "rotate-180"
                      )}
                    />
                  </button>
                  <div
                    className={cn(
                      "overflow-hidden transition-all duration-300",
                      openIndex === index
                        ? "max-h-[500px] opacity-100"
                        : "max-h-0 opacity-0"
                    )}
                  >
                    <div className="px-6 pb-5">
                      <p className="text-white/70 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* How-To Section */}
            <div className="mt-20">
              <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 bg-linear-to-br from-white to-white/10 bg-clip-text text-transparent tracking-tight">
                How to Create Review Screenshots
              </h2>
              <p className="text-xl text-white/50 text-center mb-12 tracking-tight">
                Follow these simple steps to create professional review
                screenshots
              </p>

              <div className="grid md:grid-cols-3 gap-6">
                {[
                  {
                    step: "1",
                    title: "Sign Up & Choose Platform",
                    description:
                      "Create your free account and select from our supported platforms like Google Reviews, Trustpilot, Amazon, or TripAdvisor.",
                  },
                  {
                    step: "2",
                    title: "Customize Your Review",
                    description:
                      "Edit the reviewer name, rating, date, and review text. Use our AI generator for realistic content or write your own.",
                  },
                  {
                    step: "3",
                    title: "Download & Use",
                    description:
                      "Preview your screenshot in real-time, make any final adjustments, then download your high-resolution image instantly.",
                  },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="border border-white/10 rounded-lg p-6 bg-black/20 backdrop-blur-sm hover:border-white/20 transition-all duration-300"
                  >
                    <div className="w-12 h-12 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center mb-4">
                      <span className="text-2xl font-bold text-primary">
                        {item.step}
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      {item.title}
                    </h3>
                    <p className="text-white/70 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
