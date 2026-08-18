"use client";

import { useState } from "react";
import { Calendar, CalendarOff } from "lucide-react";
import { updateBookingEnabled } from "@/modules/settings/actions/settings";

export function BookingToggle({ orgId, enabled: initialEnabled }: { orgId: string; enabled: boolean }) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [toggling, setToggling] = useState(false);

  const handleToggle = async () => {
    if (!orgId) return;
    setToggling(true);
    try {
      const result = await updateBookingEnabled(orgId, !enabled);
      setEnabled(result.enabled);
    } catch {
      // revert on error
    } finally {
      setToggling(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={toggling}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors ${
        enabled
          ? "border-olive-gold bg-olive-gold/20 text-olive-gold hover:bg-olive-gold/30"
          : "border-warm-sand/20 text-warm-sand hover:text-warm-white hover:border-warm-sand/40"
      }`}
      title={enabled ? "Online bookings are ON" : "Online bookings are OFF"}
    >
      {enabled ? <Calendar className="w-4 h-4" /> : <CalendarOff className="w-4 h-4" />}
      <span className="hidden sm:inline">{toggling ? "..." : enabled ? "Bookings On" : "Bookings Off"}</span>
    </button>
  );
}