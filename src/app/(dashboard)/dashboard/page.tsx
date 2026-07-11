import { getUserOrgId } from "@/lib/auth";
import { getOrganizations } from "@/modules/settings/actions/settings";
import { getDashboardKPIs, getRecentLeads, getUpcomingEventsList, getContactsForDashboard, getEventsForDashboard, getAllEventsForCalendar, getDashboardAdditionalData } from "@/modules/dashboard/actions/dashboard";
import { getInventoryItems } from "@/modules/profile/actions/inventory";
import { DashboardClient } from "./DashboardClient";

export default async function DashboardPage() {
  const orgId = await getUserOrgId();
  if (!orgId) {
    return <div className="text-warm-white">Loading...</div>;
  }

  const [kpis, recentLeads, upcomingEvents, contacts, events, calendarEvents, additionalData, organization, inventoryItems] = await Promise.all([
    getDashboardKPIs(orgId),
    getRecentLeads(orgId),
    getUpcomingEventsList(orgId),
    getContactsForDashboard(orgId),
    getEventsForDashboard(orgId),
    getAllEventsForCalendar(orgId),
    getDashboardAdditionalData(orgId),
    getOrganizations(orgId),
    getInventoryItems(orgId),
  ]);

  const allContacts = [...recentLeads, ...contacts].filter((c, i, arr) => 
    arr.findIndex(x => x.id === c.id) === i
  ).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const allEvents = [...upcomingEvents, ...events].filter((e, i, arr) => 
    arr.findIndex(x => x.id === e.id) === i
  );

  return (
    <DashboardClient 
      initialContacts={allContacts}
      initialEvents={allEvents}
      calendarEvents={calendarEvents}
      kpis={kpis}
      additionalData={additionalData}
      organization={organization}
      inventoryItems={inventoryItems}
    />
  );
}
