"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReviewData, GoogleReviewData } from "@/types/review";

interface ReviewFormProps {
  reviewData: ReviewData;
  onChange: (data: ReviewData) => void;
  platform: string;
}

export const ReviewForm = ({
  reviewData,
  onChange,
  platform,
}: ReviewFormProps) => {
  const updateField = (field: string, value: unknown) => {
    onChange({ ...reviewData, [field]: value } as ReviewData);
  };

  return (
    <div className="space-y-6 mt-4 w-full">
      <div className="space-y-2">
        <Label htmlFor="reviewerName">Reviewer Name</Label>
        <Input
          id="reviewerName"
          value={reviewData.reviewerName}
          onChange={(e) => updateField("reviewerName", e.target.value)}
          placeholder="John Doe"
        />
      </div>

      {/* Google-specific fields */}
      {platform === "google" && (
        <>
          <div className="space-y-2">
            <Label htmlFor="localGuideLevel">
              Local Guide Level (0-10, 0 = not a local guide)
            </Label>
            <Input
              id="localGuideLevel"
              type="number"
              min={0}
              max={10}
              value={(reviewData as GoogleReviewData).localGuideLevel || 0}
              onChange={(e) =>
                updateField("localGuideLevel", parseInt(e.target.value) || 0)
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="numberOfReviews">Number of Reviews</Label>
            <Input
              id="numberOfReviews"
              type="number"
              min={0}
              value={(reviewData as GoogleReviewData).numberOfReviews || 0}
              onChange={(e) =>
                updateField("numberOfReviews", parseInt(e.target.value) || 0)
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="numberOfPhotos">Number of Photos</Label>
            <Input
              id="numberOfPhotos"
              type="number"
              min={0}
              value={(reviewData as GoogleReviewData).numberOfPhotos || 0}
              onChange={(e) =>
                updateField("numberOfPhotos", parseInt(e.target.value) || 0)
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="isNew" className="cursor-pointer">
              Show "NEW" Badge
            </Label>
            <Switch
              id="isNew"
              checked={(reviewData as GoogleReviewData).isNew || false}
              onCheckedChange={(checked) => updateField("isNew", checked)}
            />
          </div>
        </>
      )}

      {(platform === "amazon" ||
        platform === "trustpilot" ||
        platform === "tripadvisor") && (
        <div className="space-y-2">
          <Label htmlFor="reviewTitle">Review Title</Label>
          <Input
            id="reviewTitle"
            value={(reviewData as any).reviewTitle || ""}
            onChange={(e) => updateField("reviewTitle", e.target.value)}
            placeholder="Great product!"
          />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="rating">Rating: {reviewData.rating} stars</Label>
        <div className="flex items-center gap-2">
          <Slider
            id="rating"
            min={1}
            max={5}
            step={1}
            value={[reviewData.rating]}
            onValueChange={([value]) => updateField("rating", value)}
            className="flex-1"
          />
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={cn(
                  "h-5 w-5",
                  star <= reviewData.rating
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-muted-foreground"
                )}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="reviewText">Review Text</Label>
        <Textarea
          id="reviewText"
          value={reviewData.reviewText}
          onChange={(e) => updateField("reviewText", e.target.value)}
          placeholder="Write your review here..."
          rows={6}
        />
        <div className="text-xs text-muted-foreground text-right">
          {reviewData.reviewText.length} characters
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="date">Date</Label>
        <Input
          id="date"
          type="date"
          value={reviewData.date}
          onChange={(e) => updateField("date", e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="profilePicture">Profile Picture URL (optional)</Label>
        <Input
          id="profilePicture"
          value={reviewData.profilePictureUrl}
          onChange={(e) => updateField("profilePictureUrl", e.target.value)}
          placeholder="https://example.com/avatar.jpg"
        />
      </div>

      {(platform === "amazon" ||
        platform === "facebook" ||
        platform === "trustpilot") && (
        <div className="flex items-center justify-between">
          <Label htmlFor="verified" className="cursor-pointer">
            Verified Purchase/Badge
          </Label>
          <Switch
            id="verified"
            checked={(reviewData as any).verified || false}
            onCheckedChange={(checked) => updateField("verified", checked)}
          />
        </div>
      )}

      {(platform === "amazon" || platform === "tripadvisor") && (
        <div className="space-y-2">
          <Label htmlFor="helpfulVotes">Helpful Votes</Label>
          <Input
            id="helpfulVotes"
            type="number"
            min={0}
            value={(reviewData as any).helpfulVotes || 0}
            onChange={(e) =>
              updateField("helpfulVotes", parseInt(e.target.value) || 0)
            }
          />
        </div>
      )}

      {platform === "tripadvisor" && (
        <div className="space-y-2">
          <Label htmlFor="contributionLevel">Contribution Level</Label>
          <Input
            id="contributionLevel"
            value={(reviewData as any).contributionLevel || ""}
            onChange={(e) => updateField("contributionLevel", e.target.value)}
            placeholder="e.g., 18 contributions or Level 6 Contributor"
          />
        </div>
      )}
    </div>
  );
};
