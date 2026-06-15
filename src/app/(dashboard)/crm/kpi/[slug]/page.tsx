import { getUserOrgId } from "@/lib/auth";
import { getCRMKPIs } from "@/modules/dashboard/actions/kpis";
import { CRMKpiClient } from "./CRMKpiClient";

interface KPIPageProps {
  params: Promise<{ slug: string }>;
}

export default async function CRMKpiPage({ params }: KPIPageProps) {
  const orgId = await getUserOrgId();
  if (!orgId) {
    return <div className="text-warm-white">Loading...</div>;
  }

  const kpis = await getCRMKPIs(orgId);
  const { slug } = await params;

  return <CRMKpiClient slug={slug} kpis={kpis} />;
}