import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// Public, read-only lookup used by the skin quiz results page to render
// real shoppable ProductCards for the recommended routine.
export async function GET(req: NextRequest) {
  const slugsParam = req.nextUrl.searchParams.get("slugs") ?? "";
  const slugs = [...new Set(slugsParam.split(",").map((s) => s.trim()).filter(Boolean))].slice(0, 50);
  if (!slugs.length) return NextResponse.json({ products: [] });

  const products = await db.product.findMany({
    where: { slug: { in: slugs }, isActive: true },
  });

  const minimal = (products as any[]).map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: p.price,
    salePrice: p.salePrice,
    images: p.images ?? [],
    stock: p.stock,
  }));

  return NextResponse.json({ products: minimal });
}
