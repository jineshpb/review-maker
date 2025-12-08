-- Migration: Storage Buckets Setup
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql
-- 
-- Note: Storage buckets can also be created via Supabase Dashboard:
-- Dashboard → Storage → Create Bucket

-- ============================================================================
-- STORAGE BUCKETS
-- ============================================================================

-- 1. SCREENSHOTS BUCKET
-- Store full-resolution screenshot images
INSERT INTO storage.buckets (id, name, public)
VALUES ('screenshots', 'screenshots', false)
ON CONFLICT (id) DO NOTHING;

-- 2. THUMBNAILS BUCKET (Optional)
-- Store smaller thumbnail versions for gallery view
INSERT INTO storage.buckets (id, name, public)
VALUES ('thumbnails', 'thumbnails', false)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- STORAGE POLICIES
-- ============================================================================
-- Note: Since we're using Clerk (not Supabase Auth), these policies won't work
-- We'll handle access control in application code using Service Role Key
-- But we'll set them up anyway for future compatibility

-- Allow authenticated users to upload their own screenshots
CREATE POLICY "Users can upload own screenshots"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'screenshots' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to read their own screenshots
CREATE POLICY "Users can read own screenshots"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'screenshots' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to delete their own screenshots
CREATE POLICY "Users can delete own screenshots"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'screenshots' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Similar policies for thumbnails
CREATE POLICY "Users can upload own thumbnails"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'thumbnails' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can read own thumbnails"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'thumbnails' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete own thumbnails"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'thumbnails' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================================================
-- NOTE ABOUT STORAGE POLICIES
-- ============================================================================
-- Since we're using Clerk (not Supabase Auth), these RLS policies won't work.
-- We'll use the Service Role Key in application code to:
-- 1. Upload files to: {user_id}/{screenshot_id}.png
-- 2. Generate signed URLs for access
-- 3. Manually validate user_id matches Clerk user
--
-- The policies above are set up for future compatibility if we ever switch
-- to Supabase Auth, but they won't be enforced with Clerk.

