import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

const CATEGORIES = [
  { slug: "everyday-essentials", name: "Everyday Essentials", tagline: "Your daily ritual, perfected", description: "Foundational skincare for morning and night — cleansers, toners, moisturisers and targeted treatments for all skin types.", image: "/images/collections/col-1.jpg", sortOrder: 1 },
  { slug: "peel-and-glow", name: "Peel & Glow", tagline: "Reveal radiant, renewed skin", description: "Exfoliating serums, peels, masks and glycolic solutions to resurface, brighten and transform your complexion.", image: "/images/collections/col-2.jpg", sortOrder: 2 },
  { slug: "skin-nutrients", name: "Skin Nutrients", tagline: "Nourish from within", description: "Concentrated ampoules, capsules and booster formulas packed with actives to feed your skin at a cellular level.", image: "/images/collections/col-3.jpg", sortOrder: 3 },
  { slug: "beauty-accessories", name: "Beauty Accessories", tagline: "Tools for your ritual", description: "Professional-grade tools and accessories to elevate your skincare application and enhance results.", image: "/images/collections/col-4.jpg", sortOrder: 4 },
  { slug: "professional-use", name: "Professional Use", tagline: "Clinical-grade formulas", description: "Professional-strength products formulated for clinical use in dermatology and aesthetic practices.", image: "/images/collections/col-1.jpg", sortOrder: 5 },
];

