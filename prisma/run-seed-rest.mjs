/**
 * This script seeds data via the Supabase REST API (PostgREST),
 * bypassing the need for a direct database connection.
 * Run: node prisma/run-seed-rest.mjs
 */

import crypto from "crypto";
import { createHash } from "crypto";

const SUPABASE_URL = "https://siwgptjhirmkabyjmddm.supabase.co";
const SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpd2dwdGpoaXJta2FieWptZGRtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTg3NTA4NiwiZXhwIjoyMDY3NDUxMDg2fQ.z13rLNF2aWzEKQ-GAhFqoGjBN37MFkXw3exJEbmfQKo";

const headers = {
  "apikey": SERVICE_KEY,
  "Authorization": `Bearer ${SERVICE_KEY}`,
  "Content-Type": "application/json",
  "Prefer": "resolution=merge-duplicates,return=minimal",
};

function cuid() {
  return "c" + crypto.randomBytes(16).toString("hex").slice(0, 24);
}

async function upsert(table, data, onConflict) {
  const url = `${SUPABASE_URL}/rest/v1/${table}`;
  const params = onConflict ? `?on_conflict=${onConflict}` : "";
  const res = await fetch(url + params, {
    method: "POST",
    headers: { ...headers, "Prefer": "resolution=merge-duplicates,return=representation" },
    body: JSON.stringify(Array.isArray(data) ? data : [data]),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`${table} upsert failed: ${err}`);
  }
  return res.json();
}

const categories = [
  { id: cuid(), name: "Cleansers", slug: "cleansers", tagline: "Fresh start, every day", "sortOrder": 1 },
  { id: cuid(), name: "Serums", slug: "serums", tagline: "Target. Transform. Glow.", "sortOrder": 2 },
  { id: cuid(), name: "Moisturisers", slug: "moisturisers", tagline: "Hydration redefined", "sortOrder": 3 },
  { id: cuid(), name: "Eye Care", slug: "eye-care", tagline: "Bright eyes, every morning", "sortOrder": 4 },
  { id: cuid(), name: "Toners", slug: "toners", tagline: "Balance and refine", "sortOrder": 5 },
  { id: cuid(), name: "Sun Care", slug: "sun-care", tagline: "Protected, all day", "sortOrder": 6 },
  { id: cuid(), name: "Face Masks", slug: "face-masks", tagline: "Weekly reset for your skin", "sortOrder": 7 },
  { id: cuid(), name: "Exfoliators", slug: "exfoliators", tagline: "Reveal your glow", "sortOrder": 8 },
];

console.log("Checking Supabase connection...");
const check = await fetch(`${SUPABASE_URL}/rest/v1/`, { headers });
if (!check.ok) {
  console.error("Cannot reach Supabase API. Check your credentials.");
  process.exit(1);
}
console.log("✓ Connected to Supabase\n");

console.log("Seeding categories...");
const insertedCats = await upsert("Category", categories, "slug");
const catMap = Object.fromEntries((insertedCats || categories).map((c) => [c.slug, c.id]));

// Use pre-defined IDs for categories since we're inserting fresh
const categoryIds = Object.fromEntries(categories.map((c) => [c.slug, c.id]));

console.log(`✓ ${categories.length} categories seeded`);

console.log("\nSeeding skin concerns...");
const concerns = [
  { id: cuid(), name: "Acne & Breakouts", slug: "acne", sortOrder: 1 },
  { id: cuid(), name: "Anti-Ageing", slug: "anti-ageing", sortOrder: 2 },
  { id: cuid(), name: "Dark Spots", slug: "dark-spots", sortOrder: 3 },
  { id: cuid(), name: "Dry Skin", slug: "dry-skin", sortOrder: 4 },
  { id: cuid(), name: "Dullness", slug: "dullness", sortOrder: 5 },
  { id: cuid(), name: "Enlarged Pores", slug: "enlarged-pores", sortOrder: 6 },
  { id: cuid(), name: "Fine Lines", slug: "fine-lines", sortOrder: 7 },
  { id: cuid(), name: "Hydration", slug: "hydration", sortOrder: 8 },
  { id: cuid(), name: "Oily Skin", slug: "oily-skin", sortOrder: 9 },
  { id: cuid(), name: "Pigmentation", slug: "pigmentation", sortOrder: 10 },
  { id: cuid(), name: "Redness", slug: "redness", sortOrder: 11 },
  { id: cuid(), name: "Sensitive Skin", slug: "sensitive-skin", sortOrder: 12 },
  { id: cuid(), name: "Under Eye", slug: "under-eye", sortOrder: 13 },
  { id: cuid(), name: "Uneven Texture", slug: "uneven-texture", sortOrder: 14 },
  { id: cuid(), name: "Wrinkles", slug: "wrinkles", sortOrder: 15 },
];
await upsert("SkinConcern", concerns, "slug");
console.log(`✓ ${concerns.length} skin concerns seeded`);

