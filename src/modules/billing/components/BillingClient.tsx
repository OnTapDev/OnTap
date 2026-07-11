"use client";

import { useState } from "react";
import { Card, CardContent } from "@/ui/primitives";
import { MiniLineChart } from "@/ui/components/MiniLineChart";
import {
  DollarSign, FileText, Plus, Download, CheckCircle, XCircle, Send, ArrowUpRight, Clock, AlertCircle,
  Receipt, TrendingUp, CreditCard
} from "lucide-react";
import Link from "next/link";
import { getInvoiceForDownload } from "@/modules/invoices/actions/invoices";

type Invoice = {
  id: string;
  event_id: string;
  amount: number;
  deposit_amount: number | null;
  balance_due: number;
  status: string;
  due_date: string | null;
  paid_at: string | null;
  created_at: string;
  event: { name: string; date: string; venue_name: string | null } | null;
};

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

type Event = { id: string; name: string };
type Package = { id: string; name: string; price: number };
type Contact = { id: string; name: string; email: string };

interface BillingClientProps {
  invoices: Invoice[];
  quotes: Quote[];
  events: Event[];
  packages: Package[];
  contacts: Contact[];
  kpis: Record<string, { value: number; change: string; chartData: number[] }>;
}

const TABS = [
  { id: "invoices" as const, label: "Invoices" },
  { id: "quotes" as const, label: "Quotes" },
];

const kpiConfig = [
  { slug: "total-outstanding", label: "Total Outstanding", icon: DollarSign, href: "/billing/kpi/total-outstanding", format: (v: number) => `$${v.toLocaleString()}` },
  { slug: "total-paid", label: "Total Paid", icon: Receipt, href: "/billing/kpi/total-paid", format: (v: number) => `$${v.toLocaleString()}` },
  { slug: "total-quoted", label: "Total Quoted", icon: TrendingUp, href: "/billing/kpi/total-quoted", format: (v: number) => `$${v.toLocaleString()}` },
  { slug: "overdue-count", label: "Overdue", icon: AlertCircle, href: "/billing/kpi/overdue-count", format: (v: number) => `${v} invoices` },
];