const PRODUCTS = [
  // ── Everyday Essentials ──────────────────────────────────────────────────
  {
    name: "Ceramide Cleanser",
    slug: "ceramide-cleanser",
    categories: ["everyday-essentials"],
    price: 52,
    salePrice: null,
    stock: 100,
    isActive: true,
    images: ["/images/products/ceramide-cleanser.jpg"],
    description: "A gentle, hydrating gel cleanser formulated with ceramides and niacinamide to strengthen the skin barrier while effectively removing impurities, makeup, and excess sebum. Suitable for all skin types, including dry and sensitive skin.",
    ingredients: "Aqua, Glycerin, Niacinamide, Ceramide NP, Ceramide AP, Ceramide EOP, Sodium Hyaluronate, Panthenol, Allantoin, Decyl Glucoside, Sodium Cocoyl Glutamate, Carbomer, Sodium Hydroxide, Phenoxyethanol, Ethylhexylglycerin.",
    howToUse: "Apply a small amount to damp skin, massage gently in circular motions, then rinse thoroughly with lukewarm water. Use morning and evening. Follow with toner.",
    routine: "Step 1 — Cleanse. Apply morning and evening as the first step of your skincare routine.",
    cautions: "For external use only. Avoid contact with eyes. If irritation occurs, discontinue use. Keep out of reach of children.",
  },
  {
    name: "Fruit Enzyme Cleanser",
    slug: "fruit-enzyme-cleanser",
    categories: ["everyday-essentials"],
    price: 48,
    salePrice: null,
    stock: 100,
    isActive: true,
    images: ["/images/products/fruit-enzyme-cleanser.jpg"],
    description: "A mild exfoliating cleanser enriched with natural fruit enzymes from papaya and pineapple that gently dissolve dead skin cells and surface impurities, revealing a brighter, smoother, and more radiant complexion without stripping the skin.",
    ingredients: "Aqua, Glycerin, Carica Papaya (Papaya) Fruit Extract, Ananas Sativus (Pineapple) Fruit Extract, Lactic Acid, Aloe Barbadensis Leaf Juice, Panthenol, Sodium PCA, Cocamidopropyl Betaine, Decyl Glucoside, Carbomer, Sodium Hydroxide, Phenoxyethanol.",
    howToUse: "Apply to damp skin and massage gently for 60 seconds. Rinse thoroughly. Use 2–3 times per week. Not recommended for sensitive or compromised skin. Follow with toner and moisturiser.",
    routine: "Step 1 — Cleanse & Exfoliate. Use 2-3 times per week in place of your regular cleanser.",
    cautions: "Avoid use on broken or irritated skin. May increase sun sensitivity — always apply SPF. Avoid contact with eyes.",
  },
  {
    name: "Milk Cleanser",
    slug: "milk-cleanser",
    categories: ["everyday-essentials"],
    price: 45,
    salePrice: null,
    stock: 100,
    isActive: true,
    images: ["/images/products/milk-cleanser.png"],
    description: "A soothing milk-textured cleanser that gently removes makeup, sunscreen, and daily impurities while leaving skin feeling soft, nourished, and comfortable. Ideal for dry, normal, and sensitive skin types.",
    ingredients: "Aqua, Isohexadecane, Glycerin, Caprylic/Capric Triglyceride, Cetearyl Alcohol, Oat Kernel Extract, Allantoin, Panthenol, Tocopherol, Ceteareth-20, Phenoxyethanol, Ethylhexylglycerin.",
    howToUse: "Apply to dry or damp skin. Massage gently and rinse with warm water, or remove with a damp cloth for a more nourishing cleanse. Use morning and evening.",
    routine: "Step 1 — Cleanse. Ideal as the first step in your morning and evening routine, especially for dry or sensitive skin types.",
    cautions: "For external use only. Avoid contact with eyes. Discontinue use if irritation develops.",
  },
  {
    name: "Vitamin B Facial Toner",
    slug: "vitamin-b-facial-toner",
    categories: ["everyday-essentials"],
    price: 42,
    salePrice: null,
    stock: 100,
    isActive: true,
    images: ["/images/products/vitamin-b-facial-toner.jpg"],
    description: "A balancing and hydrating toner enriched with Vitamin B3 (niacinamide), Vitamin B5 (panthenol), and hyaluronic acid. Refines pores, evens skin tone, and primes the skin to better absorb subsequent serums and moisturisers.",
    ingredients: "Aqua, Niacinamide, Panthenol, Sodium Hyaluronate, Glycerin, Allantoin, Betaine, Zinc PCA, PEG-40 Hydrogenated Castor Oil, Sodium PCA, Phenoxyethanol, Ethylhexylglycerin.",
    howToUse: "After cleansing, apply a small amount to a cotton pad or directly to hands and gently pat onto face and neck. Do not rinse. Follow with serum or moisturiser.",
    routine: "Step 2 — Tone. Apply after cleansing, before serums and moisturisers.",
    cautions: "For external use only. Avoid contact with eyes. If irritation occurs, discontinue use.",
  },
  {
    name: "Relaxing Comforting Mist",
    slug: "relaxing-comforting-mist",
    categories: ["everyday-essentials"],
    price: 38,
    salePrice: null,
    stock: 100,
    isActive: true,
    images: ["/images/products/relaxing-comforting-mist.jpg"],
    description: "A lightweight hydrating facial mist with calming botanicals — rose water, chamomile extract, and aloe vera — that soothes irritated skin, refreshes makeup throughout the day, and provides an instant moisture boost any time, anywhere.",
    ingredients: "Aqua, Rosa Damascena Flower Water, Aloe Barbadensis Leaf Juice, Chamomilla Recutita (Matricaria) Flower Extract, Glycerin, Panthenol, Sodium Hyaluronate, Allantoin, Benzyl Alcohol, Dehydroacetic Acid.",
    howToUse: "Hold bottle 20–30cm from face and mist evenly. Use throughout the day to refresh and hydrate. Can be used before or after makeup. Eyes may be closed during application.",
    routine: "Use anytime throughout the day for hydration and comfort. Can be used as a toning step or mid-day refresher.",
    cautions: "For external use only. Avoid direct contact with open eyes. Store in a cool, dry place.",
  },
  {
    name: "Bio Ferment Barrier Cream",
    slug: "bio-ferment-barrier-cream",
    categories: ["everyday-essentials"],
    price: 78,
    salePrice: null,
    stock: 80,
    isActive: true,
    images: ["/images/products/bio-ferment-barrier-cream.jpg"],
    description: "An advanced barrier-repairing moisturiser formulated with bio-fermented lactobacillus, ceramides, and postbiotics. Strengthens the skin microbiome, reduces transepidermal water loss, and soothes chronic dryness, redness, and sensitivity.",
    ingredients: "Aqua, Glycerin, Caprylic/Capric Triglyceride, Lactobacillus Ferment, Ceramide NP, Beta-Glucan, Centella Asiatica Extract, Sodium Hyaluronate, Panthenol, Squalane, Cetearyl Alcohol, Phenoxyethanol.",
    howToUse: "Apply a generous amount to cleansed, toned skin, morning and night. Gently pat until absorbed. Can be layered over serums. Particularly beneficial after exfoliation or when skin feels compromised.",
    routine: "Step 4 — Moisturise & Repair. Apply as the last skincare step before SPF (morning) or as the final step at night.",
    cautions: "For external use only. Patch test recommended for extremely reactive skin.",
  },
  {
    name: "Collagen Cream",
    slug: "collagen-cream",
    categories: ["everyday-essentials"],
    price: 72,
    salePrice: null,
    stock: 80,
    isActive: true,
    images: ["/images/products/collagen-cream.jpg"],
    description: "A rich yet non-greasy moisturising cream infused with hydrolysed marine collagen, peptides, and shea butter to improve skin elasticity, plump fine lines, and maintain long-lasting hydration throughout the day.",
    ingredients: "Aqua, Glycerin, Hydrolysed Marine Collagen, Shea Butter, Palmitoyl Tripeptide-1, Palmitoyl Tetrapeptide-7, Sodium Hyaluronate, Tocopheryl Acetate, Allantoin, Cetearyl Alcohol, Phenoxyethanol.",
    howToUse: "Apply morning and/or evening to cleansed and toned skin. Massage gently until fully absorbed. Follow with SPF in the morning.",
    routine: "Step 3 — Moisturise. Use as a daily moisturiser morning and evening.",
    cautions: "For external use only. Keep away from eyes. If irritation occurs, discontinue use.",
  },
  {
    name: "Vitamin C 20% Cream",
    slug: "vitamin-c-20-cream",
    categories: ["everyday-essentials"],
    price: 85,
    salePrice: null,
    stock: 80,
    isActive: true,
    images: ["/images/products/vitamin-c-20-cream.jpg"],
    description: "A high-potency Vitamin C moisturising cream with 20% stable ascorbic acid, ferulic acid, and vitamin E to brighten skin tone, fade hyperpigmentation, protect against free radical damage, and stimulate collagen synthesis.",
    ingredients: "Aqua, Ascorbic Acid 20%, Ferulic Acid, Tocopherol, Glycerin, Sodium Hyaluronate, Niacinamide, Squalane, Cetearyl Alcohol, Dimethicone, Phenoxyethanol, Ethylhexylglycerin.",
    howToUse: "Apply a pea-sized amount to cleansed skin every morning. Allow to absorb before applying SPF. Begin with 3 times per week if you have sensitive skin, building up to daily use.",
    routine: "Step 3 — Brighten & Protect. Use every morning after toner, before SPF.",
    cautions: "Avoid use on broken skin. May cause mild tingling initially — this is normal. Always follow with broad-spectrum SPF. Keep refrigerated for best results.",
  },
  {
    name: "Nightcare Moisturizer",
    slug: "nightcare-moisturizer",
    categories: ["everyday-essentials"],
    price: 68,
    salePrice: null,
    stock: 80,
    isActive: true,
    images: ["/images/products/nightcare-moisturizer.jpg"],
    description: "An intensive overnight moisturiser with a blend of botanical oils, peptides, and hyaluronic acid that works in harmony with the skin's natural repair cycle while you sleep. Wake up to softer, plumper, and more luminous skin.",
    ingredients: "Aqua, Glycerin, Squalane, Jojoba Oil, Rosa Canina Seed Oil, Palmitoyl Tripeptide-5, Sodium Hyaluronate, Allantoin, Panthenol, Ceramide NP, Cetearyl Alcohol, Phenoxyethanol.",
    howToUse: "Apply a generous amount to cleansed and toned skin each evening as the last step of your nighttime routine. Massage in gentle upward strokes until absorbed.",
    routine: "Step 3 (PM) — Night Moisturise. Use as the final step of your evening routine after any serums or treatments.",
    cautions: "For external use only. Not suitable for daytime use without SPF. Discontinue if irritation occurs.",
  },
  {
    name: "Night Beauty Repair",
    slug: "night-beauty-repair",
    categories: ["everyday-essentials"],
    price: 75,
    salePrice: null,
    stock: 80,
    isActive: true,
    images: ["/images/products/night-beauty-repair.jpg"],
    description: "An overnight skin repair formula combining retinol, bakuchiol, and peptides that accelerates cell renewal while you sleep. Visibly reduces fine lines, improves skin texture, and restores a youthful, radiant complexion by morning.",
    ingredients: "Aqua, Retinol, Bakuchiol, Palmitoyl Oligopeptide, Palmitoyl Tetrapeptide-7, Glycerin, Squalane, Niacinamide, Sodium Hyaluronate, Ceramide AP, Allantoin, Cetearyl Alcohol, Phenoxyethanol.",
    howToUse: "Apply a small amount to cleansed skin every evening. Start 2–3 times per week and increase frequency as skin acclimates. Follow with Nightcare Moisturiser if needed. Avoid use around the eye area.",
    routine: "Step 2 (PM) — Repair & Renew. Apply after cleansing and toning, before your night moisturiser.",
    cautions: "Do not use during the day without SPF. Not for use during pregnancy. May cause initial irritation or purging — reduce frequency if this occurs. Always patch test first.",
  },
  {
    name: "Beautiful Eyes",
    slug: "beautiful-eyes-tenor-sans",
    categories: ["everyday-essentials"],
    price: 65,
    salePrice: null,
    stock: 80,
    isActive: true,
    images: ["/images/products/beautiful-eyes-tenor-sans.jpg"],
    description: "A targeted eye cream with peptides, caffeine, and vitamin K to visibly reduce dark circles, puffiness, and fine lines around the delicate eye area. Lightweight, fast-absorbing formula suitable for all skin types.",
    ingredients: "Aqua, Glycerin, Caffeine, Vitamin K (Phytonadione), Palmitoyl Pentapeptide-4, Sodium Hyaluronate, Niacinamide, Aloe Barbadensis Leaf Juice, Allantoin, Phenoxyethanol.",
    howToUse: "Using the ring finger, gently tap a small amount around the orbital bone morning and evening. Do not apply directly on the eyelid. Allow to absorb before applying other eye products.",
    routine: "Eye Care Step. Apply after toner, before moisturiser. Use morning and evening.",
    cautions: "For use around the eye area only. Avoid direct contact with eyes. If product enters eyes, rinse immediately with water.",
  },

  // ── Peel & Glow ─────────────────────────────────────────────────────────
  {
    name: "Peel Back Retinol Serum",
    slug: "peel-back-retinol-serum",
    categories: ["peel-and-glow"],
    price: 92,
    salePrice: null,
    stock: 80,
    isActive: true,
    images: ["/images/products/peel-back-retinol-serum.jpg"],
    description: "A potent retinol serum that accelerates cellular turnover, smooths skin texture, minimises pores, and significantly reduces the appearance of fine lines and wrinkles. Formulated with encapsulated retinol for reduced irritation and maximum efficacy.",
    ingredients: "Aqua, Encapsulated Retinol 0.5%, Niacinamide, Hyaluronic Acid, Bakuchiol, Squalane, Peptide Complex, Allantoin, Panthenol, Glycerin, Carbomer, Phenoxyethanol.",
    howToUse: "Apply 2–3 drops to cleansed and toned skin each evening. Start with 2 nights per week, gradually increasing to nightly use over 4–6 weeks. Always follow with moisturiser. Do not combine with AHA/BHA on the same evening.",
    routine: "Step 2 (PM) — Treatment. Use in the evening only, after toning, before moisturiser.",
    cautions: "For nighttime use only. Do not use during pregnancy or breastfeeding. May cause purging or sensitivity initially — reduce frequency if needed. Always use SPF the following morning.",
  },
  {
    name: "Derma Glycolic 10% Serum Ampoules",
    slug: "derma-glycolic-10-serum-ampoules",
    categories: ["peel-and-glow"],
    price: 115,
    salePrice: null,
    stock: 60,
    isActive: true,
    images: ["/images/products/derma-glycolic-10-serum-ampoules.jpg"],
    description: "Professional-strength 10% glycolic acid single-use ampoules for intensive exfoliation, brightening, and skin renewal. Each ampoule delivers a precise dose of alpha-hydroxy acid to resurface and transform skin texture with consistent results.",
    ingredients: "Aqua, Glycolic Acid 10%, Sodium Hydroxide, Glycerin, Aloe Barbadensis Leaf Juice, Panthenol, Allantoin, Sodium Hyaluronate, Phenoxyethanol.",
    howToUse: "Use 1 ampoule per treatment session. Apply to cleansed skin in the evening, avoiding the eye area and lips. Leave on for 5–10 minutes for first use, building up to 20 minutes. Rinse thoroughly. Use once per week. Always follow with moisturiser and SPF the next day.",
    routine: "Weekly Treatment. Use in place of your regular evening serum once per week.",
    cautions: "Do not use on open wounds or broken skin. May cause stinging — rinse off immediately if uncomfortable. Avoid direct sun exposure for 24–48 hours after use. Not suitable for sensitive skin without consultation.",
  },
  {
    name: "Derma Peel Back Retinol Ampoules",
    slug: "derma-peel-back-retinol-ampoules",
    categories: ["peel-and-glow"],
    price: 125,
    salePrice: null,
    stock: 60,
    isActive: true,
    images: ["/images/products/derma-peel-back-retinol-ampoules.jpg"],
    description: "Concentrated single-dose retinol ampoules for targeted anti-aging treatment and intensive skin renewal. Each ampoule contains a high-potency retinol complex with supporting actives to maximise efficacy while minimising irritation.",
    ingredients: "Aqua, Retinol 1%, Niacinamide, Sodium Hyaluronate, Squalane, Ceramide NP, Palmitoyl Tripeptide-5, Allantoin, Glycerin, Phenoxyethanol.",
    howToUse: "Use 1 ampoule per treatment. Apply to cleansed skin 2–3 evenings per week, increasing gradually to every other evening. Follow with moisturiser. Use SPF the following morning.",
    routine: "Intensive Treatment. Use 2–3 times per week as a targeted anti-aging treatment.",
    cautions: "For nighttime use only. Not suitable during pregnancy. May cause initial redness or peeling — this is expected. Discontinue and consult a professional if severe irritation occurs.",
  },
  {
    name: "Glyco 15 Body Lotion",
    slug: "glyco-15-body-lotion",
    categories: ["peel-and-glow"],
    price: 55,
    salePrice: null,
    stock: 80,
    isActive: true,
    images: ["/images/products/glyco-15-body-lotion.png"],
    description: "A body lotion formulated with 15% glycolic acid to smooth rough skin texture, fade body pigmentation (including keratosis pilaris and ingrown hairs), and dramatically improve overall skin tone on the body. Reveals softer, more even skin with regular use.",
    ingredients: "Aqua, Glycolic Acid 15%, Glycerin, Shea Butter, Caprylic/Capric Triglyceride, Urea, Panthenol, Allantoin, Sodium Hyaluronate, Sodium Hydroxide, Cetearyl Alcohol, Phenoxyethanol.",
    howToUse: "Apply to cleansed body skin 2–3 times per week, avoiding sensitive areas and broken skin. Start with once per week to assess tolerance. Build up to regular use over 2–4 weeks. Rinse after 15–20 minutes or leave on as directed. Always apply body SPF when spending time in the sun.",
    routine: "Weekly Body Treatment. Apply 2–3 times per week to body skin after showering.",
    cautions: "Not for use on the face. Avoid broken, irritated, or recently waxed skin. May increase photosensitivity — use SPF on treated areas.",
  },
  {
    name: "Modeling Mask — Collagen",
    slug: "modeling-mask-collagen",
    categories: ["peel-and-glow"],
    price: 62,
    salePrice: null,
    stock: 80,
    isActive: true,
    images: ["/images/products/modeling-mask-collagen.jpg"],
    description: "A professional peel-off modeling mask infused with marine collagen to firm, hydrate, and plump the skin. The rubber mask creates an occlusive seal that enhances ingredient absorption, delivering an immediate lifting and tightening effect.",
    ingredients: "Diatomaceous Earth, Calcium Sulfate, Hydrolysed Marine Collagen, Glycerin, Sodium Hyaluronate, Aloe Barbadensis Leaf Powder, Panthenol, Allantoin.",
    howToUse: "Mix powder with cool water to a smooth paste (ratio 1:1.5). Apply a thick, even layer to clean face and neck. Leave for 15–20 minutes until set. Peel off from the edges. Follow with toner and moisturiser. Use 1–2 times per week.",
    routine: "Weekly Masking Step. Use once or twice per week after cleansing, before toner and moisturiser.",
    cautions: "For external use only. Perform a patch test before first use. Do not apply to broken skin or open wounds. Avoid contact with eyes.",
  },
  {
    name: "Modeling Mask — Cooling",
    slug: "modeling-mask-cooling",
    categories: ["peel-and-glow"],
    price: 58,
    salePrice: null,
    stock: 80,
    isActive: true,
    images: ["/images/products/modeling-mask-cooling.jpg"],
    description: "A refreshing cooling peel-off mask that soothes inflammation, instantly tightens pores, and revitalises fatigued skin. Infused with menthol and chamomile extract, it provides a pleasant cooling sensation while delivering a visible tightening effect.",
    ingredients: "Diatomaceous Earth, Calcium Sulfate, Menthol, Chamomilla Recutita (Matricaria) Flower Extract, Glycerin, Aloe Barbadensis Leaf Powder, Sodium Hyaluronate, Allantoin.",
    howToUse: "Mix powder with cool water (not warm) to a smooth paste. Apply to cleansed face. Leave for 15 minutes until fully set. Peel off from the edges. Use 1–2 times per week.",
    routine: "Weekly Cooling Treatment. Use once or twice per week, particularly beneficial after sun exposure or to reduce redness.",
    cautions: "May cause a strong cooling sensation — avoid use around the eyes. Not suitable for extremely sensitive skin. Patch test recommended.",
  },
  {
    name: "Modeling Mask — Niacinamide",
    slug: "modeling-mask-niacinamide",
    categories: ["peel-and-glow"],
    price: 60,
    salePrice: null,
    stock: 80,
    isActive: true,
    images: ["/images/products/modeling-mask-niacinamide.jpg"],
    description: "A brightening peel-off mask powered by niacinamide (Vitamin B3) and zinc PCA to visibly even skin tone, minimise the appearance of pores, regulate sebum production, and reduce hyperpigmentation. Ideal for combination and oily skin types.",
    ingredients: "Diatomaceous Earth, Calcium Sulfate, Niacinamide, Zinc PCA, Glycerin, Kaolin, Aloe Barbadensis Leaf Powder, Sodium Hyaluronate, Allantoin.",
    howToUse: "Mix with cool water to a smooth paste. Apply evenly to cleansed face. Leave for 15–20 minutes until set. Peel off. Follow with toner. Use 1–2 times per week.",
    routine: "Weekly Brightening Mask. Use once or twice per week to brighten and mattify skin.",
    cautions: "For external use only. Avoid the eye area. Do not use on broken or irritated skin.",
  },

  // ── Skin Nutrients ───────────────────────────────────────────────────────
  {
    name: "Hyaluron Booster Capsules",
    slug: "hyaluron-booster-capsules",
    categories: ["skin-nutrients"],
    price: 88,
    salePrice: null,
    stock: 80,
    isActive: true,
    images: ["/images/products/hyaluron-booster-capsules.png"],
    description: "Innovative single-dose capsules filled with a concentrated serum of multi-weight hyaluronic acid for an intense, immediate moisture surge. Biodegradable capsules preserve the formula at peak potency until the moment of application, delivering visibly plumped and dewy skin.",
    ingredients: "Aqua, Sodium Hyaluronate, Hydrolysed Hyaluronic Acid, Glycerin, Panthenol, Allantoin, Betaine, Sodium PCA, Phenoxyethanol.",
    howToUse: "Pierce one capsule and squeeze contents onto clean fingertips. Apply to face and neck by gently pressing into skin after cleansing. Use as a serum step before moisturiser. Use 1 capsule per treatment session, 1–2 times daily.",
    routine: "Step 2 — Serum. Apply after toner, before moisturiser.",
    cautions: "For external use only. Once opened, capsule contents should be used immediately.",
  },
  {
    name: "Hyaluron Booster Capsules Advanced",
    slug: "hyaluron-booster-capsules-2",
    categories: ["skin-nutrients"],
    price: 95,
    salePrice: null,
    stock: 80,
    isActive: true,
    images: ["/images/products/hyaluron-booster-capsules-2.jpg"],
    description: "An advanced generation of our Hyaluron Booster Capsules, combining four molecular weights of hyaluronic acid with ceramides and peptides for enhanced multi-layer hydration. Targets deep dehydration and surface dryness simultaneously for a comprehensive moisture solution.",
    ingredients: "Aqua, Sodium Hyaluronate, Hydrolysed Hyaluronic Acid, Sodium Acetyl Hyaluronate, Ceramide NP, Palmitoyl Tripeptide-5, Glycerin, Panthenol, Allantoin, Phenoxyethanol.",
    howToUse: "Pierce one capsule and apply contents to face and neck after cleansing and toning. Gently press into skin until absorbed. Follow with moisturiser. Use 1–2 capsules per day.",
    routine: "Step 2 — Advanced Serum. Apply after toner, before moisturiser for intensive hydration.",
    cautions: "For external use only. Use capsule contents immediately after opening.",
  },
  {
    name: "Collagen Capsules",
    slug: "collagen-capsules",
    categories: ["skin-nutrients"],
    price: 82,
    salePrice: null,
    stock: 80,
    isActive: true,
    images: ["/images/products/collagen-capsules.png"],
    description: "Marine collagen-enriched capsules delivering a potent burst of hydrolysed collagen directly to the skin. Each capsule contains a bioavailable collagen complex with vitamin C to stimulate natural collagen synthesis, improve elasticity, and reduce the appearance of fine lines.",
    ingredients: "Aqua, Hydrolysed Marine Collagen, Ascorbic Acid, Glycerin, Sodium Hyaluronate, Palmitoyl Pentapeptide-4, Panthenol, Allantoin, Phenoxyethanol.",
    howToUse: "Pierce one capsule and apply the serum to clean face and neck. Gently massage until absorbed. Use after toner, before moisturiser. Use 1 capsule per session, once or twice daily.",
    routine: "Step 2 — Collagen Serum. Use after toner as a targeted anti-aging treatment.",
    cautions: "For external use only. Not suitable for individuals with fish allergies (marine-derived collagen). Use immediately after opening.",
  },
  {
    name: "Chonofirm Peptide Matrix",
    slug: "chonofirm-peptide-matrix",
    categories: ["skin-nutrients"],
    price: 145,
    salePrice: null,
    stock: 50,
    isActive: true,
    images: ["/images/products/chonofirm-peptide-matrix.png"],
    description: "A premium biotechnology-derived peptide complex featuring ChroNoline and Argireline peptides proven to visibly firm, lift, and rejuvenate skin. This concentrated matrix targets expression lines, skin laxity, and loss of contour for a clinically-documented anti-aging response.",
    ingredients: "Aqua, Acetyl Hexapeptide-3 (Argireline), Leontopodium Alpinum (Edelweiss) Callus Culture Extract, Tripeptide-10 Citrulline (ChroNoline), Glycerin, Sodium Hyaluronate, Niacinamide, Ceramide NP, Phenoxyethanol.",
    howToUse: "Apply 2–3 drops to cleansed and toned skin, morning and/or evening. Gently press into skin with fingertips. Allow to fully absorb before moisturiser. For best results, use consistently for a minimum of 8 weeks.",
    routine: "Step 2 — Peptide Treatment. Apply morning and evening after toner for best anti-aging results.",
    cautions: "For external use only. Always perform a patch test before full application. Keep away from eyes.",
  },
  {
    name: "PDRN Pink Bio Cell Ampoules",
    slug: "pdrn-pink-bio-cell-ampoules",
    categories: ["skin-nutrients"],
    price: 155,
    salePrice: null,
    stock: 50,
    isActive: true,
    images: ["/images/products/pdrn-pink-bio-cell-ampoules.jpg"],
    description: "Cutting-edge PDRN (polydeoxyribonucleotide) ampoules for advanced skin regeneration and rejuvenation. PDRN activates skin repair at a cellular level, accelerating healing, boosting collagen synthesis, improving hydration, and reducing pigmentation for visibly transformed skin.",
    ingredients: "Aqua, PDRN (Polydeoxyribonucleotide), Sodium Hyaluronate, Niacinamide, Glycerin, Adenosine, Panthenol, Allantoin, Centella Asiatica Extract, Phenoxyethanol.",
    howToUse: "Apply the contents of one ampoule to cleansed, toned skin. Gently press into skin with fingertips and allow to fully absorb. Follow with moisturiser. Use 3–5 ampoules per treatment course, 2–3 times per week.",
    routine: "Intensive Regeneration Course. Use 2–3 times per week for a 4–6 week regeneration cycle.",
    cautions: "For external use only. Store in a cool place away from direct sunlight. Use immediately after opening. Consult a dermatologist if you have severe skin conditions.",
  },

  // ── Beauty Accessories ───────────────────────────────────────────────────
  {
    name: "Dr Pen Needles",
    slug: "dr-pen-needles",
    categories: ["beauty-accessories"],
    price: 45,
    salePrice: null,
    stock: 150,
    isActive: true,
    images: ["/images/products/dr-pen-needles.png"],
    description: "Precision-engineered micro-needling cartridges compatible with Dr Pen devices. Sterile, single-use needle cartridges that create precise micro-channels in the skin to enhance serum absorption and stimulate natural collagen production for smoother, firmer, and more youthful skin.",
    ingredients: "Medical-grade stainless steel needles. Sterile, single-use cartridge.",
    howToUse: "For use with compatible Dr Pen micro-needling devices only. Ensure skin is clean and free of active breakouts. Attach cartridge securely. Glide device gently across treatment area. Apply serum immediately after treatment. Dispose of cartridge after single use. Follow aftercare instructions provided with your device.",
    routine: "Weekly or fortnightly micro-needling treatment. Apply hyaluronic acid or PDRN serum immediately after treatment for maximum absorption.",
    cautions: "Single use only — never reuse cartridges. Not suitable for active acne, rosacea, open wounds, or compromised skin. Do not use if taking blood thinners. Consult a professional before beginning micro-needling if you have skin conditions. Discard immediately after use.",
  },

  // ── Professional Use ─────────────────────────────────────────────────────
  {
    name: "G-Biomed Skin Cleanser",
    slug: "g-biomed-skin-cleanser",
    categories: ["professional-use"],
    price: 85,
    salePrice: null,
    stock: 60,
    isActive: true,
    images: ["/images/products/g-biomed-skin-cleanser.jpg"],
    description: "A professional-grade antibacterial skin cleanser formulated for clinical and aesthetic use. Provides thorough cleansing of the skin prior to procedures, maintaining the skin's natural microbiome while eliminating surface bacteria, impurities, and residues.",
    ingredients: "Aqua, Triclosan, Glycerin, Caprylic/Capric Triglyceride, Panthenol, Allantoin, Sodium PCA, Cocamidopropyl Betaine, Sodium Cocoyl Glutamate, Phenoxyethanol.",
    howToUse: "For professional use in clinic environments. Apply to skin prior to procedures. Massage gently, leave on for 30 seconds, then rinse thoroughly. Follow protocol specific to treatment being performed.",
    routine: "Pre-Treatment Cleanse. Use prior to professional skin treatments and procedures.",
    cautions: "For professional clinical use. Follow all applicable clinical protocols. Not for daily home use as a regular cleanser.",
  },
  {
    name: "Derma Moisture Fix",
    slug: "derma-moisture-fix",
    categories: ["professional-use"],
    price: 98,
    salePrice: null,
    stock: 60,
    isActive: true,
    images: ["/images/products/derma-moisture-fix.jpg"],
    description: "An intensive professional-grade moisture-replenishing formula with high-concentration hyaluronic acid, ceramides, and plant-based moisture factors. Designed for use in clinical settings to treat severely dehydrated, compromised, or post-treatment skin.",
    ingredients: "Aqua, Sodium Hyaluronate 2%, Ceramide NP, Ceramide AP, Panthenol, Allantoin, Glycerin, Squalane, Centella Asiatica Extract, Beta-Glucan, Sodium PCA, Phenoxyethanol.",
    howToUse: "Apply to clean skin immediately after treatment or as directed by your skincare professional. Use in clinic as a post-procedure moisturiser or as part of intensive home care plan prescribed by your clinician.",
    routine: "Post-Treatment Recovery. Use as directed by your skincare professional following clinical treatments.",
    cautions: "Professional use recommended. Follow clinical post-care protocols.",
  },
  {
    name: "Derma Moisture Fix Ampoules",
    slug: "derma-moisture-fix-ampoules",
    categories: ["professional-use"],
    price: 125,
    salePrice: null,
    stock: 50,
    isActive: true,
    images: ["/images/products/derma-moisture-fix-ampoules.jpg"],
    description: "Professional concentrated moisture ampoules containing ultra-pure hyaluronic acid and barrier-repair actives for intensive clinic-based hydration treatments. Each single-dose ampoule ensures maximum freshness and potency at the time of application.",
    ingredients: "Aqua, Sodium Hyaluronate 3%, Sodium Acetyl Hyaluronate, Ceramide NP, Glycerin, Panthenol, Allantoin, Centella Asiatica Extract, Phenoxyethanol.",
    howToUse: "For professional use in clinic. Pierce ampoule and apply immediately to treated skin. Can be used as a post-procedure hydration step or as part of a clinical hydration protocol. One ampoule per treatment session.",
    routine: "Clinical Hydration Treatment. Used in-clinic as part of a professional skincare protocol.",
    cautions: "For professional use only. Use immediately after opening. Single use per ampoule.",
  },
  {
    name: "Glyco 40 Liquid Solution",
    slug: "glyco-40-liquid-solution",
    categories: ["professional-use"],
    price: 89,
    salePrice: null,
    stock: 40,
    isActive: true,
    images: ["/images/products/glyco-40-liquid-solution.png"],
    description: "A professional-grade 40% glycolic acid chemical peel solution for advanced exfoliation treatments performed in clinical settings. Delivers significant resurfacing, brightening, and anti-aging results through controlled application by qualified skincare professionals.",
    ingredients: "Aqua, Glycolic Acid 40%, Sodium Hydroxide (pH adjustor), Phenoxyethanol.",
    howToUse: "For professional use only. Apply to clean, prepped skin using a fan brush. Monitor skin response carefully. Neutralise immediately if significant reaction occurs. Follow clinical peel protocol. Do not leave on skin for more than prescribed time.",
    routine: "Professional Chemical Peel. Applied in-clinic sessions, typically every 4–6 weeks.",
    cautions: "FOR PROFESSIONAL USE ONLY. Not for home use. Requires trained application. Can cause burns or scarring if used incorrectly. Neutralise immediately upon any adverse reaction. Clients must avoid sun exposure for 1 week post-treatment.",
  },
];

