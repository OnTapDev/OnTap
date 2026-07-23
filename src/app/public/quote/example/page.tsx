"use client";

const exampleQuote = {
  id: "QTE-001",
  status: "sent",
  subtotal: 3200,
  tax: 160,
  total: 3360,
  guest_count: 150,
  expires_at: "2026-08-20",
  created_at: "2026-07-23",
  contact: { name: "Michael Chen", email: "michael@westsideweddings.com", phone: "(424) 555-0198" },
  package: { name: "Premium Bar Package", description: "Full-service bar with 3 bartenders, premium spirits, craft cocktails", base_price: 2800 },
  add_ons: { "Late Night Extension (1hr)": 300, "Signature Cocktail Menu Design": 100, "Extra Garnish Station": 0 },
  organization: { name: "OnTap Mobile Bars" },
};

export default function ExampleQuotePage() {
  const q = exampleQuote;
  const fmt = (n: number) => `$${n.toLocaleString()}`;
  const fd = (d: string) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const statusColor: Record<string, string> = {
    accepted: "bg-green-500/10 text-green-400", sent: "bg-blue-500/10 text-blue-400",
    draft: "bg-warm-sand/10 text-warm-sand", rejected: "bg-red-500/10 text-red-400",
    expired: "bg-gray-500/10 text-gray-400",
  };
  const addOns = q.add_ons as Record<string, number>;

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-[#1A1A1A] border border-warm-sand/10 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-6 sm:p-8 border-b border-warm-sand/10 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-warm-white">Quote</h1>
            <p className="text-warm-sand/60 text-sm mt-1">{q.id}</p>
          </div>
          <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusColor[q.status] || ""}`}>
            Sent
          </span>
        </div>
        <div className="p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-xs text-warm-sand/50 uppercase tracking-wider mb-1">From</p>
              <p className="text-sm font-medium text-warm-white">{q.organization.name}</p>
            </div>
            <div>
              <p className="text-xs text-warm-sand/50 uppercase tracking-wider mb-1">Prepared For</p>
              <p className="text-sm font-medium text-warm-white">{q.contact.name}</p>
              <p className="text-xs text-warm-sand/60">{q.contact.email}</p>
            </div>
          </div>

          <div className="border-t border-warm-sand/10 pt-4">
            <table className="w-full">
              <thead>
                <tr className="border-b border-warm-sand/10">
                  <th className="text-left pb-2 text-xs text-warm-sand/50 uppercase tracking-wider font-medium">Item</th>
                  <th className="text-center pb-2 text-xs text-warm-sand/50 uppercase tracking-wider font-medium">Guests</th>
                  <th className="text-right pb-2 text-xs text-warm-sand/50 uppercase tracking-wider font-medium">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="py-3">
                    <p className="text-sm text-warm-white">{q.package.name}</p>
                    <p className="text-xs text-warm-sand/60">{q.package.description}</p>
                  </td>
                  <td className="py-3 text-center text-sm text-warm-white">{q.guest_count}</td>
                  <td className="py-3 text-right text-sm text-warm-white">{fmt(q.package.base_price)}</td>
                </tr>
                {Object.entries(addOns).filter(([, p]) => p > 0).map(([name, price]) => (
                  <tr key={name}>
                    <td className="py-2 text-sm text-warm-sand/80 pl-4">{name}</td>
                    <td></td>
                    <td className="py-2 text-right text-sm text-warm-sand/80">{fmt(price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="border-t border-warm-sand/10 pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-warm-sand/60">Subtotal</span>
              <span className="text-warm-white">{fmt(q.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-warm-sand/60">Tax</span>
              <span className="text-warm-white">{fmt(q.tax)}</span>
            </div>
            <div className="flex justify-between text-base font-bold pt-2 border-t border-warm-sand/10">
              <span className="text-warm-white">Total</span>
              <span className="text-warm-white">{fmt(q.total)}</span>
            </div>
          </div>

          <p className="text-xs text-warm-sand/50 text-center pt-2">
            This quote expires on {fd(q.expires_at)}
          </p>
        </div>
        <div className="p-6 border-t border-warm-sand/10 text-center bg-warm-sand/[0.02]">
          <p className="text-xs text-warm-sand/40">Powered by OnTap</p>
        </div>
      </div>
    </div>
  );
}
