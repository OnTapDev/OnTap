"use client";

import { useState, useEffect } from "react";
import { CheckCircle, Loader2 } from "lucide-react";

type Props = {
  orgId: string;
};

export function ProcessingClient({ orgId }: Props) {
  const [checking, setChecking] = useState(true);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      while (!cancelled) {
        try {
          const res = await fetch("/api/onboarding/check-subscription", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orgId }),
          });
          const data = await res.json();

          if (data.active) {
            if (!cancelled) {
              setConfirmed(true);
              setChecking(false);
              setTimeout(() => {
                window.location.href = "/dashboard";
              }, 1500);
            }
            return;
          }
        } catch {
          // retry
        }

        await new Promise((r) => setTimeout(r, 2000));
      }
    }

    poll();

    return () => {
      cancelled = true;
    };
  }, [orgId]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
      {confirmed ? (
        <>
          <div className="w-20 h-20 rounded-full bg-olive-gold/20 flex items-center justify-center animate-bounce">
            <CheckCircle className="w-10 h-10 text-olive-gold" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-warm-white mb-2">
              You&apos;re all set!
            </h2>
            <p className="text-warm-sand">
              Taking you to your dashboard...
            </p>
          </div>
        </>
      ) : (
        <>
          <div className="relative">
            <div className="w-20 h-20 rounded-full border-4 border-warm-sand/10 border-t-olive-gold animate-spin" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-warm-white mb-2">
              Setting up your workspace
            </h2>
            <p className="text-warm-sand">
              We&apos;re getting everything ready. Just a moment...
            </p>
            {checking && (
              <p className="text-xs text-warm-sand/60 mt-4">
                Confirming your payment...
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
