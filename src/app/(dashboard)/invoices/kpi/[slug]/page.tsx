import { getUserOrgId } from "@/lib/auth";
import { getInvoiceKPIs } from "@/modules/dashboard/actions/kpis";
import { InvoicesKpiClient } from "./InvoicesKpiClient";

interface KPIPageProps {
  params: Promise<{ slug: string }>;
}

export default async function InvoicesKpiPage({ params }: KPIPageProps) {
  const orgId = await getUserOrgId();
  if (!orgId) {
    return <div className="text-warm-white">Loading...</div>;
  }

  const kpis = await getInvoiceKPIs(orgId);
  const { slug } = await params;

  return <InvoicesKpiClient slug={slug} kpis={kpis} />;
}