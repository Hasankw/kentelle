import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const db = new PrismaClient({ adapter });

const categories = [
  { name: "Cleansers", slug: "cleansers", tagline: "Fresh start, every day", sortOrder: 1 },
  { name: "Serums", slug: "serums", tagline: "Target. Transform. Glow.", sortOrder: 2 },
  { name: "Moisturisers", slug: "moisturisers", tagline: "Hydration redefined", sortOrder: 3 },
  { name: "Eye Care", slug: "eye-care", tagline: "Bright eyes, every morning", sortOrder: 4 },
  { name: "Toners", slug: "toners", tagline: "Balance and refine", sortOrder: 5 },
  { name: "Sun Care", slug: "sun-care", tagline: "Protected, all day", sortOrder: 6 },
  { name: "Face Masks", slug: "face-masks", tagline: "Weekly reset for your skin", sortOrder: 7 },
  { name: "Exfoliators", slug: "exfoliators", tagline: "Reveal your glow", sortOrder: 8 },
];

const products = [
  {
    name: "Gentle Foam Cleanser",
    slug: "gentle-foam-cleanser",
    description: "A soft, pH-balanced foam cleanser that removes impurities without stripping the skin's natural moisture barrier. Suitable for sensitive and combination skin types.",
    ingredients: "Aqua, Cocamidopropyl Betaine, Glycerin, Niacinamide, Aloe Vera Leaf Extract, Panthenol, Allantoin, Sodium Hyaluronate",
    howToUse: "Apply a small amount to damp skin. Massage gently in circular motions. Rinse thoroughly with lukewarm water. Use morning and evening.",
    price: 34.95,
    stock: 150,
    categories: ["cleansers"],
  },
  {
    name: "Micellar Cleansing Water",
    slug: "micellar-cleansing-water",
    description: "A gentle, no-rinse cleansing water that removes makeup, dirt, and SPF effectively. Leaves skin fresh, clean, and hydrated.",
    ingredients: "Aqua, Hexylene Glycol, Glycerin, Poloxamer 184, Disodium EDTA, Rosa Damascena Flower Water",
    howToUse: "Apply to a cotton pad and sweep across face, eyes, and lips. No rinsing needed. Use morning and evening.",
    price: 29.95,
    stock: 120,
    categories: ["cleansers"],
  },
  {
    name: "Oil Balancing Gel Cleanser",
    slug: "oil-balancing-gel-cleanser",
    description: "A refreshing gel cleanser formulated for oily and acne-prone skin. Contains salicylic acid to clear pores and reduce breakouts.",
    ingredients: "Aqua, Salicylic Acid 2%, Niacinamide, Tea Tree Leaf Oil, Zinc PCA, Panthenol",
    howToUse: "Apply to damp skin and massage gently. Rinse with water. Use morning and evening.",
    price: 36.95,
    stock: 100,
    categories: ["cleansers"],
  },
  {
    name: "Vitamin C Brightening Serum",
    slug: "vitamin-c-brightening-serum",
    description: "A potent 15% Vitamin C serum that targets dark spots, uneven skin tone, and boosts radiance. Formulated with stabilised ascorbic acid for maximum effectiveness.",
    ingredients: "Ascorbic Acid 15%, Niacinamide 3%, Ferulic Acid, Hyaluronic Acid, Vitamin E, Rose Hip Oil",
    howToUse: "Apply 3–4 drops to clean, dry skin. Gently press into skin. Follow with moisturiser. Use in the morning. Always wear SPF after application.",
    price: 59.95,
    salePrice: 49.95,
    stock: 80,
    categories: ["serums"],
  },
  {
    name: "Hyaluronic Acid Hydrating Serum",
    slug: "hyaluronic-acid-hydrating-serum",
    description: "A lightweight serum with multi-molecular hyaluronic acid that penetrates deep into the skin to deliver intense, lasting hydration. Plumps and smooths fine lines.",
    ingredients: "Aqua, Sodium Hyaluronate, Sodium Hyaluronate Crosspolymer, Pentylene Glycol, Ceramide NP, Allantoin",
    howToUse: "Apply 4–5 drops to damp skin morning and evening before moisturiser for best results.",
    price: 54.95,
    stock: 95,
    categories: ["serums"],
  },
  {
    name: "Retinol Night Serum 0.3%",
    slug: "retinol-night-serum",
    description: "A gentle yet effective 0.3% retinol serum that accelerates cell turnover, reduces fine lines, and improves skin texture while you sleep.",
    ingredients: "Retinol 0.3%, Squalane, Niacinamide, Peptide Complex, Shea Butter, Jojoba Oil",
    howToUse: "Apply 2–3 drops to clean skin in the evening. Begin with every 2–3 nights, gradually increasing frequency. Always use SPF during the day.",
    cautions: "Avoid during pregnancy. Keep away from eyes. Introduce gradually. Always wear SPF.",
    price: 64.95,
    stock: 60,
    categories: ["serums"],
  },
  {
    name: "Niacinamide 10% + Zinc Serum",
    slug: "niacinamide-zinc-serum",
    description: "A targeted treatment combining 10% Niacinamide and 1% Zinc PCA to visibly reduce blemishes, minimise pores, and regulate sebum production.",
    ingredients: "Niacinamide 10%, Zinc PCA 1%, Aqua, Glycerin, Pentylene Glycol, Sodium Hyaluronate",
    howToUse: "Apply a few drops to clean skin before heavier serums and moisturisers. Can be used morning and evening.",
    price: 44.95,
    stock: 110,
    categories: ["serums"],
  },
  {
    name: "Peptide Complex Anti-Ageing Serum",
    slug: "peptide-complex-serum",
    description: "A powerful multi-peptide formula that firms, lifts, and smooths the appearance of fine lines and wrinkles for visibly younger-looking skin.",
    ingredients: "Matrixyl 3000, Argireline, Leuphasyl, Syn-Ake, Hyaluronic Acid, Vitamin C, Retinyl Palmitate",
    howToUse: "Apply 3–4 drops morning and evening to clean skin. Gently press into skin. Follow with moisturiser.",
    price: 74.95,
    salePrice: 62.95,
    stock: 50,
    categories: ["serums"],
  },
  {
    name: "Hydra-Boost Gel Moisturiser",
    slug: "hydra-boost-gel-moisturiser",
    description: "A lightweight, oil-free gel moisturiser that provides 48-hour hydration without clogging pores. Perfect for oily, combination, and sensitive skin types.",
    ingredients: "Aqua, Glycerin, Niacinamide, Hyaluronic Acid, Aloe Vera, Centella Asiatica Extract, Ceramides",
    howToUse: "Apply to clean skin morning and evening. Layer under SPF in the morning.",
    price: 49.95,
    stock: 130,
    categories: ["moisturisers"],
  },
  {
    name: "Rich Repair Night Cream",
    slug: "rich-repair-night-cream",
    description: "A luxurious, deeply nourishing night cream with peptides and retinyl palmitate that repairs and regenerates skin overnight.",
    ingredients: "Shea Butter, Squalane, Retinyl Palmitate, Peptide Complex, Ceramides, Jojoba Seed Oil, Glycerin",
    howToUse: "Apply a generous amount to clean skin in the evening. Massage gently until absorbed.",
    price: 59.95,
    stock: 75,
    categories: ["moisturisers"],
  },
  {
    name: "Daily Defence SPF 50+ Moisturiser",
    slug: "daily-defence-spf50-moisturiser",
    description: "A lightweight, broad-spectrum SPF 50+ moisturiser that protects against UVA/UVB rays while hydrating and priming skin for makeup.",
    ingredients: "Zinc Oxide, Titanium Dioxide, Niacinamide, Hyaluronic Acid, Vitamin E, Green Tea Extract",
    howToUse: "Apply liberally to face and neck 20 minutes before sun exposure. Reapply every 2 hours.",
    price: 44.95,
    stock: 200,
    categories: ["moisturisers", "sun-care"],
  },
  {
    name: "Ceramide Barrier Repair Moisturiser",
    slug: "ceramide-barrier-repair-moisturiser",
    description: "A dermatologist-recommended moisturiser packed with ceramides and cholesterol to restore the skin's natural barrier function.",
    ingredients: "Ceramide NP, Ceramide AP, Ceramide EOP, Cholesterol, Fatty Acids, Hyaluronic Acid, Glycerin",
    howToUse: "Apply to face and neck morning and evening after serums.",
    price: 54.95,
    stock: 90,
    categories: ["moisturisers"],
  },
  {
    name: "Bright Eyes Revitalising Eye Cream",
    slug: "bright-eyes-revitalising-eye-cream",
    description: "A targeted eye cream that reduces dark circles, puffiness, and fine lines around the delicate eye area. Peptides and caffeine work together for visible results.",
    ingredients: "Caffeine 2%, Peptide Complex, Hyaluronic Acid, Vitamin K, Retinyl Palmitate, Ceramides",
    howToUse: "Apply a pea-sized amount around the eye area morning and evening using ring finger.",
    price: 49.95,
    stock: 70,
    categories: ["eye-care"],
  },
  {
    name: "De-Puff Eye Gel",
    slug: "de-puff-eye-gel",
    description: "A cooling, lightweight eye gel that instantly reduces puffiness and refreshes tired eyes. Ideal for mornings or after screen time.",
    ingredients: "Caffeine 3%, Peptide Complex, Aloe Vera, Green Tea Extract, Hyaluronic Acid, Cucumber Extract",
    howToUse: "Apply gently around the eye area. Store in the refrigerator for enhanced de-puffing effect.",
    price: 42.95,
    stock: 85,
    categories: ["eye-care"],
  },
  {
    name: "Balancing Rose Toner",
    slug: "balancing-rose-toner",
    description: "A hydrating, alcohol-free toner with rose water and niacinamide that balances skin's pH, tightens pores, and preps skin for serums.",
    ingredients: "Rosa Damascena Flower Water, Niacinamide 3%, Hyaluronic Acid, Glycerin, Aloe Vera, Green Tea Extract",
    howToUse: "After cleansing, apply to a cotton pad or press directly onto skin. Follow with serum and moisturiser.",
    price: 34.95,
    stock: 115,
    categories: ["toners"],
  },
  {
    name: "AHA/BHA Exfoliating Toner",
    slug: "aha-bha-exfoliating-toner",
    description: "A gentle chemical exfoliant with 5% AHA and 2% BHA that smooths texture, unclogs pores, and improves skin tone without irritation.",
    ingredients: "Lactic Acid 5%, Salicylic Acid 2%, Mandelic Acid 1%, Glycolic Acid 0.5%, Glycerin, Niacinamide",
    howToUse: "Apply to clean skin using a cotton pad, avoiding the eye area. Do not rinse. Use 2–3 times per week. Always follow with SPF.",
    cautions: "Avoid during pregnancy. May increase sun sensitivity — always wear SPF.",
    price: 39.95,
    salePrice: 34.95,
    stock: 65,
    categories: ["toners", "exfoliators"],
  },
  {
    name: "Mineral SPF 50+ Sunscreen",
    slug: "mineral-spf50-sunscreen",
    description: "A 100% mineral, reef-safe broad-spectrum SPF 50+ sunscreen suitable for sensitive skin. Lightweight, non-greasy, and leaves no white cast.",
    ingredients: "Zinc Oxide 20%, Titanium Dioxide 5%, Squalane, Aloe Vera, Vitamin E, Green Tea Extract",
    howToUse: "Apply generously 20 minutes before sun exposure. Reapply every 2 hours or after swimming.",
    price: 39.95,
    stock: 180,
    categories: ["sun-care"],
  },
  {
    name: "Tinted Mineral SPF 30",
    slug: "tinted-mineral-spf30",
    description: "A universal tinted mineral SPF that blends seamlessly into all skin tones while protecting from sun damage. Double duty as primer and SPF.",
    ingredients: "Zinc Oxide 15%, Iron Oxides, Titanium Dioxide, Squalane, Vitamin E, Niacinamide",
    howToUse: "Apply to face and neck 20 minutes before sun exposure. Reapply every 2 hours.",
    price: 44.95,
    stock: 95,
    categories: ["sun-care"],
  },
  {
    name: "Kaolin Clay Purifying Mask",
    slug: "kaolin-clay-purifying-mask",
    description: "A deep-pore cleansing mask with kaolin and bentonite clay that draws out impurities, minimises pores, and mattifies oily skin. Result: clearer, smoother skin.",
    ingredients: "Kaolin, Bentonite, Salicylic Acid 1%, Tea Tree Leaf Oil, Niacinamide, Aloe Vera",
    howToUse: "Apply a thin layer to clean skin, avoiding eyes. Leave for 10–15 minutes until partially dry. Rinse off with warm water. Use 1–2 times per week.",
    price: 39.95,
    stock: 80,
    categories: ["face-masks"],
  },
  {
    name: "Hydrogel Sheet Mask Pack",
    slug: "hydrogel-sheet-mask-pack",
    description: "A pack of 5 premium hydrogel sheet masks infused with hyaluronic acid, ceramides, and collagen for an instant plumping, hydrating boost.",
    ingredients: "Sodium Hyaluronate, Ceramide NP, Hydrolysed Collagen, Glycerin, Niacinamide, Rose Water",
    howToUse: "Apply to clean face, leave for 20–30 minutes, remove and pat in remaining essence.",
    price: 29.95,
    stock: 200,
    categories: ["face-masks"],
  },
  {
    name: "AHA Resurfacing Face Mask",
    slug: "aha-resurfacing-face-mask",
    description: "A weekly resurfacing treatment mask with 10% glycolic acid and lactic acid to smooth texture, fade dark spots, and reveal brighter skin.",
    ingredients: "Glycolic Acid 10%, Lactic Acid 3%, Kaolin, Aloe Vera, Ceramides, Hyaluronic Acid",
    howToUse: "Apply to clean, dry skin. Leave for 10 minutes. Rinse thoroughly. Use once a week. Always follow with SPF next morning.",
    cautions: "Avoid during pregnancy. May cause tingling — normal. Discontinue if irritation persists.",
    price: 44.95,
    stock: 60,
    categories: ["face-masks", "exfoliators"],
  },
  {
    name: "Enzyme Powder Exfoliator",
    slug: "enzyme-powder-exfoliator",
    description: "A gentle enzymatic exfoliator in powder form that activates with water to reveal smooth, radiant skin without physical scrubbing.",
    ingredients: "Papain (Papaya Enzyme), Bromelain (Pineapple Enzyme), Rice Powder, Niacinamide, Oat Extract",
    howToUse: "Mix a small amount with water to form a paste. Massage gently onto damp skin. Rinse after 60 seconds. Use 2–3 times per week.",
    price: 42.95,
    salePrice: 37.95,
    stock: 70,
    categories: ["exfoliators"],
  },
  {
    name: "Glycolic Acid Resurfacing Serum",
    slug: "glycolic-acid-resurfacing-serum",
    description: "A targeted glycolic acid serum at 10% concentration that dramatically improves skin texture, fades pigmentation, and boosts cell renewal.",
    ingredients: "Glycolic Acid 10%, Lactic Acid 2%, Niacinamide, Aloe Vera, Hyaluronic Acid, Green Tea Extract",
    howToUse: "Apply 2–3 drops to clean skin in the evening. Begin with every other night. Always wear SPF during the day.",
    cautions: "Do not use with retinol on the same evening. Avoid during pregnancy. Always wear SPF.",
    price: 54.95,
    stock: 55,
    categories: ["serums", "exfoliators"],
  },
  {
    name: "Azelaic Acid 10% Serum",
    slug: "azelaic-acid-serum",
    description: "A multi-tasking serum with 10% azelaic acid that targets acne, rosacea, hyperpigmentation, and uneven skin tone. Suitable for sensitive skin.",
    ingredients: "Azelaic Acid 10%, Glycerin, Niacinamide, Hyaluronic Acid, Allantoin",
    howToUse: "Apply a pea-sized amount morning and/or evening to clean skin. Can be used around the eye area (avoid direct contact).",
    price: 49.95,
    stock: 75,
    categories: ["serums"],
  },
  {
    name: "Bakuchiol Firming Serum",
    slug: "bakuchiol-firming-serum",
    description: "A plant-derived retinol alternative with 1% Bakuchiol that firms, smooths, and improves skin tone — suitable for sensitive skin and safe during pregnancy.",
    ingredients: "Bakuchiol 1%, Squalane, Rosehip Oil, Vitamin C, Vitamin E, Niacinamide",
    howToUse: "Apply 3–4 drops to clean skin morning and evening. Follow with moisturiser.",
    price: 62.95,
    stock: 55,
    categories: ["serums"],
  },
  {
    name: "Alpha Arbutin Brightening Serum",
    slug: "alpha-arbutin-brightening-serum",
    description: "A targeted brightening serum with 2% Alpha Arbutin and Vitamin C that fades dark spots and hyperpigmentation for an even, luminous skin tone.",
    ingredients: "Alpha Arbutin 2%, Ascorbic Acid 5%, Niacinamide, Kojic Acid, Hyaluronic Acid",
    howToUse: "Apply a few drops to clean skin morning and evening. Always follow with SPF in the morning.",
    price: 52.95,
    stock: 65,
    categories: ["serums"],
  },
  {
    name: "Sensitive Skin Calming Serum",
    slug: "sensitive-skin-calming-serum",
    description: "A fragrance-free, minimalist formula with centella asiatica and ceramides that soothes redness, reduces reactivity, and strengthens the skin barrier.",
    ingredients: "Centella Asiatica Extract, Ceramides, Allantoin, Panthenol, Beta-Glucan, Bisabolol",
    howToUse: "Apply to clean skin morning and evening before moisturiser.",
    price: 48.95,
    stock: 80,
    categories: ["serums"],
  },
  {
    name: "Soothing Centella Toner",
    slug: "soothing-centella-toner",
    description: "A calming, essence-like toner with 80% centella asiatica extract that soothes irritated skin, reduces redness, and strengthens the moisture barrier.",
    ingredients: "Centella Asiatica Extract 80%, Hyaluronic Acid, Panthenol, Allantoin, Beta-Glucan",
    howToUse: "After cleansing, press into skin with hands or apply with a cotton pad. Can be layered for extra hydration.",
    price: 36.95,
    stock: 90,
    categories: ["toners"],
  },
  {
    name: "Pro-Aging Eye Concentrate",
    slug: "pro-aging-eye-concentrate",
    description: "A concentrated eye treatment with tri-peptide complex, collagen, and retinyl palmitate that targets crow's feet, hooded eyelids, and dark circles.",
    ingredients: "Tri-Peptide Complex, Hydrolysed Collagen, Retinyl Palmitate, Caffeine 2%, Hyaluronic Acid",
    howToUse: "Apply a small amount morning and evening using ring finger. Pat gently to absorb.",
    price: 64.95,
    stock: 45,
    categories: ["eye-care"],
  },
  {
    name: "Brightening Eye Mask Patches",
    slug: "brightening-eye-mask-patches",
    description: "A pack of 10 brightening hydrogel eye patches infused with gold, vitamin C, and peptides for an instant refresh and depuff.",
    ingredients: "Colloidal Gold, Ascorbic Acid, Peptide Complex, Hyaluronic Acid, Caffeine, Retinyl Palmitate",
    howToUse: "Apply patches under eyes on clean skin. Leave for 15–20 minutes. Remove and gently massage in remaining serum.",
    price: 34.95,
    stock: 160,
    categories: ["eye-care"],
  },
  {
    name: "Skin Glow Starter Kit",
    slug: "skin-glow-starter-kit",
    description: "The perfect introduction to Kentelle. Includes our Gentle Foam Cleanser (75ml), Vitamin C Brightening Serum (15ml), Hydra-Boost Gel Moisturiser (50ml), and Daily Defence SPF 50+ (30ml).",
    price: 89.95,
    salePrice: 74.95,
    stock: 40,
    categories: ["cleansers", "serums", "moisturisers"],
  },
  {
    name: "Anti-Ageing Premium Collection",
    slug: "anti-ageing-premium-collection",
    description: "The complete anti-ageing system. Includes Peptide Complex Serum, Retinol Night Serum 0.3%, Rich Repair Night Cream, and Pro-Aging Eye Concentrate.",
    price: 219.95,
    salePrice: 179.95,
    stock: 25,
    categories: ["serums", "moisturisers", "eye-care"],
  },
];

