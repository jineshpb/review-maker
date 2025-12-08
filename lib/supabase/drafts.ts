import { createAuthenticatedClient, createServerClient } from "./server";
import { ensureUserExists } from "./users";
import type { Database } from "@/types/database";
import type { ReviewData } from "@/types/review";

type Draft = Database["public"]["Tables"]["drafts"]["Row"];
type DraftInsert = Database["public"]["Tables"]["drafts"]["Insert"];
type DraftUpdate = Database["public"]["Tables"]["drafts"]["Update"];

/**
 * Get all drafts for the current user
 */
export async function getUserDrafts(
  platform?: string,
  request?: import("next/server").NextRequest
) {
  const { supabase, userId } = await createAuthenticatedClient(request);

  let query = supabase
    .from("drafts")
    .select("*")
    .eq("user_id", userId) // Manual validation (since we're using Clerk)
    .order("updated_at", { ascending: false });

  if (platform) {
    query = query.eq("platform", platform);
  }

  const { data, error } = await query;

  return { data, error };
}

/**
 * Get a single draft by ID (with user validation)
 */
export async function getDraftById(draftId: string) {
  const { supabase, userId } = await createAuthenticatedClient();

  const { data, error } = await supabase
    .from("drafts")
    .select("*")
    .eq("id", draftId)
    .eq("user_id", userId) // Ensure user owns this draft
    .single();

  return { data, error };
}

/**
 * Create a new draft
 * Ensures user exists in users table before creating draft
 */
export async function createDraft(
  draft: Omit<DraftInsert, "user_id" | "id" | "created_at" | "updated_at">,
  request?: import("next/server").NextRequest
) {
  const { supabase, userId } = await createAuthenticatedClient(request);

  // Ensure user exists in users table
  await ensureUserExists(request);

  const insertData = {
    ...draft,
    user_id: userId,
  } as DraftInsert;

  const { data, error } = await supabase
    .from("drafts")
    .insert(insertData as any)
    .select()
    .single();

  return { data, error };
}

/**
 * Update an existing draft (with user validation)
 */
export async function updateDraft(
  draftId: string,
  updates: Partial<DraftUpdate>
) {
  const { supabase, userId } = await createAuthenticatedClient();

  const updateData = {
    ...updates,
    updated_at: new Date().toISOString(),
  };

  // Type assertion needed until Supabase types are regenerated from actual database
  const { data, error } = await (supabase.from("drafts") as any)
    .update(updateData)
    .eq("id", draftId)
    .eq("user_id", userId) // Ensure user owns this draft
    .select()
    .single();

  return { data, error };
}

/**
 * Delete a draft (with user validation)
 */
export async function deleteDraft(draftId: string) {
  const { supabase, userId } = await createAuthenticatedClient();

  const { error } = await supabase
    .from("drafts")
    .delete()
    .eq("id", draftId)
    .eq("user_id", userId); // Ensure user owns this draft

  return { error };
}

/**
 * Count drafts for the current user (for limit checking)
 */
export async function getDraftCount(platform?: string) {
  const { supabase, userId } = await createAuthenticatedClient();

  let query = supabase
    .from("drafts")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  if (platform) {
    query = query.eq("platform", platform);
  }

  const { count, error } = await query;

  return { count: count || 0, error };
}
