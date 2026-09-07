import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AddRoutineToCart from "@/components/store/AddRoutineToCart";
import { db } from "@/lib/db";

export const metadata: Metadata = {
  title: "Adding Your Routine",
  robots: { index: false, follow: false },
};

// Landed on from the quiz result email's "Add My Prescribed Routine To
// Cart" button — takes the same product ids shown in that email's summary
// (one per prescription line, so a Day & Night product is never added
// twice) and adds them to the cart before redirecting there.
export default async function RoutineCartPage({
  searchParams,
}: {
  searchParams: Promise<{ ids?: string }>;
}) {
  const { ids: idsParam } = await searchParams;
  const ids = (idsParam ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  if (!ids.length) redirect("/shop");

  const products = await db.product.findMany({ where: { id: { in: ids }, isActive: true } });
  if (!products.length) redirect("/shop");

  return (
    <AddRoutineToCart
      products={(products as any[]).map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: p.price,
        salePrice: p.salePrice,
        images: p.images ?? [],
        categoryIds: (p.categories ?? []).map((c: any) => c.id),
      }))}
    />
  );
}
