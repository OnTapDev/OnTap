"use server";

import { createClient } from "@/core/db/server";
import { revalidatePath } from "next/cache";

export async function getStaff(orgId: string) {
  const supabase = await createClient();
  
  const { data: staff, error } = await supabase
    .from("users")
    .select("*")
    .eq("org_id", orgId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching staff:", error);
    return [];
  }

  return staff || [];
}

export async function createStaffMember(orgId: string, member: {
  clerk_id: string;
  email: string;
  name?: string;
  role?: string;
}) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("users")
    .insert({
      org_id: orgId,
      ...member,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating staff member:", error);
    throw new Error(error.message);
  }

  revalidatePath("/staff");
  return data;
}

export async function updateStaffMember(id: string, member: {
  name?: string;
  role?: string;
}) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("users")
    .update(member)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating staff member:", error);
    throw new Error(error.message);
  }

  revalidatePath("/staff");
  return data;
}

export async function deleteStaffMember(id: string) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from("users")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting staff member:", error);
    throw new Error(error.message);
  }

  revalidatePath("/staff");
  return { success: true };
}

export async function getStaffAssignments(eventId: string) {
  const supabase = await createClient();
  
  const { data: assignments, error } = await supabase
    .from("staff_assignments")
    .select(`
      *,
      user:users(name, email)
    `)
    .eq("event_id", eventId);

  if (error) {
    console.error("Error fetching assignments:", error);
    return [];
  }

  return assignments || [];
}
