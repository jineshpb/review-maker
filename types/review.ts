// Base review data that all platforms share
export interface BaseReviewData {
  reviewerName: string;
  rating: number;
  reviewText: string;
  date: string;
  profilePictureUrl: string;
}

// Google Reviews specific data
export interface GoogleReviewData extends BaseReviewData {
  platform: "google";
  localGuideLevel?: number; // 1-10, represents local guide badge level
  numberOfReviews?: number;
  numberOfPhotos?: number;
  isNew?: boolean; // Shows "NEW" badge
}

// Amazon Reviews specific data
export interface AmazonReviewData extends BaseReviewData {
  platform: "amazon";
  reviewTitle: string; // Bold title text (e.g., "Nice Product")
  verified: boolean; // Shows "Verified Purchase" badge
  helpfulVotes?: number; // Number of helpful votes
  location?: string; // Country/location (e.g., "India")
  productDetails?: string; // Product attributes (e.g., "Size: 25L | Style Name: CDR Dlx Plus Horizontal")
}

// Yelp Reviews specific data
export interface YelpReviewData extends BaseReviewData {
  platform: "yelp";
  eliteBadge?: boolean; // Yelp Elite badge
  numberOfFriends?: number;
  numberOfPhotos?: number;
}

// TripAdvisor Reviews specific data
export interface TripAdvisorReviewData extends BaseReviewData {
  platform: "tripadvisor";
  reviewTitle: string;
  helpfulVotes?: number;
  contributionLevel?: string; // e.g., "Level 6 Contributor"
}

// Facebook Reviews specific data
export interface FacebookReviewData extends BaseReviewData {
  platform: "facebook";
  verified: boolean;
}

// Trustpilot Reviews specific data
export interface TrustpilotReviewData extends BaseReviewData {
  platform: "trustpilot";
  reviewTitle: string;
  verified: boolean;
}

// Fiverr Reviews specific data
export interface FiverrReviewData extends BaseReviewData {
  platform: "fiverr";
  orderNumber?: string;
  country?: string;
}

// Airbnb Reviews specific data
export interface AirbnbReviewData extends BaseReviewData {
  platform: "airbnb";
  reviewTitle: string;
  stayDate?: string;
  verified: boolean;
}

// App Store Reviews specific data
export interface AppStoreReviewData extends BaseReviewData {
  platform: "appstore";
  reviewTitle?: string; // Bold headline/title at the top
  appVersion?: string;
  country?: string;
  awardBadge?: {
    heading: string; // Award heading text (e.g., "App Store Awards 2024 Winner")
    content?: string; // Optional content text below heading
    textColor?: string; // Tailwind text color class or hex color (e.g., "text-white" or "#ffffff")
    laurelWreathColor?: string; // Hex color for laurel wreaths (e.g., "#000000" or "#ffffff")
  };
}

// Play Store Reviews specific data
export interface PlayStoreReviewData extends BaseReviewData {
  platform: "playstore";
  appVersion?: string;
  device?: string;
}

// Award Badge specific data (not a review, standalone badge)
export interface AwardBadgeData {
  platform: "awardbadge";
  heading: string; // Award heading text (e.g., "App Store Awards 2024 Winner")
  content?: string; // Optional content text below heading
  textColor?: string; // Tailwind text color class or hex color (e.g., "text-white" or "#ffffff")
  laurelWreathColor?: string; // Hex color for laurel wreaths (e.g., "#000000" or "#ffffff")
  reviewerName?: string;
  rating?: number;
  reviewText?: string;
  date?: string;
  profilePictureUrl?: string;
}

// Union type for all platform review data
export type ReviewData =
  | GoogleReviewData
  | AmazonReviewData
  | YelpReviewData
  | TripAdvisorReviewData
  | FacebookReviewData
  | TrustpilotReviewData
  | FiverrReviewData
  | AirbnbReviewData
  | AppStoreReviewData
  | PlayStoreReviewData
  | AwardBadgeData;

// Type guard functions
export const isGoogleReview = (data: ReviewData): data is GoogleReviewData =>
  data.platform === "google";

export const isAmazonReview = (data: ReviewData): data is AmazonReviewData =>
  data.platform === "amazon";

export const isYelpReview = (data: ReviewData): data is YelpReviewData =>
  data.platform === "yelp";
