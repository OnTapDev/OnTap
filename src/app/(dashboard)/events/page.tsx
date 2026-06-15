import { getEvents } from "@/modules/events/actions/events";
import { getContacts } from "@/modules/crm/actions/contacts";
import { EventsList } from "@/modules/events/components/EventsList";
import { AddEventButton } from "@/modules/events/components/AddEventButton";
import { getUserOrgId } from "@/lib/auth";

export default async function EventsPage() {
  const orgId = await getUserOrgId();
  if (!orgId) {
    return <div>Loading...</div>;
  }

  const [events, contacts] = await Promise.all([
    getEvents(orgId),
    getContacts(orgId),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-screen-title text-warm-white">Events</h1>
          <p className="text-warm-sand mt-1">Manage your bookings and inquiries</p>
        </div>
        <AddEventButton contacts={contacts} orgId={orgId} />
      </div>

      <EventsList events={events} />
    </div>
  );
}
