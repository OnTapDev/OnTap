"use server";

import { createClient } from "@/core/db/server";
import { revalidatePath } from "next/cache";

export async function getInvoices(orgId: string) {
  const supabase = await createClient();
  
  const { data: invoices, error } = await supabase
    .from("invoices")
    .select(`
      *,
      event:events(name, date, venue_name)
    `)
    .eq("org_id", orgId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching invoices:", error);
    return [];
  }

  return invoices || [];
}

export async function getInvoiceById(id: string) {
  const supabase = await createClient();
  
  const { data: invoice, error } = await supabase
    .from("invoices")
    .select(`
      *,
      event:events(*)
    `)
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching invoice:", error);
    return null;
  }

  return invoice;
}

export async function createInvoice(orgId: string, invoice: {
  event_id: string;
  quote_id?: string;
  amount: number;
  deposit_amount?: number;
  balance_due: number;
  status?: string;
  due_date?: string;
}) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("invoices")
    .insert({
      org_id: orgId,
      ...invoice,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating invoice:", error);
    throw new Error(error.message);
  }

  revalidatePath("/invoices");
  revalidatePath("/billing");
  return data;
}

export async function updateInvoice(id: string, invoice: {
  amount?: number;
  deposit_amount?: number;
  balance_due?: number;
  status?: string;
  due_date?: string;
  paid_at?: string;
}) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("invoices")
    .update(invoice)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating invoice:", error);
    throw new Error(error.message);
  }

  revalidatePath("/invoices");
  revalidatePath("/billing");
  return data;
}

export async function deleteInvoice(id: string) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from("invoices")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting invoice:", error);
    throw new Error(error.message);
  }

  revalidatePath("/invoices");
  revalidatePath("/billing");
  return { success: true };
}

export async function getInvoiceForDownload(invoiceId: string) {
  const supabase = await createClient();
  
  const { data: invoice, error } = await supabase
    .from("invoices")
    .select(`
      *,
      event:events(
        name,
        date,
        venue_name,
        venue_address,
        contact:contacts(name, email, phone)
      ),
      organization:organizations(name)
    `)
    .eq("id", invoiceId)
    .single();

  if (error || !invoice) {
    throw new Error("Invoice not found");
  }

  return invoice;
}
