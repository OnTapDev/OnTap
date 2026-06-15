import { getContacts, getPipelineStages } from "@/modules/crm/actions/contacts";
import { ContactsList } from "@/modules/crm/components/ContactsList";
import { AddContactButton } from "@/modules/crm/components/AddContactButton";
import { getUserOrgId } from "@/lib/auth";

export default async function ContactsPage() {
  const orgId = await getUserOrgId();
  if (!orgId) {
    return <div>Loading...</div>;
  }

  const [contacts, stages] = await Promise.all([
    getContacts(orgId),
    getPipelineStages(orgId),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-screen-title text-warm-white">Contacts</h1>
          <p className="text-warm-sand mt-1">Manage your leads and clients</p>
        </div>
        <AddContactButton stages={stages} orgId={orgId} />
      </div>

      <ContactsList contacts={contacts} stages={stages} />
    </div>
  );
}
