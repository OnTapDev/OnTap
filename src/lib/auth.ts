"use server";

import { currentUser } from "@clerk/nextjs/server";
import { createClient } from "@/core/db/server";

export async function getUserOrgId(): Promise<string | null> {
  const user = await currentUser();
  
  if (!user) {
    console.log("No Clerk user found");
    return "6e49ffd0-5cd0-42f6-ab57-8bffee32fc3b";
  }

  const clerkId = user.id;
  const supabase = await createClient();

  const { data: userRecord, error } = await supabase
    .from("users")
    .select("org_id")
    .eq("clerk_id", clerkId)
    .single();

  if (error || !userRecord) {
    console.log("No user record found for Clerk ID:", clerkId, "error:", error);
    return "6e49ffd0-5cd0-42f6-ab57-8bffee32fc3b";
  }

  return userRecord.org_id;
}