import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const products = await db.product.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(products);
}

export async function POST(request: NextRequest) {
  const { name, slug, description, ingredients, howToUse, routine, cautions, price, salePrice, stock, isActive, images, categoryIds } = await request.json();

  const product = await db.product.create({
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
      categories: categoryIds?.length
        ? { connect: categoryIds.map((id: string) => ({ id })) }
        : undefined,
    },
  });

  return NextResponse.json(product, { status: 201 });
}