console.log("\nSeeding products...");
const productData = [
  { name: "Gentle Foam Cleanser", slug: "gentle-foam-cleanser", price: 34.95, stock: 150, cats: ["cleansers"] },
  { name: "Micellar Cleansing Water", slug: "micellar-cleansing-water", price: 29.95, stock: 120, cats: ["cleansers"] },
  { name: "Oil Balancing Gel Cleanser", slug: "oil-balancing-gel-cleanser", price: 36.95, stock: 100, cats: ["cleansers"] },
  { name: "Vitamin C Brightening Serum", slug: "vitamin-c-brightening-serum", price: 59.95, salePrice: 49.95, stock: 80, cats: ["serums"] },
  { name: "Hyaluronic Acid Hydrating Serum", slug: "hyaluronic-acid-hydrating-serum", price: 54.95, stock: 95, cats: ["serums"] },
  { name: "Retinol Night Serum 0.3%", slug: "retinol-night-serum", price: 64.95, stock: 60, cats: ["serums"] },
  { name: "Niacinamide 10% + Zinc Serum", slug: "niacinamide-zinc-serum", price: 44.95, stock: 110, cats: ["serums"] },
  { name: "Peptide Complex Anti-Ageing Serum", slug: "peptide-complex-serum", price: 74.95, salePrice: 62.95, stock: 50, cats: ["serums"] },
  { name: "Hydra-Boost Gel Moisturiser", slug: "hydra-boost-gel-moisturiser", price: 49.95, stock: 130, cats: ["moisturisers"] },
  { name: "Rich Repair Night Cream", slug: "rich-repair-night-cream", price: 59.95, stock: 75, cats: ["moisturisers"] },
  { name: "Daily Defence SPF 50+ Moisturiser", slug: "daily-defence-spf50-moisturiser", price: 44.95, stock: 200, cats: ["moisturisers", "sun-care"] },
  { name: "Ceramide Barrier Repair Moisturiser", slug: "ceramide-barrier-repair-moisturiser", price: 54.95, stock: 90, cats: ["moisturisers"] },
  { name: "Bright Eyes Revitalising Eye Cream", slug: "bright-eyes-revitalising-eye-cream", price: 49.95, stock: 70, cats: ["eye-care"] },
  { name: "De-Puff Eye Gel", slug: "de-puff-eye-gel", price: 42.95, stock: 85, cats: ["eye-care"] },
  { name: "Balancing Rose Toner", slug: "balancing-rose-toner", price: 34.95, stock: 115, cats: ["toners"] },
  { name: "AHA/BHA Exfoliating Toner", slug: "aha-bha-exfoliating-toner", price: 39.95, salePrice: 34.95, stock: 65, cats: ["toners", "exfoliators"] },
  { name: "Mineral SPF 50+ Sunscreen", slug: "mineral-spf50-sunscreen", price: 39.95, stock: 180, cats: ["sun-care"] },
  { name: "Tinted Mineral SPF 30", slug: "tinted-mineral-spf30", price: 44.95, stock: 95, cats: ["sun-care"] },
  { name: "Kaolin Clay Purifying Mask", slug: "kaolin-clay-purifying-mask", price: 39.95, stock: 80, cats: ["face-masks"] },
  { name: "Hydrogel Sheet Mask Pack", slug: "hydrogel-sheet-mask-pack", price: 29.95, stock: 200, cats: ["face-masks"] },
  { name: "AHA Resurfacing Face Mask", slug: "aha-resurfacing-face-mask", price: 44.95, stock: 60, cats: ["face-masks", "exfoliators"] },
  { name: "Enzyme Powder Exfoliator", slug: "enzyme-powder-exfoliator", price: 42.95, salePrice: 37.95, stock: 70, cats: ["exfoliators"] },
  { name: "Glycolic Acid Resurfacing Serum", slug: "glycolic-acid-resurfacing-serum", price: 54.95, stock: 55, cats: ["serums", "exfoliators"] },
  { name: "Azelaic Acid 10% Serum", slug: "azelaic-acid-serum", price: 49.95, stock: 75, cats: ["serums"] },
  { name: "Bakuchiol Firming Serum", slug: "bakuchiol-firming-serum", price: 62.95, stock: 55, cats: ["serums"] },
  { name: "Alpha Arbutin Brightening Serum", slug: "alpha-arbutin-brightening-serum", price: 52.95, stock: 65, cats: ["serums"] },
  { name: "Sensitive Skin Calming Serum", slug: "sensitive-skin-calming-serum", price: 48.95, stock: 80, cats: ["serums"] },
  { name: "Soothing Centella Toner", slug: "soothing-centella-toner", price: 36.95, stock: 90, cats: ["toners"] },
  { name: "Pro-Aging Eye Concentrate", slug: "pro-aging-eye-concentrate", price: 64.95, stock: 45, cats: ["eye-care"] },
  { name: "Brightening Eye Mask Patches", slug: "brightening-eye-mask-patches", price: 34.95, stock: 160, cats: ["eye-care"] },
  { name: "Skin Glow Starter Kit", slug: "skin-glow-starter-kit", price: 89.95, salePrice: 74.95, stock: 40, cats: ["cleansers", "serums", "moisturisers"] },
];

const products = productData.map((p) => ({
  id: cuid(),
  name: p.name,
  slug: p.slug,
  price: p.price,
  salePrice: p.salePrice ?? null,
  stock: p.stock,
  images: [],
  isActive: true,
  updatedAt: new Date().toISOString(),
}));

await upsert("Product", products, "slug");
console.log(`✓ ${products.length} products seeded`);

// Seed the join table
console.log("\nLinking products to categories...");
const joins = [];
for (let i = 0; i < productData.length; i++) {
  const p = products[i];
  for (const catSlug of productData[i].cats) {
    const catId = categoryIds[catSlug];
    if (catId) joins.push({ A: catId, B: p.id });
  }
}
await upsert("_ProductCategories", joins, "A,B");
console.log(`✓ ${joins.length} product-category links seeded`);

console.log("\n🎉 All data seeded successfully!");
