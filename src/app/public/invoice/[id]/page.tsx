import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function PublicInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: invoice } = await supabase
    .from("invoices")
    .select(`
      *,
      event:events(
        id, name, date, venue_name, venue_address,
        contact:contacts(name, email, phone)
      ),
      organization:organizations(name)
    `)
    .eq("id", id)
    .maybeSingle();

  if (!invoice) notFound();

  const fmtCurrency = (n: number) => `$${n.toLocaleString()}`;
  const fmtDate = (d: string | null) =>
    d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "-";
  const statusColor: Record<string, string> = {
    paid: "bg-green-500/10 text-green-400",
    sent: "bg-blue-500/10 text-blue-400",
    draft: "bg-warm-sand/10 text-warm-sand",
    overdue: "bg-red-500/10 text-red-400",
    cancelled: "bg-gray-500/10 text-gray-400",
    partial: "bg-yellow-500/10 text-yellow-400",
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-[#1A1A1A] border border-warm-sand/10 rounded-2xl overflow-hidden">
        <div className="p-6 sm:p-8 border-b border-warm-sand/10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-warm-white">Invoice</h1>
              <p className="text-warm-sand/60 text-sm mt-1">#{id.slice(0, 8).toUpperCase()}</p>
            </div>
            <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusColor[invoice.status] || "bg-warm-sand/10 text-warm-sand"}`}>
              {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
            </span>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-xs text-warm-sand/50 uppercase tracking-wider mb-1">From</p>
              <p className="text-sm font-medium text-warm-white">{invoice.organization?.name || "OnTap"}</p>
            </div>
            <div>
              <p className="text-xs text-warm-sand/50 uppercase tracking-wider mb-1">Bill To</p>
              <p className="text-sm font-medium text-warm-white">{invoice.event?.contact?.name || "Client"}</p>
              {invoice.event?.contact?.email && (
                <p className="text-xs text-warm-sand/60">{invoice.event.contact.email}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-xs text-warm-sand/50 uppercase tracking-wider mb-1">Event</p>
              <p className="text-sm text-warm-white">{invoice.event?.name || "-"}</p>
              {invoice.event?.venue_name && (
                <p className="text-xs text-warm-sand/60">{invoice.event.venue_name}</p>
              )}
            </div>
            <div>
              <p className="text-xs text-warm-sand/50 uppercase tracking-wider mb-1">Date</p>
              <p className="text-sm text-warm-white">{fmtDate(invoice.event?.date)}</p>
              {invoice.due_date && (
                <>
                  <p className="text-xs text-warm-sand/50 uppercase tracking-wider mt-2 mb-1">Due Date</p>
                  <p className="text-sm text-warm-white">{fmtDate(invoice.due_date)}</p>
                </>
              )}
            </div>
          </div>

          <div className="border-t border-warm-sand/10 pt-4">
            <table className="w-full">
              <thead>
                <tr className="border-b border-warm-sand/10">
                  <th className="text-left pb-2 text-xs text-warm-sand/50 uppercase tracking-wider font-medium">Description</th>
                  <th className="text-right pb-2 text-xs text-warm-sand/50 uppercase tracking-wider font-medium">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="py-3 text-sm text-warm-white">
                    {invoice.event?.name ? `Bar Services — ${invoice.event.name}` : "Bar Services"}
                  </td>
                  <td className="py-3 text-sm text-right text-warm-white">{fmtCurrency(invoice.amount)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="border-t border-warm-sand/10 pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-warm-sand/60">Subtotal</span>
              <span className="text-warm-white">{fmtCurrency(invoice.amount)}</span>
            </div>
            {invoice.deposit_amount ? (
              <div className="flex justify-between text-sm">
                <span className="text-warm-sand/60">Deposit Paid</span>
                <span className="text-green-400">-{fmtCurrency(invoice.deposit_amount)}</span>
              </div>
            ) : null}
            <div className="flex justify-between text-base font-bold pt-2 border-t border-warm-sand/10">
              <span className="text-warm-white">Balance Due</span>
              <span className="text-warm-white">{fmtCurrency(invoice.balance_due)}</span>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8 border-t border-warm-sand/10 text-center">
          <p className="text-xs text-warm-sand/40">Powered by OnTap — The operating system for mobile bar operators</p>
        </div>
      </div>
    </div>
  );
}
