import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const event = await db.featuredEvent.findUnique({ where: { id } });
  if (!event) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const eps = await db.featuredEventProduct.findMany({ where: { eventId: id } });
  const productIds = eps.map((ep: any) => ep.productId);
  const products = productIds.length > 0
    ? await db.product.findMany({ where: { id: productIds } })
    : [];

  return NextResponse.json({ ...event, products });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const data = await req.json();
  const event = await db.featuredEvent.update({ where: { id }, data });
  return NextResponse.json(event);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await db.featuredEventProduct.deleteMany({ where: { eventId: id } });
  await db.featuredEvent.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
