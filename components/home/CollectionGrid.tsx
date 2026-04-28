import Link from "next/link";
import Image from "next/image";

const collections = [
  {
    name: "Cleansers",
    slug: "cleansers",
    tagline: "Fresh start, every day",
    image: "/images/collections/col-1.jpg",
  },
  {
    name: "Serums",
    slug: "serums",
    tagline: "Target. Transform. Glow.",
    image: "/images/collections/col-2.jpg",
  },
  {
    name: "Moisturisers",
    slug: "moisturisers",
    tagline: "Hydration redefined",
    image: "/images/collections/col-3.jpg",
  },
  {
    name: "Eye Care",
    slug: "eye-care",
    tagline: "Bright eyes, every morning",
    image: "/images/collections/col-4.jpg",
  },
  {
    name: "Toners",
    slug: "toners",
    tagline: "Balance and refine",
    image: "/images/library/lib-1.jpg",
  },
  {
    name: "Sun Care",
    slug: "sun-care",
    tagline: "Protected, all day",
    image: "/images/library/lib-2.jpg",
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
