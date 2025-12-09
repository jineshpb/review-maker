"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Edit2, Loader2, EllipsisVertical } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { getUserSubscription } from "@/lib/supabase/subscriptions";
import { Database } from "@/types/database";

interface Draft {
  id: string;
  platform: string;
  review_data: any;
  name: string | null;
  created_at: string;
  updated_at: string;
}

interface DraftsSidebarProps {
  onSelectDraft: (draft: Draft) => void;
  onNewDraft: () => void;
  selectedDraftId?: string | null;
  subscriptionData: UserSubscription;
}

type UserSubscription =
  Database["public"]["Tables"]["user_subscriptions"]["Row"];

export const DraftsSidebar = ({
  onSelectDraft,
  onNewDraft,
  selectedDraftId,
  subscriptionData,
}: DraftsSidebarProps) => {
  const { isSignedIn } = useAuth();
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  console.log("@@subscriptionData client", subscriptionData);

  const { tier } = subscriptionData;
  console.log("@@tier", tier);

  const fetchDrafts = async () => {
    if (!isSignedIn) {
      setDrafts([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("/api/drafts");
      const result = await response.json();

      if (response.ok) {
        setDrafts(result.data || []);
      } else {
        console.error("Error fetching drafts:", result.error);
        toast({
          title: "Error",
          description: "Failed to load drafts",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching drafts:", error);
      toast({
        title: "Error",
        description: "Failed to load drafts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrafts();
  }, [isSignedIn]);

  const handleDelete = async (draftId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent selecting draft when clicking delete

    if (!confirm("Are you sure you want to delete this draft?")) {
      return;
    }

    try {
      setDeletingId(draftId);
      const response = await fetch(`/api/drafts/${draftId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setDrafts(drafts.filter((d) => d.id !== draftId));
        toast({
          title: "Success",
          description: "Draft deleted",
        });
        // If deleted draft was selected, clear selection
        if (selectedDraftId === draftId) {
          onNewDraft();
        }
      } else {
        const result = await response.json();
        toast({
          title: "Error",
          description: result.message || "Failed to delete draft",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting draft:", error);
      toast({
        title: "Error",
        description: "Failed to delete draft",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const getDraftTitle = (draft: Draft) => {
    if (draft.name) return draft.name;
    const platform = draft.platform || "Untitled";
    return `${platform.charAt(0).toUpperCase() + platform.slice(1)} Review`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (!isSignedIn) {
    return (
      <div className="w-64 border-r bg-muted/30 p-4">
        <p className="text-sm text-muted-foreground text-center">
          Sign in to save drafts
        </p>
      </div>
    );
  }

  const sidebarHeader = () => {
    return (
      <div className="py-4 pl-4 border-b flex items-center justify-between">
        <p className="text-sm font-medium">Drafts</p>
        <div>
          <Button
            onClick={onNewDraft}
            className=" cursor-pointer"
            size="sm"
            variant="secondary"
          >
            <Plus className=" h-4 w-4" />
            New Draft
          </Button>
          <Button variant="link" size="sm" className=" cursor-pointer">
            <EllipsisVertical />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="w-64 border-r bg-muted/30 flex flex-col h-full">
      {/* Header */}
      {sidebarHeader()}
      {/* Drafts List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : drafts.length === 0 ? (
          <div className="p-4 text-center">
            <p className="text-sm text-muted-foreground">
              No drafts yet. Create your first draft!
            </p>
          </div>
        ) : (
          <div className="p-2">
            {drafts.map((draft) => (
              <div
                key={draft.id}
                onClick={() => onSelectDraft(draft)}
                className={`
                  group relative p-3 rounded-lg cursor-pointer mb-2
                  transition-colors
                  ${
                    selectedDraftId === draft.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-background hover:bg-muted"
                  }
                `}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-medium truncate ${
                        selectedDraftId === draft.id
                          ? "text-primary-foreground"
                          : ""
                      }`}
                    >
                      {getDraftTitle(draft)}
                    </p>
                    <p
                      className={`text-xs mt-1 ${
                        selectedDraftId === draft.id
                          ? "text-primary-foreground/80"
                          : "text-muted-foreground"
                      }`}
                    >
                      {formatDate(draft.updated_at)}
                    </p>
                  </div>
                  <button
                    onClick={(e) => handleDelete(draft.id, e)}
                    className={`
                      ml-2 p-1 rounded opacity-0 group-hover:opacity-100
                      transition-opacity
                      ${
                        selectedDraftId === draft.id
                          ? "hover:bg-primary-foreground/20"
                          : "hover:bg-destructive/10"
                      }
                    `}
                    disabled={deletingId === draft.id}
                  >
                    {deletingId === draft.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Trash2
                        className={`h-3 w-3 ${
                          selectedDraftId === draft.id
                            ? "text-primary-foreground"
                            : "text-muted-foreground"
                        }`}
                      />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="p-2 flex gap-2  items-center justify-between rounded-lg bg-linear-to-r from-primary/10 to-primary/20 m-2">
        <div className="text-sm text-muted-foreground flex gap-1 ml-2 font-medium">
          <p>{tier.charAt(0).toUpperCase() + tier.slice(1)}</p>
          <p>Plan</p>
        </div>
        <Button variant="outline" size="sm" className="text-sm cursor-pointer">
          Upgrade
        </Button>
      </div>
    </div>
  );
};
