"use server";

import { createClient } from "@/core/db/server";
import { revalidatePath } from "next/cache";

export async function getQuotes(orgId: string) {
  const supabase = await createClient();
  
  const { data: quotes, error } = await supabase
    .from("quotes")
    .select(`
      *,
      contact:contacts(name, email),
      package:packages(name)
    `)
    .eq("org_id", orgId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching quotes:", error);
    return [];
  }

  return quotes || [];
}

export async function getQuoteById(id: string) {
  const supabase = await createClient();
  
  const { data: quote, error } = await supabase
    .from("quotes")
    .select(`
      *,
      contact:contacts(*),
      package:packages(*)
    `)
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching quote:", error);
    return null;
  }

  return quote;
}

export async function createQuote(orgId: string, quote: {
  contact_id: string;
  event_id?: string;
  package_id?: string;
  guest_count: number;
  add_ons?: Record<string, number>;
  subtotal: number;
  tax: number;
  total: number;
  status?: string;
  expires_at?: string;
}) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("quotes")
    .insert({
      org_id: orgId,
      ...quote,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating quote:", error);
    throw new Error(error.message);
  }

  revalidatePath("/quotes");
  return data;
}

export async function updateQuote(id: string, quote: {
  contact_id?: string;
  event_id?: string;
  package_id?: string;
  guest_count?: number;
  add_ons?: Record<string, number>;
  subtotal?: number;
  tax?: number;
  total?: number;
  status?: string;
  expires_at?: string;
}) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("quotes")
    .update(quote)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating quote:", error);
    throw new Error(error.message);
  }

  revalidatePath("/quotes");
  return data;
}

export async function deleteQuote(id: string) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from("quotes")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting quote:", error);
    throw new Error(error.message);
  }

  revalidatePath("/quotes");
  return { success: true };
}

export async function getPackages(orgId: string) {
  const supabase = await createClient();
  
  const { data: packages, error } = await supabase
    .from("packages")
    .select("*")
    .eq("org_id", orgId)
    .eq("is_active", true)
    .order("base_price", { ascending: true });

  if (error) {
    console.error("Error fetching packages:", error);
    return [];
  }

  return packages || [];
}
