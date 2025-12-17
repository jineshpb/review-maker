import { textColorPalette, laurelWreathColorPalette } from "./ColorPicker";
import type { ReviewData } from "@/types/review";

// Common base defaults shared by all review platforms
const baseDefaults = {
  reviewerName: "",
  rating: 5,
  reviewText: "",
  date: new Date().toISOString().split("T")[0],
  profilePictureUrl: "",
};

// Platform-specific defaults
export const platformDefaults: Record<string, Partial<ReviewData>> = {
  google: {
    ...baseDefaults,
    platform: "google",
    localGuideLevel: 0,
    numberOfReviews: 0,
    numberOfPhotos: 0,
    isNew: false,
  },
  amazon: {
    ...baseDefaults,
    platform: "amazon",
    reviewTitle: "",
    verified: false,
    helpfulVotes: 0,
  },
  yelp: {
    ...baseDefaults,
    platform: "yelp",
    eliteBadge: false,
    numberOfFriends: 0,
    numberOfPhotos: 0,
  },
  tripadvisor: {
    ...baseDefaults,
    platform: "tripadvisor",
    reviewTitle: "",
    helpfulVotes: 0,
    contributionLevel: "",
  },
  facebook: {
    ...baseDefaults,
    platform: "facebook",
    verified: false,
  },
  trustpilot: {
    ...baseDefaults,
    platform: "trustpilot",
    reviewTitle: "",
    verified: false,
  },
  fiverr: {
    ...baseDefaults,
    platform: "fiverr",
    orderNumber: "",
    country: "",
  },
  airbnb: {
    ...baseDefaults,
    platform: "airbnb",
    reviewTitle: "",
    stayDate: "",
    verified: false,
  },
  appstore: {
    ...baseDefaults,
    platform: "appstore",
    reviewTitle: "",
    appVersion: "",
    country: "",
  },
  playstore: {
    ...baseDefaults,
    platform: "playstore",
    appVersion: "",
    device: "",
  },
  awardbadge: {
    platform: "awardbadge",
    heading: "App Store Awards 2024 Winner",
    content: "",
    textColor: textColorPalette[2],
    laurelWreathColor: laurelWreathColorPalette[0],
  },
};

// Helper function to get defaults for a platform
export const getPlatformDefaults = (platform: string): Partial<ReviewData> => {
  return platformDefaults[platform] || baseDefaults;
};

