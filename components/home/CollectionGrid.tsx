import Link from "next/link";
import Image from "next/image";

const collections = [
  {
    name: "Everyday Essentials",
    slug: "everyday-essentials",
    tagline: "Your daily ritual, perfected",
    image: "/images/collections/col-1.jpg",
  },
  {
    name: "Peel & Glow",
    slug: "peel-and-glow",
    tagline: "Reveal radiant, renewed skin",
    image: "/images/collections/col-2.jpg",
  },
  {
    name: "Skin Nutrients",
    slug: "skin-nutrients",
    tagline: "Nourish from within",
    image: "/images/collections/col-3.jpg",
  },
  {
    name: "Beauty Accessories",
    slug: "beauty-accessories",
    tagline: "Tools for your ritual",
    image: "/images/collections/col-4.jpg",
  },
  {
    name: "Professional Use",
    slug: "professional-use",
    tagline: "Clinical-grade formulas",
    image: "/images/collections/col-2.jpg",
    badge: "Under Construction",
  },
];

export default function CollectionGrid() {
  return (
    <section className="py-16 px-4 max-w-7xl mx-auto">
      <div className="text-center mb-10">
        <p className="text-xs font-heading font-bold tracking-widest uppercase text-brand-blue mb-2">
          Shop by Collection
        </p>
        <h2 className="font-heading font-bold text-3xl md:text-4xl text-brand-navy">
          Your Routine Starts Here
        </h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
        {collections.map((col) => (
          <Link
            key={col.name}
            href={`/collections/${col.slug}`}
            className="group relative aspect-[4/5] overflow-hidden bg-brand-navy"
          >
            <Image
              src={col.image}
              alt={col.name}
              fill
              className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
              sizes="(max-width: 768px) 50vw, 33vw"
            />

            <div
              className="absolute inset-0"
              style={{ background: "rgba(20,10,0,0.20)", mixBlendMode: "multiply" }}
            />

            <div className="absolute inset-0 bg-gradient-to-t from-[#3A3240]/90 via-[#3A3240]/20 to-transparent" />

            {(col as any).badge && (
              <div className="absolute top-3 right-3 px-2 py-1 bg-brand-accent text-brand-navy rounded text-[9px] font-heading font-bold uppercase tracking-widest">
                {(col as any).badge}
              </div>
            )}

            <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5">
              <h3 className="font-heading font-bold text-sm md:text-base text-white uppercase tracking-wider">
                {col.name}
              </h3>
              <p className="text-xs text-white/65 font-body mt-0.5 hidden md:block">
                {col.tagline}
              </p>
              <span className="inline-block mt-2 text-[11px] font-heading font-bold tracking-widest uppercase text-white border-b border-white/40 pb-0.5 group-hover:border-white group-hover:opacity-80 transition-all">
                Shop →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
