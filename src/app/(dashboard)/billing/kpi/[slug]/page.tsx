import { getBillingKPIs } from "@/modules/billing/actions/billing";
import { getUserOrgId } from "@/lib/auth";
import { BillingKpiClient } from "./BillingKpiClient";

export default async function BillingKpiPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const orgId = await getUserOrgId();
  if (!orgId) return <div>Loading...</div>;

  const kpis = await getBillingKPIs(orgId);

  return <BillingKpiClient slug={slug} kpis={kpis} />;
}
