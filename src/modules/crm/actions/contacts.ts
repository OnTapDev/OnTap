"use server";

import { createClient } from "@/core/db/server";
import { revalidatePath } from "next/cache";

export async function getContacts(orgId: string) {
  const supabase = await createClient();
  
  const { data: contacts, error } = await supabase
    .from("contacts")
    .select(`
      *,
      stage:pipeline_stages(*)
    `)
    .eq("org_id", orgId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching contacts:", error);
    return [];
  }

  return contacts || [];
}

export async function getContactById(id: string) {
  const supabase = await createClient();
  
  const { data: contact, error } = await supabase
    .from("contacts")
    .select(`
      *,
      stage:pipeline_stages(*)
    `)
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching contact:", error);
    return null;
  }

  return contact;
}

export async function createContact(orgId: string, contact: {
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  role?: string;
  source?: string;
  notes?: string;
  tags?: string[];
  stage_id?: string;
}) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("contacts")
    .insert({
      org_id: orgId,
      ...contact,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating contact:", error);
    throw new Error(error.message);
  }

  revalidatePath("/crm");
  return data;
}

export async function updateContact(id: string, contact: {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  role?: string;
  source?: string;
  notes?: string;
  tags?: string[];
  stage_id?: string;
}) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("contacts")
    .update(contact)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating contact:", error);
    throw new Error(error.message);
  }

  revalidatePath("/crm");
  return data;
}

export async function deleteContact(id: string) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from("contacts")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting contact:", error);
    throw new Error(error.message);
  }

  revalidatePath("/crm");
  return { success: true };
}

export async function getPipelineStages(orgId: string) {
  const supabase = await createClient();
  
  const { data: stages, error } = await supabase
    .from("pipeline_stages")
    .select("*")
    .eq("org_id", orgId)
    .order("order", { ascending: true });

  if (error) {
    console.error("Error fetching stages:", error);
    return [];
  }

  return stages || [];
}
