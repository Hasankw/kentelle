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

  const contentRows = await db.content.findMany({ where: { key: "event_images" } });
  const images = contentRows[0] ? JSON.parse(contentRows[0].value) : {};
  const image = images[id] ?? null;

  return NextResponse.json({ ...event, image, products });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const { image, ...eventData } = body;

  if (image !== undefined) {
    const rows = await db.content.findMany({ where: { key: "event_images" } });
    const images = rows[0] ? JSON.parse(rows[0].value) : {};
    if (image) images[id] = image;
    else delete images[id];
    await db.content.upsert({
      where: { key: "event_images" },
      update: { value: JSON.stringify(images) },
      create: { key: "event_images", value: JSON.stringify(images) },
    });
  }

  if (Object.keys(eventData).length > 0) {
    const event = await db.featuredEvent.update({ where: { id }, data: eventData });
    return NextResponse.json(event);
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await db.featuredEventProduct.deleteMany({ where: { eventId: id } });
  await db.featuredEvent.delete({ where: { id } });

  const rows = await db.content.findMany({ where: { key: "event_images" } });
  if (rows[0]) {
    const images = JSON.parse(rows[0].value);
    delete images[id];
    await db.content.upsert({
      where: { key: "event_images" },
      update: { value: JSON.stringify(images) },
      create: { key: "event_images", value: JSON.stringify(images) },
    });
  }

  return NextResponse.json({ ok: true });
}
