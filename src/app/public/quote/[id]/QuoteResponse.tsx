"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X, Loader2 } from "lucide-react";
import { respondToQuote } from "@/modules/quotes/actions/publicQuote";

type Props = {
  quoteId: string;
  status: string;
  hasEvent: boolean;
};

export function QuoteResponse({ quoteId, status, hasEvent }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<"accept" | "reject" | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const canRespond = status === "draft" || status === "sent";
  if (!canRespond) return null;

  const handleRespond = async (action: "accept" | "reject") => {
    setLoading(action);
    setError("");
    setSuccess("");
    try {
      const result = await respondToQuote(quoteId, action);
      if (result.success) {
        setSuccess(result.message);
        router.refresh();
      } else {
        setError(result.message);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="p-6 sm:p-8 border-t border-warm-sand/10">
      <div className="flex flex-col items-center gap-3">
        <p className="text-sm text-warm-sand/80">
          {hasEvent
            ? "Accepting this quote will create an invoice for payment."
            : "Respond to this quote below."}
        </p>
        <div className="flex gap-3 w-full max-w-xs">
          <button
            onClick={() => handleRespond("reject")}
            disabled={loading !== null}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-warm-sand/10 text-warm-white font-semibold rounded-xl hover:bg-warm-sand/20 disabled:opacity-50 transition-colors"
          >
            {loading === "reject" ? <Loader2 className="w-5 h-5 animate-spin" /> : <X className="w-5 h-5" />}
            Decline
          </button>
          <button
            onClick={() => handleRespond("accept")}
            disabled={loading !== null}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-warm-gold text-charcoal font-semibold rounded-xl hover:bg-warm-gold/90 disabled:opacity-50 transition-colors"
          >
            {loading === "accept" ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
            Accept
          </button>
        </div>
        {success && <p className="text-xs text-green-400 text-center">{success}</p>}
        {error && <p className="text-xs text-red-400 text-center">{error}</p>}
      </div>
    </div>
  );
}