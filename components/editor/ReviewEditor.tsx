"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { PlatformSelector } from "./PlatformSelector";
import { ReviewPreview } from "./ReviewPreview";
import { ReviewForm } from "./ReviewForm";
import { Button } from "@/components/ui/button";
import { Download, Save } from "lucide-react";
import html2canvas from "html2canvas";
import { toast } from "@/hooks/use-toast";

interface ReviewEditorProps {
  isAuthenticated: boolean;
}

export const ReviewEditor = ({ isAuthenticated }: ReviewEditorProps) => {
  const { userId } = useAuth();
  const router = useRouter();
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [reviewData, setReviewData] = useState({
    reviewerName: "",
    rating: 5,
    reviewText: "",
    reviewTitle: "",
    date: new Date().toISOString().split("T")[0],
    profilePictureUrl: "",
    verified: false,
    helpfulVotes: 0,
  });

  const handleDownload = async () => {
    const previewElement = document.getElementById("review-preview");
    if (!previewElement) {
      toast({
        title: "Error",
        description: "Preview not found",
        variant: "destructive",
      });
      return;
    }

    try {
      const canvas = await html2canvas(previewElement, {
        backgroundColor: null,
        scale: 2,
      });
      const link = document.createElement("a");
      link.download = `review-${
        selectedPlatform || "custom"
      }-${Date.now()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      toast({
        title: "Success",
        description: "Screenshot downloaded successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate screenshot",
        variant: "destructive",
      });
    }
  };

  const handleSave = () => {
    if (!isAuthenticated) {
      router.push("/sign-up?redirect=/dashboard");
      return;
    }
    // TODO: Implement save functionality
    toast({
      title: "Save",
      description: "Save functionality coming soon!",
    });
  };

  return (
    <div className="w-full mx-auto mt-12">
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left Side - Editor */}
        <div className="space-y-6">
          <div className="">
            <h2 className="text-2xl font-semibold mb-4">Choose Platform</h2>
            <PlatformSelector
              selectedPlatform={selectedPlatform}
              onSelect={setSelectedPlatform}
            />
          </div>

          {selectedPlatform && (
            <div className="mt-12">
              <h2 className="text-2xl font-semibold mb-4">Review Details</h2>
              <ReviewForm
                reviewData={reviewData}
                onChange={setReviewData}
                platform={selectedPlatform}
              />
            </div>
          )}

          {selectedPlatform && (
            <div className="flex gap-4">
              <Button
                onClick={handleSave}
                variant="outline"
                className="flex-1"
                size="lg"
              >
                <Save className="mr-2 h-4 w-4" />
                {isAuthenticated ? "Save" : "Sign Up to Save"}
              </Button>
            </div>
          )}
        </div>

        {/* Right Side - Preview */}
        <div className="lg:sticky lg:top-8 h-fit">
          <div className="">
            <h2 className="text-2xl font-semibold mb-4">Preview</h2>
            <div className="bg-muted/50 rounded-lg p-8 flex items-center justify-center min-h-[400px]">
              {selectedPlatform ? (
                <ReviewPreview
                  platform={selectedPlatform}
                  reviewData={reviewData}
                />
              ) : (
                <div className="text-center text-muted-foreground">
                  <p className="text-lg">Select a platform to start</p>
                  <p className="text-sm mt-2">
                    Choose from Google, Amazon, Yelp, and more
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
