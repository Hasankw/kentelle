export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";
import { db } from "@/lib/db";
import ProductCard from "@/components/store/ProductCard";
import { ChevronRight } from "lucide-react";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await db.category.findUnique({ where: { slug } });
  if (!category) return { title: "Collection Not Found", robots: { index: false } };
  return {
    title: `${category.name} Skincare | Kentelle`,
    description: category.description ?? `Shop ${category.name} — professional-grade Australian skincare products from Kentelle. Cruelty-free, science-backed formulas.`,
    robots: { index: true, follow: true },
  };
}

const COLLECTION_ROUTINE: Record<string, string> = {
  "everyday-essentials": "/routines/everyday-essential",
  "peel-and-glow":       "/routines/peel-and-glow",
  "skin-nutrients":      "/routines/skin-nutrients",
};

const CATEGORY_BANNERS: Record<string, { bg: string; position: string }> = {
  "everyday-essentials": { bg: "/images/hero/hero-slide2.jpg", position: "object-center" },
  "peel-and-glow":       { bg: "/images/hero/hero-slide3.jpg", position: "object-center" },
  "skin-nutrients":      { bg: "/images/hero/hero-slide4.jpg", position: "object-center" },
  "beauty-accessories":  { bg: "/images/hero/hero-beauty-accessories.jpg", position: "object-center" },
  "professional-use":    { bg: "/images/hero/hero-professional-use.jpg", position: "object-center" },
  "cleansers":           { bg: "/images/hero/hero-slide1.png", position: "object-center" },
  "serums":              { bg: "/images/hero/hero-slide4.jpg", position: "object-center" },
  "moisturisers":        { bg: "/images/hero/hero-slide2.jpg", position: "object-center" },
  "face-masks":          { bg: "/images/hero/hero-slide3.jpg", position: "object-center" },
  "toners":              { bg: "/images/hero/hero-slide2.jpg", position: "object-center" },
  "eye-care":            { bg: "/images/hero/hero-slide2.jpg", position: "object-center" },
  "sun-care":            { bg: "/images/hero/hero-slide1.png", position: "object-center" },
};

