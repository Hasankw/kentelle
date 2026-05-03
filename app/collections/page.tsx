import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Collections | Kentelle",
  description: "Explore Kentelle's skincare collections — everyday essentials, peels, nutrients, accessories and professional products.",
};

const SLUGS = ["everyday-essentials","peel-and-glow","skin-nutrients","beauty-accessories","professional-use"];

const BANNERS: Record<string, string> = {
  "everyday-essentials": "/images/collections/col-1.jpg",
  "peel-and-glow": "/images/collections/col-2.jpg",
  "skin-nutrients": "/images/collections/col-3.jpg",
  "beauty-accessories": "/images/collections/col-4.jpg",
  "professional-use": "/images/collections/col-2.jpg",
};

export default async function CollectionsPage() {
  const all = await db.category.findMany({ orderBy: { sortOrder: "asc" } });
  const collections = all.filter((c: any) => SLUGS.includes(c.slug));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <div className="text-center mb-12">
        <p className="text-xs font-heading font-bold tracking-widest uppercase text-brand-blue mb-2">
          Browse by Collection
        </p>
        <h1 className="font-heading font-bold text-4xl text-brand-navy">
          Our Collections
        </h1>
        <p className="font-body text-sm text-brand-contrast mt-3 max-w-md mx-auto">
          Every Kentelle product belongs to a curated collection — find yours.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {collections.map((col: any) => (
          <Link
            key={col.slug}
            href={`/collections/${col.slug}`}
            className="group relative aspect-[4/3] overflow-hidden bg-brand-navy"
          >
            <Image
              src={col.image ?? BANNERS[col.slug] ?? "/images/collections/col-1.jpg"}
              alt={col.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700"
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
            <div className="absolute inset-0" style={{ background: "rgba(20,10,0,0.20)" }} />
            <div className="absolute inset-0 bg-gradient-to-t from-[#3A3240]/90 via-[#3A3240]/20 to-transparent" />

            <div className="absolute bottom-0 left-0 right-0 p-6">
              <p className="text-[10px] font-heading font-bold tracking-widest uppercase text-brand-accent mb-1">
                {col.tagline}
              </p>
              <h2 className="font-heading font-bold text-xl text-white mb-2">
                {col.name}
              </h2>
              {col.description && (
                <p className="text-xs text-white/60 font-body leading-relaxed line-clamp-2 mb-3">
                  {col.description}
                </p>
              )}
              <span className="inline-block text-[11px] font-heading font-bold tracking-widest uppercase text-white border-b border-white/40 pb-0.5 group-hover:border-white transition-all">
                Shop Collection →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
