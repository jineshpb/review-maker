"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { PlatformSelector } from "./PlatformSelector";
import { ReviewPreview } from "./ReviewPreview";
import { ReviewForm } from "./ReviewForm";
import { Button } from "@/components/ui/button";
import { Download, Save, Loader2 } from "lucide-react";
import html2canvas from "html2canvas";
import { toast } from "@/hooks/use-toast";

interface Draft {
  id: string;
  platform: string;
  review_data: any;
  name: string | null;
  created_at: string;
  updated_at: string;
}

interface ReviewEditorProps {
  isAuthenticated: boolean;
  selectedDraft?: Draft | null;
  onDraftChange?: () => void;
}

export const ReviewEditor = ({
  isAuthenticated,
  selectedDraft,
  onDraftChange,
}: ReviewEditorProps) => {
  const { userId } = useAuth();
  const router = useRouter();
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [reviewData, setReviewData] = useState<any>({
    platform: null,
    reviewerName: "",
    rating: 5,
    reviewText: "",
    date: new Date().toISOString().split("T")[0],
    profilePictureUrl: "",
    // Google-specific
    localGuideLevel: 0,
    numberOfReviews: 0,
    numberOfPhotos: 0,
    isNew: false,
    // Amazon-specific
    reviewTitle: "",
    verified: false,
    helpfulVotes: 0,
    // TripAdvisor-specific
    contributionLevel: "",
  });

  // Load draft when selected
  useEffect(() => {
    if (selectedDraft) {
      setCurrentDraftId(selectedDraft.id);
      setSelectedPlatform(selectedDraft.platform);
      setReviewData({
        ...selectedDraft.review_data,
        platform: selectedDraft.platform,
      });
    } else {
      // New draft - reset
      setCurrentDraftId(null);
      setSelectedPlatform(null);
      setReviewData({
        platform: null,
        reviewerName: "",
        rating: 5,
        reviewText: "",
        date: new Date().toISOString().split("T")[0],
        profilePictureUrl: "",
        localGuideLevel: 0,
        numberOfReviews: 0,
        numberOfPhotos: 0,
        isNew: false,
        reviewTitle: "",
        verified: false,
        helpfulVotes: 0,
        contributionLevel: "",
      });
    }
  }, [selectedDraft]);

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

  const handleSave = async () => {
    if (!isAuthenticated) {
      router.push("/sign-up?redirect=/dashboard");
      return;
    }

    if (!selectedPlatform) {
      toast({
        title: "Error",
        description: "Please select a platform first",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);

      const draftData = {
        platform: selectedPlatform,
        reviewData: {
          ...reviewData,
          platform: selectedPlatform,
        },
        name: null, // Can add name input later
      };

      if (currentDraftId) {
        // Update existing draft
        const response = await fetch(`/api/drafts/${currentDraftId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            reviewData: draftData.reviewData,
          }),
        });

        if (!response.ok) {
          const result = await response.json();
          // Show validation errors if available
          if (result.issues && Array.isArray(result.issues)) {
            const errorMessages = result.issues
              .map((issue: any) => `${issue.path.join(".")}: ${issue.message}`)
              .join(", ");
            throw new Error(`Validation failed: ${errorMessages}`);
          }
          throw new Error(result.message || "Failed to update draft");
        }

        toast({
          title: "Success",
          description: "Draft updated successfully!",
        });
      } else {
        // Create new draft
        const response = await fetch("/api/drafts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(draftData),
        });

        if (!response.ok) {
          const result = await response.json();
          // Show validation errors if available
          if (result.issues && Array.isArray(result.issues)) {
            const errorMessages = result.issues
              .map((issue: any) => `${issue.path.join(".")}: ${issue.message}`)
              .join(", ");
            throw new Error(`Validation failed: ${errorMessages}`);
          }
          throw new Error(result.message || "Failed to save draft");
        }

        const result = await response.json();
        setCurrentDraftId(result.data.id);

        toast({
          title: "Success",
          description: "Draft saved successfully!",
        });

        // Refresh drafts list
        if (onDraftChange) {
          onDraftChange();
        }
      }
    } catch (error) {
      console.error("Error saving draft:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to save draft",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full mx-auto mt-12">
      <div className="w-full">
        <h2 className="text-sm uppercase text-muted-foreground  font-semibold mb-4">
          Choose Platform
        </h2>
        <PlatformSelector
          selectedPlatform={selectedPlatform}
          onSelect={setSelectedPlatform}
        />
      </div>
      <div className="flex flex-col lg:flex-row mt-12 w-full">
        {/* Left Side - Editor */}
        <div className="space-y-6 flex-1 w-full mr-8">
          {selectedPlatform && (
            <div className="">
              <h2 className="text-sm uppercase text-muted-foreground  font-semibold mb-4">
                Review Details
              </h2>
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
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {isAuthenticated
                      ? currentDraftId
                        ? "Update Draft"
                        : "Save Draft"
                      : "Sign Up to Save"}
                  </>
                )}
              </Button>
              <Button
                onClick={handleDownload}
                variant="default"
                className="flex-1"
                size="lg"
              >
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </div>
          )}
        </div>

        {/* Right Side - Preview */}
        <div className=" h-fit w-full">
          <div className="w-full">
            <h2 className="text-sm uppercase text-muted-foreground  font-semibold mb-4">
              Preview
            </h2>
            <div className="bg-muted/50 relative rounded-lg p-8 flex items-center justify-center min-h-[400px] overflow-hidden">
              {selectedPlatform ? (
                <ReviewPreview
                  platform={selectedPlatform}
                  reviewData={{ ...reviewData, platform: selectedPlatform }}
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
