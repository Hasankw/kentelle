import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const events = await db.featuredEvent.findMany({});
  const enriched = await Promise.all(
    events.map(async (e: any) => {
      const eps = await db.featuredEventProduct.findMany({ where: { eventId: e.id } });
      return { ...e, productCount: eps.length };
    })
  );
  return NextResponse.json(enriched);
}

export async function POST(req: NextRequest) {
  const { title, subtitle } = await req.json();
  if (!title?.trim()) return NextResponse.json({ error: "Title required" }, { status: 400 });
  const event = await db.featuredEvent.create({ data: { title: title.trim(), subtitle: subtitle?.trim() ?? null } });
  return NextResponse.json(event);
}
