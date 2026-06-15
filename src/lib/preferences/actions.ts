"use server";

import { createClient } from "@supabase/supabase-js";
import { currentUser } from "@clerk/nextjs/server";

function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export type UserPreferences = {
  id: string;
  user_id: string;
  email_new_leads: boolean;
  email_quote_updates: boolean;
  email_contract_signatures: boolean;
  email_payment_received: boolean;
  sms_urgent_events: boolean;
  sms_staff_assignments: boolean;
  digest_daily: boolean;
  digest_weekly: boolean;
};

export async function getUserPreferences(): Promise<UserPreferences | null> {
  const user = await currentUser();
  if (!user) return null;

  const clerkId = user.id;
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("user_preferences")
    .select("*")
    .eq("user_id", clerkId)
    .single();

  if (error || !data) {
    return null;
  }

  return data as UserPreferences;
}

export async function updateUserPreferences(preferences: Partial<UserPreferences>): Promise<{ success: boolean; error?: string }> {
  const user = await currentUser();
  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  const clerkId = user.id;
  const supabase = createAdminClient();

  // Check if preferences exist
  const { data: existing } = await supabase
    .from("user_preferences")
    .select("id")
    .eq("user_id", clerkId)
    .single();

  if (existing) {
    // Update existing
    const { error } = await supabase
      .from("user_preferences")
      .update({ ...preferences, updated_at: new Date().toISOString() })
      .eq("user_id", clerkId);

    if (error) {
      return { success: false, error: error.message };
    }
  } else {
    // Insert new
    const { error } = await supabase
      .from("user_preferences")
      .insert({ user_id: clerkId, ...preferences });

    if (error) {
      return { success: false, error: error.message };
    }
  }

  return { success: true };
}

export async function createUserPreferencesIfNotExists(): Promise<void> {
  const user = await currentUser();
  if (!user) return;

  const clerkId = user.id;
  const supabase = createAdminClient();

  const { data: existing } = await supabase
    .from("user_preferences")
    .select("id")
    .eq("user_id", clerkId)
    .single();

  if (!existing) {
    await supabase
      .from("user_preferences")
      .insert({ user_id: clerkId });
  }
}