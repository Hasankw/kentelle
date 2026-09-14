export const MOTHERS_DAY_BUNDLE = {
  // Promo ended — emptied instead of deleted so cart.ts/ProductCard/PDP
  // bundle-pricing code doesn't need touching if a future bundle promo reuses it.
  productIds: [] as string[],
  bundleQty: 2,
  bundlePrice: 120,
  unitPrice: 89,
  label: "Mother's Day Bundle",
  savingsPerPair: 58, // 2×89 − 120
};

export function isBundleProduct(productId: string): boolean {
  return MOTHERS_DAY_BUNDLE.productIds.includes(productId);
}
