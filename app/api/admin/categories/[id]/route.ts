import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const { name, slug, tagline, description, image, sortOrder } = body;

  const data: Record<string, unknown> = {};
  if (name !== undefined) data.name = name;
  if (slug !== undefined) data.slug = slug;
  if (tagline !== undefined) data.tagline = tagline ?? null;
  if (description !== undefined) data.description = description ?? null;
  if (image !== undefined) data.image = image ?? null;
  if (sortOrder !== undefined) data.sortOrder = Number(sortOrder);

  const category = await db.category.update({ where: { id }, data });
  return NextResponse.json(category);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await db.category.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
