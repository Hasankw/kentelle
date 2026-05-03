import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const categories = await db.category.findMany({ orderBy: { sortOrder: "asc" } });
  return NextResponse.json(categories);
}

export async function POST(req: NextRequest) {
  const { name, slug, description, tagline, image, sortOrder } = await req.json();
  const category = await db.category.create({
    data: {
      name,
      slug,
      description: description ?? null,
      tagline: tagline ?? null,
      image: image ?? null,
      sortOrder: sortOrder ?? 0,
    },
  });
  return NextResponse.json(category, { status: 201 });
}
