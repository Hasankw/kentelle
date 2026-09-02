import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { DEFAULT_DISCOUNT_SETTINGS } from "@/lib/discount-tiers";

// Public — consumed by the storefront cart to compute the automatic
// basket-value discount and the "spend $X more" messaging.
export async function GET() {
  const [tiers, settingsRow] = await Promise.all([
    db.discountTier.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
    db.discountSettings.find(),
  ]);
  const settings = settingsRow
    ? {
        enabled: settingsRow.enabled,
        combinableWithCoupons: settingsRow.combinableWithCoupons,
        freeShippingEligible: settingsRow.freeShippingEligible,
      }
    : DEFAULT_DISCOUNT_SETTINGS;
  return NextResponse.json({ tiers: settings.enabled ? tiers : [], settings });
}
