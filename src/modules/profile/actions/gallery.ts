"use server";

import { createClient } from "@/core/db/server";
import { revalidatePath } from "next/cache";
import { uploadFile, deleteFile } from "@/core/storage/upload";

type GalleryItem = {
  id: string;
  org_id: string;
  url: string;
  type: string;
  caption: string | null;
  is_public: boolean;
  is_featured: boolean;
  display_order: number;
  created_at: string;
};

export async function getGalleryItems(orgId: string): Promise<GalleryItem[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("gallery_items")
    .select("*")
    .eq("org_id", orgId)
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching gallery:", error);
    return [];
  }

  return data || [];
}

export async function getGalleryItemsBySlug(orgSlug: string): Promise<GalleryItem[]> {
  const supabase = await createClient();
  
  const { data: organization } = await supabase
    .from("organizations")
    .select("id")
    .eq("slug", orgSlug)
    .single();

  if (!organization) {
    return [];
  }

  const { data, error } = await supabase
    .from("gallery_items")
    .select("*")
    .eq("org_id", organization.id)
    .eq("is_public", true)
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching gallery:", error);
    return [];
  }

  return data || [];
}

export async function createGalleryItem(
  orgId: string,
  item: {
    file_data: string;
    file_name: string;
    type: string;
    caption?: string;
    is_public?: boolean;
  }
): Promise<GalleryItem | null> {
  const supabase = await createClient();
  
  let url: string;
  try {
    url = await uploadFile(orgId, item.file_data, item.file_name, "gallery");
  } catch (error) {
    console.error("Error uploading gallery image:", error);
    throw new Error("Failed to upload image");
  }

  const { data: maxOrder } = await supabase
    .from("gallery_items")
    .select("display_order")
    .eq("org_id", orgId)
    .order("display_order", { ascending: false })
    .limit(1)
    .single();

  const newOrder = (maxOrder?.display_order ?? -1) + 1;

  const { data, error } = await supabase
    .from("gallery_items")
    .insert({
      org_id: orgId,
      url,
      type: item.type,
      caption: item.caption || null,
      is_public: item.is_public ?? true,
      display_order: newOrder,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating gallery item:", error);
    await deleteFile(url);
    throw new Error(error.message);
  }

  revalidatePath("/profile");
  return data;
}

export async function updateGalleryItem(
  id: string,
  data: {
    caption?: string;
    is_public?: boolean;
    display_order?: number;
    type?: string;
    is_featured?: boolean;
  }
): Promise<GalleryItem | null> {
  const supabase = await createClient();
  
  const { data: item, error } = await supabase
    .from("gallery_items")
    .update({
      ...data,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating gallery item:", error);
    throw new Error(error.message);
  }

  revalidatePath("/profile");
  return item;
}

export async function reorderGalleryItems(orgId: string, orderedIds: string[]): Promise<{ success: boolean }> {
  const supabase = await createClient();

  for (let i = 0; i < orderedIds.length; i++) {
    const { error } = await supabase
      .from("gallery_items")
      .update({ display_order: i })
      .eq("id", orderedIds[i])
      .eq("org_id", orgId);

    if (error) {
      console.error("Error reordering gallery item:", error);
      throw new Error(error.message);
    }
  }

  revalidatePath("/profile");
  return { success: true };
}

export async function deleteGalleryItem(id: string): Promise<{ success: boolean }> {
  const supabase = await createClient();
  
  const { data: item, error: fetchError } = await supabase
    .from("gallery_items")
    .select("url")
    .eq("id", id)
    .single();

  if (fetchError) {
    console.error("Error fetching gallery item:", fetchError);
    throw new Error(fetchError.message);
  }

  if (item?.url) {
    try {
      await deleteFile(item.url);
    } catch (error) {
      console.error("Error deleting file from storage:", error);
    }
  }

  const { error } = await supabase
    .from("gallery_items")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting gallery item:", error);
    throw new Error(error.message);
  }

  revalidatePath("/profile");
  return { success: true };
}