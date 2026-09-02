import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const tiers = await db.discountTier.findMany({ orderBy: { sortOrder: "asc" } });
  return NextResponse.json(tiers);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const tier = await db.discountTier.create({
    data: {
      label: body.label || null,
      threshold: Number(body.threshold) || 0,
      percent: Number(body.percent) || 0,
      active: body.active ?? true,
      sortOrder: body.sortOrder ?? 0,
      eligibleCategoryIds: body.eligibleCategoryIds ?? [],
    },
  });
  return NextResponse.json(tier);
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { id, ...data } = body;
  if (data.threshold != null) data.threshold = Number(data.threshold);
  if (data.percent != null) data.percent = Number(data.percent);
  const tier = await db.discountTier.update({ where: { id }, data });
  return NextResponse.json(tier);
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  await db.discountTier.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
