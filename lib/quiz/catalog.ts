// Condensed KENTELLE product reference used by the skin quiz recommendation
// engine. Sourced from the KENTELLE CATALOG sheet in QUIZ_Kentelle.xlsx —
// only the products actually referenced by the quiz question guide are
// listed here, grouped by the routine step they belong in.
//
// `slug` links a catalog entry to its real, active Product row in the shop
// (see scripts run against the production DB) so the results page can
// render a real shoppable ProductCard instead of a plain text line. Entries
// with no `slug` either aren't in the shop catalog yet or are inactive —
// those degrade to a plain text line in the results UI.

export type RoutineStep = "cleanser" | "toner" | "treatment" | "moisturiser" | "eye" | "special";

export type CatalogProduct = {
  id: string;
  name: string;
  step: RoutineStep;
  /** Flags this product carries so the safety engine can exclude it. */
  tags?: ("retinoid" | "aha" | "high-vitc")[];
  /** Slug of the matching real, active Product row — enables a shop card. */
  slug?: string;
};

export const CATALOG: CatalogProduct[] = [
  // Cleansers
  { id: "milk-cleanser", name: "KENTELLE Milk Cleanser", step: "cleanser", slug: "milk-cleanser" },
  { id: "ceramide-cleanser", name: "KENTELLE Ceramide Cleanser", step: "cleanser", slug: "ceramide-cleanser" },
  { id: "fruit-enzyme-cleanser", name: "KENTELLE Fruit Enzyme Cleanser", step: "cleanser", slug: "fruit-enzyme-cleanser" },
  { id: "glycolic-cleanser", name: "KENTELLE Glycolic 12% Cleanser", step: "cleanser", tags: ["aha"], slug: "g-biomed-skin-cleanser" },

  // Toners / mists
  { id: "vitamin-b-toner", name: "KENTELLE Vitamin B Facial Toner", step: "toner", slug: "vitamin-b-facial-toner" },
  { id: "relaxing-mist", name: "KENTELLE Relaxing & Comforting Mist", step: "toner", slug: "relaxing-comforting-mist" },

  // Treatments / serums / actives
  { id: "glyco-10", name: "KENTELLE Derma Glycolic 10 Serum", step: "treatment", tags: ["aha"], slug: "derma-glycolic-10-serum-ampoules" },
  { id: "retinal", name: "KENTELLE Peel Back De-Aging Retinal Serum 0.01", step: "treatment", tags: ["retinoid"], slug: "peel-back-de-aging-retinol-serum" },
  { id: "ummf-serum", name: "KENTELLE UMMF Correcting Serum", step: "treatment", slug: "ummf-correcting-serum" },
  { id: "bha-serum", name: "KENTELLE BHA Serum", step: "treatment" },
  { id: "vitamin-c-cream", name: "KENTELLE Vitamin C 20 Cream", step: "treatment", tags: ["high-vitc"], slug: "vitamin-c-20-cream" },
  { id: "cica-collagen-concentrate", name: "KENTELLE Cica Collagen Concentrate", step: "treatment", slug: "cica-collagen-concentrate" },
  { id: "cica-peptide-concentrate", name: "KENTELLE Cica Peptide Concentrate", step: "treatment", slug: "cica-peptide-concentrate" },
  { id: "copper-peptide", name: "KENTELLE Copper Peptide", step: "treatment" },
  { id: "chronofirm-peptide", name: "KENTELLE Chronofirm Peptide Matrix", step: "treatment", slug: "chonofirm-peptide-matrix-airpump" },
  { id: "pdrn-ampoules", name: "KENTELLE PDRN Pink Bio Cell Ampoules", step: "treatment", slug: "pdrn-pink-bio-cell-ampoules" },
  { id: "hyaluron-capsules", name: "KENTELLE Hyaluron Booster Capsules", step: "treatment", slug: "hyaluron-booster-capsules" },
  { id: "collagen-capsules", name: "KENTELLE Collagen Capsules", step: "treatment", slug: "collagen-capsules" },
  { id: "collagen-cream", name: "KENTELLE Collagen Cream", step: "treatment", slug: "collagen-cream" },
  { id: "cucumber-exosome", name: "KENTELLE Cucumber Exosome Essence", step: "treatment" },
  { id: "turmeric-exosome", name: "KENTELLE Turmeric Exosome Essence", step: "treatment" },
  { id: "lacto-exosome", name: "KENTELLE Lacto Exosome Essence", step: "treatment" },
  { id: "ginseng-exosome", name: "KENTELLE Ginseng Exosome Essence", step: "treatment" },

  // Barrier / moisture fix (sits between treatment and moisturiser)
  { id: "moisture-fix", name: "KENTELLE Derma Moisture Fix", step: "treatment", slug: "derma-moisture-fix" },
  { id: "bio-ferment-cream", name: "KENTELLE Bio-Ferment Barrier Cream", step: "moisturiser", slug: "bio-ferment-barrier-cream" },

  // Moisturisers
  { id: "daycare", name: "KENTELLE DayCare", step: "moisturiser", slug: "daycare" },
  { id: "day-beauty-radiance", name: "KENTELLE Day Beauty Radiance", step: "moisturiser", slug: "day-beauty-radiance" },
  { id: "nightcare", name: "KENTELLE Nightcare Moisturizer", step: "moisturiser", slug: "nightcare-moisturizer" },
  { id: "night-beauty-repair", name: "KENTELLE Night Beauty Repair", step: "moisturiser", slug: "night-beauty-repair" },
  { id: "aqua-moisturiser", name: "KENTELLE Aqua Moisturiser", step: "moisturiser", slug: "aqua-moisturiser" },

  // Eye
  { id: "beautiful-eyes-serum", name: "KENTELLE Beautiful Eyes Tenor Sans", step: "eye", slug: "beautiful-eyes-tenor-sans" },
];

export const CATALOG_BY_ID: Record<string, CatalogProduct> = Object.fromEntries(
  CATALOG.map((p) => [p.id, p]),
);

export const CORE_ROUTINE_IDS = {
  cleanser: "ceramide-cleanser",
  toner: "vitamin-b-toner",
  treatment: "moisture-fix",
  moisturiser: "daycare",
} as const;
