export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import ProductCard from "@/components/store/ProductCard";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

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

  const eps = await db.featuredEventProduct.findMany({ where: { eventId: id } });
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

  const eventImage =
    (await db.content.findMany({ where: { key: "event_images" } }))[0]?.value;
  const images = eventImage ? JSON.parse(eventImage) : {};
  const image = images[id] ?? null;

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div
        className="relative h-48 md:h-64 flex items-end"
        style={
          image
            ? {
                backgroundImage: `url(${image})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : { background: "linear-gradient(135deg, #3A3240 0%, #4A3F52 100%)" }
        }
      >
        <div className="absolute inset-0 bg-gradient-to-t from-[#3A3240]/80 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pb-8 w-full">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-white/70 hover:text-white text-xs font-body mb-3 transition-colors"
          >
            <ArrowLeft size={13} /> Back to home
          </Link>
          <h1 className="font-heading font-bold text-2xl md:text-4xl text-white uppercase tracking-wide">
            {(event as any).title}
          </h1>
          {(event as any).subtitle && (
            <p className="text-white/70 font-body text-sm mt-1">
              {(event as any).subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Products */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <p className="text-xs font-body text-brand-contrast mb-8">
          {ordered.length} product{ordered.length !== 1 ? "s" : ""}
        </p>

        {ordered.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-brand-contrast font-body">No products in this event yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {ordered.map((p: any) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
