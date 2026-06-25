"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import StarRating from "@/components/ui/StarRating";

interface Review {
  id: string;
  name?: string;
  customerName?: string;
  body: string;
  product?: string;
  productName?: string;
  rating: number;
}

interface BannerContent {
  tagline: string;
  title: string;
  ratingText: string;
  reviews: Review[];
}

const FALLBACK_REVIEWS: Review[] = [
  { id: "1", name: "Sarah M.", body: "My skin has never looked better. The serum transformed my texture in just 3 weeks.", product: "Vitamin C Brightening Serum", rating: 5 },
  { id: "2", name: "Jessica L.", body: "Finally a moisturiser that doesn't clog my pores. I'm obsessed!", product: "Hydra-Boost Moisturiser", rating: 5 },
  { id: "3", name: "Amanda K.", body: "The cleanser leaves my skin feeling clean without that tight, dry feeling.", product: "Gentle Foam Cleanser", rating: 5 },
];

const PER_PAGE = 3;

export default function ReviewsBanner({
  content,
  approvedReviews,
}: {
  content?: Partial<BannerContent>;
  approvedReviews?: any[];
}) {
  const tagline = content?.tagline ?? "Real Results";
  const title = content?.title ?? "What Our Customers Say";
  const ratingText = content?.ratingText ?? "4.9 from 2,400+ reviews";

  // Normalise DB reviews to the internal shape
  const dbReviews: Review[] = (approvedReviews ?? []).map((r: any) => ({
    id: r.id,
    name: r.customerName,
    body: r.body,
    product: r.productName ?? "",
    rating: r.rating,
  }));

  const reviews = dbReviews.length > 0 ? dbReviews : FALLBACK_REVIEWS;
  const totalPages = Math.ceil(reviews.length / PER_PAGE);

  const [page, setPage] = useState(0);

  const prev = () => setPage((p) => (p - 1 + totalPages) % totalPages);
  const next = () => setPage((p) => (p + 1) % totalPages);

  const visible = reviews.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE);

  return (
    <section className="py-16 px-4 bg-brand-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-xs font-heading font-bold tracking-widest uppercase text-brand-blue mb-2">
            {tagline}
          </p>
          <h2 className="font-heading font-bold text-3xl md:text-4xl text-brand-navy">
            {title}
          </h2>
          <div className="flex items-center justify-center gap-2 mt-3">
            <StarRating rating={5} size={18} />
            <span className="font-body text-sm text-brand-navy/70">{ratingText}</span>
          </div>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {visible.map((r) => (
            <div key={r.id} className="border border-brand-contrast/20 p-6 bg-brand-bg">
              <StarRating rating={r.rating} className="mb-3" />
              <p className="font-body text-sm text-brand-navy leading-relaxed mb-4 italic">
                &ldquo;{r.body}&rdquo;
              </p>
              <div>
                <p className="font-heading font-bold text-xs text-brand-navy">
                  {r.name ?? r.customerName}
                </p>
                {(r.product || r.productName) && (
                  <p className="text-xs text-brand-contrast font-body">
                    {r.product ?? r.productName}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Navigation — only show if more than one page */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-10">
            <button
              onClick={prev}
              aria-label="Previous reviews"
              className="w-9 h-9 flex items-center justify-center border border-brand-contrast/30 text-brand-navy hover:border-brand-accent hover:text-brand-accent transition-colors rounded-full"
            >
              <ChevronLeft size={16} />
            </button>

            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i)}
                  aria-label={`Go to page ${i + 1}`}
                  className={`rounded-full transition-all duration-300 ${
                    i === page
                      ? "w-2.5 h-2.5 bg-brand-navy"
                      : "w-1.5 h-1.5 bg-brand-contrast/30 hover:bg-brand-navy/50"
                  }`}
                />
              ))}
            </div>

            <button
              onClick={next}
              aria-label="Next reviews"
              className="w-9 h-9 flex items-center justify-center border border-brand-contrast/30 text-brand-navy hover:border-brand-accent hover:text-brand-accent transition-colors rounded-full"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
