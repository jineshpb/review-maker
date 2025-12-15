"use client";

import { useState, useEffect } from "react";
import { DraftsSidebar } from "./DraftsSidebar";
import { ReviewEditor } from "./editor/ReviewEditor";
import { Database } from "@/types/database";

type UserSubscription =
  Database["public"]["Tables"]["user_subscriptions"]["Row"];

interface Draft {
  id: string;
  platform: string;
  review_data: any;
  name: string | null;
  created_at: string;
  updated_at: string;
}

export const DashboardLayout = ({
  isAuthenticated,
  subscriptionData,
}: {
  isAuthenticated: boolean;
  subscriptionData: UserSubscription;
}) => {
  const [selectedDraft, setSelectedDraft] = useState<Draft | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [draftsLoaded, setDraftsLoaded] = useState(false);

  const handleSelectDraft = (draft: Draft | null) => {
    setSelectedDraft(draft);
  };

  const handleNewDraft = async () => {
    if (!isAuthenticated) {
      // Redirect to sign up if not authenticated
      window.location.href = "/sign-up?redirect=/dashboard";
      return;
    }

    try {
      // Create a new draft immediately with minimal data
      const response = await fetch("/api/drafts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform: "google", // Default platform
          reviewData: {
            platform: "google",
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
          },
          name: null, // Will be generated from review text later
        }),
      });

      if (!response.ok) {
        const result = await response.json();
        // If limit reached, the error is already handled in sidebar
        if (result.error === "Draft limit reached") {
          return; // Sidebar already shows error and redirects
        }
        throw new Error(result.message || "Failed to create draft");
      }

      const result = await response.json();
      const newDraft = result.data;

      // Select the newly created draft immediately
      setSelectedDraft(newDraft);

      // Refresh sidebar to show the new draft
      setRefreshKey((prev) => prev + 1);
    } catch (error) {
      console.error("Error creating new draft:", error);
      // Error is already handled by sidebar limit check or API validation
    }
  };

  const handleDraftChange = () => {
    // Only refresh sidebar when a new draft is created
    // Auto-save updates don't need a refresh - the draft is already in the sidebar
    // This is called from ReviewEditor when a new draft is created
    setRefreshKey((prev) => prev + 1);
  };

  const handleDraftRefetch = async (draftId: string) => {
    try {
      console.log("Refetching draft:", draftId);
      // Use cache busting to ensure we get fresh data
      const response = await fetch(`/api/drafts/${draftId}?t=${Date.now()}`);
      if (response.ok) {
        const result = await response.json();
        const updatedDraft = result.data;
        console.log("✅ Refetched draft data:", {
          id: updatedDraft?.id,
          updated_at: updatedDraft?.updated_at,
          reviewTextPreview: updatedDraft?.review_data?.reviewText?.substring(
            0,
            50
          ),
        });

        if (updatedDraft) {
          // Update the draft - the key prop on ReviewEditor will handle remounting
          // when updated_at changes, ensuring the UI updates
          setSelectedDraft(updatedDraft);

          // Also refresh sidebar to show updated draft name/timestamp
          setRefreshKey((prev) => prev + 1);
        }
      } else {
        console.error(
          "Failed to refetch draft:",
          response.status,
          await response.text()
        );
      }
    } catch (error) {
      console.error("Error refetching draft:", error);
    }
  };

  // Auto-select first draft when drafts are loaded and none is selected
  // Only on first login when there are no drafts - don't create a new draft automatically
  useEffect(() => {
    if (!isAuthenticated || selectedDraft || draftsLoaded) return;

    const fetchAndSelectFirstDraft = async () => {
      try {
        const response = await fetch("/api/drafts");
        if (response.ok) {
          const result = await response.json();
          const drafts = result.data || [];
          if (drafts.length > 0) {
            // Select the first existing draft
            setSelectedDraft(drafts[0]);
          }
          // Don't create a new draft if there are no drafts - user can click "New Draft" button
          setDraftsLoaded(true);
        }
      } catch (error) {
        console.error("Error fetching drafts for auto-select:", error);
        setDraftsLoaded(true); // Set to true even on error to prevent infinite loops
      }
    };

    fetchAndSelectFirstDraft();
  }, [isAuthenticated, selectedDraft, draftsLoaded]);

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <DraftsSidebar
        onSelectDraft={handleSelectDraft}
        onNewDraft={handleNewDraft}
        selectedDraftId={selectedDraft?.id || null}
        subscriptionData={subscriptionData}
        refreshTrigger={refreshKey}
      />

      {/* Main Editor Area */}
      <div className="flex-1 overflow-y-auto">
        <ReviewEditor
          key={selectedDraft?.updated_at || selectedDraft?.id || "no-draft"}
          isAuthenticated={isAuthenticated}
          selectedDraft={selectedDraft}
          onDraftChange={handleDraftChange}
          onDraftRefetch={handleDraftRefetch}
        />
      </div>
    </div>
  );
};
