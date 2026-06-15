import { getContacts, getPipelineStages } from "@/modules/crm/actions/contacts";
import { getEvents } from "@/modules/events/actions/events";
import { CRMDashboard } from "@/modules/crm/components/CRMDashboard";
import { getUserOrgId } from "@/lib/auth";
import { getDashboardKPIs } from "@/modules/dashboard/actions/dashboard";

interface CRMPageProps {
  searchParams: Promise<{ view?: string }>;
}

export default async function CRMPage({ searchParams }: CRMPageProps) {
  const orgId = await getUserOrgId();
  
  if (!orgId) {
    return <div>Loading...</div>;
  }

  const params = await searchParams;
  const initialView = params.view === "pipeline" ? "pipeline" : params.view === "contacts" ? "contacts" : "overview";

  const [contacts, stages, events, dashboardKpis] = await Promise.all([
    getContacts(orgId),
    getPipelineStages(orgId),
    getEvents(orgId),
    getDashboardKPIs(orgId),
  ]);

  const crmKpis = {
    "total-leads": dashboardKpis.leads,
    "new-inquiries": dashboardKpis.leads,
    "active-quotes": dashboardKpis.conversion,
  };

  return (
    <div className="space-y-6">
      <CRMDashboard contacts={contacts} stages={stages} events={events} initialView={initialView} kpis={crmKpis} revenueKpi={dashboardKpis.revenue} orgId={orgId} />
    </div>
  );
}
