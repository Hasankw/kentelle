import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { title, slug, tagline, category, steps, tips, sortOrder, published } = await request.json();
  const routine = await db.routine.update({
    where: { id },
    data: {
      title,
      slug,
      tagline: tagline || null,
      category,
      steps: steps ?? [],
      tips: tips ?? null,
      sortOrder: sortOrder ?? 0,
      published: published !== false,
    },
  });
  return NextResponse.json(routine);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await db.routine.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
