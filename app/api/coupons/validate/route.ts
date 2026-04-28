import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const { code, orderTotal } = await req.json();
  if (!code) return NextResponse.json({ error: "Code required" }, { status: 400 });

  const coupon = await db.coupon.findUnique({ where: { code: code.toUpperCase().trim() } });

  if (!coupon) return NextResponse.json({ error: "Invalid coupon code" }, { status: 404 });
  if (!coupon.isActive) return NextResponse.json({ error: "This coupon is no longer active" }, { status: 400 });
  if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
    return NextResponse.json({ error: "This coupon has expired" }, { status: 400 });
  }
  if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
    return NextResponse.json({ error: "This coupon has reached its usage limit" }, { status: 400 });
  }
  if (orderTotal < coupon.minOrder) {
    return NextResponse.json({
      error: `Minimum order of $${Number(coupon.minOrder).toFixed(2)} required for this coupon`,
    }, { status: 400 });
  }

  return NextResponse.json({
    code: coupon.code,
    type: coupon.type,
    value: coupon.value,
  });
}
