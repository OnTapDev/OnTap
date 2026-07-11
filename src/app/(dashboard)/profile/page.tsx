import { getOrganizations, getPackages } from "@/modules/settings/actions/settings";
import { getDocuments } from "@/modules/profile/actions/documents";
import { getGalleryItems } from "@/modules/profile/actions/gallery";
import { getInventoryItems } from "@/modules/profile/actions/inventory";
import { getSetupProgress } from "@/modules/profile/actions/setup";
import { ProfileClient } from "@/modules/profile/components/ProfileClient";
import { getUserOrgId } from "@/lib/auth";

export default async function ProfilePage() {
  const orgId = await getUserOrgId();
  if (!orgId) {
    return <div>Loading...</div>;
  }

  const [organization, documents, packages, galleryItems, inventoryItems, setupProgress] = await Promise.all([
    getOrganizations(orgId),
    getDocuments(orgId),
    getPackages(orgId),
    getGalleryItems(orgId),
    getInventoryItems(orgId),
    getSetupProgress(orgId),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-screen-title text-warm-white">Business Profile</h1>
        <p className="text-warm-sand mt-1">Manage your business profile, setup checklist, inventory, and public-facing information</p>
      </div>

      <ProfileClient
        organization={organization}
        documents={documents}
        packages={packages}
        galleryItems={galleryItems}
        inventoryItems={inventoryItems}
        setupProgress={setupProgress}
      />
    </div>
  );
}
