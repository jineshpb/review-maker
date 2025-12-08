import { createAuthenticatedClient } from "./server";
import type { Database } from "@/types/database";
import { uploadScreenshot, deleteScreenshot } from "./storage";

type SavedScreenshot = Database["public"]["Tables"]["saved_screenshots"]["Row"];
type ScreenshotInsert =
  Database["public"]["Tables"]["saved_screenshots"]["Insert"];
type ScreenshotUpdate =
  Database["public"]["Tables"]["saved_screenshots"]["Update"];

/**
 * Get all saved screenshots for the current user
 */
export async function getUserScreenshots(
  platform?: string,
  limit?: number,
  offset?: number
) {
  const { supabase, userId } = await createAuthenticatedClient();

  let query = supabase
    .from("saved_screenshots")
    .select("*")
    .eq("user_id", userId) // Manual validation
    .order("created_at", { ascending: false });

  if (platform) {
    query = query.eq("platform", platform);
  }

  if (limit) {
    query = query.limit(limit);
  }

  if (offset) {
    query = query.range(offset, offset + (limit || 20) - 1);
  }

  const { data, error } = await query;

  return { data, error };
}

/**
 * Get a single screenshot by ID (with user validation)
 */
export async function getScreenshotById(screenshotId: string) {
  const { supabase, userId } = await createAuthenticatedClient();

  const { data, error } = await (supabase.from("saved_screenshots") as any)
    .select("*")
    .eq("id", screenshotId)
    .eq("user_id", userId) // Ensure user owns this screenshot
    .single();

  return { data, error };
}

/**
 * Save a screenshot (upload to storage + create database record)
 */
export async function saveScreenshot(
  screenshot: Omit<
    ScreenshotInsert,
    "user_id" | "id" | "created_at" | "updated_at" | "screenshot_url"
  >,
  imageBlob: Blob | Buffer,
  request?: import("next/server").NextRequest
) {
  const { userId } = await createAuthenticatedClient(request);

  // Upload to storage
  const { data: uploadData, error: uploadError } = await uploadScreenshot(
    userId,
    imageBlob
  );

  if (uploadError || !uploadData) {
    return { data: null, error: uploadError || new Error("Upload failed") };
  }

  // Create database record
  const { supabase } = await createAuthenticatedClient();

  const insertData: ScreenshotInsert = {
    ...screenshot,
    user_id: userId,
    screenshot_url: uploadData.url,
  } as ScreenshotInsert;

  const { data, error } = await (supabase.from("saved_screenshots") as any)
    .insert(insertData)
    .select()
    .single();

  // If database insert fails, clean up uploaded file
  if (error && uploadData.path) {
    await deleteScreenshot(uploadData.path);
  }

  return { data, error };
}

/**
 * Delete a screenshot (remove from storage + delete database record)
 */
export async function deleteScreenshotById(screenshotId: string) {
  const { supabase, userId } = await createAuthenticatedClient();

  // Get screenshot to find storage path
  const { data: screenshot, error: fetchError } = await getScreenshotById(
    screenshotId
  );

  if (fetchError || !screenshot) {
    return { error: fetchError || new Error("Screenshot not found") };
  }

  // Extract file path from URL
  // URL format: https://xxx.supabase.co/storage/v1/object/public/screenshots/user_id/file_id.png
  const url = screenshot.screenshot_url;
  const pathMatch = url.match(/screenshots\/(.+)$/);
  const filePath = pathMatch ? pathMatch[1] : null;

  // Delete from storage
  if (filePath) {
    await deleteScreenshot(filePath);
  }

  // Delete database record
  const { error } = await (supabase.from("saved_screenshots") as any)
    .delete()
    .eq("id", screenshotId)
    .eq("user_id", userId); // Ensure user owns this screenshot

  return { error };
}

/**
 * Count screenshots for the current user (for limit checking)
 */
export async function getScreenshotCount(platform?: string) {
  const { supabase, userId } = await createAuthenticatedClient();

  let query = (supabase.from("saved_screenshots") as any)
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  if (platform) {
    query = query.eq("platform", platform);
  }

  const { count, error } = await query;

  return { count: count || 0, error };
}
