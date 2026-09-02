import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { DEFAULT_DISCOUNT_SETTINGS } from "@/lib/discount-tiers";

export async function GET() {
  const row = await db.discountSettings.find();
  return NextResponse.json(row ?? { id: "singleton", ...DEFAULT_DISCOUNT_SETTINGS });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const row = await db.discountSettings.update({
    data: {
      enabled: body.enabled,
      combinableWithCoupons: body.combinableWithCoupons,
      freeShippingEligible: body.freeShippingEligible,
    },
  });
  return NextResponse.json(row);
}
