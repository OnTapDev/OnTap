"use client";

import { useState } from "react";
import { CreditCard, Loader2 } from "lucide-react";

type Props = {
  invoiceId: string;
  balanceDue: number;
  canPay: boolean;
};

export function PayButton({ invoiceId, balanceDue, canPay }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePay = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/public/pay-invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || "Payment unavailable");
      }
    } catch {
      setError("Failed to connect to payment provider");
    } finally {
      setLoading(false);
    }
  };

  if (!canPay) return null;

  return (
    <div className="p-6 border-t border-warm-sand/10">
      <div className="flex flex-col items-center gap-3">
        <button
          onClick={handlePay}
          disabled={loading}
          className="w-full max-w-xs flex items-center justify-center gap-2 py-3 bg-olive-gold text-charcoal font-semibold rounded-xl hover:bg-olive-gold/90 disabled:opacity-50 transition-colors"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <CreditCard className="w-5 h-5" />
          )}
          {loading ? "Opening payment..." : `Pay $${balanceDue.toLocaleString()} — Card`}
        </button>
        {error && <p className="text-xs text-red-400">{error}</p>}
        <p className="text-xs text-warm-sand/40">Secure payment via Stripe</p>
      </div>
    </div>
  );
}
