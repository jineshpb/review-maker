"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReviewData {
  reviewerName: string;
  rating: number;
  reviewText: string;
  reviewTitle: string;
  date: string;
  profilePictureUrl: string;
  verified: boolean;
  helpfulVotes: number;
}

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
  const updateField = (field: keyof ReviewData, value: unknown) => {
    onChange({ ...reviewData, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="reviewerName">Reviewer Name</Label>
        <Input
          id="reviewerName"
          value={reviewData.reviewerName}
          onChange={(e) => updateField("reviewerName", e.target.value)}
          placeholder="John Doe"
        />
      </div>

      {(platform === "amazon" || platform === "trustpilot") && (
        <div className="space-y-2">
          <Label htmlFor="reviewTitle">Review Title</Label>
          <Input
            id="reviewTitle"
            value={reviewData.reviewTitle}
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

      <div className="flex items-center justify-between">
        <Label htmlFor="verified" className="cursor-pointer">
          Verified Purchase/Badge
        </Label>
        <Switch
          id="verified"
          checked={reviewData.verified}
          onCheckedChange={(checked) => updateField("verified", checked)}
        />
      </div>

      {platform === "amazon" && (
        <div className="space-y-2">
          <Label htmlFor="helpfulVotes">Helpful Votes</Label>
          <Input
            id="helpfulVotes"
            type="number"
            min={0}
            value={reviewData.helpfulVotes}
            onChange={(e) =>
              updateField("helpfulVotes", parseInt(e.target.value) || 0)
            }
          />
        </div>
      )}
    </div>
  );
};
