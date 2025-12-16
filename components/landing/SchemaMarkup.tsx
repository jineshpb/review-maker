export const SchemaMarkup = () => {
  const websiteUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://reviewpicasso.com";

  // WebSite Schema - helps with site search and sitelinks
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "ReviewPicasso",
    url: websiteUrl,
    description:
      "Create authentic review screenshots for Google Reviews, Trustpilot, Amazon, TripAdvisor and more. AI-powered review generator with customizable templates.",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${websiteUrl}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  // SoftwareApplication Schema - describes your web app
  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "ReviewPicasso",
    applicationCategory: "DesignApplication",
    operatingSystem: "Web Browser",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: `${websiteUrl}/sign-up`,
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: "127",
    },
    description:
      "Professional review screenshot generator. Create authentic-looking review screenshots for Google Reviews, Trustpilot, Amazon, TripAdvisor, Yelp, and more. Features AI-powered content generation, customizable templates, and high-resolution exports.",
    featureList: [
      "Multiple platform templates (Google, Trustpilot, Amazon, TripAdvisor, Yelp)",
      "AI-powered review content generation",
      "Customizable ratings, dates, and reviewer names",
      "High-resolution screenshot exports",
      "Real-time preview",
      "No design skills required",
    ],
    screenshot: `${websiteUrl}/screenshot.png`,
    url: websiteUrl,
    softwareVersion: "1.0",
  };

  // Organization Schema - for your brand/company
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "ReviewPicasso",
    url: websiteUrl,
    logo: `${websiteUrl}/logo.svg`,
    description:
      "ReviewPicasso - Create authentic review screenshots for marketing, presentations, and design projects.",
    sameAs: [
      // Add your social media links here when available
      // "https://twitter.com/reviewpicasso",
      // "https://linkedin.com/company/reviewpicasso",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Customer Support",
      email: "support@reviewpicasso.com", // Update with your actual email
      availableLanguage: ["English"],
    },
  };

  // BreadcrumbList Schema - helps with navigation in search results
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: websiteUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Dashboard",
        item: `${websiteUrl}/dashboard`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "Pricing",
        item: `${websiteUrl}/subscription`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
    </>
  );
};