export async function POST() {
  const log: string[] = [];

  try {
    const now = new Date().toISOString();

    // ── 1. Seed categories ──────────────────────────────────────────────────
    const categoryIdMap: Record<string, string> = {};

    for (const cat of CATEGORIES) {
      const { data: existing } = await supabase
        .from("Category")
        .select("id")
        .eq("slug", cat.slug)
        .maybeSingle();

      if (existing) {
        categoryIdMap[cat.slug] = (existing as any).id;
        log.push(`[skip] Category already exists: ${cat.name}`);
        continue;
      }

      const { data, error } = await supabase
        .from("Category")
        .insert({ id: crypto.randomUUID(), ...cat })
        .select()
        .single();

      if (error) {
        log.push(`[error] Category ${cat.name}: ${error.message}`);
      } else {
        categoryIdMap[cat.slug] = (data as any).id;
        log.push(`[ok] Category created: ${cat.name}`);
      }
    }

    // ── 2. Seed products ────────────────────────────────────────────────────
    for (const product of PRODUCTS) {
      const { categories: catSlugs, ...productData } = product;

      const { data: existing } = await supabase
        .from("Product")
        .select("id")
        .eq("slug", product.slug)
        .maybeSingle();

      if (existing) {
        log.push(`[skip] Product already exists: ${product.name}`);
        continue;
      }

      const productId = crypto.randomUUID();

      const { error: pErr } = await supabase.from("Product").insert({
        id: productId,
        createdAt: now,
        updatedAt: now,
        ...productData,
      });

      if (pErr) {
        log.push(`[error] Product ${product.name}: ${pErr.message}`);
        continue;
      }

      const catLinks = catSlugs
        .map((slug) => categoryIdMap[slug])
        .filter(Boolean)
        .map((catId) => ({ A: catId, B: productId }));

      if (catLinks.length) {
        const { error: linkErr } = await supabase.from("_ProductCategories").insert(catLinks);
        if (linkErr) log.push(`[warn] Category link for ${product.name}: ${linkErr.message}`);
      }

      log.push(`[ok] Product created: ${product.name}`);
    }

    return NextResponse.json({ ok: true, log });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message, log }, { status: 500 });
  }
}
