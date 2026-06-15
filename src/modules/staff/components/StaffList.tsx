"use client";

import { useState } from "react";
import { User, Mail, Shield, MoreHorizontal, Crown, UserCheck, UserPlus, Building2 } from "lucide-react";
import { useOrganization, OrganizationSwitcher } from "@clerk/nextjs";

type StaffMember = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  created_at: string;
};

interface StaffListProps {
  staff: StaffMember[];
}

const roleConfig: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
  owner: { bg: "bg-olive-gold/20", text: "text-olive-gold", icon: <Crown className="w-3 h-3" /> },
  admin: { bg: "bg-blue-500/20", text: "text-blue-400", icon: <Shield className="w-3 h-3" /> },
  member: { bg: "bg-warm-sand/20", text: "text-warm-sand", icon: <UserCheck className="w-3 h-3" /> },
};

const roleLabels: Record<string, string> = {
  owner: "Owner",
  admin: "Admin",
  member: "Team Member",
};

export function StaffList({ staff }: StaffListProps) {
  const { organization } = useOrganization();
  const [filter, setFilter] = useState<string>("all");

  const filteredStaff = filter === "all" 
    ? staff 
    : staff.filter(s => s.role === filter);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              filter === "all"
                ? "bg-olive-gold text-charcoal"
                : "text-warm-sand hover:text-warm-white bg-warm-sand/10"
            }`}
          >
            All ({staff.length})
          </button>
          {Object.keys(roleConfig).map((role) => (
            <button
              key={role}
              onClick={() => setFilter(role)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                filter === role
                  ? "bg-olive-gold text-charcoal"
                  : "text-warm-sand hover:text-warm-white bg-warm-sand/10"
              }`}
            >
              {roleLabels[role] || role} ({staff.filter(s => s.role === role).length})
            </button>
          ))}
        </div>

        {organization && (
          <a
            href={`https://dashboard.clerk.com/${organization.id}/members`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-olive-gold text-charcoal font-medium hover:bg-olive-gold/90 transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            Invite Member
          </a>
        )}
      </div>

      <div className="mb-6 p-4 bg-charcoal border border-warm-sand/20 rounded-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-olive-gold/20 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-olive-gold" />
            </div>
            <div>
              <p className="text-warm-white font-medium">Organization</p>
              <p className="text-sm text-warm-sand">Manage your business account</p>
            </div>
          </div>
          <OrganizationSwitcher
            appearance={{
              elements: {
                organizationSwitcherTrigger: "rounded-lg border border-warm-sand/30 bg-charcoal px-4 py-2 text-warm-white hover:bg-warm-sand/10",
                organizationPreviewText: "text-warm-white",
                organizationSwitcherTriggerIcon: "text-warm-sand",
              },
            }}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredStaff.length === 0 ? (
          <div className="col-span-full p-8 text-center text-warm-sand bg-charcoal border border-warm-sand/20 rounded-xl">
            No team members yet. Invite your first team member to get started.
          </div>
        ) : (
          filteredStaff.map((member) => (
            <div
              key={member.id}
              className="bg-charcoal border border-warm-sand/20 rounded-xl p-4 hover:border-warm-sand/40 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-olive-gold/20 flex items-center justify-center">
                    <User className="w-5 h-5 text-olive-gold" />
                  </div>
                  <div>
                    <p className="text-warm-white font-medium">
                      {member.name || "No name"}
                    </p>
                    <p className="text-sm text-warm-sand flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {member.email}
                    </p>
                  </div>
                </div>
                <button className="p-1.5 text-warm-sand hover:text-warm-white">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-warm-sand/10">
                <span
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                    roleConfig[member.role]?.bg || "bg-warm-sand/20"
                  } ${
                    roleConfig[member.role]?.text || "text-warm-sand"
                  }`}
                >
                  {roleConfig[member.role]?.icon}
                  {roleLabels[member.role] || member.role}
                </span>
                <span className="text-xs text-warm-sand ml-auto">
                  Joined {formatDate(member.created_at)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-6 p-6 bg-charcoal border border-warm-sand/20 rounded-xl">
        <h3 className="text-warm-white font-medium mb-2">Managing Team Members</h3>
        <p className="text-warm-sand text-sm mb-3">
          Click &quot;Invite Member&quot; to add new team members. They will receive an email to join your organization and access OnTap.
        </p>
        <p className="text-warm-sand text-sm bg-warm-sand/10 p-3 rounded-lg">
          <strong>Tip:</strong> Admins and Team Members have different permissions. Adjust roles in the member list to control access.
        </p>
      </div>
    </div>
  );
}