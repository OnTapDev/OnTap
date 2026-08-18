"use client";

import { useState, useEffect } from "react";
import { SignOutButton } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Target,
  FileSignature,
  Receipt,
  UserCircle,
  LogOut,
  User,
  Settings,
  HelpCircle,
  Wine,
  X,
} from "lucide-react";
import { subscribeMobileNav } from "@/ui/layouts/mobileNavStore";

const ONTAP_MASTER_ICON = "/images/png/ontap_master_icon_new_gold.png";
const ONTAP_LOGO_URL = "/images/png/horizontal_lockup.png";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Profile", href: "/profile", icon: User },
  { name: "CRM", href: "/crm", icon: Target },
  { name: "Events", href: "/events", icon: Wine },
  { name: "Contracts", href: "/contracts", icon: FileSignature },
  { name: "Billing", href: "/billing", icon: Receipt },
  { name: "Staff", href: "/staff", icon: UserCircle },
  { name: "Support", href: "/support", icon: HelpCircle },
  { name: "Settings", href: "/settings", icon: Settings },
];

type Organization = {
  name: string;
  logo_url: string | null;
};

type SidebarProps = {
  organization?: Organization | null;
};

export function Sidebar({ organization }: SidebarProps) {
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeMobileNav(setMobileOpen);
    return unsubscribe;
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const navItems = (
    <div className="flex-1 flex flex-col justify-evenly py-4">
      {navigation.map((item) => {
        const isActive =
          pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "flex items-center rounded-lg transition-all duration-300 py-2 px-0",
              isActive
                ? "bg-olive-gold/20 text-warm-white"
                : "text-warm-sand hover:bg-warm-sand/10 hover:text-warm-white"
            )}
            title={!isExpanded ? item.name : undefined}
          >
            <div className="flex items-center justify-center w-[72px]">
              <item.icon className="h-5 w-5 flex-shrink-0" />
            </div>
            <span
              className={cn(
                "whitespace-nowrap overflow-hidden transition-all duration-300",
                isExpanded ? "opacity-100 max-w-[150px] translate-x-0" : "opacity-0 max-w-0 -translate-x-4"
              )}
              style={{ marginLeft: isExpanded ? "12px" : "0" }}
            >
              {item.name}
            </span>
          </Link>
        );
      })}

      <SignOutButton>
        <button
          className={cn(
            "flex items-center rounded-lg text-warm-sand transition-all duration-300 hover:bg-warm-sand/10 hover:text-warm-white py-2 px-0 w-full",
          )}
          title={!isExpanded ? "Sign Out" : undefined}
        >
          <div className="flex items-center justify-center w-[72px]">
            <LogOut className="h-5 w-5 flex-shrink-0" />
          </div>
          <span
            className={cn(
              "whitespace-nowrap overflow-hidden transition-all duration-300",
              isExpanded ? "opacity-100 max-w-[150px] translate-x-0" : "opacity-0 max-w-0 -translate-x-4"
            )}
            style={{ marginLeft: isExpanded ? "12px" : "0" }}
          >
            Sign Out
          </span>
        </button>
      </SignOutButton>
    </div>
  );

  const header = (compact: boolean) =>
    organization?.logo_url ? (
      compact ? (
        <div className="h-12 w-12 relative">
          <Image
            src={organization.logo_url}
            alt={organization.name || "Logo"}
            fill
            className="object-contain"
          />
        </div>
      ) : (
        <div className="h-[100px] w-[360px] relative">
          <Image
            src={organization.logo_url}
            alt={organization.name || "Logo"}
            fill
            className="object-contain"
          />
        </div>
      )
    ) : compact ? (
      <div className="h-12 w-12 relative">
        <Image
          src={ONTAP_MASTER_ICON}
          alt="OnTap"
          fill
          className="object-contain"
        />
      </div>
    ) : (
      <div className="h-[100px] w-[360px] relative">
        <Image
          src={ONTAP_LOGO_URL}
          alt="OnTap"
          fill
          className="object-contain"
        />
      </div>
    );

  return (
    <>
      {/* Desktop sidebar (hover-expand) */}
      <aside
        className="fixed left-0 top-0 z-40 hidden lg:block h-screen border-r border-warm-sand/20 bg-charcoal transition-all duration-300 ease-in-out"
        style={{ width: isExpanded ? "256px" : "72px" }}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
      >
        <div className="flex flex-col h-full">
          <div
            className="flex items-center justify-center border-b border-warm-sand/20 py-4"
            style={{ height: "100px", padding: isExpanded ? "8px 24px" : "16px" }}
          >
            {header(!isExpanded)}
          </div>
          {navItems}
        </div>
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden bg-black/60 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-screen w-[280px] border-r border-warm-sand/20 bg-charcoal transition-transform duration-300 ease-in-out lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between border-b border-warm-sand/20 px-4 py-4">
            <div className="h-10 w-32 relative">
              <Image
                src={ONTAP_LOGO_URL}
                alt="OnTap"
                fill
                className="object-contain"
              />
            </div>
            <button
              onClick={() => setMobileOpen(false)}
              className="p-2 text-warm-sand hover:text-warm-white rounded-lg hover:bg-warm-sand/10 transition-colors"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 transition-colors",
                    isActive
                      ? "bg-olive-gold/20 text-warm-white border-l-2 border-olive-gold"
                      : "text-warm-sand hover:bg-warm-sand/10 hover:text-warm-white"
                  )}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
            <SignOutButton>
              <button className="flex items-center gap-3 px-4 py-3 text-warm-sand hover:bg-warm-sand/10 hover:text-warm-white transition-colors w-full">
                <LogOut className="h-5 w-5" />
                <span className="font-medium">Sign Out</span>
              </button>
            </SignOutButton>
          </div>
        </div>
      </aside>
    </>
  );
}