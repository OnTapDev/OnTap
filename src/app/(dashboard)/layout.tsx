import { Sidebar } from "@/ui/layouts/Sidebar";
import { Header } from "@/ui/layouts/Header";
import { getOrganizations } from "@/modules/settings/actions/settings";
import { getUserOrgId } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const orgId = await getUserOrgId();
  const organization = orgId ? await getOrganizations(orgId) : null;

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