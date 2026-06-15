import { getInvoices } from "@/modules/invoices/actions/invoices";
import { getQuotes, getPackages } from "@/modules/quotes/actions/quotes";
import { getEvents } from "@/modules/events/actions/events";
import { getContacts } from "@/modules/crm/actions/contacts";
import { BillingClient } from "./BillingClient";
import { getUserOrgId } from "@/lib/auth";

export default async function BillingPage() {
  const orgId = await getUserOrgId();
  if (!orgId) {
    return <div>Loading...</div>;
  }

  const [invoices, quotes, packages, events, contacts] = await Promise.all([
    getInvoices(orgId),
    getQuotes(orgId),
    getPackages(orgId),
    getEvents(orgId),
    getContacts(orgId),
  ]);

  return (
    <BillingClient 
      invoices={invoices}
      quotes={quotes}
      packages={packages}
      events={events}
      contacts={contacts}
    />
  );
}