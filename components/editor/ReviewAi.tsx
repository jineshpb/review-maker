"use client";

import React, { useState, useRef, useCallback } from "react";
import { X, RotateCcw, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";

interface ToneValues {
  concise: number; // -1 to 1, where -1 is most concise, 1 is most expanded
  positive: number; // -1 to 1, where -1 is most negative, 1 is most positive
}

interface ReviewAiProps {
  onToneChange?: (values: ToneValues) => void;
  onClose?: () => void;
  onReviewGenerated?: () => void;
  onDraftRefetch?: (draftId: string) => Promise<void>;
  platform?: string;
  draftId?: string;
}

const ReviewAi: React.FC<ReviewAiProps> = ({
  onToneChange,
  onClose,
  onReviewGenerated,
  onDraftRefetch,
  platform,
  draftId,
}) => {
  const [toneValues, setToneValues] = useState<ToneValues>({
    concise: 0,
    positive: 0,
  });
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const puckRef = useRef<HTMLDivElement>(null);

  const GRID_SIZE = 254; // Size of the draggable area
  const PUCK_SIZE = 24; // Size of the draggable puck
  const MAX_DISTANCE = GRID_SIZE / 2 - PUCK_SIZE / 2; // Max distance from center

  const updateToneValues = useCallback(
    (x: number, y: number) => {
      // Clamp values to -1 to 1 range
      const concise = Math.max(-1, Math.min(1, x / MAX_DISTANCE));
      const positive = Math.max(-1, Math.min(1, -y / MAX_DISTANCE)); // Invert Y axis

      const newValues = { concise, positive };
      setToneValues(newValues);
      onToneChange?.(newValues);
    },
    [MAX_DISTANCE, onToneChange]
  );

  const getPuckPosition = useCallback(() => {
    const x = toneValues.concise * MAX_DISTANCE;
    const y = -toneValues.positive * MAX_DISTANCE; // Invert Y axis
    return { x, y };
  }, [toneValues, MAX_DISTANCE]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!containerRef.current) return;
      setIsDragging(true);

      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const handleMouseMove = (e: MouseEvent) => {
        const x = e.clientX - centerX;
        const y = e.clientY - centerY;
        updateToneValues(x, y);
      };

      const handleMouseUp = () => {
        setIsDragging(false);
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      // Initial position
      const x = e.clientX - centerX;
      const y = e.clientY - centerY;
      updateToneValues(x, y);

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [updateToneValues]
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (!containerRef.current) return;
      setIsDragging(true);

      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const handleTouchMove = (e: TouchEvent) => {
        if (e.touches.length === 0) return;
        const touch = e.touches[0];
        const x = touch.clientX - centerX;
        const y = touch.clientY - centerY;
        updateToneValues(x, y);
      };

      const handleTouchEnd = () => {
        setIsDragging(false);
        document.removeEventListener("touchmove", handleTouchMove);
        document.removeEventListener("touchend", handleTouchEnd);
      };

      // Initial position
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        const x = touch.clientX - centerX;
        const y = touch.clientY - centerY;
        updateToneValues(x, y);
      }

      document.addEventListener("touchmove", handleTouchMove);
      document.addEventListener("touchend", handleTouchEnd);
    },
    [updateToneValues]
  );

  const puckPosition = getPuckPosition();
  const [aiGenerating, setAiGenerating] = useState(false);
  const [userPrompt, setUserPrompt] = useState("");
  const [aiFillsLimit, setAiFillsLimit] = useState<{
    max: number | null;
    used: number;
    available?: number; // Available fills (for free tier)
  } | null>(null);
  const { userId, isSignedIn } = useAuth();

  // Fetch AI fills limit on mount
  React.useEffect(() => {
    if (isSignedIn) {
      const fetchLimits = async () => {
        try {
          const response = await fetch("/api/subscription/status");
          if (response.ok) {
            const result = await response.json();
            setAiFillsLimit(result.limits?.limits?.aiFills || null);
          }
        } catch (error) {
          console.error("Error fetching AI fills limit:", error);
        }
      };
      fetchLimits();
    }
  }, [isSignedIn]);

  const handleAIFill = async () => {
    if (!isSignedIn || !userId) {
      toast.error("Please sign in to use AI fill");
      return;
    }

    if (!userPrompt.trim()) {
      toast.error("Please describe your business or what you want reviewed");
      return;
    }

    if (!platform) {
      toast.error("Please select a platform first");
      return;
    }

    try {
      setAiGenerating(true);

      // Trigger Inngest workflow
      const response = await fetch("/api/review/ai-generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userPrompt: userPrompt.trim(),
          platforms: [platform], // Generate for current platform
          draftId: draftId || undefined,
          tone: {
            concise: toneValues.concise,
            positive: toneValues.positive,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // If limit reached, show upgrade message
        if (response.status === 403 && data.error === "AI fill limit reached") {
          toast.error(data.message || "AI fill limit reached");
          // Refresh limits to update UI
          const limitsResponse = await fetch("/api/subscription/status");
          if (limitsResponse.ok) {
            const limitsResult = await limitsResponse.json();
            setAiFillsLimit(limitsResult.limits?.limits?.aiFills || null);
          }
          setAiGenerating(false);
          return;
        }
        throw new Error(data.message || "Failed to generate reviews");
      }

      // Update limits after successful generation
      const limitsResponse = await fetch("/api/subscription/status");
      if (limitsResponse.ok) {
        const limitsResult = await limitsResponse.json();
        setAiFillsLimit(limitsResult.limits?.limits?.aiFills || null);
      }

      toast.success("AI generation started! This may take a few moments...");

      // Store the initial updated_at timestamp BEFORE generation starts
      // This is our baseline to detect when Inngest finishes writing to DB
      let initialUpdatedAt: string | null = null;
      if (draftId) {
        try {
          const initialDraftResponse = await fetch(`/api/drafts/${draftId}`);
          if (initialDraftResponse.ok) {
            const initialDraftData = await initialDraftResponse.json();
            initialUpdatedAt = initialDraftData.data?.updated_at || null;
            console.log("📌 Initial draft timestamp:", initialUpdatedAt);
          }
        } catch (error) {
          console.error("Error fetching initial draft:", error);
        }
      }

      // Poll for completion - check if Inngest finished writing to DB
      const pollForCompletion = async () => {
        const maxAttempts = 30; // 30 attempts = 30 seconds max (AI can take time)
        const pollInterval = 1000; // 1 second between polls
        let attempts = 0;

        const poll = async (): Promise<void> => {
          if (!draftId) {
            // If no draftId, just refresh sidebar after delay
            setTimeout(() => {
              if (onReviewGenerated) {
                onReviewGenerated();
              }
              setAiGenerating(false);
              toast.success("Review generated! Check your drafts.");
            }, 5000);
            return;
          }

          try {
            // Fetch the draft to check if it's been updated by Inngest
            const draftResponse = await fetch(
              `/api/drafts/${draftId}?t=${Date.now()}`
            ); // Cache bust
            if (draftResponse.ok) {
              const draftData = await draftResponse.json();
              const draft = draftData.data;
              const currentUpdatedAt = draft?.updated_at;

              // Compare timestamps: if updated_at changed, Inngest finished writing!
              const wasUpdated =
                initialUpdatedAt !== null &&
                currentUpdatedAt !== null &&
                initialUpdatedAt !== undefined &&
                currentUpdatedAt !== undefined &&
                new Date(currentUpdatedAt).getTime() >
                  new Date(initialUpdatedAt).getTime();

              if (wasUpdated && currentUpdatedAt && initialUpdatedAt) {
                // ✅ Inngest finished! Timestamp changed = DB was written
                console.log("✅ Inngest finished writing to DB!", {
                  initialTimestamp: initialUpdatedAt,
                  currentTimestamp: currentUpdatedAt,
                  timeDiff:
                    new Date(currentUpdatedAt).getTime() -
                    new Date(initialUpdatedAt).getTime(),
                });

                // Refetch the draft to update UI
                if (onDraftRefetch) {
                  await onDraftRefetch(draftId);
                }
                setAiGenerating(false);
                toast.success("Review generated successfully!");
                return;
              } else {
                // Still waiting for Inngest to finish...
                console.log(
                  `⏳ Polling attempt ${
                    attempts + 1
                  }/${maxAttempts}: Waiting for Inngest...`,
                  {
                    initialTimestamp: initialUpdatedAt,
                    currentTimestamp: currentUpdatedAt,
                    wasUpdated: false,
                  }
                );
              }
            } else {
              console.error(
                "Failed to fetch draft:",
                draftResponse.status,
                await draftResponse.text()
              );
            }

            attempts++;
            if (attempts < maxAttempts) {
              // Continue polling
              setTimeout(poll, pollInterval);
            } else {
              // Timeout - still try to refetch as a fallback
              console.log("⏱️ Polling timeout, attempting final refetch...");
              if (onDraftRefetch && draftId) {
                await onDraftRefetch(draftId);
              }
              setAiGenerating(false);
              toast.success("Review generation completed!");
            }
          } catch (error) {
            console.error("Error polling for draft update:", error);
            // On error, still try to refetch once as a fallback
            if (onDraftRefetch && draftId) {
              console.log("Error during polling, attempting refetch...");
              await onDraftRefetch(draftId);
            }
            setAiGenerating(false);
            toast.success("Review generation completed!");
          }
        };

        // Start polling after a short delay (give Inngest time to start)
        setTimeout(poll, 2000);
      };

      pollForCompletion();
    } catch (error) {
      console.error("Error generating AI review:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to generate review"
      );
      setAiGenerating(false);
    }
  };

  return (
    <>
      {isSignedIn ? (
        <div className="w-full">
          {/* Header */}
          <div>
            {/* AI Fill Section */}
            <div className="flex flex-col gap-2 mt-4">
              <div className="flex flex-col gap-2">
                <Textarea
                  placeholder="Describe your business or what you want reviewed..."
                  value={userPrompt}
                  onChange={(e) => setUserPrompt(e.target.value)}
                  className="w-full"
                />
              </div>
              {isSignedIn && aiFillsLimit && (
                <div className="flex items-center gap-2 justify-between text-xs text-muted-foreground">
                  <span>
                    AI fills: {aiFillsLimit.used}/
                    {aiFillsLimit.max === null ? "∞" : aiFillsLimit.max}
                  </span>
                  {aiFillsLimit.max !== null &&
                    aiFillsLimit.used >= aiFillsLimit.max && (
                      <a
                        href="/subscription"
                        className="text-primary hover:underline"
                      >
                        Upgrade
                      </a>
                    )}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between mb-6 mt-4">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold">Adjust tone</h3>
              <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-muted text-muted-foreground">
                AI beta
              </span>
            </div>
          </div>

          {/* Tone Control Grid */}
          <div className="relative">
            <div
              ref={containerRef}
              className="relative  border-2 border-border rounded-lg bg-muted/30 mx-auto "
              style={{
                width: GRID_SIZE,
                height: GRID_SIZE,
                touchAction: "none",
              }}
              onMouseDown={handleMouseDown}
              onTouchStart={handleTouchStart}
            >
              {/* Grid lines */}
              <div className="absolute inset-0">
                {/* Vertical center line */}
                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-border -translate-x-1/2" />
                {/* Horizontal center line */}
                <div className="absolute top-1/2 left-0 right-0 h-px bg-border -translate-y-1/2" />
              </div>

              {/* Corner labels */}
              <div className="absolute inset-0 pointer-events-none">
                {/* Top - Professional */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 text-xs font-medium text-muted-foreground">
                  Positive
                </div>

                {/* Left - Concise */}
                <div
                  className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground"
                  style={{
                    writingMode: "vertical-rl",
                    textOrientation: "mixed",
                  }}
                >
                  Concise
                </div>

                {/* Right - Expanded */}
                <div
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground"
                  style={{
                    writingMode: "vertical-rl",
                    textOrientation: "mixed",
                  }}
                >
                  Expanded
                </div>

                {/* Bottom - Casual */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs font-medium text-muted-foreground">
                  Negative
                </div>
              </div>

              {/* Draggable Puck */}
              <div
                ref={puckRef}
                className={cn(
                  "absolute rounded-full bg-primary cursor-grab active:cursor-grabbing transition-transform",
                  isDragging && "scale-110"
                )}
                style={{
                  width: PUCK_SIZE,
                  height: PUCK_SIZE,
                  left: `calc(50% + ${puckPosition.x}px - ${PUCK_SIZE / 2}px)`,
                  top: `calc(50% + ${puckPosition.y}px - ${PUCK_SIZE / 2}px)`,
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                }}
              >
                {/* Inner dot */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                </div>
              </div>
            </div>

            {/* Value Display */}
            <div className="mt-4 space-y-2">
              <div className="text-center text-xs text-muted-foreground">
                <div className="flex items-center justify-center gap-4">
                  <span>
                    {toneValues.concise < 0
                      ? `Concise ${Math.round(
                          Math.abs(toneValues.concise) * 100
                        )}%`
                      : toneValues.concise > 0
                      ? `Expanded ${Math.round(toneValues.concise * 100)}%`
                      : "Concise"}
                  </span>
                  <span>•</span>
                  <span>
                    {toneValues.positive < 0
                      ? `Negative ${Math.round(
                          Math.abs(toneValues.positive) * 100
                        )}%`
                      : toneValues.positive > 0
                      ? `Positive ${Math.round(toneValues.positive * 100)}%`
                      : "Positive"}
                  </span>
                </div>
              </div>
              <div className="flex w-full items-center gap-2 mt-3">
                {(toneValues.concise !== 0 || toneValues.positive !== 0) && (
                  <div className="flex justify-center w-full">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setToneValues({ concise: 0, positive: 0 });
                        onToneChange?.({ concise: 0, positive: 0 });
                      }}
                      className="h-7 text-xs"
                    >
                      <RotateCcw className="mr-1.5 h-3 w-3" />
                      Reset
                    </Button>
                  </div>
                )}
                <Button
                  onClick={handleAIFill}
                  variant="outline"
                  size="sm"
                  disabled={
                    aiGenerating ||
                    !userPrompt.trim() ||
                    !isSignedIn ||
                    (aiFillsLimit !== null &&
                      aiFillsLimit.max !== null &&
                      (aiFillsLimit.available ?? 0) <= 0)
                  }
                  className="grow"
                >
                  {aiGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : aiFillsLimit &&
                    aiFillsLimit.max !== null &&
                    (aiFillsLimit.available ?? 0) <= 0 ? (
                    <>Limit Reached</>
                  ) : (
                    <>Generate Review</>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-between w-full mt-2 p-4">
          <span className="text-sm font-semibold">Sign in to use AI fill</span>
          <span className="text-xs text-muted-foreground text-center mt-1">
            Sign in to get AI fill, drafts and more.
          </span>
          <Button
            variant="outline"
            size="sm"
            className="text-sm cursor-pointer mt-3"
            onClick={() => {
              window.location.href = "/sign-in";
            }}
          >
            Sign in
          </Button>
        </div>
      )}
    </>
  );
};

export default ReviewAi;
