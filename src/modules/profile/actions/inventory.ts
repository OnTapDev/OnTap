"use server";

import { createClient } from "@/core/db/server";
import { revalidatePath } from "next/cache";

export type InventoryItem = {
  id: string;
  org_id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  reorder_level: number | null;
  cost_per_unit: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export async function getInventoryItems(orgId: string): Promise<InventoryItem[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("inventory_items")
    .select("*")
    .eq("org_id", orgId)
    .order("category", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching inventory:", error);
    return [];
  }

  return data || [];
}

export async function createInventoryItem(
  orgId: string,
  item: {
    name: string;
    category: string;
    quantity: number;
    unit: string;
    reorder_level?: number;
    cost_per_unit?: number;
    notes?: string;
  }
): Promise<InventoryItem | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("inventory_items")
    .insert({
      org_id: orgId,
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      unit: item.unit,
      reorder_level: item.reorder_level ?? null,
      cost_per_unit: item.cost_per_unit ?? null,
      notes: item.notes ?? null,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating inventory item:", error);
    throw new Error(error.message);
  }

  revalidatePath("/profile");
  return data;
}

export async function updateInventoryItem(
  id: string,
  data: {
    name?: string;
    category?: string;
    quantity?: number;
    unit?: string;
    reorder_level?: number | null;
    cost_per_unit?: number | null;
    notes?: string | null;
  }
): Promise<InventoryItem | null> {
  const supabase = await createClient();

  const { data: item, error } = await supabase
    .from("inventory_items")
    .update({
      ...data,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating inventory item:", error);
    throw new Error(error.message);
  }

  revalidatePath("/profile");
  return item;
}

export async function deleteInventoryItem(id: string): Promise<{ success: boolean }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("inventory_items")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting inventory item:", error);
    throw new Error(error.message);
  }

  revalidatePath("/profile");
  return { success: true };
}
