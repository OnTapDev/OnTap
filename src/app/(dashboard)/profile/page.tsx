import { getOrganizations, getPackages } from "@/modules/settings/actions/settings";
import { getDocuments } from "@/modules/profile/actions/documents";
import { getGalleryItems } from "@/modules/profile/actions/gallery";
import { ProfileClient } from "@/modules/profile/components/ProfileClient";
import { getUserOrgId } from "@/lib/auth";

export default async function ProfilePage() {
  const orgId = await getUserOrgId();
  if (!orgId) {
    return <div>Loading...</div>;
  }

  const [organization, documents, packages, galleryItems] = await Promise.all([
    getOrganizations(orgId),
    getDocuments(orgId),
    getPackages(orgId),
    getGalleryItems(orgId),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-screen-title text-warm-white">Profile</h1>
        <p className="text-warm-sand mt-1">Manage your business profile and public-facing information</p>
      </div>

      <ProfileClient organization={organization} documents={documents} packages={packages} galleryItems={galleryItems} />
    </div>
  );
}