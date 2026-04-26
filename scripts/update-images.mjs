/**
 * Updates product images with real Kentelle CDN URLs.
 * Run: node scripts/update-images.mjs
 */

const SUPABASE_URL = "https://siwgptjhirmkabyjmddm.supabase.co";
const SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpd2dwdGpoaXJta2FieWptZGRtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTg3NTA4NiwiZXhwIjoyMDY3NDUxMDg2fQ.z13rLNF2aWzEKQ-GAhFqoGjBN37MFkXw3exJEbmfQKo";

const CDN = "https://kentelle.com/cdn/shop/files";

// Real Kentelle product images from their Shopify CDN
const IMAGES = {
  eye:       [`${CDN}/Kentelle_Beautiful_Eyes_Tenor_Sans.jpg`],
  peptide:   [`${CDN}/PeptideChonoFirmMatrix.png`],
  retinol:   [`${CDN}/DermaPeelBackRetinol.jpg`, `${CDN}/PeelBack.jpg`],
  glycol:    [`${CDN}/DermaGlycol_10_Serum.jpg`],
  moisture:  [`${CDN}/Kenntelle_Derma_Moisture_Fix.jpg`],
  pdrn:      [`${CDN}/PDRNPink.jpg`],
  general1:  [`${CDN}/20260324_093631.jpg`],
  general2:  [`${CDN}/20260416_112650.jpg`],
  general3:  [`${CDN}/20260416_113029.jpg`],
  general4:  [`${CDN}/20260416_113218.jpg`],
  general5:  [`${CDN}/20260416_113340.jpg`],
  general6:  [`${CDN}/20260416_115031_1.jpg`],
  general7:  [`${CDN}/20260416_121052_1.jpg`],
  general8:  [`${CDN}/20260420_113441.jpg`],
  general9:  [`${CDN}/20260420_133351.jpg`],
  general10: [`${CDN}/1000039779.jpg`],
  general11: [`${CDN}/1000046629_4fe38b13-b2a6-4847-9ed5-9e1ad3bcb982.jpg`],
  general12: [`${CDN}/1000046630.jpg`],
  general13: [`${CDN}/1000046632_360e9b90-816e-40c5-8168-6f1c231c1fab.jpg`],
  general14: [`${CDN}/IMG-20260226-WA0004_7431f00b-0c79-4baf-a834-6d7185381dc2.jpg`],
  general15: [`${CDN}/Screenshot2026-04-20135206.png`],
  general16: [`${CDN}/Screenshot_2026-04-20_152452.png`],
};

// Map each product slug to its image set
const PRODUCT_IMAGES = {
  "gentle-foam-cleanser":            IMAGES.general1,
  "micellar-cleansing-water":        IMAGES.general2,
  "oil-balancing-gel-cleanser":      IMAGES.general3,
  "vitamin-c-brightening-serum":     IMAGES.general4,
  "hyaluronic-acid-hydrating-serum": IMAGES.general5,
  "retinol-night-serum":             IMAGES.retinol,
  "niacinamide-zinc-serum":          IMAGES.general6,
  "peptide-complex-serum":           IMAGES.peptide,
  "hydra-boost-gel-moisturiser":     IMAGES.moisture,
  "rich-repair-night-cream":         IMAGES.general7,
  "daily-defence-spf50-moisturiser": IMAGES.general8,
  "ceramide-barrier-repair-moisturiser": IMAGES.general9,
  "bright-eyes-revitalising-eye-cream":  IMAGES.eye,
  "de-puff-eye-gel":                 IMAGES.eye,
  "balancing-rose-toner":            IMAGES.general10,
  "aha-bha-exfoliating-toner":       IMAGES.glycol,
  "mineral-spf50-sunscreen":         IMAGES.general11,
  "tinted-mineral-spf30":            IMAGES.general12,
  "kaolin-clay-purifying-mask":      IMAGES.general13,
  "hydrogel-sheet-mask-pack":        IMAGES.general14,
  "aha-resurfacing-face-mask":       IMAGES.general15,
  "enzyme-powder-exfoliator":        IMAGES.general16,
  "glycolic-acid-resurfacing-serum": IMAGES.glycol,
  "azelaic-acid-serum":              IMAGES.pdrn,
  "bakuchiol-firming-serum":         IMAGES.general1,
  "alpha-arbutin-brightening-serum": IMAGES.general2,
  "sensitive-skin-calming-serum":    IMAGES.general3,
  "soothing-centella-toner":         IMAGES.general4,
  "pro-aging-eye-concentrate":       IMAGES.eye,
  "brightening-eye-mask-patches":    IMAGES.eye,
  "skin-glow-starter-kit":           [...IMAGES.general5, ...IMAGES.general6],
};

const headers = {
  apikey: SERVICE_KEY,
  Authorization: `Bearer ${SERVICE_KEY}`,
  "Content-Type": "application/json",
  Prefer: "return=minimal",
};

let updated = 0;
let failed = 0;

for (const [slug, images] of Object.entries(PRODUCT_IMAGES)) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/Product?slug=eq.${encodeURIComponent(slug)}`,
    {
      method: "PATCH",
      headers,
      body: JSON.stringify({ images }),
    }
  );

  if (res.ok) {
    console.log(`✓ ${slug}`);
    updated++;
  } else {
    const err = await res.text();
    console.error(`✗ ${slug}: ${err}`);
    failed++;
  }
}

console.log(`\nDone: ${updated} updated, ${failed} failed`);
