import {
  FormFieldType,
  type FormField,
  type FormSection,
  type PlatformFormConfig,
} from "@/types/form-fields";
import { textColorPalette, laurelWreathColorPalette } from "./ColorPicker";

// Common base fields (used by most platforms)
const baseFields: FormField[] = [
  {
    id: "reviewerName",
    label: "Reviewer Name",
    type: FormFieldType.INPUT,
    placeholder: "John Doe",
  },
  {
    id: "rating",
    label: "Rating",
    type: FormFieldType.SLIDER,
    min: 1,
    max: 5,
    step: 1,
  },
  {
    id: "reviewText",
    label: "Review Text",
    type: FormFieldType.TEXTAREA,
    rows: 6,
    placeholder: "Write your review here...",
  },
  {
    id: "date",
    label: "Date",
    type: FormFieldType.DATE,
  },
  {
    id: "profilePictureUrl",
    label: "Profile Picture URL (optional)",
    type: FormFieldType.INPUT,
    inputType: "url",
    placeholder: "https://example.com/avatar.jpg",
  },
];

// Google-specific fields
const googleFields: FormField[] = [
  {
    id: "localGuideLevel",
    label: "Local Guide Level (0-10, 0 = not a local guide)",
    type: FormFieldType.NUMBER,
    min: 0,
    max: 10,
  },
  {
    id: "numberOfReviews",
    label: "Number of Reviews",
    type: FormFieldType.NUMBER,
    min: 0,
  },
  {
    id: "numberOfPhotos",
    label: "Number of Photos",
    type: FormFieldType.NUMBER,
    min: 0,
  },
  {
    id: "isNew",
    label: 'Show "NEW" Badge',
    type: FormFieldType.TOGGLE,
  },
];

// Amazon-specific fields
const amazonFields: FormField[] = [
  {
    id: "reviewTitle",
    label: "Review Title",
    type: FormFieldType.INPUT,
    placeholder: "Great product!",
  },
  {
    id: "verified",
    label: "Verified Purchase",
    type: FormFieldType.TOGGLE,
  },
  {
    id: "helpfulVotes",
    label: "Helpful Votes",
    type: FormFieldType.NUMBER,
    min: 0,
  },
];

// TripAdvisor-specific fields
const tripadvisorFields: FormField[] = [
  {
    id: "reviewTitle",
    label: "Review Title",
    type: FormFieldType.INPUT,
    placeholder: "Great experience!",
  },
  {
    id: "helpfulVotes",
    label: "Helpful Votes",
    type: FormFieldType.NUMBER,
    min: 0,
  },
  {
    id: "contributionLevel",
    label: "Contribution Level",
    type: FormFieldType.INPUT,
    placeholder: "e.g., 18 contributions or Level 6 Contributor",
  },
];

// Trustpilot-specific fields
const trustpilotFields: FormField[] = [
  {
    id: "reviewTitle",
    label: "Review Title",
    type: FormFieldType.INPUT,
    placeholder: "Great service!",
  },
  {
    id: "verified",
    label: "Verified Purchase",
    type: FormFieldType.TOGGLE,
  },
];

// Facebook-specific fields
const facebookFields: FormField[] = [
  {
    id: "verified",
    label: "Verified Badge",
    type: FormFieldType.TOGGLE,
  },
];

// App Store-specific fields
const appstoreFields: FormField[] = [
  {
    id: "reviewTitle",
    label: "Review Title",
    type: FormFieldType.INPUT,
    placeholder: "Ads being forced even in paid version",
  },
];

// App Store Award Badge fields (nested)
const appstoreAwardBadgeFields: FormField[] = [
  {
    id: "awardBadge.heading",
    label: "Award Heading",
    type: FormFieldType.INPUT,
    placeholder: "App Store Awards 2024 Winner",
  },
  {
    id: "awardBadge.content",
    label: "Award Content (optional)",
    type: FormFieldType.INPUT,
    placeholder: "Additional award information",
  },
  {
    id: "awardBadge.textColor",
    label: "Text Color",
    type: FormFieldType.COLOR_PICKER,
    colors: textColorPalette,
    defaultColor: textColorPalette[0], // Default to first color in palette
  },
  {
    id: "awardBadge.laurelWreathColor",
    label: "Laurel Wreath Color",
    type: FormFieldType.COLOR_PICKER,
    colors: laurelWreathColorPalette,
    defaultColor: laurelWreathColorPalette[0], // Default to first color in palette
  },
];

// Award Badge platform fields (standalone)
const awardBadgeFields: FormField[] = [
  {
    id: "heading",
    label: "Award Heading",
    type: FormFieldType.INPUT,
    placeholder: "App Store Awards 2024 Winner",
  },
  {
    id: "content",
    label: "Award Content (optional)",
    type: FormFieldType.INPUT,
    placeholder: "Additional award information",
  },
  {
    id: "textColor",
    label: "Text Color",
    type: FormFieldType.COLOR_PICKER,
    colors: textColorPalette,
    defaultColor: textColorPalette[0], // Default to first color in palette
  },
  {
    id: "laurelWreathColor",
    label: "Laurel Wreath Color",
    type: FormFieldType.COLOR_PICKER,
    colors: laurelWreathColorPalette,
    defaultColor: laurelWreathColorPalette[0], // Default to first color in palette
  },
];

// Platform form configurations
export const platformFormConfigs: Record<string, PlatformFormConfig> = {
  google: {
    platform: "google",
    sections: [
      {
        fields: [...baseFields, ...googleFields],
      },
    ],
  },
  amazon: {
    platform: "amazon",
    sections: [
      {
        fields: [...baseFields, ...amazonFields],
      },
    ],
  },
  tripadvisor: {
    platform: "tripadvisor",
    sections: [
      {
        fields: [...baseFields, ...tripadvisorFields],
      },
    ],
  },
  trustpilot: {
    platform: "trustpilot",
    sections: [
      {
        fields: [...baseFields, ...trustpilotFields],
      },
    ],
  },
  facebook: {
    platform: "facebook",
    sections: [
      {
        fields: [...baseFields, ...facebookFields],
      },
    ],
  },
  appstore: {
    platform: "appstore",
    sections: [
      {
        fields: [...baseFields, ...appstoreFields],
      },
      {
        title: "Award Badge",
        fields: [
          {
            id: "awardBadge.enabled",
            label: "Show Award Badge",
            type: FormFieldType.TOGGLE,
          },
          ...appstoreAwardBadgeFields,
        ],
      },
    ],
  },
  awardbadge: {
    platform: "awardbadge",
    sections: [
      {
        fields: awardBadgeFields,
      },
    ],
  },
};
