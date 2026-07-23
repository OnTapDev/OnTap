"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Bell, CheckCheck, Loader2, Calendar, Phone, Mail, MessageSquare, Info } from "lucide-react";
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead } from "./actions";

type Notification = {
  id: string;
  title: string;
  message: string | null;
  type: string;
  related_entity_type: string | null;
  related_entity_id: string | null;
  is_read: boolean;
  created_at: string;
};

function playChime() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.setValueAtTime(1108, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.3);
  } catch {
    // Audio not supported
  }
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
  event: <Calendar className="w-4 h-4" />,
  follow_up: <Bell className="w-4 h-4" />,
  call: <Phone className="w-4 h-4" />,
  email: <Mail className="w-4 h-4" />,
  message: <MessageSquare className="w-4 h-4" />,
  info: <Info className="w-4 h-4" />,
};

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const prevUnread = useRef(0);
  const panelRef = useRef<HTMLDivElement>(null);
  const hasPlayed = useRef(false);

  const load = useCallback(async () => {
    try {
      const [data, count] = await Promise.all([getNotifications(), getUnreadCount()]);
      setNotifications(data);
      setUnread(count);

      if (count > prevUnread.current && prevUnread.current > 0 && !hasPlayed.current) {
        playChime();
      }
      prevUnread.current = count;
      hasPlayed.current = false;
    } catch (e) {
      console.error("Failed to load notifications:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, [load]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const handleMarkRead = async (id: string) => {
    await markAsRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    setUnread((prev) => Math.max(0, prev - 1));
  };

  const handleMarkAll = async () => {
    await markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnread(0);
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => { setOpen(!open); hasPlayed.current = true; }}
        className="relative p-2 text-warm-sand hover:text-warm-white hover:bg-warm-sand/10 rounded-lg transition-colors"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-red-500 border-2 border-charcoal rounded-full flex items-center justify-center text-[10px] font-bold text-white leading-none min-w-[18px] min-h-[18px] px-1">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-[#1A1A1A] border border-warm-sand/20 rounded-xl shadow-xl overflow-hidden z-50">
          <div className="flex items-center justify-between p-3 border-b border-warm-sand/10">
            <h3 className="text-sm font-semibold text-warm-white">Notifications</h3>
            {unread > 0 && (
              <button
                onClick={handleMarkAll}
                className="flex items-center gap-1 text-xs text-olive-gold hover:text-olive-gold/80 transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 text-warm-sand animate-spin" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="w-8 h-8 text-warm-sand/20 mx-auto mb-2" />
                <p className="text-sm text-warm-sand/50">No notifications yet</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => !n.is_read && handleMarkRead(n.id)}
                  className={`p-3 border-b border-warm-sand/5 cursor-pointer transition-colors ${
                    n.is_read ? "opacity-60 hover:opacity-80" : "hover:bg-warm-sand/5"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 ${n.is_read ? "text-warm-sand/40" : "text-olive-gold"}`}>
                      {TYPE_ICONS[n.type] || <Info className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${n.is_read ? "text-warm-sand/70" : "text-warm-white font-medium"}`}>
                        {n.title}
                      </p>
                      {n.message && (
                        <p className="text-xs text-warm-sand/60 mt-0.5 line-clamp-2">{n.message}</p>
                      )}
                      <p className="text-[10px] text-warm-sand/30 mt-1">
                        {new Date(n.created_at).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    {!n.is_read && (
                      <div className="w-2 h-2 rounded-full bg-olive-gold flex-shrink-0 mt-1.5" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
