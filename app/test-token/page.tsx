"use client";

import { useAuth } from "@clerk/nextjs";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";

/**
 * Test page to get JWT token for API testing
 * DELETE THIS PAGE BEFORE PRODUCTION!
 */
export default function TestTokenPage() {
  const { getToken, userId, isLoaded } = useAuth();
  const [token, setToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleGetToken = async () => {
    setLoading(true);
    try {
      const jwtToken = await getToken();
      setToken(jwtToken);
    } catch (error) {
      console.error("Error getting token:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (token) {
      await navigator.clipboard.writeText(token);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isLoaded) {
    return <div className="p-8">Loading...</div>;
  }

  if (!userId) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Get JWT Token</h1>
        <p className="text-gray-600">You must be logged in to get a token.</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Get JWT Token for API Testing</h1>
      <p className="text-gray-600 mb-6">
        Use this token in Postman with:{" "}
        <code className="bg-gray-100 px-2 py-1 rounded">
          Authorization: Bearer TOKEN
        </code>
      </p>

      <div className="space-y-4">
        <Button onClick={handleGetToken} disabled={loading}>
          {loading ? "Getting Token..." : "Get JWT Token"}
        </Button>

        {token && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <label className="font-medium">Your JWT Token:</label>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="flex items-center gap-2"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy
                  </>
                )}
              </Button>
            </div>
            <div className="bg-gray-100 p-4 rounded-lg break-all font-mono text-sm">
              {token}
            </div>
            <p className="text-sm text-gray-500">
              Token length: {token.length} characters
            </p>
          </div>
        )}

        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h2 className="font-bold mb-2">How to use in Postman:</h2>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Copy the token above</li>
            <li>
              In Postman, add header:{" "}
              <code>Authorization: Bearer YOUR_TOKEN</code>
            </li>
            <li>Test your API routes!</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
