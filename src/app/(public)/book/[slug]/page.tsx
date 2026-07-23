import { getOrganizationBySlugPublic, getPackagesBySlugPublic, isBookingEnabled } from "@/lib/public";
import { PublicBookingForm } from "@/modules/booking/components/PublicBookingForm";
import { notFound } from "next/navigation";

interface BookPageProps {
  params: Promise<{ slug: string }>;
}

export default async function BookPage({ params }: BookPageProps) {
  const { slug } = await params;

  const [organization, packages, bookingEnabled] = await Promise.all([
    getOrganizationBySlugPublic(slug),
    getPackagesBySlugPublic(slug),
    isBookingEnabled(slug),
  ]);

  if (!organization) {
    notFound();
  }

  if (!bookingEnabled) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-warm-white mb-2">Booking Unavailable</h1>
          <p className="text-warm-sand">This operator is not currently accepting online bookings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <PublicBookingForm orgId={organization.id} orgSlug={organization.slug} orgName={organization.name} packages={packages} />
      </div>
    </div>
  );
}
