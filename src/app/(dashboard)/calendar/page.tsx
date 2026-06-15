import { getEvents } from "@/modules/events/actions/events";
import { CalendarView } from "@/modules/calendar/components/CalendarView";
import { getUserOrgId } from "@/lib/auth";

export default async function CalendarPage() {
  const orgId = await getUserOrgId();
  if (!orgId) {
    return <div>Loading...</div>;
  }

  const events = await getEvents(orgId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-screen-title text-warm-white">Calendar</h1>
          <p className="text-warm-sand mt-1">View and manage your events schedule</p>
        </div>
      </div>

      <CalendarView events={events} />
    </div>
  );
}