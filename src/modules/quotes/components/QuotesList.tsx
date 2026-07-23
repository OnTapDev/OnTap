"use client";

import { useState } from "react";
import { FileText, MoreHorizontal, Check, X, Clock, Link as LinkIcon, CheckCheck } from "lucide-react";

type Quote = {
  id: string;
  contact_id: string;
  event_id: string | null;
  package_id: string | null;
  guest_count: number;
  add_ons: Record<string, number>;
  subtotal: number;
  tax: number;
  total: number;
  status: string;
  expires_at: string | null;
  created_at: string;
  contact: { name: string; email: string } | null;
  package: { name: string } | null;
};

interface QuotesListProps {
  quotes: Quote[];
}

const statusConfig: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
  draft: { bg: "bg-warm-sand/20", text: "text-warm-sand", icon: <FileText className="w-3 h-3" /> },
  sent: { bg: "bg-blue-500/20", text: "text-blue-400", icon: <Clock className="w-3 h-3" /> },
  accepted: { bg: "bg-green-500/20", text: "text-green-400", icon: <Check className="w-3 h-3" /> },
  rejected: { bg: "bg-red-500/20", text: "text-red-400", icon: <X className="w-3 h-3" /> },
  expired: { bg: "bg-gray-500/20", text: "text-gray-400", icon: <Clock className="w-3 h-3" /> },
};

export function QuotesList({ quotes }: QuotesListProps) {
  const [filter, setFilter] = useState<string>("all");
  const [copied, setCopied] = useState<string | null>(null);

  const copyQuoteLink = async (id: string) => {
    const link = `${window.location.origin}/public/quote/${id}`;
    await navigator.clipboard.writeText(link);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const filteredQuotes = filter === "all" 
    ? quotes 
    : quotes.filter(q => q.status === filter);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <div>
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        <button
          onClick={() => setFilter("all")}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
            filter === "all"
              ? "bg-olive-gold text-charcoal"
              : "text-warm-sand hover:text-warm-white bg-warm-sand/10"
          }`}
        >
          All ({quotes.length})
        </button>
        {Object.keys(statusConfig).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              filter === status
                ? "bg-olive-gold text-charcoal"
                : "text-warm-sand hover:text-warm-white bg-warm-sand/10"
            }`}
          >
            {formatStatus(status)} ({quotes.filter(q => q.status === status).length})
          </button>
        ))}
      </div>

      <div className="bg-charcoal border border-warm-sand/20 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-warm-sand/20">
              <th className="text-left p-4 text-sm font-medium text-warm-sand">Quote</th>
              <th className="text-left p-4 text-sm font-medium text-warm-sand">Client</th>
              <th className="text-left p-4 text-sm font-medium text-warm-sand">Package</th>
              <th className="text-left p-4 text-sm font-medium text-warm-sand">Guests</th>
              <th className="text-left p-4 text-sm font-medium text-warm-sand">Total</th>
              <th className="text-left p-4 text-sm font-medium text-warm-sand">Status</th>
              <th className="text-left p-4 text-sm font-medium text-warm-sand">Created</th>
              <th className="w-12"></th>
            </tr>
          </thead>
          <tbody>
            {filteredQuotes.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-warm-sand">
                  No quotes yet. Create your first quote to get started.
                </td>
              </tr>
            ) : (
              filteredQuotes.map((quote) => (
                <tr
                  key={quote.id}
                  className="border-b border-warm-sand/10 hover:bg-warm-sand/5 transition-colors"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-warm-sand" />
                      <span className="text-warm-white font-medium">#{quote.id.slice(0, 8)}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div>
                      <p className="text-warm-white">{quote.contact?.name || "Unknown"}</p>
                      <p className="text-sm text-warm-sand">{quote.contact?.email}</p>
                    </div>
                  </td>
                  <td className="p-4 text-warm-white">{quote.package?.name || "-"}</td>
                  <td className="p-4 text-warm-white">{quote.guest_count}</td>
                  <td className="p-4">
                    <span className="text-warm-white font-medium">${quote.total.toLocaleString()}</span>
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        statusConfig[quote.status]?.bg || "bg-warm-sand/20"
                      } ${
                        statusConfig[quote.status]?.text || "text-warm-sand"
                      }`}
                    >
                      {statusConfig[quote.status]?.icon}
                      {formatStatus(quote.status)}
                    </span>
                  </td>
                  <td className="p-4 text-warm-sand">
                    {formatDate(quote.created_at)}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => copyQuoteLink(quote.id)}
                        className="p-2 text-warm-sand hover:text-olive-gold"
                        title="Copy shareable link"
                      >
                        {copied === quote.id ? (
                          <CheckCheck className="w-4 h-4 text-olive-gold" />
                        ) : (
                          <LinkIcon className="w-4 h-4" />
                        )}
                      </button>
                      <button className="p-2 text-warm-sand hover:text-warm-white">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
