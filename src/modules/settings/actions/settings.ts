"use server";

import { createClient } from "@/core/db/server";
import { revalidatePath } from "next/cache";
import { uploadLogo, deleteLogo } from "@/core/storage/upload";
import { currentUser, clerkClient } from "@clerk/nextjs/server";

export async function updateUserName(firstName: string, lastName: string) {
  const user = await currentUser();
  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    const client = await clerkClient();
    await client.users.updateUser(user.id, {
      firstName: firstName || undefined,
      lastName: lastName || undefined,
    });
    return { success: true };
  } catch (err: any) {
    console.error("Error updating user name:", err);
    return { success: false, error: err?.message || "Failed to update name" };
  }
}

export async function getOrganizations(orgId: string) {
  const supabase = await createClient();
  
  const { data: organization, error } = await supabase
    .from("organizations")
    .select("*")
    .eq("id", orgId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error("Error fetching organization:", error);
    return null;
  }

  return organization;
}

export async function getOrganizationBySlug(slug: string) {
  const supabase = await createClient();
  
  const { data: organization, error } = await supabase
    .from("organizations")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error("Error fetching organization:", error);
    return null;
  }

  return organization;
}

export async function updateOrganization(id: string, data: {
  name?: string;
  slug?: string;
  logo_url?: string;
  description?: string;
  website?: string;
  instagram?: string;
  facebook?: string;
  twitter?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  default_hourly_rate?: number;
  minimum_booking_hours?: number;
  service_area?: string;
  service_radius?: number;
  zones_of_operation?: string;
  regulations?: string;
  is_marketplace_listed?: boolean;
  delete_logo?: boolean;
}) {
  try {
    console.log("updateOrganization CALLED with id:", id, "data keys:", Object.keys(data));
    const supabase = await createClient();
  
  let logoUrl: string | undefined = data.logo_url;
  
  if (data.logo_url?.startsWith("data:")) {
    try {
      logoUrl = await uploadLogo(id, data.logo_url);
    } catch (error) {
      console.error("Error uploading logo:", error);
      throw new Error("Failed to upload logo");
    }
  } else if (data.delete_logo) {
    await deleteLogo(id);
    logoUrl = null as unknown as undefined;
  }

  const updateData: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      updateData[key] = value;
    }
  }
  if (logoUrl !== undefined) {
    updateData.logo_url = logoUrl;
   }
   delete updateData.delete_logo;

   console.log("updateOrganization: updateData keys:", Object.keys(updateData));
   console.log("updateOrganization: updateData:", JSON.stringify(updateData));

   const { data: organization, error } = await supabase
     .from("organizations")
     .update(updateData)
     .eq("id", id)
     .select()
     .single();

   if (error) {
     console.error("Error updating organization:", error);
     throw new Error(error.message);
   }

    revalidatePath("/profile");
    revalidatePath("/settings");
    return organization;
  } catch (err: any) {
    console.error("updateOrganization FATAL ERROR:", {
      message: err?.message,
      stack: err?.stack,
      code: err?.code,
      details: err?.details,
      hint: err?.hint,
      data_keys: Object.keys(data),
      data_sample: JSON.stringify(data).substring(0, 500),
    });
    throw new Error(err?.message || "Failed to update organization");
  }
}

export async function getPipelineStages(orgId: string) {
  const supabase = await createClient();
  
  const { data: stages, error } = await supabase
    .from("pipeline_stages")
    .select("*")
    .eq("org_id", orgId)
    .order("order", { ascending: true });

  if (error) {
    console.error("Error fetching pipeline stages:", error);
    return [];
  }

  return stages || [];
}

export async function createPipelineStage(orgId: string, stage: {
  name: string;
  order: number;
  color?: string;
}) {
  const supabase = await createClient();
  
  const { data: stageData, error } = await supabase
    .from("pipeline_stages")
    .insert({
      org_id: orgId,
      ...stage,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating pipeline stage:", error);
    throw new Error(error.message);
  }

  revalidatePath("/settings");
  return stageData;
}

export async function updatePipelineStage(id: string, data: {
  name?: string;
  order?: number;
  color?: string;
}) {
  const supabase = await createClient();
  
  const { data: stageData, error } = await supabase
    .from("pipeline_stages")
    .update(data)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating pipeline stage:", error);
    throw new Error(error.message);
  }

  revalidatePath("/settings");
  return stageData;
}

export async function deletePipelineStage(id: string) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from("pipeline_stages")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting pipeline stage:", error);
    throw new Error(error.message);
  }

  revalidatePath("/settings");
  return { success: true };
}

export async function getPackages(orgId: string) {
  const supabase = await createClient();
  
  const { data: packages, error } = await supabase
    .from("packages")
    .select("*")
    .eq("org_id", orgId)
    .order("base_price", { ascending: true });

  if (error) {
    console.error("Error fetching packages:", error);
    return [];
  }

  return packages || [];
}

