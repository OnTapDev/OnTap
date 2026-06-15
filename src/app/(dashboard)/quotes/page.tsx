import { getQuotes, getPackages } from "@/modules/quotes/actions/quotes";
import { getContacts } from "@/modules/crm/actions/contacts";
import { QuotesList } from "@/modules/quotes/components/QuotesList";
import { CreateQuoteButton } from "@/modules/quotes/components/CreateQuoteButton";
import { getUserOrgId } from "@/lib/auth";

export default async function QuotesPage() {
  const orgId = await getUserOrgId();
  if (!orgId) {
    return <div>Loading...</div>;
  }

  const [quotes, packages, contacts] = await Promise.all([
    getQuotes(orgId),
    getPackages(orgId),
    getContacts(orgId),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-screen-title text-warm-white">Quotes</h1>
          <p className="text-warm-sand mt-1">Create and manage quotes for your clients</p>
        </div>
        <CreateQuoteButton packages={packages} contacts={contacts} orgId={orgId} />
      </div>

      <QuotesList quotes={quotes} />
    </div>
  );
}
