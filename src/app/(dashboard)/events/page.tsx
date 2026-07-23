import { getEvents } from "@/modules/events/actions/events";
import { getContacts } from "@/modules/crm/actions/contacts";
import { getPackages } from "@/modules/quotes/actions/quotes";
import { EventsList } from "@/modules/events/components/EventsList";
import { BookingModal } from "@/modules/events/components/BookingModal";
import { CopyBookingLink } from "@/modules/events/components/CopyBookingLink";
import { getUserOrgId } from "@/lib/auth";
import { createClient } from "@/core/db/server";

export default async function EventsPage() {
  const orgId = await getUserOrgId();
  if (!orgId) {
    return <div>Loading...</div>;
  }

  const supabase = await createClient();
  const { data: org } = await supabase
    .from("organizations")
    .select("slug")
    .eq("id", orgId)
    .single();

  const [events, contacts, packages] = await Promise.all([
    getEvents(orgId),
    getContacts(orgId),
    getPackages(orgId),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-screen-title text-warm-white">Events</h1>
          <p className="text-warm-sand mt-1">Manage your bookings and inquiries</p>
        </div>
        <div className="flex items-center gap-2">
          {org && <CopyBookingLink slug={org.slug} />}
          <BookingModal contacts={contacts} packages={packages} orgId={orgId} />
        </div>
      </div>

      <EventsList events={events} orgId={orgId} />
    </div>
  );
}
