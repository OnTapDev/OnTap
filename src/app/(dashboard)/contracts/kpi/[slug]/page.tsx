import { getUserOrgId } from "@/lib/auth";
import { getContractKPIs } from "@/modules/contracts/actions/contracts";
import { ContractsKpiClient } from "./ContractsKpiClient";

interface KPIPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ContractsKpiPage({ params }: KPIPageProps) {
  const orgId = await getUserOrgId();
  if (!orgId) {
    return <div className="text-warm-white">Loading...</div>;
  }

  const kpis = await getContractKPIs(orgId);
  const { slug } = await params;

  return <ContractsKpiClient slug={slug} kpis={kpis} />;
}