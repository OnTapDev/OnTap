"use server";

import { currentUser } from "@clerk/nextjs/server";
import { createClient } from "@/core/db/server";

export async function getUserOrgId(): Promise<string | null> {
  const user = await currentUser();
  if (!user) return null;

  const clerkId = user.id;
  const supabase = await createClient();

  const { data: userRecord, error } = await supabase
    .from("users")
    .select("org_id")
    .eq("clerk_id", clerkId)
    .single();

  if (error || !userRecord) return null;

  return userRecord.org_id;
}