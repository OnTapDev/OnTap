"use client";

import { useState } from "react";
import { FileText, DollarSign, MoreHorizontal, Check, Clock, AlertCircle, Download } from "lucide-react";
import { getInvoiceForDownload } from "@/modules/invoices/actions/invoices";
import { MiniLineChart } from "@/ui/components/MiniLineChart";
import { Card, CardContent } from "@/ui/primitives";
import Link from "next/link";

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

interface InvoicesListProps {
  invoices: Invoice[];
}

const statusConfig: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
  draft: { bg: "bg-warm-sand/20", text: "text-warm-sand", icon: <FileText className="w-3 h-3" /> },
  sent: { bg: "bg-blue-500/20", text: "text-blue-400", icon: <Clock className="w-3 h-3" /> },
  paid: { bg: "bg-green-500/20", text: "text-green-400", icon: <Check className="w-3 h-3" /> },
  partial: { bg: "bg-yellow-500/20", text: "text-yellow-400", icon: <DollarSign className="w-3 h-3" /> },
  overdue: { bg: "bg-red-500/20", text: "text-red-400", icon: <AlertCircle className="w-3 h-3" /> },
  cancelled: { bg: "bg-gray-500/20", text: "text-gray-400", icon: <FileText className="w-3 h-3" /> },
};