async function main() {
  console.log("Seeding categories...");
  const createdCategories: Record<string, string> = {};

  for (const cat of categories) {
    const created = await db.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, tagline: cat.tagline, sortOrder: cat.sortOrder },
      create: cat,
    });
    createdCategories[cat.slug] = created.id;
    console.log(`  ✓ ${cat.name}`);
  }

  console.log("\nSeeding products...");
  for (const product of products) {
    const { categories: cats, ...productData } = product;
    const categoryIds = cats
      .map((slug) => createdCategories[slug])
      .filter(Boolean)
      .map((id) => ({ id }));

    await db.product.upsert({
      where: { slug: productData.slug },
      update: {
        ...productData,
        categories: { set: categoryIds },
      },
      create: {
        ...productData,
        images: [],
        categories: { connect: categoryIds },
      },
    });
    console.log(`  ✓ ${productData.name}`);
  }

  console.log("\nSeeding admin account...");
  const passwordHash = await bcrypt.hash("Kentelle@Admin2024", 12);
  await db.admin.upsert({
    where: { email: "admin@kentelle.com" },
    update: {},
    create: {
      email: "admin@kentelle.com",
      passwordHash,
      role: "superadmin",
    },
  });
  console.log("  ✓ admin@kentelle.com");

  console.log("\nSeeding skin concerns...");
  const concerns = [
    { name: "Acne & Breakouts", slug: "acne", sortOrder: 1 },
    { name: "Anti-Ageing", slug: "anti-ageing", sortOrder: 2 },
    { name: "Dark Spots", slug: "dark-spots", sortOrder: 3 },
    { name: "Dry Skin", slug: "dry-skin", sortOrder: 4 },
    { name: "Dullness", slug: "dullness", sortOrder: 5 },
    { name: "Enlarged Pores", slug: "enlarged-pores", sortOrder: 6 },
    { name: "Fine Lines", slug: "fine-lines", sortOrder: 7 },
    { name: "Hydration", slug: "hydration", sortOrder: 8 },
    { name: "Oily Skin", slug: "oily-skin", sortOrder: 9 },
    { name: "Pigmentation", slug: "pigmentation", sortOrder: 10 },
    { name: "Redness", slug: "redness", sortOrder: 11 },
    { name: "Sensitive Skin", slug: "sensitive-skin", sortOrder: 12 },
    { name: "Under Eye", slug: "under-eye", sortOrder: 13 },
    { name: "Uneven Texture", slug: "uneven-texture", sortOrder: 14 },
    { name: "Wrinkles", slug: "wrinkles", sortOrder: 15 },
  ];

  for (const concern of concerns) {
    await db.skinConcern.upsert({
      where: { slug: concern.slug },
      update: { name: concern.name, sortOrder: concern.sortOrder },
      create: concern,
    });
  }
  console.log("  ✓ 15 skin concerns seeded");

  console.log("\n✅ Seed complete!");
  await db.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
