import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getContacts, getPipelineStages, getPipelineKPIs } from "@/modules/crm/actions/contacts";
import { getEvents } from "@/modules/events/actions/events";
import { getOrgMessages } from "@/modules/crm/actions/messaging";
import { CRMDashboard } from "@/modules/crm/components/CRMDashboard";
import { getUserOrgId } from "@/lib/auth";

export const dynamic = "force-dynamic";

interface CRMPageProps {
  searchParams: Promise<{ view?: string }>;
}

async function CRMContent({ searchParams }: CRMPageProps) {
  const orgId = await getUserOrgId();

  if (!orgId) {
    redirect("/sign-in");
  }

  const params = await searchParams;
  const initialView = params.view === "pipeline" ? "pipeline" : params.view === "contacts" ? "contacts" : "overview";

  let contacts: Awaited<ReturnType<typeof getContacts>> = [];
  let stages: Awaited<ReturnType<typeof getPipelineStages>> = [];
  let events: Awaited<ReturnType<typeof getEvents>> = [];
  let pipelineKpis: Awaited<ReturnType<typeof getPipelineKPIs>> | undefined;
  let messages: Awaited<ReturnType<typeof getOrgMessages>> = [];
  let fetchError = "";

  try {
    [contacts, stages, events, pipelineKpis, messages] = await Promise.all([
      getContacts(orgId),
      getPipelineStages(orgId),
      getEvents(orgId),
      getPipelineKPIs(orgId),
      getOrgMessages(orgId),
    ]);
  } catch (err) {
    fetchError = err instanceof Error ? err.message : "Failed to load CRM data";
  }

  return (
    <div className="space-y-6">
      {fetchError && (
        <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-xl" role="alert">
          <p className="text-red-400 text-sm">{fetchError}</p>
        </div>
      )}
      <CRMDashboard contacts={contacts} stages={stages} events={events} messages={messages} initialView={initialView} pipelineKpis={pipelineKpis} orgId={orgId} />
    </div>
  );
}

function CRMLoading() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-charcoal border border-warm-sand/20 rounded-xl p-4 animate-pulse">
            <div className="h-8 w-8 rounded-lg bg-warm-sand/20 mb-3" />
            <div className="h-3 w-20 bg-warm-sand/20 rounded mb-2" />
            <div className="h-5 w-16 bg-warm-sand/20 rounded" />
          </div>
        ))}
      </div>
      <div className="flex gap-2 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-8 w-24 bg-warm-sand/20 rounded-lg" />
        ))}
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <div className="bg-charcoal border border-warm-sand/20 rounded-xl p-6 animate-pulse">
            <div className="h-5 w-32 bg-warm-sand/20 rounded mb-4" />
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 bg-warm-sand/10 rounded mb-2" />
            ))}
          </div>
        </div>
        <div>
          <div className="bg-charcoal border border-warm-sand/20 rounded-xl p-6 animate-pulse">
            <div className="h-5 w-36 bg-warm-sand/20 rounded mb-4" />
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-14 bg-warm-sand/10 rounded mb-2" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function CRMPage(props: CRMPageProps) {
  return (
    <Suspense fallback={<CRMLoading />}>
      <CRMContent {...props} />
    </Suspense>
  );
}
