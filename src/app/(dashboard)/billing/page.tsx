import { getInvoices } from "@/modules/invoices/actions/invoices";
import { getQuotes, getPackages } from "@/modules/quotes/actions/quotes";
import { getEvents } from "@/modules/events/actions/events";
import { getContacts } from "@/modules/crm/actions/contacts";
import { getBillingKPIs } from "@/modules/billing/actions/billing";
import { BillingClient } from "@/modules/billing/components/BillingClient";
import { getUserOrgId } from "@/lib/auth";

export default async function BillingPage() {
  const orgId = await getUserOrgId();
  if (!orgId) {
    return <div>Loading...</div>;
  }

  const [invoices, quotes, packages, events, contacts, kpis] = await Promise.all([
    getInvoices(orgId),
    getQuotes(orgId),
    getPackages(orgId),
    getEvents(orgId),
    getContacts(orgId),
    getBillingKPIs(orgId),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-screen-title text-warm-white">Billing</h1>
        <p className="text-warm-sand mt-1">Manage quotes and invoices</p>
      </div>
      <BillingClient
        invoices={invoices}
        quotes={quotes}
        packages={packages}
        events={events}
        contacts={contacts}
        kpis={kpis}
      />
    </div>
  );
}
