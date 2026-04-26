"use client";

export default function ShopError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-20 text-center">
      <h2 className="font-heading font-bold text-2xl text-brand-navy mb-3">Something went wrong</h2>
      <p className="font-body text-sm text-brand-contrast mb-6">
        We couldn&apos;t load the shop. Please try again.
      </p>
      <button
        onClick={reset}
        className="px-6 py-2.5 bg-brand-accent text-brand-navy text-xs font-heading font-bold uppercase tracking-widest hover:bg-brand-accent/85 transition-colors"
      >
        Try Again
      </button>
    </div>
  );
}
