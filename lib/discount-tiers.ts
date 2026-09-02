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

export type DiscountableItem = {
  price: number;
  quantity: number;
  /** Category ids the item belongs to — items with no categoryIds only
   * count toward whole-basket (unscoped) tiers. */
  categoryIds?: string[];
};

function lineTotal(item: DiscountableItem): number {
  return item.price * item.quantity;
}

/** The subtotal a given tier's threshold/discount is measured against —
 * the whole basket for an unscoped tier, or just the items in its eligible
 * categories for a category-scoped tier. */
export function eligibleSubtotalForTier(items: DiscountableItem[], tier: DiscountTier): number {
  if (tier.eligibleCategoryIds.length === 0) {
    return items.reduce((sum, i) => sum + lineTotal(i), 0);
  }
  return items
    .filter((i) => i.categoryIds?.some((c) => tier.eligibleCategoryIds.includes(c)))
    .reduce((sum, i) => sum + lineTotal(i), 0);
}

/** The tier producing the largest discount the basket currently qualifies
 * for, or null. Each tier is measured against its own eligible subtotal
 * (whole basket, or just its eligible categories), so a category-scoped
 * tier and a whole-basket tier can be compared fairly by dollar saving. */
export function matchTier(items: DiscountableItem[], tiers: DiscountTier[]): DiscountTier | null {
  const qualifying = tiers
    .filter((t) => t.active)
    .map((t) => ({ tier: t, subtotal: eligibleSubtotalForTier(items, t) }))
    .filter(({ tier, subtotal }) => subtotal >= tier.threshold);
  if (!qualifying.length) return null;
  qualifying.sort((a, b) => b.subtotal * b.tier.percent - a.subtotal * a.tier.percent);
  return qualifying[0].tier;
}

export function tierDiscountAmount(items: DiscountableItem[], tiers: DiscountTier[]): number {
  const tier = matchTier(items, tiers);
  if (!tier) return 0;
  return eligibleSubtotalForTier(items, tier) * (tier.percent / 100);
}

/** "Spend another $X [on eligible items] to unlock Y% off" — looks at
 * whichever not-yet-qualified tier is closest to unlocking. */
export function nextTierMessage(items: DiscountableItem[], tiers: DiscountTier[]): string | null {
  const candidates = tiers
    .filter((t) => t.active)
    .map((t) => ({ tier: t, subtotal: eligibleSubtotalForTier(items, t) }))
    .filter(({ tier, subtotal }) => subtotal < tier.threshold)
    .map(({ tier, subtotal }) => ({ tier, remaining: tier.threshold - subtotal }))
    .sort((a, b) => a.remaining - b.remaining);
  if (!candidates.length) return null;
  const { tier, remaining } = candidates[0];
  const scope = tier.eligibleCategoryIds.length > 0 ? " on eligible items" : "";
  return `Spend another $${remaining.toFixed(2)}${scope} to unlock ${tier.percent}% off.`;
}
