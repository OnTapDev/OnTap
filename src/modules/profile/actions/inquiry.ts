"use server";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function submitInquiry(orgSlug: string, inquiry: {
  name: string;
  email: string;
  phone?: string;
  event_type: string;
  date?: string;
  guest_count?: number;
  venue_name?: string;
  notes?: string;
}) {
  const supabase = createAdminClient();
  
  const { data: organization, error: orgError } = await supabase
    .from("organizations")
    .select("id")
    .eq("slug", orgSlug)
    .single();

  if (orgError || !organization) {
    throw new Error("Organization not found");
  }

  const orgId = organization.id;

  const { data: contact, error: contactError } = await supabase
    .from("contacts")
    .insert({
      org_id: orgId,
      name: inquiry.name,
      email: inquiry.email || null,
      phone: inquiry.phone || null,
      source: "website",
      notes: inquiry.notes ? `Event Type: ${inquiry.event_type}\nGuests: ${inquiry.guest_count || "TBD"}\nDate: ${inquiry.date || "TBD"}\nVenue: ${inquiry.venue_name || "TBD"}\n\nNotes: ${inquiry.notes}` : `Event Type: ${inquiry.event_type}\nGuests: ${inquiry.guest_count || "TBD"}\nDate: ${inquiry.date || "TBD"}\nVenue: ${inquiry.venue_name || "TBD"}`,
    })
    .select()
    .single();

  if (contactError || !contact) {
    console.error("Error creating contact:", contactError);
    throw new Error("Failed to create contact");
  }

  if (inquiry.date) {
    const { error: eventError } = await supabase
      .from("events")
      .insert({
        org_id: orgId,
        contact_id: contact.id,
        name: `${inquiry.event_type} - ${inquiry.name}`,
        type: inquiry.event_type,
        date: inquiry.date,
        venue_name: inquiry.venue_name || null,
        guest_count: inquiry.guest_count || 0,
        status: "new_inquiry",
      })
      .select()
      .single();

    if (eventError) {
      console.error("Error creating event:", eventError);
    }
  }

  revalidatePath(`/profile/${orgSlug}`);
  return { success: true, contactId: contact.id };
}