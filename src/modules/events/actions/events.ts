"use server";

import { createClient } from "@/core/db/server";
import { revalidatePath } from "next/cache";
import { currentUser } from "@clerk/nextjs/server";

export async function getEvents(orgId: string) {
  const supabase = await createClient();
  
  const { data: events, error } = await supabase
    .from("events")
    .select(`
      *,
      contact:contacts(*)
    `)
    .eq("org_id", orgId)
    .order("date", { ascending: true });

  if (error) {
    console.error("Error fetching events:", error);
    return [];
  }

  return events || [];
}

export async function getEventById(id: string) {
  const supabase = await createClient();
  
  const { data: event, error } = await supabase
    .from("events")
    .select(`
      *,
      contact:contacts(*)
    `)
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching event:", error);
    return null;
  }

  return event;
}

export async function createEvent(orgId: string, event: {
  contact_id: string;
  name: string;
  type: string;
  date: string;
  start_time?: string;
  end_time?: string;
  venue_name?: string;
  venue_address?: string;
  guest_count?: number;
  notes?: string;
}) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("events")
    .insert({
      org_id: orgId,
      ...event,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating event:", error);
    throw new Error(error.message);
  }

  try {
    const user = await currentUser();
    if (user) {
      await supabase.from("notifications").insert({
        org_id: orgId,
        user_id: user.id,
        title: `New event: ${event.name}`,
        message: `${event.name} on ${new Date(event.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}${event.venue_name ? ` at ${event.venue_name}` : ""}`,
        type: "event",
        related_entity_type: "event",
        related_entity_id: data.id,
      });
    }
  } catch (e) {
    console.error("Failed to create notification:", e);
  }

  revalidatePath("/events");
  return data;
}

export async function updateEvent(id: string, event: {
  contact_id?: string;
  name?: string;
  type?: string;
  date?: string;
  start_time?: string;
  end_time?: string;
  venue_name?: string;
  venue_address?: string;
  guest_count?: number;
  status?: string;
  total_price?: number;
  deposit_amount?: number;
  balance_due?: number;
  notes?: string;
}) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("events")
    .update(event)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating event:", error);
    throw new Error(error.message);
  }

  revalidatePath("/events");
  return data;
}

export async function deleteEvent(id: string) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from("events")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting event:", error);
    throw new Error(error.message);
  }

  revalidatePath("/events");
  return { success: true };
}

export async function getUpcomingEvents(orgId: string, limit = 5) {
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];
  
  const { data: events, error } = await supabase
    .from("events")
    .select(`
      *,
      contact:contacts(name)
    `)
    .eq("org_id", orgId)
    .gte("date", today)
    .in("status", ["booked", "deposit_paid"])
    .order("date", { ascending: true })
    .limit(limit);

  if (error) {
    console.error("Error fetching upcoming events:", error);
    return [];
  }

  return events || [];
}
