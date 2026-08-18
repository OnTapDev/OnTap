import { getInvoices } from "@/modules/invoices/actions/invoices";
import { getEvents } from "@/modules/events/actions/events";
import { getQuotes } from "@/modules/quotes/actions/quotes";
import { InvoicesList } from "@/modules/invoices/components/InvoicesList";
import { CreateInvoiceButton } from "@/modules/invoices/components/CreateInvoiceButton";
import { getUserOrgId } from "@/lib/auth";

export default async function InvoicesPage() {
  const orgId = await getUserOrgId();
  if (!orgId) {
    return <div>Loading...</div>;
  }

  const [invoices, events, quotes] = await Promise.all([
    getInvoices(orgId),
    getEvents(orgId),
    getQuotes(orgId),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-screen-title text-warm-white">Invoices</h1>
          <p className="text-warm-sand mt-1">Track payments and send invoices</p>
        </div>
        <CreateInvoiceButton events={events} quotes={quotes} orgId={orgId} />
      </div>

      <InvoicesList invoices={invoices} orgId={orgId} />
    </div>
  );
}
