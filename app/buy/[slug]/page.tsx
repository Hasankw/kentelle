import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import DirectCheckout from "@/components/store/DirectCheckout";
import { db } from "@/lib/db";

export const metadata: Metadata = {
  title: "Preparing Checkout",
  robots: { index: false, follow: false },
};

export default async function BuyProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await db.product.findUnique({ where: { slug, isActive: true } });

  if (!product || product.stock === 0) notFound();

  const requiresProfessionalAccess = product.categories?.some(
    (category: { slug: string }) => category.slug === "professional-use",
  );
  if (requiresProfessionalAccess) redirect(`/products/${encodeURIComponent(product.slug)}`);

  return (
    <DirectCheckout
      product={{
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        salePrice: product.salePrice,
        images: product.images ?? [],
      }}
    />
  );
}
