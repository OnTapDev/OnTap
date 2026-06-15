import { createClient } from "@supabase/supabase-js";

function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function getOrganizationBySlugPublic(slug: string) {
  const supabase = createAdminClient();
  
  const { data: organization, error } = await supabase
    .from("organizations")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) {
    console.error("Error fetching organization:", error);
    return null;
  }

  return organization;
}

export async function getPackagesBySlugPublic(orgSlug: string) {
  const supabase = createAdminClient();
  
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

export async function getGalleryItemsBySlugPublic(orgSlug: string) {
  const supabase = createAdminClient();
  
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