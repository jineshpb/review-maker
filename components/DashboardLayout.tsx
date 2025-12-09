"use client";

import { useState } from "react";
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

  const handleSelectDraft = (draft: Draft) => {
    setSelectedDraft(draft);
  };

  const handleNewDraft = () => {
    setSelectedDraft(null);
  };

  const handleDraftChange = () => {
    // Force sidebar to refresh
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] gap-4">
      {/* Sidebar */}
      <DraftsSidebar
        key={refreshKey}
        onSelectDraft={handleSelectDraft}
        onNewDraft={handleNewDraft}
        selectedDraftId={selectedDraft?.id || null}
        subscriptionData={subscriptionData}
      />

      {/* Main Editor Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-8">
          <ReviewEditor
            isAuthenticated={isAuthenticated}
            selectedDraft={selectedDraft}
            onDraftChange={handleDraftChange}
          />
        </div>
      </div>
    </div>
  );
};
