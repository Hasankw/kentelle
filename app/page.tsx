export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import HeroCarousel from "@/components/home/HeroCarousel";
import TrustBadges from "@/components/home/TrustBadges";
import CollectionGrid from "@/components/home/CollectionGrid";
import SkinConcernNav from "@/components/home/SkinConcernNav";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import EventCollectionGrid from "@/components/home/EventCollectionGrid";
import ReviewsBanner from "@/components/home/ReviewsBanner";
import FadeIn from "@/components/ui/FadeIn";
import RoutinesSection from "@/components/home/RoutinesSection";

const PRODUCT_FIELDS = { id: true, name: true, slug: true, price: true, salePrice: true, images: true, stock: true, description: true };

async function getFeaturedProducts() {
  try {
    const rows = await db.content.findMany({ where: { key: "bestsellers" } });
    const ids: string[] = rows[0] ? JSON.parse(rows[0].value) : [];
    if (ids.length > 0) {
      const products = await db.product.findMany({
        where: { id: { in: ids }, isActive: true },
        select: PRODUCT_FIELDS,
      });
      return ids.map((id: string) => products.find((p: any) => p.id === id)).filter(Boolean);
    }
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
    if (!events.length) return { events: [], sectionTitle: "Our Special Offers", eventImages: {} };

    const contentRows = await db.content.findMany({
      where: { key: { in: ["events_section_title", "event_images"] } },
    });
    const contentMap = Object.fromEntries((contentRows as any[]).map((r: any) => [r.key, r.value]));
    const sectionTitle = contentMap.events_section_title ?? "Our Special Offers";
    const eventImages = contentMap.event_images ? JSON.parse(contentMap.event_images) : {};

    const eventsWithImages = events.map((e: any) => ({ ...e, image: eventImages[e.id] ?? null }));
    return { events: eventsWithImages, sectionTitle, eventImages };
  } catch {
    return { events: [], sectionTitle: "Our Special Offers", eventImages: {} };
  }
}

async function getCarouselSlides() {
  try {
    const rows = await db.content.findMany({ where: { key: "carousel_slides" } });
    if (rows[0]?.value) return JSON.parse(rows[0].value);
  } catch {}
  return undefined;
}

async function getTrustBadges() {
  try {
    const rows = await db.content.findMany({ where: { key: "trust_strip" } });
    if (rows[0]?.value) return JSON.parse(rows[0].value);
  } catch {}
  return undefined;
}

async function getRoutines() {
  try {
    const all = (await db.routine.findMany({
      where: { published: true },
      orderBy: { sortOrder: "asc" },
    })) as any[];
    return {
      routines: all.filter((r: any) => r.category === "routine"),
      clinical: all.filter((r: any) => r.category === "clinical"),
    };
  } catch {
    return { routines: [], clinical: [] };
  }
}

export default async function HomePage() {
  const [products, { events, sectionTitle }, { routines, clinical }, carouselSlides, trustBadges] = await Promise.all([
    getFeaturedProducts(),
    getActiveEvents(),
    getRoutines(),
    getCarouselSlides(),
    getTrustBadges(),
  ]);

  return (
    <>
      <HeroCarousel initialSlides={carouselSlides} />
      <FadeIn><TrustBadges initialBadges={trustBadges} /></FadeIn>
      {events.length > 0 && (
        <FadeIn delay={0.05}>
          <EventCollectionGrid events={events as any} sectionTitle={sectionTitle} />
        </FadeIn>
      )}
      <FadeIn delay={0.05}><FeaturedProducts products={products as any} title="Bestsellers" subtitle="Loved by thousands of Australian skin types" /></FadeIn>
      {(routines.length > 0 || clinical.length > 0) && (
        <FadeIn delay={0.05}><RoutinesSection routines={routines} clinical={clinical} /></FadeIn>
      )}
      <FadeIn delay={0.05}><SkinConcernNav /></FadeIn>
      <FadeIn delay={0.05}><ReviewsBanner /></FadeIn>
    </>
  );
}
