import { getOrganizationBySlugPublic, getPackagesBySlugPublic, getGalleryItemsBySlugPublic } from "@/lib/public";
import { PublicProfileClient } from "@/modules/profile/components/PublicProfileClient";

interface ProfilePageProps {
  params: Promise<{ slug: string }>;
}

export default async function PublicProfilePage({ params }: ProfilePageProps) {
  const { slug } = await params;
  
  const [organization, packages, galleryItems] = await Promise.all([
    getOrganizationBySlugPublic(slug),
    getPackagesBySlugPublic(slug),
    getGalleryItemsBySlugPublic(slug),
  ]);

  if (!organization) {
    return (
      <div className="min-h-screen bg-charcoal flex items-center justify-center p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-warm-white mb-2">Profile Not Found</h1>
          <p className="text-warm-sand">Slug: {slug}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-charcoal">
      <PublicProfileClient 
        organization={organization} 
        packages={packages || []}
        galleryItems={galleryItems || []}
      />
    </div>
  );
}