export default async function CollectionPage({ params }: PageProps) {
  const { slug } = await params;

  const [category, products] = await Promise.all([
    db.category.findUnique({ where: { slug } }),
    db.product.findManyByCategory(slug, { orderBy: { name: "asc" } }),
  ]);

  if (!category) notFound();

  const banner = CATEGORY_BANNERS[slug] ?? { bg: "/images/collections/col-1.jpg", position: "object-center" };
  const routineHref = COLLECTION_ROUTINE[slug] ?? null;

  return (
    <div>
      {/* Category hero banner */}
      <div className="relative h-[280px] md:h-[380px] overflow-hidden">
        <Image
          src={(category as any).image ?? banner.bg}
          alt={(category as any).name}
          fill
          className={`object-cover ${banner.position}`}
          priority
          sizes="100vw"
        />
        <div
          className="absolute inset-0"
          style={{ background: "rgba(29,25,32,0.30)" }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(58,50,64,0.82) 0%, rgba(58,50,64,0.3) 50%, transparent 100%)",
          }}
        />
        <div className="relative z-10 h-full flex items-end justify-between px-6 md:px-16 pb-10 gap-6">
          {/* Left: category info */}
          <div>
            <nav className="flex items-center gap-1.5 mb-4 text-[11px] font-heading font-bold uppercase tracking-widest text-white/50">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <ChevronRight size={10} />
              <Link href="/shop" className="hover:text-white transition-colors">Shop</Link>
              <ChevronRight size={10} />
              <span className="text-white/80">{(category as any).name}</span>
            </nav>
            <p className="text-[10px] font-heading font-bold tracking-widest uppercase text-brand-accent mb-2">
              {(category as any).tagline}
            </p>
            <h1 className="font-heading font-bold text-3xl md:text-5xl text-white mb-2">
              {(category as any).name}
            </h1>
            {(category as any).description && (
              <p className="font-body text-sm text-white/70 max-w-lg leading-relaxed">
                {(category as any).description}
              </p>
            )}
          </div>

          {/* Right: View Routine button */}
          {routineHref && (
            <div className="shrink-0">
              <Link
                href={routineHref}
                className="inline-flex items-center gap-2 bg-brand-accent text-brand-navy px-5 py-3 text-xs font-heading font-bold uppercase tracking-widest hover:bg-brand-accent/85 transition-colors whitespace-nowrap"
              >
                View Routine →
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Products */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <p className="text-xs font-body text-brand-contrast">
            {products.length} product{products.length !== 1 ? "s" : ""}
          </p>
          <Link
            href="/shop"
            className="text-xs font-heading font-bold uppercase tracking-widest text-brand-blue hover:text-brand-navy transition-colors"
          >
            Shop All →
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-24">
            <p className="font-body text-sm text-brand-contrast mb-4">
              No products in this collection yet.
            </p>
            <Link
              href="/shop"
              className="inline-block px-8 py-3 bg-brand-navy text-white rounded text-xs font-heading font-bold uppercase tracking-widest hover:bg-brand-blue transition-colors"
            >
              Browse All Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((p: any) => (
              <ProductCard
                key={p.id}
                product={{
                  id: p.id,
                  name: p.name,
                  slug: p.slug,
                  price: p.price,
                  salePrice: p.salePrice,
                  images: p.images,
                  stock: p.stock,
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Browse other collections */}
      <OtherCollections currentSlug={slug} />
    </div>
  );
}

async function OtherCollections({ currentSlug }: { currentSlug: string }) {
  const [categories, [hiddenContent]] = await Promise.all([
    db.category.findMany({ orderBy: { sortOrder: "asc" } }),
    db.content.findMany({ where: { key: "collections:hidden" } }),
  ]);
  const hiddenSlugs: string[] = hiddenContent ? JSON.parse(hiddenContent.value) : [];
  const others = categories.filter((c: any) => c.slug !== currentSlug && !hiddenSlugs.includes(c.slug));
  if (!others.length) return null;

  const bannerMap: Record<string, string> = {
    "everyday-essentials": "/images/hero/hero-slide2.jpg",
    "peel-and-glow":       "/images/hero/hero-slide3.jpg",
    "skin-nutrients":      "/images/hero/hero-slide4.jpg",
    "beauty-accessories":  "/images/hero/hero-beauty-accessories.jpg",
    "professional-use":    "/images/hero/hero-professional-use.jpg",
    "cleansers":           "/images/hero/hero-slide1.png",
    "serums":              "/images/hero/hero-slide4.jpg",
    "moisturisers":        "/images/hero/hero-slide2.jpg",
    "face-masks":          "/images/hero/hero-slide3.jpg",
    "toners":              "/images/hero/hero-slide2.jpg",
    "eye-care":            "/images/hero/hero-slide2.jpg",
    "sun-care":            "/images/hero/hero-slide1.png",
  };

  return (
    <div className="border-t border-brand-contrast/10 py-14 px-4">
      <div className="max-w-7xl mx-auto">
        <h2 className="font-heading font-bold text-xl text-brand-navy mb-6 text-center">
          Explore Other Collections
        </h2>
        <div className="flex flex-wrap justify-center gap-3">
          {others.map((c: any) => (
            <Link
              key={c.slug}
              href={`/collections/${c.slug}`}
              className="group relative h-28 w-44 overflow-hidden rounded-[6px]"
            >
              <Image
                src={c.image ?? bannerMap[c.slug] ?? "/images/collections/col-1.jpg"}
                alt={c.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
                sizes="176px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#3A3240]/85 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <p className="font-heading font-bold text-xs text-white uppercase tracking-wider">
                  {c.name}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
