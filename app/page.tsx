export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import HeroCarousel from "@/components/home/HeroCarousel";
import TrustBadges from "@/components/home/TrustBadges";
import CollectionGrid from "@/components/home/CollectionGrid";
import SkinConcernNav from "@/components/home/SkinConcernNav";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import ReviewsBanner from "@/components/home/ReviewsBanner";

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
      <TrustBadges />
      <CollectionGrid />
      <FeaturedProducts
        products={products}
        title="Bestsellers"
        subtitle="Loved by thousands of Australian skin types"
      />
      <SkinConcernNav />
      <ReviewsBanner />
    </>
  );
}
