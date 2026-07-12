import { Sidebar } from "@/ui/layouts/Sidebar";
import { Header } from "@/ui/layouts/Header";
import { getOrganizations } from "@/modules/settings/actions/settings";
import { getUserOrgId } from "@/lib/auth";
import { createClient } from "@/core/db/server";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const orgId = await getUserOrgId();

  if (!orgId) {
    redirect("/onboarding/subscription");
  }

  const supabase = await createClient();
  const { data: org } = await supabase
    .from("organizations")
    .select("stripe_subscription_status")
    .eq("id", orgId)
    .maybeSingle();

  const subscriptionStatus = org?.stripe_subscription_status;

  if (!subscriptionStatus || subscriptionStatus === "inactive" || subscriptionStatus === "canceled" || subscriptionStatus === "unpaid") {
    redirect("/onboarding/subscription");
  }

  const organization = await getOrganizations(orgId);

  return (
    <div className="min-h-screen bg-charcoal">
      <Sidebar organization={organization} />
      <div className="ml-[72px] transition-all duration-300">
        <Header />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}