export const dynamic = "force-dynamic";

import { Metadata } from "next";
import { db } from "@/lib/db";
import StarRating from "@/components/ui/StarRating";
import ReviewSubmitForm from "@/components/store/ReviewSubmitForm";

export const metadata: Metadata = {
  title: "Reviews",
  description: "Real reviews from Kentelle customers.",
};

export default async function ReviewsPage() {
  const reviews = await db.review.findMany({
    where: { approved: true },
    orderBy: { createdAt: "desc" },
  });

  const avg = reviews.length
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  const dist = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));

  return (
    <div>
      <section className="bg-brand-navy py-16 px-4 text-center">
        <p className="text-xs font-heading font-bold tracking-widest uppercase text-brand-blue mb-2">
          Customer Reviews
        </p>
        <h1 className="font-heading font-bold text-4xl text-brand-white mb-3">
          Real Results, Real People
        </h1>
        {reviews.length > 0 && (
          <div className="flex items-center justify-center gap-3 mt-4">
            <StarRating rating={Math.round(avg)} size={20} />
            <span className="font-heading font-bold text-2xl text-brand-white">{avg.toFixed(1)}</span>
            <span className="font-body text-sm text-brand-white/60">({reviews.length} reviews)</span>
          </div>
        )}
      </section>

      <div className="max-w-5xl mx-auto px-4 py-16 grid md:grid-cols-3 gap-12">
        {/* Sidebar: breakdown + submit form */}
        <div className="md:col-span-1 space-y-8">
          {reviews.length > 0 && (
            <div>
              <h2 className="font-heading font-bold text-sm uppercase tracking-wider text-brand-navy mb-4">
                Rating Breakdown
              </h2>
              <div className="space-y-2">
                {dist.map(({ star, count }) => (
                  <div key={star} className="flex items-center gap-2">
                    <span className="text-xs font-body text-brand-contrast w-4">{star}</span>
                    <div className="flex-1 h-2 bg-brand-contrast/10">
                      <div
                        className="h-full bg-brand-blue"
                        style={{ width: reviews.length ? `${(count / reviews.length) * 100}%` : "0%" }}
                      />
                    </div>
                    <span className="text-xs font-body text-brand-contrast w-4">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <h2 className="font-heading font-bold text-sm uppercase tracking-wider text-brand-navy mb-4">
              Write a Review
            </h2>
            <ReviewSubmitForm />
          </div>
        </div>

        {/* Reviews list */}
        <div className="md:col-span-2">
          {reviews.length === 0 ? (
            <p className="font-body text-brand-contrast py-10 text-center">
              No reviews yet — be the first!
            </p>
          ) : (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="border-b border-brand-contrast/10 pb-6 last:border-none">
                  <div className="flex items-center gap-3 mb-2">
                    <StarRating rating={review.rating} size={14} />
                    <span className="font-heading font-bold text-xs text-brand-navy uppercase tracking-wider">
                      {review.customerName}
                    </span>
                    {review.productName && (
                      <span className="text-xs text-brand-contrast font-body">· {review.productName}</span>
                    )}
                    <span className="ml-auto text-xs text-brand-contrast font-body">
                      {new Date(review.createdAt).toLocaleDateString("en-AU")}
                    </span>
                  </div>
                  <p className="font-body text-sm text-brand-navy/80 leading-relaxed">{review.body}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
