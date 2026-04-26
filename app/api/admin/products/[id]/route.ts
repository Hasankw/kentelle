import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { name, slug, description, ingredients, howToUse, routine, cautions, price, salePrice, stock, isActive, images, categoryIds } = await request.json();

  const existing = await db.product.findUnique({
    where: { id },
    include: { categories: { select: { id: true } } },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const existingCategoryIds = existing.categories.map((c) => c.id);
  const toConnect = (categoryIds ?? []).filter((cid: string) => !existingCategoryIds.includes(cid));
  const toDisconnect = existingCategoryIds.filter((cid) => !(categoryIds ?? []).includes(cid));

  const product = await db.product.update({
    where: { id },
    data: {
      name,
      slug,
      description: description || null,
      ingredients: ingredients || null,
      howToUse: howToUse || null,
      routine: routine || null,
      cautions: cautions || null,
      price: Number(price),
      salePrice: salePrice ? Number(salePrice) : null,
      stock: Number(stock),
      isActive: !!isActive,
      images: images ?? [],
      categories: {
        connect: toConnect.map((cid: string) => ({ id: cid })),
        disconnect: toDisconnect.map((cid: string) => ({ id: cid })),
      },
    },
  });

  return NextResponse.json(product);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await db.product.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
