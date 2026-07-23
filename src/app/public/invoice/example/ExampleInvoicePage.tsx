"use client";

const exampleInvoice = {
  id: "INV-001",
  status: "sent",
  amount: 2500,
  deposit_amount: 500,
  balance_due: 2000,
  due_date: "2026-08-15",
  created_at: "2026-07-20",
  event: {
    name: "Summer Corporate Gala",
    date: "2026-08-10",
    venue_name: "The Rooftop at Oceana",
    venue_address: "100 Harbor Blvd, Santa Monica, CA",
    contact: { name: "Sarah Johnson", email: "sarah@acmecorp.com", phone: "(310) 555-0142" },
  },
  organization: { name: "OnTap Mobile Bars" },
};

export function ExampleInvoicePage() {
  const inv = exampleInvoice;
  const fmt = (n: number) => `$${n.toLocaleString()}`;
  const fd = (d: string) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const statusColor: Record<string, string> = {
    paid: "bg-green-500/10 text-green-400", sent: "bg-blue-500/10 text-blue-400",
    draft: "bg-warm-sand/10 text-warm-sand", overdue: "bg-red-500/10 text-red-400",
    cancelled: "bg-gray-500/10 text-gray-400", partial: "bg-yellow-500/10 text-yellow-400",
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-[#1A1A1A] border border-warm-sand/10 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-6 sm:p-8 border-b border-warm-sand/10 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-warm-white">Invoice</h1>
            <p className="text-warm-sand/60 text-sm mt-1">{inv.id}</p>
          </div>
          <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusColor[inv.status] || ""}`}>
            Sent
          </span>
        </div>
        <div className="p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-xs text-warm-sand/50 uppercase tracking-wider mb-1">From</p>
              <p className="text-sm font-medium text-warm-white">{inv.organization.name}</p>
            </div>
            <div>
              <p className="text-xs text-warm-sand/50 uppercase tracking-wider mb-1">Bill To</p>
              <p className="text-sm font-medium text-warm-white">{inv.event.contact.name}</p>
              <p className="text-xs text-warm-sand/60">{inv.event.contact.email}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-xs text-warm-sand/50 uppercase tracking-wider mb-1">Event</p>
              <p className="text-sm text-warm-white">{inv.event.name}</p>
              <p className="text-xs text-warm-sand/60">{inv.event.venue_name}</p>
            </div>
            <div>
              <p className="text-xs text-warm-sand/50 uppercase tracking-wider mb-1">Event Date</p>
              <p className="text-sm text-warm-white">{fd(inv.event.date)}</p>
              <p className="text-xs text-warm-sand/50 uppercase tracking-wider mt-2 mb-1">Due Date</p>
              <p className="text-sm text-warm-white">{fd(inv.due_date)}</p>
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
                  <td className="py-3 text-sm text-warm-white">Bar Services — {inv.event.name}</td>
                  <td className="py-3 text-sm text-right text-warm-white">{fmt(inv.amount)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="border-t border-warm-sand/10 pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-warm-sand/60">Subtotal</span>
              <span className="text-warm-white">{fmt(inv.amount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-warm-sand/60">Deposit Paid</span>
              <span className="text-green-400">-{fmt(inv.deposit_amount)}</span>
            </div>
            <div className="flex justify-between text-base font-bold pt-2 border-t border-warm-sand/10">
              <span className="text-warm-white">Balance Due</span>
              <span className="text-warm-white">{fmt(inv.balance_due)}</span>
            </div>
          </div>
        </div>
        <div className="p-6 border-t border-warm-sand/10 text-center bg-warm-sand/[0.02]">
          <p className="text-xs text-warm-sand/40">Powered by OnTap</p>
        </div>
      </div>
    </div>
  );
}
