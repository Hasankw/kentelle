export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import HeroCarousel from "@/components/home/HeroCarousel";
import TrustBadges from "@/components/home/TrustBadges";
import CollectionGrid from "@/components/home/CollectionGrid";
import SkinConcernNav from "@/components/home/SkinConcernNav";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import EventSection from "@/components/home/EventSection";
import ReviewsBanner from "@/components/home/ReviewsBanner";
import FadeIn from "@/components/ui/FadeIn";

const PRODUCT_FIELDS = { id: true, name: true, slug: true, price: true, salePrice: true, images: true, stock: true, description: true };

async function getFeaturedProducts() {
  try {
    return await db.product.findMany({
      where: { isActive: true, stock: { gt: 0 } },
      orderBy: { createdAt: "desc" },
      take: 8,
      select: PRODUCT_FIELDS,
    });
  } catch {
    return [];
  }
}

async function getActiveEvents() {
  try {
    const events = await db.featuredEvent.findMany({ where: { enabled: true }, orderBy: { sortOrder: "asc" } });
    return await Promise.all(
      events.map(async (event: any) => {
        const eps = await db.featuredEventProduct.findMany({ where: { eventId: event.id }, orderBy: { sortOrder: "asc" } });
        const productIds = eps.map((ep: any) => ep.productId);
        const products = productIds.length > 0
          ? await db.product.findMany({ where: { id: productIds, isActive: true } })
          : [];
        return { ...event, products };
      })
    );
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const [products, events] = await Promise.all([getFeaturedProducts(), getActiveEvents()]);

  return (
    <>
      <HeroCarousel />
      <FadeIn><TrustBadges /></FadeIn>
      <FadeIn delay={0.05}><FeaturedProducts products={products as any} title="Bestsellers" subtitle="Loved by thousands of Australian skin types" /></FadeIn>
      {events.map((event: any) => (
        <FadeIn key={event.id} delay={0.05}>
          <EventSection title={event.title} subtitle={event.subtitle} products={event.products} />
        </FadeIn>
      ))}
      <FadeIn delay={0.05}><SkinConcernNav /></FadeIn>
      <FadeIn delay={0.05}><ReviewsBanner /></FadeIn>
    </>
  );
}
