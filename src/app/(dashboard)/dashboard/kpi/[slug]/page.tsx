import { getUserOrgId } from "@/lib/auth";
import { getDashboardKPIs } from "@/modules/dashboard/actions/dashboard";
import { DashboardKpiClient } from "./DashboardKpiClient";

interface KPIPageProps {
  params: Promise<{ slug: string }>;
}

export default async function DashboardKpiPage({ params }: KPIPageProps) {
  const orgId = await getUserOrgId();
  if (!orgId) {
    return <div className="text-warm-white">Loading...</div>;
  }

  const kpis = await getDashboardKPIs(orgId);
  const { slug } = await params;

  return <DashboardKpiClient slug={slug} kpis={kpis} />;
}