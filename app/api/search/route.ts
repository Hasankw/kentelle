import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  const limit = Math.min(
    parseInt(req.nextUrl.searchParams.get("limit") ?? "12"),
    24
  );

  if (!q || q.length < 2) {
    return NextResponse.json({ products: [] });
  }

  const products = await db.product.findMany({
    where: {
      isActive: true,
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { categories: { some: { name: { contains: q, mode: "insensitive" } } } },
      ],
    },
    take: limit,
    select: {
      id: true,
      name: true,
      slug: true,
      price: true,
      salePrice: true,
      images: true,
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ products });
}