export function BillingClient({ invoices, quotes, kpis }: BillingClientProps) {
  const [tab, setTab] = useState<"invoices" | "quotes">("invoices");
  const [invoiceFilter, setInvoiceFilter] = useState<string>("all");
  const [quoteFilter, setQuoteFilter] = useState<string>("all");
  const [downloading, setDownloading] = useState<string | null>(null);
  const [paying, setPaying] = useState<string | null>(null);

  const invoiceStatusCounts = {
    draft: invoices.filter(i => i.status === "draft").length,
    sent: invoices.filter(i => i.status === "sent").length,
    paid: invoices.filter(i => i.status === "paid").length,
    partial: invoices.filter(i => i.status === "partial").length,
    overdue: invoices.filter(i => i.status === "overdue").length,
    cancelled: invoices.filter(i => i.status === "cancelled").length,
  };

  const quoteStatusCounts = {
    draft: quotes.filter(q => q.status === "draft").length,
    sent: quotes.filter(q => q.status === "sent").length,
    accepted: quotes.filter(q => q.status === "accepted").length,
    rejected: quotes.filter(q => q.status === "rejected").length,
    expired: quotes.filter(q => q.status === "expired").length,
  };

  const filteredInvoices = invoiceFilter === "all"
    ? invoices
    : invoices.filter(i => i.status === invoiceFilter);

  const filteredQuotes = quoteFilter === "all"
    ? quotes
    : quotes.filter(q => q.status === quoteFilter);

  const formatDate = (date: string | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const formatCurrency = (amount: number) => `$${amount.toLocaleString()}`;

  const handlePayNow = async (invoiceId: string) => {
    setPaying(invoiceId);
    try {
      const res = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceId }),
      });
      const data = await res.json();
      if (data.url) {
        window.open(data.url, "_blank");
      } else {
        alert(data.error || "Failed to create payment");
      }
    } catch {
      alert("Failed to initiate payment");
    } finally {
      setPaying(null);
    }
  };

  const handleDownload = async (invoiceId: string) => {
    setDownloading(invoiceId);
    try {
      const invoice = await getInvoiceForDownload(invoiceId);
      const printWindow = window.open("", "_blank");
      if (!printWindow) { alert("Please allow popups to download invoices"); return; }
      const html = `
        <html><head><style>
          body { font-family: Arial, sans-serif; padding: 40px; }
          .header { display: flex; justify-content: space-between; margin-bottom: 40px; }
          .company { font-size: 24px; font-weight: bold; }
          .invoice-info { text-align: right; }
          .invoice-number { font-size: 18px; font-weight: bold; }
          .status { padding: 4px 12px; border-radius: 4px; display: inline-block; margin-top: 8px; }
          table { width: 100%; border-collapse: collapse; margin-top: 40px; }
          th, td { padding: 12px; text-align: left; border-bottom: 1px solid #eee; }
          th { background: #f9f9f9; }
          .totals { margin-top: 40px; text-align: right; }
          .total-row { display: flex; justify-content: flex-end; gap: 40px; padding: 8px 0; }
          .total-label { color: #666; }
          .total-value { font-weight: bold; }
        </style></head><body>
          <div class="header">
            <div class="company">OnTap</div>
            <div class="invoice-info">
              <div class="invoice-number">Invoice #${invoice.id.slice(0, 8).toUpperCase()}</div>
              <div>${formatDate(invoice.created_at)}</div>
            </div>
          </div>
          ${invoice.event ? `<div style="margin-bottom:40px"><h3>Event: ${invoice.event.name}</h3><p>${formatDate(invoice.event.date)}${invoice.event.venue_name ? ` - ${invoice.event.venue_name}` : ""}</p></div>` : ""}
          <table><thead><tr><th>Description</th><th style="text-align:right">Amount</th></tr></thead><tbody>
            <tr><td>Event Services</td><td style="text-align:right">${formatCurrency(invoice.amount)}</td></tr>
            ${invoice.deposit_amount ? `<tr><td>Deposit Paid</td><td style="text-align:right">-${formatCurrency(invoice.deposit_amount)}</td></tr>` : ""}
          </tbody></table>
          <div class="totals">
            <div class="total-row"><span class="total-label">Subtotal</span><span class="total-value">${formatCurrency(invoice.amount)}</span></div>
            <div class="total-row"><span class="total-label">Balance Due</span><span class="total-value">${formatCurrency(invoice.balance_due)}</span></div>
          </div>
        </body></html>`;
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.print();
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-warm-sand mt-1">
            {invoiceStatusCounts.paid} paid · {invoiceStatusCounts.overdue} overdue · {quoteStatusCounts.accepted} accepted
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        {[
          { name: "New Invoice", icon: Plus, href: "/invoices" },
          { name: "New Quote", icon: FileText, href: "/quotes" },
        ].map(action => (
          <Link key={action.name} href={action.href}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-warm-sand/20 hover:border-warm-sand/40 transition-colors bg-charcoal">
            <div className="p-1.5 rounded-lg bg-olive-gold/20 text-olive-gold"><action.icon className="w-4 h-4" /></div>
            <span className="text-sm text-warm-white font-medium">{action.name}</span>
          </Link>
        ))}
      </div>

      <div className="bg-charcoal border border-warm-sand/20 rounded-xl p-6">
        <h3 className="text-warm-white font-medium text-sm mb-4">Invoice Pipeline</h3>
        <div className="grid grid-cols-6 gap-2">
          {(["draft", "sent", "paid", "partial", "overdue", "cancelled"] as const).map(status => {
            const maxVal = Math.max(...Object.values(invoiceStatusCounts), 1);
            return (
              <div key={status} className="text-center">
                <div className="relative h-2 bg-warm-sand/10 rounded-full mb-2 overflow-hidden">
                  <div className="h-full bg-olive-gold rounded-full transition-all duration-500"
                    style={{ width: `${(invoiceStatusCounts[status] / maxVal) * 100}%` }} />
                </div>
                <p className="text-lg font-bold text-warm-white">{invoiceStatusCounts[status]}</p>
                <p className="text-xs text-warm-sand capitalize">{status}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {kpiConfig.map(k => {
          const data = kpis[k.slug];
          if (!data) return null;
          const displayValue = data.value > 0 || k.slug === "overdue-count" ? k.format(data.value) : `$${0}`;
          return (
            <Link key={k.slug} href={k.href}>
              <Card className="bg-charcoal border-warm-sand/20 hover:border-olive-gold hover:scale-[1.02] transition-all duration-200 cursor-pointer h-full">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="rounded-lg bg-olive-gold/20 p-3"><k.icon className="h-6 w-6 text-olive-gold" /></div>
                    <MiniLineChart data={data.chartData.length > 0 ? data.chartData : [0]} color="#7D7254" />
                  </div>
                  <p className="text-meta text-warm-sand">{k.label}</p>
                  <div className="flex items-end justify-between mt-1">
                    <p className="text-2xl font-bold text-warm-white">{displayValue}</p>
                    {data.change && data.value > 0 && (
                      <div className="flex items-center gap-1 text-sm text-olive-gold"><ArrowUpRight className="w-4 h-4" /><span>{data.change}</span></div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="flex items-center gap-1 bg-charcoal rounded-lg p-1 w-fit border border-warm-sand/20">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${tab === t.id ? "bg-olive-gold text-charcoal" : "text-warm-sand hover:text-warm-white"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "invoices" && (
        <>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {["all", "draft", "sent", "paid", "partial", "overdue"].map((status) => (
              <button key={status} onClick={() => setInvoiceFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${invoiceFilter === status ? "bg-olive-gold text-charcoal" : "text-warm-sand hover:text-warm-white bg-warm-sand/10"}`}>
                {status === "all" ? `All (${invoices.length})` : `${status.charAt(0).toUpperCase() + status.slice(1)} (${invoiceStatusCounts[status as keyof typeof invoiceStatusCounts]})`}
              </button>
            ))}
          </div>
          <Card className="bg-charcoal border-warm-sand/20">
            <CardContent className="p-0">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-warm-sand/20">
                    <th className="text-left p-4 text-sm font-medium text-warm-sand">Invoice</th>
                    <th className="text-left p-4 text-sm font-medium text-warm-sand">Event</th>
                    <th className="text-left p-4 text-sm font-medium text-warm-sand">Amount</th>
                    <th className="text-left p-4 text-sm font-medium text-warm-sand">Balance</th>
                    <th className="text-left p-4 text-sm font-medium text-warm-sand">Status</th>
                    <th className="text-left p-4 text-sm font-medium text-warm-sand">Due Date</th>
                    <th className="w-24"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.length === 0 ? (
                    <tr><td colSpan={7} className="p-8 text-center text-warm-sand">No invoices found. Create an invoice to get started.</td></tr>
                  ) : filteredInvoices.map(invoice => (
                    <tr key={invoice.id} className="border-b border-warm-sand/10 hover:bg-warm-sand/5">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-warm-sand" />
                          <span className="text-warm-white font-medium">#{invoice.id.slice(0, 8).toUpperCase()}</span>
                        </div>
                      </td>
                      <td className="p-4 text-warm-white">{invoice.event?.name || "-"}</td>
                      <td className="p-4 text-warm-white">{formatCurrency(invoice.amount)}</td>
                      <td className="p-4 text-warm-white">{formatCurrency(invoice.balance_due)}</td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-olive-gold/20 text-olive-gold">
                          {invoice.status === "paid" ? <CheckCircle className="w-3 h-3" /> :
                           invoice.status === "cancelled" ? <XCircle className="w-3 h-3" /> :
                           invoice.status === "overdue" ? <AlertCircle className="w-3 h-3" /> :
                           invoice.status === "sent" ? <Send className="w-3 h-3" /> :
                           invoice.status === "partial" ? <DollarSign className="w-3 h-3" /> :
                           <FileText className="w-3 h-3" />}
                          {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                        </span>
                      </td>
                      <td className="p-4 text-warm-sand text-sm">{formatDate(invoice.due_date)}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          {invoice.status !== "paid" && invoice.status !== "cancelled" && (
                            <button onClick={() => handlePayNow(invoice.id)} disabled={paying === invoice.id}
                              className="p-1.5 text-olive-gold hover:text-olive-gold/70 disabled:opacity-50" title="Pay Now">
                              {paying === invoice.id ? (
                                <span className="w-4 h-4 block border-2 border-olive-gold border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <CreditCard className="w-4 h-4" />
                              )}
                            </button>
                          )}
                          <button onClick={() => handleDownload(invoice.id)} disabled={downloading === invoice.id}
                            className="p-1.5 text-warm-sand hover:text-warm-white" title="Download Invoice">
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </>
      )}

      {tab === "quotes" && (
        <>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {["all", "draft", "sent", "accepted", "rejected", "expired"].map((status) => (
              <button key={status} onClick={() => setQuoteFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${quoteFilter === status ? "bg-olive-gold text-charcoal" : "text-warm-sand hover:text-warm-white bg-warm-sand/10"}`}>
                {status === "all" ? `All (${quotes.length})` : `${status.charAt(0).toUpperCase() + status.slice(1)} (${quoteStatusCounts[status as keyof typeof quoteStatusCounts]})`}
              </button>
            ))}
          </div>
          <Card className="bg-charcoal border-warm-sand/20">
            <CardContent className="p-0">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-warm-sand/20">
                    <th className="text-left p-4 text-sm font-medium text-warm-sand">Client</th>
                    <th className="text-left p-4 text-sm font-medium text-warm-sand">Package</th>
                    <th className="text-left p-4 text-sm font-medium text-warm-sand">Guests</th>
                    <th className="text-left p-4 text-sm font-medium text-warm-sand">Total</th>
                    <th className="text-left p-4 text-sm font-medium text-warm-sand">Status</th>
                    <th className="text-left p-4 text-sm font-medium text-warm-sand">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredQuotes.length === 0 ? (
                    <tr><td colSpan={6} className="p-8 text-center text-warm-sand">No quotes found. Create a quote to get started.</td></tr>
                  ) : filteredQuotes.map(quote => (
                    <tr key={quote.id} className="border-b border-warm-sand/10 hover:bg-warm-sand/5">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-warm-sand" />
                          <span className="text-warm-white font-medium">{quote.contact?.name || "Unknown"}</span>
                        </div>
                      </td>
                      <td className="p-4 text-warm-sand">{quote.package?.name || "Custom"}</td>
                      <td className="p-4 text-warm-white">{quote.guest_count}</td>
                      <td className="p-4 text-warm-white font-medium">{formatCurrency(quote.total)}</td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-olive-gold/20 text-olive-gold">
                          {quote.status === "accepted" ? <CheckCircle className="w-3 h-3" /> :
                           quote.status === "rejected" ? <XCircle className="w-3 h-3" /> :
                           quote.status === "sent" ? <Send className="w-3 h-3" /> :
                           quote.status === "expired" ? <Clock className="w-3 h-3" /> :
                           <FileText className="w-3 h-3" />}
                          {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
                        </span>
                      </td>
                      <td className="p-4 text-warm-sand text-sm">{formatDate(quote.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
