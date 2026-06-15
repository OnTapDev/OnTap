import { getContracts, getContractTemplates, getContractKPIs } from "@/modules/contracts/actions/contracts";
import { getEvents } from "@/modules/events/actions/events";
import { getContacts } from "@/modules/crm/actions/contacts";
import { ContractsList } from "@/modules/contracts/components/ContractsList";
import { ContractKPIs } from "@/modules/contracts/components/ContractKPIs";
import { getUserOrgId } from "@/lib/auth";

export default async function ContractsPage() {
  const orgId = await getUserOrgId();
  if (!orgId) {
    return <div>Loading...</div>;
  }

  const [contracts, templates, events, contacts, kpis] = await Promise.all([
    getContracts(orgId),
    getContractTemplates(orgId),
    getEvents(orgId),
    getContacts(orgId),
    getContractKPIs(orgId),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-screen-title text-warm-white">Contracts</h1>
        <p className="text-warm-sand mt-1">Manage your service agreements and templates</p>
      </div>
      <ContractKPIs kpis={kpis} />
      <ContractsList 
        contracts={contracts} 
        templates={templates} 
        events={events}
        contacts={contacts}
        orgId={orgId}
      />
    </div>
  );
}