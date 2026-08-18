"use server";

import { publicBookEvent } from "@/lib/public";

export type PublicBookingInput = {
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
};

export async function submitPublicBooking(slug: string, data: PublicBookingInput) {
  return publicBookEvent(slug, data);
}
