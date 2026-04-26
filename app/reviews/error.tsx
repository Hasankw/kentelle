"use client";

export default function ReviewsError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="max-w-5xl mx-auto px-4 py-20 text-center">
      <h2 className="font-heading font-bold text-2xl text-brand-navy mb-3">Something went wrong</h2>
      <p className="font-body text-sm text-brand-contrast mb-6">
        We couldn&apos;t load the reviews. Please try again.
      </p>
      <button
        onClick={reset}
        className="px-6 py-2.5 bg-brand-navy text-brand-white text-xs font-heading font-bold uppercase tracking-widest hover:bg-brand-blue transition-colors"
      >
        Try Again
      </button>
    </div>
  );
}
