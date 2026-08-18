import { getEvents } from "@/modules/events/actions/events";
import { getContacts } from "@/modules/crm/actions/contacts";
import { getPackages, getQuotes } from "@/modules/quotes/actions/quotes";
import { getInvoices } from "@/modules/invoices/actions/invoices";
import { EventsList } from "@/modules/events/components/EventsList";
import { BookingModal } from "@/modules/events/components/BookingModal";
import { CopyBookingLink } from "@/modules/events/components/CopyBookingLink";
import { BookingToggle } from "@/modules/events/components/BookingToggle";
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
    .select("slug, booking_enabled")
    .eq("id", orgId)
    .single();

  const [events, contacts, packages, quotes, invoices] = await Promise.all([
    getEvents(orgId),
    getContacts(orgId),
    getPackages(orgId),
    getQuotes(orgId),
    getInvoices(orgId),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-screen-title text-warm-white">Events</h1>
          <p className="text-warm-sand mt-1">Manage your bookings and inquiries</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <BookingToggle orgId={orgId} enabled={org?.booking_enabled ?? false} />
          {org && <CopyBookingLink slug={org.slug} />}
          <BookingModal contacts={contacts} packages={packages} orgId={orgId} />
        </div>
      </div>

      <EventsList events={events} quotes={quotes} invoices={invoices} orgId={orgId} />
    </div>
  );
}
