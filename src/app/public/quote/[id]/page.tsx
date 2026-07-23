import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function PublicQuotePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: quote } = await supabase
    .from("quotes")
    .select(`
      *,
      contact:contacts(name, email, phone),
      package:packages(name, description, base_price),
      organization:organizations(name, logo_url)
    `)
    .eq("id", id)
    .maybeSingle();

  if (!quote) notFound();

  const fmtCurrency = (n: number) => `$${n.toLocaleString()}`;
  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const statusColor: Record<string, string> = {
    accepted: "bg-green-500/10 text-green-400",
    sent: "bg-blue-500/10 text-blue-400",
    draft: "bg-warm-sand/10 text-warm-sand",
    rejected: "bg-red-500/10 text-red-400",
    expired: "bg-gray-500/10 text-gray-400",
  };

  const addOns = quote.add_ons as Record<string, number> | null;

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-[#1A1A1A] border border-warm-sand/10 rounded-2xl overflow-hidden">
        <div className="p-6 sm:p-8 border-b border-warm-sand/10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-warm-white">Quote</h1>
              <p className="text-warm-sand/60 text-sm mt-1">#{id.slice(0, 8).toUpperCase()}</p>
            </div>
            <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusColor[quote.status] || "bg-warm-sand/10 text-warm-sand"}`}>
              {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
            </span>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-xs text-warm-sand/50 uppercase tracking-wider mb-1">From</p>
              <p className="text-sm font-medium text-warm-white">{quote.organization?.name || "OnTap"}</p>
            </div>
            <div>
              <p className="text-xs text-warm-sand/50 uppercase tracking-wider mb-1">Prepared For</p>
              <p className="text-sm font-medium text-warm-white">{quote.contact?.name || "Client"}</p>
              {quote.contact?.email && (
                <p className="text-xs text-warm-sand/60">{quote.contact.email}</p>
              )}
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
                {quote.package && (
                  <tr>
                    <td className="py-3">
                      <p className="text-sm text-warm-white">{quote.package.name}</p>
                      {quote.package.description && (
                        <p className="text-xs text-warm-sand/60">{quote.package.description}</p>
                      )}
                    </td>
                    <td className="py-3 text-center text-sm text-warm-white">{quote.guest_count}</td>
                    <td className="py-3 text-right text-sm text-warm-white">{fmtCurrency(quote.package.base_price)}</td>
                  </tr>
                )}
                {addOns && Object.entries(addOns).length > 0 && (
                  <>
                    {Object.entries(addOns).map(([name, price]) => (
                      <tr key={name}>
                        <td className="py-2 text-sm text-warm-sand/80 pl-4">{name}</td>
                        <td></td>
                        <td className="py-2 text-right text-sm text-warm-sand/80">{fmtCurrency(price)}</td>
                      </tr>
                    ))}
                  </>
                )}
              </tbody>
            </table>
          </div>

          <div className="border-t border-warm-sand/10 pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-warm-sand/60">Subtotal</span>
              <span className="text-warm-white">{fmtCurrency(quote.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-warm-sand/60">Tax</span>
              <span className="text-warm-white">{fmtCurrency(quote.tax)}</span>
            </div>
            <div className="flex justify-between text-base font-bold pt-2 border-t border-warm-sand/10">
              <span className="text-warm-white">Total</span>
              <span className="text-warm-white">{fmtCurrency(quote.total)}</span>
            </div>
          </div>

          {quote.expires_at && (
            <p className="text-xs text-warm-sand/50 text-center pt-2">
              This quote expires on {fmtDate(quote.expires_at)}
            </p>
          )}
        </div>

        <div className="p-6 sm:p-8 border-t border-warm-sand/10 text-center">
          <p className="text-xs text-warm-sand/40">Powered by OnTap — The operating system for mobile bar operators</p>
        </div>
      </div>
    </div>
  );
}
