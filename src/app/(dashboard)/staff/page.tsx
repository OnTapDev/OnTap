import { getStaff } from "@/modules/staff/actions/staff";
import { StaffList } from "@/modules/staff/components/StaffList";
import { getUserOrgId } from "@/lib/auth";

export default async function StaffPage() {
  const orgId = await getUserOrgId();
  if (!orgId) {
    return <div>Loading...</div>;
  }

  const staff = await getStaff(orgId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-screen-title text-warm-white">Staff</h1>
        <p className="text-warm-sand mt-1">Manage your team members</p>
      </div>

      <StaffList staff={staff} />
    </div>
  );
}
