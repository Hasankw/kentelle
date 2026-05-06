import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: eventId } = await params;
  const { productId } = await req.json();
  if (!productId) return NextResponse.json({ error: "productId required" }, { status: 400 });

  // Prevent duplicates
  const existing = await db.featuredEventProduct.findMany({ where: { eventId, productId } });
  if (existing.length > 0) return NextResponse.json({ ok: true });

  await db.featuredEventProduct.create({ data: { eventId, productId } });
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: eventId } = await params;
  const { productId } = await req.json();
  await db.featuredEventProduct.delete({ where: { eventId, productId } });
  return NextResponse.json({ ok: true });
}