export async function getPackagesBySlug(orgSlug: string) {
  const supabase = await createClient();
  
  const { data: organization } = await supabase
    .from("organizations")
    .select("id")
    .eq("slug", orgSlug)
    .single();

  if (!organization) {
    return [];
  }

  const { data: packages, error } = await supabase
    .from("packages")
    .select("*")
    .eq("org_id", organization.id)
    .order("base_price", { ascending: true });

  if (error) {
    console.error("Error fetching packages:", error);
    return [];
  }

  return packages || [];
}

export async function createPackage(orgId: string, pkg: {
  name: string;
  description?: string;
  base_price: number;
  pricing_type: string;
  min_guests?: number;
  max_guests?: number;
  includes_bartenders?: number;
  includes_glassware?: boolean;
}) {
  const supabase = await createClient();
  
  const { data: packageData, error } = await supabase
    .from("packages")
    .insert({
      org_id: orgId,
      ...pkg,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating package:", error);
    throw new Error(error.message);
  }

  revalidatePath("/settings");
  revalidatePath("/profile");
  return packageData;
}

export async function updatePackage(id: string, data: {
  name?: string;
  description?: string;
  base_price?: number;
  pricing_type?: string;
  min_guests?: number;
  max_guests?: number;
  includes_bartenders?: number;
  includes_glassware?: boolean;
  is_active?: boolean;
}) {
  const supabase = await createClient();
  
  const { data: packageData, error } = await supabase
    .from("packages")
    .update(data)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating package:", error);
    throw new Error(error.message);
  }

  revalidatePath("/settings");
  revalidatePath("/profile");
  return packageData;
}

export async function updateOrgSlug(orgId: string, newSlug: string) {
  const supabase = await createClient();

  const cleanSlug = newSlug
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (!cleanSlug || cleanSlug.length < 3) {
    throw new Error("Slug must be at least 3 characters (letters, numbers, hyphens)");
  }

  const { data: existing } = await supabase
    .from("organizations")
    .select("id")
    .eq("slug", cleanSlug)
    .neq("id", orgId)
    .maybeSingle();

  if (existing) {
    throw new Error("This slug is already taken. Try a different one.");
  }

  const { error } = await supabase
    .from("organizations")
    .update({ slug: cleanSlug })
    .eq("id", orgId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/settings");
  return { slug: cleanSlug };
}

export async function updateBookingEnabled(orgId: string, enabled: boolean) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("organizations")
    .update({ booking_enabled: enabled })
    .eq("id", orgId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/settings");
  return { enabled };
}

export async function updatePackageBookingVisibility(packageId: string, showOnBooking: boolean) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("packages")
    .update({ show_on_booking: showOnBooking })
    .eq("id", packageId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/settings");
  revalidatePath("/profile");
  return { show_on_booking: showOnBooking };
}

export async function deletePackage(id: string) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from("packages")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting package:", error);
    throw new Error(error.message);
  }

  revalidatePath("/settings");
  revalidatePath("/profile");
  return { success: true };
}

export type AddOn = {
  id: string;
  org_id: string;
  name: string;
  description: string | null;
  price: number;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
};

export async function getAddOns(orgId: string): Promise<AddOn[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("add_ons")
    .select("*")
    .eq("org_id", orgId)
    .order("display_order", { ascending: true });
  
  if (error) {
    console.error("Error fetching add-ons:", error);
    return [];
  }
  
  return data || [];
}

export async function createAddOn(orgId: string, addOn: {
  name: string;
  description?: string;
  price: number;
  is_active?: boolean;
}): Promise<AddOn | null> {
  const supabase = await createClient();
  
  const { data: maxOrder } = await supabase
    .from("add_ons")
    .select("display_order")
    .eq("org_id", orgId)
    .order("display_order", { ascending: false })
    .limit(1)
    .single();
  
  const newOrder = (maxOrder?.display_order ?? -1) + 1;
  
  const { data, error } = await supabase
    .from("add_ons")
    .insert({
      org_id: orgId,
      name: addOn.name,
      description: addOn.description || null,
      price: addOn.price,
      is_active: addOn.is_active ?? true,
      display_order: newOrder,
    })
    .select()
    .single();
  
  if (error) {
    console.error("Error creating add-on:", error);
    throw new Error(error.message);
  }
  
  revalidatePath("/profile");
  return data;
}

export async function updateAddOn(id: string, data: {
  name?: string;
  description?: string;
  price?: number;
  is_active?: boolean;
  display_order?: number;
}): Promise<AddOn | null> {
  const supabase = await createClient();
  
  const { data: addOn, error } = await supabase
    .from("add_ons")
    .update({
      ...data,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();
  
  if (error) {
    console.error("Error updating add-on:", error);
    throw new Error(error.message);
  }
  
  revalidatePath("/profile");
  return addOn;
}

export async function deleteAddOn(id: string): Promise<{ success: boolean }> {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from("add_ons")
    .delete()
    .eq("id", id);
  
  if (error) {
    console.error("Error deleting add-on:", error);
    throw new Error(error.message);
  }
  
  revalidatePath("/profile");
  return { success: true };
}
