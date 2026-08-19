"use client";

import { Search, Menu } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { NotificationBell } from "@/modules/notifications/NotificationBell";
import { toggleMobileNav } from "@/ui/layouts/mobileNavStore";

export function Header() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-warm-sand/20 bg-charcoal px-3 sm:px-6">
      <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
        <button
          onClick={() => toggleMobileNav()}
          className="lg:hidden p-2 text-warm-sand hover:text-warm-white rounded-lg hover:bg-warm-sand/10 transition-colors"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="relative flex-1 max-w-xs sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-warm-sand" />
          <input
            type="text"
            placeholder="Search contacts, events..."
            className="h-10 w-full rounded-lg border border-warm-sand/30 bg-charcoal pl-10 pr-4 text-base text-warm-white placeholder:text-warm-sand focus:border-warm-gold focus:outline-none focus:ring-1 focus:ring-warm-gold"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        <NotificationBell />
        <UserButton
          appearance={{
            elements: {
              avatarBox: "h-10 w-10 rounded-full border border-warm-sand/30",
              userButtonTrigger: "focus:shadow-none",
            },
          }}
        />
      </div>
    </header>
  );
}