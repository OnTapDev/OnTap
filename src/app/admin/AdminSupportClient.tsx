"use client";

import { useState } from "react";
import { Mail, Clock, Shield, Inbox, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";

type Ticket = {
  id: string;
  org_id: string | null;
  email: string | null;
  name: string | null;
  type: string;
  subject: string;
  description: string;
  priority: string;
  status: string;
  created_at: string;
};

const STATUS_COLORS: Record<string, string> = {
  open: "bg-green-500/10 text-green-400 border-green-500/20",
  in_progress: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  resolved: "bg-warm-sand/10 text-warm-sand border-warm-sand/20",
  closed: "bg-warm-sand/5 text-warm-sand/60 border-warm-sand/10",
};

const PRIORITY_COLORS: Record<string, string> = {
  low: "text-blue-400",
  normal: "text-warm-sand",
  high: "text-orange-400",
  urgent: "text-red-400",
};

type Props = {
  tickets: Ticket[];
};

export function AdminSupportPage({ tickets }: Props) {
  const [filter, setFilter] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = filter === "all" ? tickets : tickets.filter((t) => t.status === filter);

  const counts = {
    all: tickets.length,
    open: tickets.filter((t) => t.status === "open").length,
    in_progress: tickets.filter((t) => t.status === "in_progress").length,
    resolved: tickets.filter((t) => t.status === "resolved").length,
    closed: tickets.filter((t) => t.status === "closed").length,
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D]">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Shield className="w-8 h-8 text-olive-gold" />
              <h1 className="text-3xl font-bold text-warm-white">Admin Panel</h1>
            </div>
            <p className="text-warm-sand">Support tickets from all operators</p>
          </div>
          <Link
            href="/dashboard"
            className="text-sm text-warm-sand hover:text-warm-white transition-colors"
          >
            ← Back to dashboard
          </Link>
        </div>

        <div className="flex gap-2 mb-6 flex-wrap">
          {Object.entries(counts).map(([key, count]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === key
                  ? "bg-olive-gold text-charcoal"
                  : "bg-warm-sand/10 text-warm-sand hover:bg-warm-sand/20"
              }`}
            >
              {key.replace("_", " ")} ({count})
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <Inbox className="w-12 h-12 text-warm-sand/30 mx-auto mb-4" />
              <p className="text-warm-sand/60">No tickets</p>
            </div>
          ) : (
            filtered.map((ticket) => (
              <div
                key={ticket.id}
                className="bg-[#1A1A1A] border border-warm-sand/10 rounded-xl overflow-hidden hover:border-warm-sand/20 transition-colors"
              >
                <button
                  onClick={() => setExpandedId(expandedId === ticket.id ? null : ticket.id)}
                  className="w-full text-left p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_COLORS[ticket.status] || STATUS_COLORS.open}`}>
                          {ticket.status.replace("_", " ")}
                        </span>
                        <span className={`text-xs font-medium ${PRIORITY_COLORS[ticket.priority] || ""}`}>
                          {ticket.priority}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-olive-gold/10 text-olive-gold font-medium">
                          {ticket.type}
                        </span>
                      </div>
                      <h3 className="text-base font-semibold text-warm-white mb-1">{ticket.subject}</h3>
                      <div className="flex items-center gap-3 text-xs text-warm-sand/50">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {ticket.email || "—"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(ticket.created_at).toLocaleDateString(undefined, {
                            month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                    <div className="flex-shrink-0 text-warm-sand/30">
                      {expandedId === ticket.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </div>
                </button>

                {expandedId === ticket.id && (
                  <div className="px-5 pb-5 pt-0 border-t border-warm-sand/10 mt-0">
                    <div className="mt-3 bg-warm-sand/5 rounded-lg p-4">
                      <p className="text-sm text-warm-white whitespace-pre-wrap">{ticket.description}</p>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <p className="text-center text-xs text-warm-sand/30 mt-8">
          {tickets.length} total ticket{tickets.length !== 1 ? "s" : ""}
        </p>
      </div>
    </div>
  );
}
