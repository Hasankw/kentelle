import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Collections",
  description: "Shop Kentelle Skincare by collection.",
};

const collections = [
  { name: "Cleansers", slug: "cleansers", tagline: "Fresh start, every day", image: "/images/collection-cleansers.jpg", bg: "#4770DB" },
  { name: "Serums", slug: "serums", tagline: "Target. Transform. Glow.", image: "/images/collection-serums.jpg", bg: "#051D49" },
  { name: "Moisturisers", slug: "moisturisers", tagline: "Hydration redefined", image: "/images/collection-moisturisers.jpg", bg: "#0E1B4D" },
  { name: "Eye Care", slug: "eye-care", tagline: "Bright eyes, every morning", image: "/images/collection-eye.jpg", bg: "#4770DB" },
  { name: "Toners", slug: "toners", tagline: "Balance and refine", image: "/images/collection-toners.jpg", bg: "#051D49" },
  { name: "Sun Care", slug: "sun-care", tagline: "Protected, all day", image: "/images/collection-sun.jpg", bg: "#0E1B4D" },
];

export default function CollectionsPage() {
  return (
    <div>
      <section className="bg-brand-navy py-14 px-4 text-center">
        <p className="text-xs font-heading font-bold tracking-widest uppercase text-brand-blue mb-2">
          Shop by Collection
        </p>
        <h1 className="font-heading font-bold text-4xl text-brand-white">
          Your Routine Starts Here
        </h1>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {collections.map((col) => (
            <Link
              key={col.slug}
              href={`/collections/${col.slug}`}
              className="group relative aspect-[4/5] overflow-hidden"
              style={{ backgroundColor: col.bg }}
            >
              <Image
                src={col.image}
                alt={col.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 768px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/80 via-brand-navy/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
                <h2 className="font-heading font-bold text-sm md:text-base text-brand-white uppercase tracking-wider">
                  {col.name}
                </h2>
                <p className="text-xs text-brand-white/70 font-body mt-0.5 hidden md:block">
                  {col.tagline}
                </p>
                <span className="inline-block mt-2 text-xs font-heading font-bold tracking-widest uppercase text-brand-white border-b border-brand-white pb-0.5 group-hover:border-brand-blue group-hover:text-brand-blue transition-colors">
                  Shop →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
