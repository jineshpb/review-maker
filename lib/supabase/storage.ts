import { createServerClient } from "./server";
import { v4 as uuidv4 } from "uuid";

/**
 * Upload screenshot to Supabase Storage
 * @param userId - Clerk user ID
 * @param imageBlob - Image blob/buffer
 * @param filename - Optional custom filename (defaults to UUID)
 * @returns Storage path and public URL
 */
export async function uploadScreenshot(
  userId: string,
  imageBlob: Blob | Buffer,
  filename?: string
) {
  const supabase = createServerClient();
  const fileId = filename || uuidv4();
  const filePath = `${userId}/${fileId}.png`;

  // Convert Buffer to Blob if needed
  const blob =
    imageBlob instanceof Buffer
      ? new Blob([new Uint8Array(imageBlob)], { type: "image/png" })
      : imageBlob;

  const { data, error } = await supabase.storage
    .from("screenshots")
    .upload(filePath, blob, {
      contentType: "image/png",
      upsert: false,
    });

  if (error) {
    return { data: null, error };
  }

  // Get public URL (or signed URL for private buckets)
  const { data: urlData } = supabase.storage
    .from("screenshots")
    .getPublicUrl(filePath);

  return {
    data: {
      path: filePath,
      url: urlData.publicUrl,
      id: fileId,
    },
    error: null,
  };
}

/**
 * Generate a signed URL for a screenshot (for private buckets)
 * @param filePath - Storage path (e.g., "user_id/screenshot_id.png")
 * @param expiresIn - URL expiration time in seconds (default: 3600 = 1 hour)
 */
export async function getSignedUrl(filePath: string, expiresIn: number = 3600) {
  const supabase = createServerClient();

  const { data, error } = await supabase.storage
    .from("screenshots")
    .createSignedUrl(filePath, expiresIn);

  return { data, error };
}

/**
 * Delete screenshot from storage
 * @param filePath - Storage path (e.g., "user_id/screenshot_id.png")
 */
export async function deleteScreenshot(filePath: string) {
  const supabase = createServerClient();

  const { error } = await supabase.storage
    .from("screenshots")
    .remove([filePath]);

  return { error };
}

/**
 * Get file metadata (size, etc.)
 * @param filePath - Storage path
 */
export async function getFileMetadata(filePath: string) {
  const supabase = createServerClient();

  const { data, error } = await supabase.storage
    .from("screenshots")
    .list(filePath.split("/")[0], {
      search: filePath.split("/")[1],
    });

  return { data, error };
}
