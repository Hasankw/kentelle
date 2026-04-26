import Link from "next/link";
import Image from "next/image";

// Vintage, low-tone real human skincare photography from Unsplash
const collections = [
  {
    name: "Cleansers",
    slug: "cleansers",
    tagline: "Fresh start, every day",
    image: "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Serums",
    slug: "serums",
    tagline: "Target. Transform. Glow.",
    image: "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Moisturisers",
    slug: "moisturisers",
    tagline: "Hydration redefined",
    image: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Eye Care",
    slug: "eye-care",
    tagline: "Bright eyes, every morning",
    image: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Toners",
    slug: "toners",
    tagline: "Balance and refine",
    image: "https://images.unsplash.com/photo-1556228453-ba0a65c74b9c?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Sun Care",
    slug: "sun-care",
    tagline: "Protected, all day",
    image: "https://images.unsplash.com/photo-1530811761207-8d9d22f0a1f5?auto=format&fit=crop&w=600&q=80",
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
            key={col.slug}
            href={`/collections/${col.slug}`}
            className="group relative aspect-[4/5] overflow-hidden bg-brand-navy"
          >
            {/* Photo */}
            <Image
              src={col.image}
              alt={col.name}
              fill
              unoptimized
              className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
              sizes="(max-width: 768px) 50vw, 33vw"
            />

            {/* Vintage warm tone overlay */}
            <div
              className="absolute inset-0"
              style={{
                background: "rgba(160,130,110,0.22)",
                mixBlendMode: "multiply",
              }}
            />

            {/* Dark gradient for text legibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/85 via-brand-navy/15 to-transparent" />

            {/* Text */}
            <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5">
              <h3 className="font-heading font-bold text-sm md:text-base text-white uppercase tracking-wider">
                {col.name}
              </h3>
              <p className="text-xs text-white/65 font-body mt-0.5 hidden md:block">
                {col.tagline}
              </p>
              <span className="inline-block mt-2 text-[11px] font-heading font-bold tracking-widest uppercase text-white border-b border-white/40 pb-0.5 group-hover:border-brand-pink group-hover:text-brand-pink transition-colors">
                Shop →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
