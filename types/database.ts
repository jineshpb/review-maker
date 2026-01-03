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
      drafts: {
        Row: {
          id: string;
          user_id: string;
          platform: string;
          review_data: Json;
          name: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          platform: string;
          review_data: Json;
          name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          platform?: string;
          review_data?: Json;
          name?: string | null;
          updated_at?: string;
        };
      };
      saved_screenshots: {
        Row: {
          id: string;
          user_id: string;
          draft_id: string | null;
          platform: string;
          review_data: Json;
          screenshot_url: string;
          thumbnail_url: string | null;
          name: string | null;
          file_size: number | null;
          width: number | null;
          height: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          draft_id?: string | null;
          platform: string;
          review_data: Json;
          screenshot_url: string;
          thumbnail_url?: string | null;
          name?: string | null;
          file_size?: number | null;
          width?: number | null;
          height?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          draft_id?: string | null;
          platform?: string;
          review_data?: Json;
          screenshot_url?: string;
          thumbnail_url?: string | null;
          name?: string | null;
          file_size?: number | null;
          width?: number | null;
          height?: number | null;
          updated_at?: string;
        };
      };
      user_subscriptions: {
        Row: {
          user_id: string;
          tier: "free" | "premium" | "enterprise";
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          razorpay_customer_id: string | null;
          razorpay_subscription_id: string | null;
          status: "active" | "cancelled" | "expired";
          current_period_end: string | null;
          billing_interval: "month" | "year" | null;
          ai_fills_available: number;
          credits_balance: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          tier?: "free" | "premium" | "enterprise";
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          razorpay_customer_id?: string | null;
          razorpay_subscription_id?: string | null;
          status?: "active" | "cancelled" | "expired";
          current_period_end?: string | null;
          billing_interval?: "month" | "year" | null;
          ai_fills_available?: number;
          credits_balance?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          tier?: "free" | "premium" | "enterprise";
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          razorpay_customer_id?: string | null;
          razorpay_subscription_id?: string | null;
          status?: "active" | "cancelled" | "expired";
          current_period_end?: string | null;
          billing_interval?: "month" | "year" | null;
          ai_fills_available?: number;
          credits_balance?: number;
          updated_at?: string;
        };
      };
      credit_transactions: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          balance_after: number;
          transaction_type: string;
          reference_id: string | null;
          reference_type: string | null;
          description: string | null;
          metadata: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          amount: number;
          balance_after: number;
          transaction_type: string;
          reference_id?: string | null;
          reference_type?: string | null;
          description?: string | null;
          metadata?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          amount?: number;
          balance_after?: number;
          transaction_type?: string;
          reference_id?: string | null;
          reference_type?: string | null;
          description?: string | null;
          metadata?: Json | null;
          created_at?: string;
        };
      };
      credit_pack_purchases: {
        Row: {
          id: string;
          user_id: string;
          pack_id: string;
          pack_tier: string;
          credits_amount: number;
          bonus_credits: number;
          total_credits: number;
          price: number;
          currency: string;
          razorpay_order_id: string | null;
          razorpay_payment_id: string | null;
          payment_status: string;
          credit_transaction_id: string | null;
          expires_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          pack_id: string;
          pack_tier: string;
          credits_amount: number;
          bonus_credits?: number;
          total_credits: number;
          price: number;
          currency?: string;
          razorpay_order_id?: string | null;
          razorpay_payment_id?: string | null;
          payment_status?: string;
          credit_transaction_id?: string | null;
          expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          pack_id?: string;
          pack_tier?: string;
          credits_amount?: number;
          bonus_credits?: number;
          total_credits?: number;
          price?: number;
          currency?: string;
          razorpay_order_id?: string | null;
          razorpay_payment_id?: string | null;
          payment_status?: string;
          credit_transaction_id?: string | null;
          expires_at?: string | null;
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
