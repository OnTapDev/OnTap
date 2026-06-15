"use client";

import { useState } from "react";
import { Card, CardContent } from "@/ui/primitives";
import { FileText, DollarSign, Check, Clock, AlertCircle, Download, X } from "lucide-react";
import { getInvoiceForDownload } from "@/modules/invoices/actions/invoices";

const TABS = [
  { id: "invoices", label: "Invoices" },
  { id: "quotes", label: "Quotes" },
] as const;

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

type Event = {
  id: string;
  name: string;
};

type Package = {
  id: string;
  name: string;
  price: number;
};

type Contact = {
  id: string;
  name: string;
  email: string;
};

interface BillingClientProps {
  invoices: Invoice[];
  quotes: Quote[];
  events: Event[];
  packages: Package[];
  contacts: Contact[];
}

const invoiceStatusConfig: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
  draft: { bg: "bg-warm-sand/20", text: "text-warm-sand", icon: <FileText className="w-3 h-3" /> },
  sent: { bg: "bg-blue-500/20", text: "text-blue-400", icon: <Clock className="w-3 h-3" /> },
  paid: { bg: "bg-green-500/20", text: "text-green-400", icon: <Check className="w-3 h-3" /> },
  partial: { bg: "bg-yellow-500/20", text: "text-yellow-400", icon: <DollarSign className="w-3 h-3" /> },
  overdue: { bg: "bg-red-500/20", text: "text-red-400", icon: <AlertCircle className="w-3 h-3" /> },
  cancelled: { bg: "bg-gray-500/20", text: "text-gray-400", icon: <FileText className="w-3 h-3" /> },
};

const quoteStatusConfig: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
  draft: { bg: "bg-warm-sand/20", text: "text-warm-sand", icon: <FileText className="w-3 h-3" /> },
  sent: { bg: "bg-blue-500/20", text: "text-blue-400", icon: <Clock className="w-3 h-3" /> },
  accepted: { bg: "bg-green-500/20", text: "text-green-400", icon: <Check className="w-3 h-3" /> },
  rejected: { bg: "bg-red-500/20", text: "text-red-400", icon: <X className="w-3 h-3" /> },
  expired: { bg: "bg-gray-500/20", text: "text-gray-400", icon: <Clock className="w-3 h-3" /> },
};