export function InvoicesList({ invoices }: InvoicesListProps) {
  const [filter, setFilter] = useState<string>("all");
  const [downloading, setDownloading] = useState<string | null>(null);

  const filteredInvoices = filter === "all" 
    ? invoices 
    : invoices.filter(i => i.status === filter);

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

  const formatStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const totalOutstanding = invoices
    .filter(i => i.status !== "paid" && i.status !== "cancelled")
    .reduce((sum, i) => sum + i.balance_due, 0);

  const totalPaid = invoices
    .filter(i => i.status === "paid")
    .reduce((sum, i) => sum + i.amount, 0);

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
<!DOCTYPE html>
<html>
<head>
  <title>Invoice #${invoiceId.slice(0, 8)}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; color: #333; }
    .header { display: flex; justify-content: space-between; margin-bottom: 40px; }
    .logo { font-size: 24px; font-weight: bold; color: #7D7254; }
    .invoice-title { font-size: 32px; color: #1A1A1A; }
    .invoice-number { color: #666; margin-top: 8px; }
    .details { display: flex; justify-content: space-between; margin-bottom: 40px; }
    .details-section h3 { font-size: 12px; color: #999; text-transform: uppercase; margin-bottom: 8px; }
    .details-section p { margin: 4px 0; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
    th { text-align: left; padding: 12px; border-bottom: 2px solid #ddd; font-size: 12px; color: #666; text-transform: uppercase; }
    td { padding: 12px; border-bottom: 1px solid #eee; }
    .totals { text-align: right; }
    .totals .row { display: flex; justify-content: flex-end; padding: 8px 0; }
    .totals .label { width: 150px; color: #666; }
    .totals .value { width: 100px; font-weight: bold; }
    .totals .total { font-size: 20px; color: #1A1A1A; border-top: 2px solid #1A1A1A; padding-top: 8px; margin-top: 8px; }
    .status { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; text-transform: uppercase; }
    .status.paid { background: #dcfce7; color: #16a34a; }
    .status.sent { background: #dbeafe; color: #2563eb; }
    .status.draft { background: #f3f4f6; color: #6b7280; }
    .status.overdue { background: #fee2e2; color: #dc2626; }
    .footer { margin-top: 60px; text-align: center; color: #999; font-size: 12px; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="logo">OnTap</div>
    </div>
    <div style="text-align: right;">
      <div class="invoice-title">INVOICE</div>
      <div class="invoice-number">#${invoiceId.slice(0, 8).toUpperCase()}</div>
      <div style="margin-top: 8px;">
        <span class="status ${invoice.status}">${invoice.status}</span>
      </div>
    </div>
  </div>

  <div class="details">
    <div class="details-section">
      <h3>Bill To</h3>
      <p><strong>${invoice.event?.contact?.name || "N/A"}</strong></p>
      <p>${invoice.event?.contact?.email || ""}</p>
      <p>${invoice.event?.contact?.phone || ""}</p>
    </div>
    <div class="details-section">
      <h3>Invoice Details</h3>
      <p><strong>Event:</strong> ${invoice.event?.name || "N/A"}</p>
      <p><strong>Date:</strong> ${formatDate(invoice.created_at)}</p>
      <p><strong>Due Date:</strong> ${formatDate(invoice.due_date)}</p>
      <p><strong>Venue:</strong> ${invoice.event?.venue_name || "N/A"}</p>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Description</th>
        <th style="text-align: right;">Amount</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Bar Services - ${invoice.event?.name || "Event"}</td>
        <td style="text-align: right;">${formatCurrency(invoice.amount)}</td>
      </tr>
    </tbody>
  </table>

  <div class="totals">
    <div class="row">
      <span class="label">Subtotal</span>
      <span class="value">${formatCurrency(invoice.amount)}</span>
    </div>
    ${invoice.deposit_amount ? `
    <div class="row">
      <span class="label">Deposit Paid</span>
      <span class="value">-${formatCurrency(invoice.deposit_amount)}</span>
    </div>
    ` : ""}
    <div class="row total">
      <span class="label">Balance Due</span>
      <span class="value">${formatCurrency(invoice.balance_due)}</span>
    </div>
  </div>

  <div class="footer">
    <p>Thank you for your business!</p>
    <p>Questions? Contact us at ontap.inquiries@gmail.com</p>
  </div>
</body>
</html>
      `;

      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.print();
    } catch (error) {
      console.error("Error downloading invoice:", error);
      alert("Failed to download invoice");
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div>
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Link href="/billing">
          <Card className="bg-charcoal border-warm-sand/20 hover:border-olive-gold hover:scale-[1.02] hover:shadow-lg hover:shadow-olive-gold/10 transition-all duration-200 cursor-pointer h-full">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="rounded-lg bg-olive-gold/20 p-3">
                  <FileText className="h-6 w-6 text-olive-gold" />
                </div>
                <MiniLineChart data={[60, 75, 70, 85, 80, 90, 88, 95]} color="#7D7254" />
              </div>
              <p className="text-meta text-warm-sand">Total Invoiced</p>
              <p className="text-2xl font-bold text-warm-white mt-1">
                {formatCurrency(invoices.reduce((sum, i) => sum + i.amount, 0))}
              </p>
            </CardContent>
          </Card>
        </Link>
        
        <Link href="/billingpaid">
          <Card className="bg-charcoal border-warm-sand/20 hover:border-olive-gold hover:scale-[1.02] hover:shadow-lg hover:shadow-olive-gold/10 transition-all duration-200 cursor-pointer h-full">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="rounded-lg bg-olive-gold/20 p-3">
                  <Check className="h-6 w-6 text-olive-gold" />
                </div>
                <MiniLineChart data={[40, 55, 60, 50, 70, 65, 75, 80]} color="#7D7254" />
              </div>
              <p className="text-meta text-warm-sand">Paid</p>
              <div className="flex items-end justify-between mt-1">
                <p className="text-2xl font-bold text-warm-white">
                  {formatCurrency(totalPaid)}
                </p>
                <div className="w-24 h-2 bg-warm-sand/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-olive-gold rounded-full transition-all" 
                    style={{ width: `${invoices.length > 0 ? (totalPaid / (invoices.reduce((sum, i) => sum + i.amount, 0) || 1)) * 100 : 0}%` }} 
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
        
        <Link href="/billingoutstanding">
          <Card className="bg-charcoal border-warm-sand/20 hover:border-olive-gold hover:scale-[1.02] hover:shadow-lg hover:shadow-olive-gold/10 transition-all duration-200 cursor-pointer h-full">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="rounded-lg bg-olive-gold/20 p-3">
                  <Clock className="h-6 w-6 text-olive-gold" />
                </div>
                <MiniLineChart data={[30, 45, 40, 55, 50, 65, 60, 70]} color="#7D7254" />
              </div>
              <p className="text-meta text-warm-sand">Outstanding</p>
              <div className="flex items-end justify-between mt-1">
                <p className="text-2xl font-bold text-warm-white">
                  {formatCurrency(totalOutstanding)}
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        <button
          onClick={() => setFilter("all")}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
            filter === "all"
              ? "bg-olive-gold text-charcoal"
              : "text-warm-sand hover:text-warm-white bg-warm-sand/10"
          }`}
        >
          All ({invoices.length})
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
            {formatStatus(status)} ({invoices.filter(i => i.status === status).length})
          </button>
        ))}
      </div>

      <div className="bg-charcoal border border-warm-sand/20 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-warm-sand/20">
              <th className="text-left p-4 text-sm font-medium text-warm-sand">Invoice</th>
              <th className="text-left p-4 text-sm font-medium text-warm-sand">Event</th>
              <th className="text-left p-4 text-sm font-medium text-warm-sand">Amount</th>
              <th className="text-left p-4 text-sm font-medium text-warm-sand">Deposit</th>
              <th className="text-left p-4 text-sm font-medium text-warm-sand">Balance</th>
              <th className="text-left p-4 text-sm font-medium text-warm-sand">Status</th>
              <th className="text-left p-4 text-sm font-medium text-warm-sand">Due Date</th>
              <th className="w-24"></th>
            </tr>
          </thead>
          <tbody>
            {filteredInvoices.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-warm-sand">
                  No invoices yet. Create your first invoice to get started.
                </td>
              </tr>
            ) : (
              filteredInvoices.map((invoice) => (
                <tr
                  key={invoice.id}
                  className="border-b border-warm-sand/10 hover:bg-warm-sand/5 transition-colors"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-warm-sand" />
                      <span className="text-warm-white font-medium">#{invoice.id.slice(0, 8)}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div>
                      <p className="text-warm-white">{invoice.event?.name || "Unknown"}</p>
                      <p className="text-sm text-warm-sand">
                        {invoice.event?.venue_name || new Date(invoice.event?.date || "").toLocaleDateString()}
                      </p>
                    </div>
                  </td>
                  <td className="p-4 text-warm-white font-medium">
                    {formatCurrency(invoice.amount)}
                  </td>
                  <td className="p-4 text-warm-sand">
                    {invoice.deposit_amount ? formatCurrency(invoice.deposit_amount) : "-"}
                  </td>
                  <td className="p-4">
                    <span className={invoice.balance_due > 0 ? "text-yellow-400" : "text-green-400"}>
                      {formatCurrency(invoice.balance_due)}
                    </span>
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        statusConfig[invoice.status]?.bg || "bg-warm-sand/20"
                      } ${
                        statusConfig[invoice.status]?.text || "text-warm-sand"
                      }`}
                    >
                      {statusConfig[invoice.status]?.icon}
                      {formatStatus(invoice.status)}
                    </span>
                  </td>
                  <td className="p-4 text-warm-sand">
                    {formatDate(invoice.due_date)}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => handleDownload(invoice.id)}
                        disabled={downloading === invoice.id}
                        className="p-2 text-warm-sand hover:text-warm-white disabled:opacity-50"
                        title="Download Invoice"
                      >
                        {downloading === invoice.id ? (
                          <span className="w-4 h-4 block border-2 border-warm-sand border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Download className="w-4 h-4" />
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