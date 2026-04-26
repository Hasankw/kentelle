import Link from "next/link";
import Image from "next/image";

// Generic skincare photography — editorial, warm-muted tones
const collections = [
  {
    name: "Cleansers",
    slug: "cleansers",
    tagline: "Fresh start, every day",
    image: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=600&q=85",
  },
  {
    name: "Serums",
    slug: "serums",
    tagline: "Target. Transform. Glow.",
    image: "https://images.unsplash.com/photo-1550159930-40066082a4fc?auto=format&fit=crop&w=600&q=85",
  },
  {
    name: "Moisturisers",
    slug: "moisturisers",
    tagline: "Hydration redefined",
    image: "https://images.unsplash.com/photo-1576426863848-c21f53c60b19?auto=format&fit=crop&w=600&q=85",
  },
  {
    name: "Eye Care",
    slug: "eye-care",
    tagline: "Bright eyes, every morning",
    image: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=600&q=85",
  },
  {
    name: "Toners",
    slug: "toners",
    tagline: "Balance and refine",
    image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=85",
  },
  {
    name: "Sun Care",
    slug: "sun-care",
    tagline: "Protected, all day",
    image: "https://images.unsplash.com/photo-1570194065650-d99fb4d8a609?auto=format&fit=crop&w=600&q=85",
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

            {/* Warm vintage tone */}
            <div
              className="absolute inset-0"
              style={{ background: "rgba(20,10,0,0.20)", mixBlendMode: "multiply" }}
            />

            {/* Bottom gradient for text */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0E1B4D]/90 via-[#0E1B4D]/20 to-transparent" />

            {/* Text */}
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
