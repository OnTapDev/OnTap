"use client";

import { Search } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { NotificationBell } from "@/modules/notifications/NotificationBell";

export function Header() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-warm-sand/20 bg-charcoal px-6">
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-warm-sand" />
          <input
            type="text"
            placeholder="Search contacts, events..."
            className="h-10 w-80 rounded-lg border border-warm-sand/30 bg-charcoal pl-10 pr-4 text-base text-warm-white placeholder:text-warm-sand focus:border-olive-gold focus:outline-none focus:ring-1 focus:ring-olive-gold"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
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