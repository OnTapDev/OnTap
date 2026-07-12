"use client";

import { useState, useEffect } from "react";
import { Check, Loader2, ArrowLeft, Star, Crown } from "lucide-react";
import Link from "next/link";

type Props = {
  clerkId: string;
  email: string;
  name: string;
};

type Plan = "pro" | "enterprise";

const TIERS = [
  {
    id: "pro" as Plan,
    name: "Pro",
    price: "$20",
    period: "/month",
    originalPrice: "$79",
    badge: "Founding Member",
    description: "Everything you need to run your bar business. Founding member pricing locked in forever.",
    features: [
      "Unlimited CRM & contacts",
      "Quotes & e-signatures",
      "Unlimited contracts & invoicing",
      "Full calendar & booking",
      "Staff management",
      "Analytics & KPIs",
      "Stripe payment processing",
      "Priority support",
    ],
    icon: Star,
    color: "from-olive-gold/20 to-charcoal",
    border: "border-olive-gold/50 hover:border-olive-gold",
    buttonStyle: "bg-olive-gold text-charcoal hover:bg-olive-gold/90 font-semibold",
    popular: true,
  },
  {
    id: "enterprise" as Plan,
    name: "Enterprise",
    price: "$199",
    period: "/month",
    description: "For established operations with custom needs.",
    features: [
      "Everything in Pro",
      "Multiple locations",
      "Custom branding & white label",
      "Dedicated account manager",
      "Custom integrations",
      "API access",
      "SLA guarantee",
      "24/7 phone support",
    ],
    icon: Crown,
    color: "from-warm-sand/10 to-charcoal",
    border: "border-warm-sand/20 hover:border-warm-sand/40",
    buttonStyle: "border border-warm-sand/30 text-warm-white hover:bg-warm-sand/10",
  },
];

export function SubscriptionClient({ clerkId, email, name }: Props) {
  const [loading, setLoading] = useState(false);
  const [resolving, setResolving] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [orgId, setOrgId] = useState<string | null>(null);
  const [orgName, setOrgName] = useState("");

  useEffect(() => {
    async function resolveOrg() {
      try {
        const res = await fetch("/api/onboarding/resolve-org", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ clerkId, email, name }),
        });
        const data = await res.json();
        if (data.redirect) {
          window.location.href = data.redirect;
          return;
        }
        if (data.orgId) {
          setOrgId(data.orgId);
          setOrgName(data.orgName || name);
        }
      } catch {
        // retry not needed
      } finally {
        setResolving(false);
      }
    }
    resolveOrg();
  }, [clerkId, email, name]);

  const handleSelect = async (plan: Plan) => {
    setSelectedPlan(plan);
    setLoading(true);

    try {
      if (plan === "enterprise") {
        window.location.href = "mailto:OnTapInquiries@gmail.com?subject=Enterprise%20Plan%20Inquiry";
        setLoading(false);
        setSelectedPlan(null);
        return;
      }

      const resolvedRes = await fetch("/api/onboarding/resolve-org", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clerkId, email, name }),
      });
      const resolvedData = await resolvedRes.json();
      const resolvedOrgId = resolvedData.orgId || orgId;

      if (!resolvedOrgId) {
        alert("Failed to set up your account. Please try again.");
        setLoading(false);
        setSelectedPlan(null);
        return;
      }

      const checkoutRes = await fetch("/api/stripe/create-subscription-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgId: resolvedOrgId }),
      });
      const checkoutData = await checkoutRes.json();
      if (checkoutData.url) {
        window.location.href = checkoutData.url;
      } else {
        alert(checkoutData.error || "Failed to create subscription");
        setLoading(false);
        setSelectedPlan(null);
      }
    } catch {
      alert("Something went wrong. Please try again.");
      setLoading(false);
      setSelectedPlan(null);
    }
  };

  if (resolving) {
    return (
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 text-olive-gold animate-spin" />
        <p className="text-warm-sand">Setting up your account...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-warm-sand hover:text-warm-white text-sm mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>
        <h1 className="text-4xl md:text-5xl font-bold text-warm-white mb-4">
          Welcome to OnTap{orgName ? `, ${orgName}` : ""}
        </h1>
        <p className="text-lg text-warm-sand max-w-2xl mx-auto">
          You&apos;re early. Lock in founding member pricing before we go public.
          This rate stays with your account forever.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-3xl mx-auto">
        {TIERS.map((tier) => {
          const Icon = tier.icon;
          const isSelected = selectedPlan === tier.id;
          const isLoading = isSelected && loading;

          return (
            <div
              key={tier.id}
              className={`relative flex flex-col rounded-2xl border ${tier.border} bg-gradient-to-b ${tier.color} p-6 lg:p-8 transition-all duration-300 ${tier.popular ? "scale-105 lg:scale-110" : ""}`}
            >
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-olive-gold text-charcoal text-xs font-bold px-4 py-1 rounded-full">
                  MOST POPULAR
                </div>
              )}

              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tier.popular ? "bg-olive-gold/30" : "bg-warm-sand/10"}`}>
                  <Icon className={`w-5 h-5 ${tier.popular ? "text-olive-gold" : "text-warm-sand"}`} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-warm-white">{tier.name}</h3>
                  {tier.badge && (
                    <span className="text-xs text-olive-gold font-medium">{tier.badge}</span>
                  )}
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-warm-white">{tier.price}</span>
                  <span className="text-warm-sand">{tier.period}</span>
                </div>
                {tier.originalPrice && (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-warm-sand/60 line-through">{tier.originalPrice}</span>
                    <span className="text-xs bg-olive-gold/20 text-olive-gold px-2 py-0.5 rounded-full font-medium">
                      Limited time
                    </span>
                  </div>
                )}
                <p className="text-sm text-warm-sand/80 mt-2">{tier.description}</p>
              </div>

              <div className="flex-1 mb-6">
                <ul className="space-y-3">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className={`w-4 h-4 flex-shrink-0 mt-0.5 ${tier.popular ? "text-olive-gold" : "text-warm-sand"}`} />
                      <span className="text-sm text-warm-sand">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => handleSelect(tier.id)}
                disabled={isLoading}
                className={`w-full py-3 rounded-xl text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${tier.buttonStyle}`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {tier.id === "pro" ? "Opening checkout..." : "Setting up..."}
                  </>
                ) : tier.id === "enterprise" ? (
                  "Contact sales"
                ) : (
                  `Subscribe — ${tier.price}${tier.period}`
                )}
              </button>
            </div>
          );
        })}
      </div>

      <p className="text-center text-xs text-warm-sand/60 mt-8">
        Founding member pricing locked in forever. Cancel anytime. No hidden fees.
      </p>
    </div>
  );
}
