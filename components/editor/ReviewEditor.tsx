"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { PlatformSelector } from "./PlatformSelector";
import { ReviewPreview } from "./ReviewPreview";
import { ReviewForm } from "./ReviewForm";
import { Button } from "@/components/ui/button";
import { Download, Save, Loader2, Brain } from "lucide-react";
import Link from "next/link";
import html2canvas from "html2canvas";
import { toast } from "@/hooks/use-toast";

import { Label } from "@radix-ui/react-label";
import { GoogleReviewData } from "@/types/review";
import { Switch } from "@/components/ui/switch";
import ReviewAi from "./ReviewAi";
import Header from "../Header";
import { getPlatformDefaults } from "./platformDefaults";
import { Logo } from "../Logo";
import { platforms } from "@/lib/review-editor/platforms";

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
  onDraftRefetch?: (draftId: string) => Promise<void>;
}

export const ReviewEditor = ({
  isAuthenticated,
  selectedDraft,
  onDraftChange,
  onDraftRefetch,
}: ReviewEditorProps) => {
  const { userId } = useAuth();
  const router = useRouter();
  const [selectedPlatform, setSelectedPlatform] = useState<
    (typeof platforms)[number] | null
  >(null);
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  // Generate draft name from review text
  const generateDraftName = useCallback((reviewText: string): string | null => {
    if (!reviewText || !reviewText.trim()) {
      return null;
    }
    // Take first 50 characters, trim to last complete word
    const trimmed = reviewText.trim().substring(0, 50);
    const lastSpace = trimmed.lastIndexOf(" ");
    const name = lastSpace > 0 ? trimmed.substring(0, lastSpace) : trimmed;
    return name || null;
  }, []);

  // Auto-save function
  const autoSaveDraft = useCallback(async () => {
    if (!isAuthenticated || !selectedPlatform) {
      return;
    }

    // Don't auto-save if review text is empty
    if (!reviewData.reviewText || !reviewData.reviewText.trim()) {
      return;
    }

    try {
      const draftName = generateDraftName(reviewData.reviewText);
      const draftData = {
        platform: selectedPlatform.id,
        reviewData: {
          ...reviewData,
          platform: selectedPlatform.id,
        },
        name: draftName,
      };

      if (currentDraftId) {
        // Update existing draft
        const response = await fetch(`/api/drafts/${currentDraftId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            reviewData: draftData.reviewData,
            name: draftName,
          }),
        });

        if (response.ok) {
          // Silently update - no refresh needed, draft is already in sidebar
          // Only the name/timestamp might change, but that's not critical to refresh
        }
      } else {
        // Create new draft - this needs sidebar refresh
        const response = await fetch("/api/drafts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(draftData),
        });

        if (response.ok) {
          const result = await response.json();
          setCurrentDraftId(result.data.id);
          // Only refresh when a NEW draft is created
          if (onDraftChange) {
            onDraftChange();
          }
        }
      }
    } catch (error) {
      // Silently fail for auto-save - don't show error toast
      console.error("Auto-save error:", error);
    }
  }, [
    isAuthenticated,
    selectedPlatform,
    reviewData,
    currentDraftId,
    generateDraftName,
    onDraftChange,
  ]);

  // Debounced auto-save effect
  useEffect(() => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    // Only auto-save if user is authenticated and has selected a platform
    if (isAuthenticated && selectedPlatform && reviewData.reviewText) {
      autoSaveTimeoutRef.current = setTimeout(() => {
        autoSaveDraft();
      }, 2000); // 2 second debounce
    }

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [reviewData, isAuthenticated, selectedPlatform, autoSaveDraft]);

  // Load draft when selected
  // Note: This component remounts when the key (updated_at) changes,
  // so this effect runs fresh with new data
  useEffect(() => {
    if (selectedDraft) {
      console.log("🔄 ReviewEditor: Loading draft", {
        id: selectedDraft.id,
        updated_at: selectedDraft.updated_at,
        reviewTextPreview: selectedDraft.review_data?.reviewText?.substring(
          0,
          50
        ),
      });
      setCurrentDraftId(selectedDraft.id);
      setSelectedPlatform(
        platforms.find((platform) => platform.id === selectedDraft.platform) ||
          null
      );
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

  // Initialize review data when platform is selected
  useEffect(() => {
    if (selectedPlatform && !selectedDraft) {
      // Only initialize if no draft is loaded (new draft)
      const defaults = getPlatformDefaults(selectedPlatform.id);
      setReviewData({
        ...defaults,
        platform: selectedPlatform.id,
      });
    }
  }, [selectedPlatform, selectedDraft]);

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
        selectedPlatform?.name || "custom"
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

      const draftName = generateDraftName(reviewData.reviewText);
      const draftData = {
        platform: selectedPlatform.id,
        reviewData: {
          ...reviewData,
          platform: selectedPlatform.id,
        },
        name: draftName,
      };

      if (currentDraftId) {
        // Update existing draft
        const response = await fetch(`/api/drafts/${currentDraftId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            reviewData: draftData.reviewData,
            name: draftName,
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

        // No refresh needed - draft is already in sidebar
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

        // Refresh sidebar only when a NEW draft is created (not on update)
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

  const [aiMode, setAiMode] = useState(false);
  const handleAiModeChange = () => {
    setAiMode(!aiMode);
  };

  console.log("selectedPlatform", selectedPlatform);

  return (
    <>
      {!isAuthenticated ? (
        <div className="w-full mx-auto flex items-center justify-between gap-2 px-6 py-4 border-b border-black/10 sticky top-0 bg-white/10 backdrop-blur-sm z-50">
          <div className="flex items-center gap-2">
            <Logo
              gradient={{
                from: "gray",
                to: "rgba(0, 0, 0, 0.8)",
              }}
            />
            <span className="text-lg font-semibold bg-linear-to-br tracking-tight from-black via-black/90 to-black/70 bg-clip-text text-transparent">
              ReviewPicasso
            </span>
          </div>

          <Button className="" size={"sm"}>
            <Link href="/sign-up">Sign In</Link>
          </Button>
        </div>
      ) : (
        <Header />
      )}
      <div className="w-full mx-auto container px-6">
        <div className="w-full mt-12 ">
          <h2 className="text-sm uppercase text-muted-foreground  font-semibold mb-4">
            Choose Platform
          </h2>
          <PlatformSelector
            selectedPlatform={selectedPlatform?.id || null}
            onSelect={(platformId) => {
              const platform =
                platforms.find((p) => p.id === platformId) || null;
              setSelectedPlatform(platform);
            }}
          />
        </div>
        <div className="flex flex-col lg:flex-row mt-12 w-full">
          {/* Left Side - Editor */}
          <div className="space-y-6  w-full flex-1 mb-6 ">
            {selectedPlatform && (
              <div className="min-w-[300px] w-full pr-6 ">
                <div className="flex flex-col items-start">
                  <h2 className="text-sm uppercase text-muted-foreground mb-4  font-semibold ">
                    Review Details
                  </h2>
                  {selectedPlatform.aiFriendly && (
                    <>
                      <div className="flex flex-col items-start gap-2 w-full justify-between border rounded-lg p-2">
                        <div className="flex items-center gap-2 w-full justify-between">
                          <Label
                            htmlFor="aiMode"
                            className="cursor-pointer text-sm flex gap-2 items-center"
                          >
                            <Brain className="h-4 w-4 text-muted-foreground" />
                            AI Fill
                          </Label>
                          <Switch
                            id="aiMode"
                            checked={aiMode}
                            onCheckedChange={(checked: boolean) =>
                              setAiMode(checked)
                            }
                          />
                        </div>

                        {aiMode && (
                          <ReviewAi
                            onToneChange={(values: any) =>
                              setReviewData({ ...reviewData, tone: values })
                            }
                            onClose={() => setAiMode(false)}
                            onReviewGenerated={onDraftChange}
                            onDraftRefetch={onDraftRefetch}
                            platform={selectedPlatform?.id}
                            draftId={currentDraftId || undefined}
                          />
                        )}
                      </div>
                    </>
                  )}
                  {!aiMode && (
                    <ReviewForm
                      reviewData={reviewData}
                      onChange={setReviewData}
                      platform={selectedPlatform.id}
                    />
                  )}
                </div>
              </div>
            )}

            {selectedPlatform && !aiMode && (
              <div className="flex flex-col gap-4 min-w-[300px] w-full pr-6">
                {/* Save & Download Buttons */}
                <div className="flex gap-4">
                  <Button
                    onClick={handleSave}
                    variant="outline"
                    className="flex-1"
                    size="sm"
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
                </div>
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
                    platform={selectedPlatform.id}
                    reviewData={{
                      ...reviewData,
                      platform: selectedPlatform.id,
                    }}
                    draftId={currentDraftId}
                    onReviewGenerated={onDraftChange}
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
    </>
  );
};
