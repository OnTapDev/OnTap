"use server";

import { currentUser } from "@clerk/nextjs/server";
import { createClient } from "@/core/db/server";

export async function getUserOrgId(): Promise<string | null> {
  const user = await currentUser();
  
  if (!user) {
    console.log("No Clerk user found");
    return "demo-org";
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
    return "demo-org";
  }

  return userRecord.org_id;
}