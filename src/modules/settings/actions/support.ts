"use server";

import { createClient } from "@/core/db/server";
import { revalidatePath } from "next/cache";

export async function createSupportRequest(request: {
  orgId?: string;
  email?: string;
  name?: string;
  type: "help" | "bug" | "feature" | "other";
  subject: string;
  description: string;
  priority?: "low" | "normal" | "high" | "urgent";
}) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("support_requests")
    .insert({
      org_id: request.orgId || null,
      email: request.email,
      name: request.name || null,
      type: request.type,
      subject: request.subject,
      description: request.description,
      priority: request.priority || "normal",
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating support request:", error);
    throw new Error("Failed to submit request");
  }

  revalidatePath("/settings");
  return data;
}

export async function getSupportRequests(orgId: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("support_requests")
    .select("*")
    .eq("org_id", orgId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching support requests:", error);
    return [];
  }

  return data || [];
}