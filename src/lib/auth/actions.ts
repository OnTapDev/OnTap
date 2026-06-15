"use server";

import { currentUser, auth, clerkClient } from "@clerk/nextjs/server";
import { createClient } from "@/core/db/server";
import { redirect } from "next/navigation";

export async function deleteUserAccount(): Promise<{ success: boolean; error?: string }> {
  const user = await currentUser();
  
  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  const clerkId = user.id;
  const supabase = await createClient();

  try {
    // Get the user record to find org_id
    const { data: userRecord, error: userError } = await supabase
      .from("users")
      .select("org_id")
      .eq("clerk_id", clerkId)
      .single();

    if (userError || !userRecord) {
      console.log("No user record found for Clerk ID:", clerkId);
    }

    const orgId = userRecord?.org_id;

    // Delete related data if org exists
    if (orgId) {
      // Delete contacts
      await supabase.from("contacts").delete().eq("org_id", orgId);
      // Delete events
      await supabase.from("events").delete().eq("org_id", orgId);
      // Delete invoices
      await supabase.from("invoices").delete().eq("org_id", orgId);
      // Delete quotes
      await supabase.from("quotes").delete().eq("org_id", orgId);
      // Delete contracts
      await supabase.from("contracts").delete().eq("org_id", orgId);
      // Delete staff
      await supabase.from("staff").delete().eq("org_id", orgId);
      // Delete organization
      await supabase.from("organizations").delete().eq("id", orgId);
    }

    // Delete user record
    await supabase.from("users").delete().eq("clerk_id", clerkId);

    // Sign out the user via Clerk v5 API
    const { sessionId } = await auth();
    if (sessionId) {
      const client = await clerkClient();
      await client.sessions.revokeSession(sessionId);
    }

    redirect("/");
    
    return { success: true };
  } catch {
    console.error("Failed to delete account");
    return { success: false, error: "Failed to delete account" };
  }
}