export function BillingClient({ invoices, quotes }: BillingClientProps) {
  const [tab, setTab] = useState<"invoices" | "quotes">("invoices");
  const [invoiceFilter, setInvoiceFilter] = useState<string>("all");
  const [quoteFilter, setQuoteFilter] = useState<string>("all");
  const [downloading, setDownloading] = useState<string | null>(null);

  const filteredInvoices = invoiceFilter === "all" 
    ? invoices 
    : invoices.filter(i => i.status === invoiceFilter);

  const filteredQuotes = quoteFilter === "all" 
    ? quotes 
    : quotes.filter(q => q.status === quoteFilter);

  const formatDate = (date: string | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString()}`;
  };

  const totalOutstanding = invoices
    .filter(i => i.status !== "paid" && i.status !== "cancelled")
    .reduce((sum, i) => sum + i.balance_due, 0);

  const totalPaid = invoices
    .filter(i => i.status === "paid")
    .reduce((sum, i) => sum + i.amount, 0);

  const totalQuoted = quotes
    .filter(q => q.status !== "rejected" && q.status !== "expired")
    .reduce((sum, q) => sum + q.total, 0);

  const handleDownload = async (invoiceId: string) => {
    setDownloading(invoiceId);
    try {
      const invoice = await getInvoiceForDownload(invoiceId);
      
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        alert("Please allow popups to download invoices");
        return;
      }

      const html = `
        <html>
          <head>
            <style>
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
            </style>
          </head>
          <body>
            <div class="header">
              <div class="company">OnTap</div>
              <div class="invoice-info">
                <div class="invoice-number">Invoice #${invoice.id.slice(0, 8).toUpperCase()}</div>
                <div>${formatDate(invoice.created_at)}</div>
                <div class="status" style="background: ${invoiceStatusConfig[invoice.status]?.bg || '#eee'}; color: ${invoiceStatusConfig[invoice.status]?.text || '#666'}">
                  ${invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                </div>
              </div>
            </div>
            
            ${invoice.event ? `
            <div style="margin-bottom: 40px;">
              <h3>Event: ${invoice.event.name}</h3>
              <p>${formatDate(invoice.event.date)}${invoice.event.venue_name ? ` - ${invoice.event.venue_name}` : ''}</p>
            </div>
            ` : ''}

            <table>
              <thead>
                <tr>
                  <th>Description</th>
                  <th style="text-align: right;">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Event Services</td>
                  <td style="text-align: right;">${formatCurrency(invoice.amount)}</td>
                </tr>
                ${invoice.deposit_amount ? `
                <tr>
                  <td>Deposit Paid</td>
                  <td style="text-align: right;">-${formatCurrency(invoice.deposit_amount)}</td>
                </tr>
                ` : ''}
              </tbody>
            </table>

            <div class="totals">
              <div class="total-row">
                <span class="total-label">Subtotal</span>
                <span class="total-value">${formatCurrency(invoice.amount)}</span>
              </div>
              <div class="total-row">
                <span class="total-label">Balance Due</span>
                <span class="total-value">${formatCurrency(invoice.balance_due)}</span>
              </div>
            </div>
          </body>
        </html>
      `;

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
          <h1 className="text-screen-title text-warm-white">Billing</h1>
          <p className="text-warm-sand mt-1">Manage quotes and invoices</p>
        </div>
      </div>

      <div className="flex items-center gap-1 bg-charcoal rounded-lg p-1 w-fit border border-warm-sand/20">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as typeof tab)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              tab === t.id
                ? "bg-olive-gold text-charcoal"
                : "text-warm-sand hover:text-warm-white"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-charcoal border-warm-sand/20">
          <CardContent className="p-6">
            <p className="text-meta text-warm-sand">Total Outstanding</p>
            <p className="text-2xl font-bold text-warm-white mt-1">{formatCurrency(totalOutstanding)}</p>
          </CardContent>
        </Card>
        <Card className="bg-charcoal border-warm-sand/20">
          <CardContent className="p-6">
            <p className="text-meta text-warm-sand">Total Paid</p>
            <p className="text-2xl font-bold text-warm-white mt-1">{formatCurrency(totalPaid)}</p>
          </CardContent>
        </Card>
        <Card className="bg-charcoal border-warm-sand/20">
          <CardContent className="p-6">
            <p className="text-meta text-warm-sand">Total Quoted</p>
            <p className="text-2xl font-bold text-warm-white mt-1">{formatCurrency(totalQuoted)}</p>
          </CardContent>
        </Card>
      </div>

      {tab === "invoices" && (
        <>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {["all", "draft", "sent", "paid", "partial", "overdue"].map((status) => (
              <button
                key={status}
                onClick={() => setInvoiceFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  invoiceFilter === status
                    ? "bg-olive-gold text-charcoal"
                    : "bg-warm-sand/10 text-warm-sand hover:bg-warm-sand/20"
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>

          <Card className="bg-charcoal border-warm-sand/20">
            <CardContent className="p-0">
              <div className="divide-y divide-warm-sand/10">
                {filteredInvoices.length === 0 ? (
                  <p className="text-warm-sand text-center py-12">No invoices found</p>
                ) : (
                  filteredInvoices.map((invoice) => (
                    <div key={invoice.id} className="flex items-center justify-between p-4 hover:bg-warm-sand/5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-olive-gold/20 flex items-center justify-center">
                          <DollarSign className="w-6 h-6 text-olive-gold" />
                        </div>
                        <div>
                          <p className="text-warm-white font-medium">
                            {invoice.event?.name || `Invoice #${invoice.id.slice(0, 8)}`}
                          </p>
                          <p className="text-sm text-warm-sand">
                            {formatDate(invoice.due_date)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-warm-white font-medium">
                          {formatCurrency(invoice.balance_due)}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${invoiceStatusConfig[invoice.status]?.bg || "bg-warm-sand/20"} ${invoiceStatusConfig[invoice.status]?.text || "text-warm-sand"}`}>
                          {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                        </span>
                        <button
                          onClick={() => handleDownload(invoice.id)}
                          disabled={downloading === invoice.id}
                          className="p-2 text-warm-sand hover:text-warm-white"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {tab === "quotes" && (
        <>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {["all", "draft", "sent", "accepted", "rejected", "expired"].map((status) => (
              <button
                key={status}
                onClick={() => setQuoteFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  quoteFilter === status
                    ? "bg-olive-gold text-charcoal"
                    : "bg-warm-sand/10 text-warm-sand hover:bg-warm-sand/20"
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>

          <Card className="bg-charcoal border-warm-sand/20">
            <CardContent className="p-0">
              <div className="divide-y divide-warm-sand/10">
                {filteredQuotes.length === 0 ? (
                  <p className="text-warm-sand text-center py-12">No quotes found</p>
                ) : (
                  filteredQuotes.map((quote) => (
                    <div key={quote.id} className="flex items-center justify-between p-4 hover:bg-warm-sand/5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-olive-gold/20 flex items-center justify-center">
                          <FileText className="w-6 h-6 text-olive-gold" />
                        </div>
                        <div>
                          <p className="text-warm-white font-medium">
                            {quote.contact?.name || `Quote #${quote.id.slice(0, 8)}`}
                          </p>
                          <p className="text-sm text-warm-sand">
                            {quote.package?.name || "Custom quote"} - {quote.guest_count} guests
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-warm-white font-medium">
                          {formatCurrency(quote.total)}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${quoteStatusConfig[quote.status]?.bg || "bg-warm-sand/20"} ${quoteStatusConfig[quote.status]?.text || "text-warm-sand"}`}>
                          {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}