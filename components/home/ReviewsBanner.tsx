import StarRating from "@/components/ui/StarRating";

interface Review { id: string; name: string; body: string; product: string; rating: number; }
interface BannerContent {
  tagline: string;
  title: string;
  ratingText: string;
  reviews: Review[];
}

const DEFAULTS: BannerContent = {
  tagline: "Real Results",
  title: "What Our Customers Say",
  ratingText: "4.9 from 2,400+ reviews",
  reviews: [
    { id: "1", name: "Sarah M.", body: "My skin has never looked better. The serum transformed my texture in just 3 weeks.", product: "Vitamin C Brightening Serum", rating: 5 },
    { id: "2", name: "Jessica L.", body: "Finally a moisturiser that doesn't clog my pores. I'm obsessed!", product: "Hydra-Boost Moisturiser", rating: 5 },
    { id: "3", name: "Amanda K.", body: "The cleanser leaves my skin feeling clean without that tight, dry feeling.", product: "Gentle Foam Cleanser", rating: 5 },
  ],
};

export default function ReviewsBanner({ content }: { content?: Partial<BannerContent> }) {
  const c: BannerContent = {
    tagline: content?.tagline ?? DEFAULTS.tagline,
    title: content?.title ?? DEFAULTS.title,
    ratingText: content?.ratingText ?? DEFAULTS.ratingText,
    reviews: content?.reviews?.length ? content.reviews : DEFAULTS.reviews,
  };

  return (
    <section className="py-16 px-4 bg-brand-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-xs font-heading font-bold tracking-widest uppercase text-brand-blue mb-2">
            {c.tagline}
          </p>
          <h2 className="font-heading font-bold text-3xl md:text-4xl text-brand-navy">
            {c.title}
          </h2>
          <div className="flex items-center justify-center gap-2 mt-3">
            <StarRating rating={5} size={18} />
            <span className="font-body text-sm text-brand-navy/70">{c.ratingText}</span>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {c.reviews.map((r) => (
            <div key={r.id} className="border border-brand-contrast/20 p-6 bg-brand-bg">
              <StarRating rating={r.rating} className="mb-3" />
              <p className="font-body text-sm text-brand-navy leading-relaxed mb-4 italic">
                &ldquo;{r.body}&rdquo;
              </p>
              <div>
                <p className="font-heading font-bold text-xs text-brand-navy">{r.name}</p>
                <p className="text-xs text-brand-contrast font-body">{r.product}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
