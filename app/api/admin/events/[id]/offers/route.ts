import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

const CONTENT_KEY = "event_offers";

async function getOffersMap(): Promise<Record<string, any[]>> {
  const rows = await db.content.findMany({ where: { key: CONTENT_KEY } });
  return rows[0] ? JSON.parse(rows[0].value) : {};
}

async function saveOffersMap(map: Record<string, any[]>) {
  await db.content.upsert({
    where: { key: CONTENT_KEY },
    update: { value: JSON.stringify(map) },
    create: { key: CONTENT_KEY, value: JSON.stringify(map) },
  });
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const map = await getOffersMap();
  return NextResponse.json(map[id] ?? []);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const offer = await req.json();
  offer.id = crypto.randomUUID();

  const map = await getOffersMap();
  map[id] = [...(map[id] ?? []), offer];
  await saveOffersMap(map);
  return NextResponse.json(offer);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { offerId } = await req.json();

  const map = await getOffersMap();
  map[id] = (map[id] ?? []).filter((o: any) => o.id !== offerId);
  await saveOffersMap(map);
  return NextResponse.json({ ok: true });
}
