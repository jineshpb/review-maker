export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          username: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          username?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          username?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      review_templates: {
        Row: {
          id: string;
          user_id: string | null;
          name: string;
          platform: string;
          is_system_template: boolean;
          is_public: boolean;
          template_data: Json;
          preview_image_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          name: string;
          platform: string;
          is_system_template?: boolean;
          is_public?: boolean;
          template_data: Json;
          preview_image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          name?: string;
          platform?: string;
          is_system_template?: boolean;
          is_public?: boolean;
          template_data?: Json;
          preview_image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      review_screenshots: {
        Row: {
          id: string;
          user_id: string;
          template_id: string | null;
          title: string;
          review_data: Json;
          screenshot_url: string;
          thumbnail_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          template_id?: string | null;
          title: string;
          review_data: Json;
          screenshot_url: string;
          thumbnail_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          template_id?: string | null;
          title?: string;
          review_data?: Json;
          screenshot_url?: string;
          thumbnail_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}

export type ReviewPlatform =
  | "google"
  | "amazon"
  | "yelp"
  | "tripadvisor"
  | "facebook"
  | "trustpilot"
  | "fiverr"
  | "airbnb"
  | "appstore"
  | "playstore"
  | "custom";

export interface ReviewData {
  reviewerName: string;
  rating: number;
  reviewText: string;
  reviewTitle?: string;
  date: string;
  profilePictureUrl?: string;
  verified?: boolean;
  helpfulVotes?: number;
  [key: string]: unknown;
}

export interface TemplateData {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  fonts: {
    family: string;
    size: string;
    weight: string;
  };
  layout: {
    borderRadius: string;
    padding: string;
    shadow: string;
  };
  platformSpecific?: Json;
}

