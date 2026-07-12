"use client";

import { useState } from "react";
import { Check, Loader2, Sparkles } from "lucide-react";

const FEATURES = [
  "CRM with contact management",
  "Quotes & proposals with e-signatures",
  "Contracts & invoicing",
  "Calendar & booking",
  "Client communication hub",
  "Staff management",
  "Analytics & KPIs",
  "Stripe payment processing",
  "Priority support",
];

type Props = {
  orgId: string;
  orgName: string;
};

export function SubscriptionClient({ orgId, orgName }: Props) {
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/create-subscription-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Failed to create subscription");
      }
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg w-full">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-olive-gold/20 mb-4">
          <Sparkles className="w-6 h-6 text-olive-gold" />
        </div>
        <h1 className="text-3xl font-bold text-warm-white mb-2">
          You&apos;re almost in
        </h1>
        <p className="text-warm-sand">
          Welcome to OnTap, <span className="text-warm-white font-medium">{orgName}</span>. Pick your plan to get started.
        </p>
      </div>

      <div className="bg-charcoal border border-warm-sand/20 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-warm-sand/20">
          <div className="flex items-baseline gap-1 mb-1">
            <span className="text-4xl font-bold text-warm-white">$99</span>
            <span className="text-warm-sand">/month</span>
          </div>
          <p className="text-sm text-warm-sand">Founding member rate — locked in forever</p>
        </div>

        <div className="p-6">
          <p className="text-warm-white font-medium mb-4">Everything you need to run your bar business:</p>
          <ul className="space-y-3">
            {FEATURES.map((feature) => (
              <li key={feature} className="flex items-start gap-3">
                <Check className="w-5 h-5 text-olive-gold flex-shrink-0 mt-0.5" />
                <span className="text-warm-sand text-sm">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="p-6 pt-0">
          <button
            onClick={handleSubscribe}
            disabled={loading}
            className="w-full bg-olive-gold text-charcoal py-3 rounded-lg font-semibold hover:bg-olive-gold/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Opening checkout...
              </>
            ) : (
              "Subscribe — $99/month"
            )}
          </button>
          <p className="text-xs text-warm-sand/60 text-center mt-3">
            Cancel anytime. No hidden fees.
          </p>
        </div>
      </div>
    </div>
  );
}
