export type DiscountTier = {
  id: string;
  label: string | null;
  threshold: number;
  percent: number;
  active: boolean;
  sortOrder: number;
  eligibleCategoryIds: string[];
};

export type DiscountSettings = {
  enabled: boolean;
  combinableWithCoupons: boolean;
  freeShippingEligible: boolean;
};

export const DEFAULT_DISCOUNT_SETTINGS: DiscountSettings = {
  enabled: true,
  combinableWithCoupons: false,
  freeShippingEligible: true,
};

/** Highest active tier the given subtotal qualifies for, or null. Tiers with
 * eligibleCategoryIds set are skipped here — this computes the simple
 * whole-cart-subtotal case used by the storefront cart today. */
export function matchTier(subtotal: number, tiers: DiscountTier[]): DiscountTier | null {
  const eligible = tiers
    .filter((t) => t.active && t.eligibleCategoryIds.length === 0 && subtotal >= t.threshold)
    .sort((a, b) => b.threshold - a.threshold);
  return eligible[0] ?? null;
}

export function tierDiscountAmount(subtotal: number, tiers: DiscountTier[]): number {
  const tier = matchTier(subtotal, tiers);
  return tier ? subtotal * (tier.percent / 100) : 0;
}

/** "Spend another $X to unlock Y% off" — looks at the next tier up from
 * whichever one currently applies (or the first tier if none do yet). */
export function nextTierMessage(subtotal: number, tiers: DiscountTier[]): string | null {
  const whole = tiers.filter((t) => t.active && t.eligibleCategoryIds.length === 0).sort((a, b) => a.threshold - b.threshold);
  const next = whole.find((t) => subtotal < t.threshold);
  if (!next) return null;
  const remaining = next.threshold - subtotal;
  return `Spend another $${remaining.toFixed(2)} to unlock ${next.percent}% off.`;
}
