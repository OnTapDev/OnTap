"use client";

export default function Error({
  error: _error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-charcoal px-4">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-bold text-warm-white mb-3">Something went wrong</h1>
        <p className="text-warm-sand mb-6">
          We could not set up your account. Please try again.
        </p>
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-olive-gold text-charcoal font-semibold hover:bg-olive-gold/90 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
