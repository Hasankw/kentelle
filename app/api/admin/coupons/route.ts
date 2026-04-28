import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const coupons = await db.coupon.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(coupons);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const coupon = await db.coupon.create({
    data: {
      code: body.code.toUpperCase().trim(),
      type: body.type,
      value: parseFloat(body.value),
      minOrder: parseFloat(body.minOrder ?? 0),
      maxUses: body.maxUses ? parseInt(body.maxUses) : null,
      usedCount: 0,
      isActive: true,
      expiresAt: body.expiresAt ? new Date(body.expiresAt).toISOString() : null,
    },
  });
  return NextResponse.json(coupon);
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const updated = await db.coupon.update({
    where: { id: body.id },
    data: { isActive: body.isActive },
  });
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  await db.coupon.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
