import { getQuotes, getPackages } from "@/modules/quotes/actions/quotes";
import { getContacts } from "@/modules/crm/actions/contacts";
import { getEvents } from "@/modules/events/actions/events";
import { getAddOns } from "@/modules/settings/actions/settings";
import { QuotesList } from "@/modules/quotes/components/QuotesList";
import { CreateQuoteButton } from "@/modules/quotes/components/CreateQuoteButton";
import { getUserOrgId } from "@/lib/auth";

export default async function QuotesPage() {
  const orgId = await getUserOrgId();
  if (!orgId) {
    return <div>Loading...</div>;
  }

  const [quotes, packages, contacts, events, addOns] = await Promise.all([
    getQuotes(orgId),
    getPackages(orgId),
    getContacts(orgId),
    getEvents(orgId),
    getAddOns(orgId),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-screen-title text-warm-white">Quotes</h1>
          <p className="text-warm-sand mt-1">Create and manage quotes for your clients</p>
        </div>
        <CreateQuoteButton packages={packages} addOns={addOns} contacts={contacts} events={events} orgId={orgId} />
      </div>

      <QuotesList quotes={quotes} />
    </div>
  );
}
