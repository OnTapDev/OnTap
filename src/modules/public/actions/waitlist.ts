"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

const MAX_SPOTS = 500;

function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function getWaitlistCount() {
  const supabase = createAdminClient();
  
  // Try to count from waitlist table first
  const { count: waitlistCount, error: waitlistError } = await supabase
    .from("waitlist")
    .select("*", { count: "exact", head: true });

  if (!waitlistError && waitlistCount !== null) {
    return waitlistCount;
  }

  // Fallback to count from contacts with source = "waitlist"
  const { count: contactCount, error: contactError } = await supabase
    .from("contacts")
    .select("*", { count: "exact", head: true })
    .eq("source", "waitlist");

  if (contactError) {
    console.error("Count error:", contactError);
    return 0;
  }

  return contactCount || 0;
}

export async function getAvailableSpots() {
  const count = await getWaitlistCount();
  const available = MAX_SPOTS - count;
  return available > 0 ? available : 0;
}

export async function createWaitlistEntry(email: string) {
  const supabase = createAdminClient();
  
  const available = await getAvailableSpots();
  if (available <= 0) {
    throw new Error("We're full! Join our waitlist to be notified of spots opening up.");
  }
  
  // Try to insert into waitlist table first
  const { error: waitlistError } = await supabase
    .from("waitlist")
    .insert({ email });

  if (!waitlistError) {
    revalidatePath("/");
    return { success: true };
  }

  // If waitlist table doesn't exist, use contacts table as fallback
  const { error: contactError } = await supabase
    .from("contacts")
    .insert({ 
      email,
      name: email.split("@")[0],
      source: "waitlist",
      org_id: "public-waitlist"
    });

  if (contactError) {
    console.error("Waitlist error:", contactError);
    throw new Error("Failed to join waitlist");
  }

  revalidatePath("/");
  return { success: true };
}