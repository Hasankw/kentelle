export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import HeroCarousel from "@/components/home/HeroCarousel";
import TrustBadges from "@/components/home/TrustBadges";
import CollectionGrid from "@/components/home/CollectionGrid";
import SkinConcernNav from "@/components/home/SkinConcernNav";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import ReviewsBanner from "@/components/home/ReviewsBanner";
import FadeIn from "@/components/ui/FadeIn";

async function getFeaturedProducts() {
  try {
    return await db.product.findMany({
      where: { isActive: true, stock: { gt: 0 } },
      orderBy: { createdAt: "desc" },
      take: 8,
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        salePrice: true,
        images: true,
        stock: true,
      },
    });
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const products = await getFeaturedProducts();

  return (
    <>
      <HeroCarousel />
      <FadeIn><TrustBadges /></FadeIn>
      <FadeIn delay={0.05}><CollectionGrid /></FadeIn>
      <FadeIn delay={0.05}><FeaturedProducts products={products} title="Bestsellers" subtitle="Loved by thousands of Australian skin types" /></FadeIn>
      <FadeIn delay={0.05}><SkinConcernNav /></FadeIn>
      <FadeIn delay={0.05}><ReviewsBanner /></FadeIn>
    </>
  );
}
