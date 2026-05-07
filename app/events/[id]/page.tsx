export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import ProductCard from "@/components/store/ProductCard";
import AddBundleButton from "@/components/store/AddBundleButton";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Tag } from "lucide-react";

const PRODUCT_FIELDS = {
  id: true,
  name: true,
  slug: true,
  price: true,
  salePrice: true,
  images: true,
  stock: true,
  description: true,
};

export default async function EventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const event = await db.featuredEvent.findUnique({ where: { id } });
  if (!event || !(event as any).enabled) notFound();

  const [eps, contentRows] = await Promise.all([
    db.featuredEventProduct.findMany({ where: { eventId: id } }),
    db.content.findMany({ where: { key: { in: ["event_images", "event_offers"] } } }),
  ]);

  const contentMap = Object.fromEntries((contentRows as any[]).map((r: any) => [r.key, r.value]));
  const image = contentMap.event_images ? (JSON.parse(contentMap.event_images)[id] ?? null) : null;
  const offersMap = contentMap.event_offers ? JSON.parse(contentMap.event_offers) : {};
  const offers: any[] = offersMap[id] ?? [];

  const productIds = eps.map((ep: any) => ep.productId);
  const products =
    productIds.length > 0
      ? await db.product.findMany({
          where: { id: { in: productIds }, isActive: true },
          select: PRODUCT_FIELDS,
        })
      : [];

  const ordered = productIds
    .map((pid: string) => products.find((p: any) => p.id === pid))
    .filter(Boolean) as any[];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div
        className="relative h-48 md:h-64 flex items-end"
        style={
          image
            ? { backgroundImage: `url(${image})`, backgroundSize: "cover", backgroundPosition: "center" }
            : { background: "linear-gradient(135deg, #3A3240 0%, #4A3F52 100%)" }
        }
      >
        <div className="absolute inset-0 bg-gradient-to-t from-[#3A3240]/80 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pb-8 w-full">
          <Link href="/" className="inline-flex items-center gap-1.5 text-white/70 hover:text-white text-xs font-body mb-3 transition-colors">
            <ArrowLeft size={13} /> Back to home
          </Link>
          <h1 className="font-heading font-bold text-2xl md:text-4xl text-white uppercase tracking-wide">
            {(event as any).title}
          </h1>
          {(event as any).subtitle && (
            <p className="text-white/70 font-body text-sm mt-1">{(event as any).subtitle}</p>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        {/* Bundle Offers */}
        {offers.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-5">
              <Tag size={14} className="text-brand-accent" />
              <h2 className="font-heading font-bold text-sm uppercase tracking-widest text-brand-navy">
                Special Bundle Deals
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {offers.map((offer) => (
                <div
                  key={offer.id}
                  className="border border-brand-accent/40 rounded-lg overflow-hidden bg-white shadow-sm"
                >
                  {/* Product image */}
                  {offer.productImage && (
                    <div className="relative aspect-video overflow-hidden bg-brand-contrast/5">
                      <Image
                        src={offer.productImage}
                        alt={offer.productName}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                      <div className="absolute top-2 left-2 bg-brand-accent text-brand-navy text-[10px] font-heading font-bold uppercase tracking-wider px-2 py-1 rounded">
                        Save ${(offer.originalPrice - offer.bundlePrice).toFixed(0)}
                      </div>
                    </div>
                  )}

                  <div className="p-4">
                    <p className="font-heading font-bold text-sm text-brand-navy mb-0.5">
                      {offer.productName}
                    </p>
                    <p className="text-xs font-body text-brand-contrast mb-3">
                      Buy {offer.qty} for this special price
                    </p>

                    {/* Pricing */}
                    <div className="flex items-baseline gap-2 mb-4">
                      <span className="font-heading font-bold text-xl text-brand-navy">
                        ${offer.bundlePrice}
                      </span>
                      <span className="text-xs font-body text-brand-contrast line-through">
                        ${offer.originalPrice}
                      </span>
                      <span className="text-xs font-body text-brand-accent font-bold">
                        for {offer.qty}
                      </span>
                    </div>

                    <AddBundleButton
                      offerId={offer.id}
                      productId={offer.productId}
                      productName={offer.productName}
                      productSlug={offer.productSlug}
                      productImage={offer.productImage}
                      qty={offer.qty}
                      bundlePrice={offer.bundlePrice}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All products */}
        {ordered.length > 0 && (
          <>
            {offers.length > 0 && (
              <h2 className="font-heading font-bold text-sm uppercase tracking-widest text-brand-navy mb-5">
                All Products
              </h2>
            )}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {ordered.map((p: any) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </>
        )}

        {ordered.length === 0 && offers.length === 0 && (
          <div className="text-center py-24">
            <p className="text-brand-contrast font-body">No products in this event yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
