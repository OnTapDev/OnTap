"use server";

import { createClient } from "@/core/db/server";
import { revalidatePath } from "next/cache";
import { uploadLogo, deleteLogo } from "@/core/storage/upload";

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
