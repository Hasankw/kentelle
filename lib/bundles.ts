export const MOTHERS_DAY_BUNDLE = {
  productIds: [
    "a177462a-6926-419c-9201-fe3f46211da2", // G Biomed Skin Cleanser
    "74b18878-fedb-4e05-a043-731938f98748",  // Derma Moisture Fix
  ],
  bundleQty: 2,
  bundlePrice: 120,
  unitPrice: 89,
  label: "Mother's Day Bundle",
  savingsPerPair: 58, // 2×89 − 120
};

export function isBundleProduct(productId: string): boolean {
  return MOTHERS_DAY_BUNDLE.productIds.includes(productId);
}
