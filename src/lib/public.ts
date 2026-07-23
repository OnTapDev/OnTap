import { createClient } from "@supabase/supabase-js";

function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function publicBookEvent(slug: string, data: {
  name: string;
  email: string;
  phone?: string;
  event_name: string;
  event_type: string;
  event_date: string;
  guest_count?: number;
  start_time?: string;
  end_time?: string;
  venue_name?: string;
  notes?: string;
  package_id?: string;
}) {
  const supabase = createAdminClient();

  const { data: org } = await supabase
    .from("organizations")
    .select("id, name")
    .eq("slug", slug)
    .single();

  if (!org) {
    return { error: "Organization not found" };
  }

  let contactId: string;

  const { data: existingContact } = await supabase
    .from("contacts")
    .select("id")
    .eq("org_id", org.id)
    .eq("email", data.email)
    .maybeSingle();

  if (existingContact) {
    contactId = existingContact.id;
  } else {
    const { data: newContact, error: contactError } = await supabase
      .from("contacts")
      .insert({
        org_id: org.id,
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        source: "booking_link",
      })
      .select("id")
      .single();

    if (contactError || !newContact) {
      return { error: "Failed to create contact" };
    }
    contactId = newContact.id;
  }

  const { data: event, error: eventError } = await supabase
    .from("events")
    .insert({
      org_id: org.id,
      contact_id: contactId,
      name: data.event_name,
      type: data.event_type,
      date: data.event_date,
      start_time: data.start_time || null,
      end_time: data.end_time || null,
      venue_name: data.venue_name || null,
      guest_count: data.guest_count || 0,
      notes: data.notes || null,
      status: "new_inquiry",
    })
    .select()
    .single();

  if (eventError) {
    return { error: "Failed to create event" };
  }

  if (data.package_id) {
    const { data: pkg } = await supabase
      .from("packages")
      .select("*")
      .eq("id", data.package_id)
      .single();

    if (pkg) {
      let packagePrice = 0;
      if (pkg.pricing_type === "per_guest") {
        packagePrice = pkg.base_price * (data.guest_count || 0);
      } else if (pkg.pricing_type === "flat") {
        packagePrice = pkg.base_price;
      } else if (pkg.pricing_type === "hourly") {
        packagePrice = pkg.base_price * 5;
      }

      const subtotal = packagePrice;
      const taxRate = 0.0875;
      const total = subtotal * (1 + taxRate);

      await supabase.from("quotes").insert({
        org_id: org.id,
        contact_id: contactId,
        event_id: event.id,
        package_id: data.package_id,
        guest_count: data.guest_count || 0,
        subtotal,
        tax: subtotal * taxRate,
        total,
        status: "draft",
      });
    }
  }

  return { success: true, event_id: event.id, contact_id: contactId };
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
    .eq("is_active", true)
    .eq("show_on_booking", true)
    .order("base_price", { ascending: true });

  if (error) {
    console.error("Error fetching packages:", error);
    return [];
  }

  return packages || [];
}

export async function isBookingEnabled(orgSlug: string) {
  const supabase = createAdminClient();

  const { data: org } = await supabase
    .from("organizations")
    .select("booking_enabled")
    .eq("slug", orgSlug)
    .single();

  return org?.booking_enabled ?? false;
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