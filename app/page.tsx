import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-white">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6 text-gray-900">
            Create Authentic Review Screenshots
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Design and generate professional review screenshots for Google,
            Trustpilot, TripAdvisor, and more. Perfect for marketing,
            presentations, and social proof.
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/sign-up">Get Started</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            Features
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-3 text-gray-900">
                Multiple Platforms
              </h3>
              <p className="text-gray-600">
                Support for Google Reviews, Trustpilot, TripAdvisor, Amazon, and
                more.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-3 text-gray-900">
                AI-Powered Generation
              </h3>
              <p className="text-gray-600">
                Use AI to generate realistic review content tailored to your
                business.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-3 text-gray-900">
                Customizable Templates
              </h3>
              <p className="text-gray-600">
                Customize ratings, dates, reviewer names, and review text to
                match your needs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4 text-gray-900">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Create your first review screenshot in minutes.
          </p>
          <Button asChild size="lg">
            <Link href="/sign-up">Sign Up Free</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
