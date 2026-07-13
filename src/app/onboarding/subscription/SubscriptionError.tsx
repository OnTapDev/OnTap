import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function SubscriptionError({ message }: { message: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-charcoal px-4">
      <div className="max-w-md text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/10 flex items-center justify-center">
          <span className="text-2xl">!</span>
        </div>
        <h1 className="text-2xl font-bold text-warm-white mb-3">Something went wrong</h1>
        <p className="text-warm-sand mb-6">{message}</p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/onboarding/subscription"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-olive-gold text-charcoal font-semibold hover:bg-olive-gold/90 transition-colors"
          >
            Try again
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-warm-sand/30 text-warm-white hover:bg-warm-sand/10 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Go home
          </Link>
        </div>
        <p className="text-xs text-warm-sand/40 mt-8">
          If this persists, contact OnTapInquiries@gmail.com
        </p>
      </div>
    </div>
  );
}
