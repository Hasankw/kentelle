const BASE = "https://siwgptjhirmkabyjmddm.supabase.co/rest/v1";
const KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpd2dwdGpoaXJta2FieWptZGRtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTg3NTA4NiwiZXhwIjoyMDY3NDUxMDg2fQ.z13rLNF2aWzEKQ-GAhFqoGjBN37MFkXw3exJEbmfQKo";

const H = { "apikey": KEY, "Authorization": `Bearer ${KEY}`, "Content-Type": "application/json", "Prefer": "return=minimal" };

async function patch(id, data) {
  const r = await fetch(`${BASE}/Product?id=eq.${id}`, { method: "PATCH", headers: H, body: JSON.stringify(data) });
  if (!r.ok) { const t = await r.text(); console.error(`PATCH ${id} failed:`, r.status, t); }
}

async function insert(data) {
  const r = await fetch(`${BASE}/Product`, { method: "POST", headers: { ...H, Prefer: "return=representation" }, body: JSON.stringify(data) });
  if (!r.ok) { const t = await r.text(); console.error("INSERT failed:", r.status, t); }
  else { const d = await r.json(); console.log("  Inserted:", d[0]?.name); }
}

// ── 1. DISABLE extras not on real site ───────────────────────────────────────
const DISABLE = [
  "ca74b0678db0748261bc8b75d",  // AHA Resurfacing Face Mask
  "c984527f26c2dfc1cd9d11ca3",  // AHA/BHA Exfoliating Toner
  "c0691f2307e07875011ae2a94",  // Alpha Arbutin Brightening Serum
  "c7a3d4c2049f4290928afcc52",  // Azelaic Acid 10% Serum
  "c5d32e140b51595f4082064c4",  // Bakuchiol Firming Serum
  "c125d242a26146483cf3faca5",  // Balancing Rose Toner
  "c40a076b9ff18aee8871b3477",  // Ceramide Barrier Repair Moisturiser
  "cf295cdcadf7c5a57cd29cd04",  // Daily Defence SPF 50+ Moisturiser
  "c0cf3ae9864a15602ffe64e33",  // Enzyme Powder Exfoliator
  "c27063c6393799f28e484559e",  // Gentle Foam Cleanser
  "ce97dc1a9fc8a838e0b0bfbec",  // Glycolic Acid Resurfacing Serum
  "294d75ab-adb0-4e4e-973f-b4518c6a2397", // Hyaluron Booster Capsules Advanced
  "ce14c25ca7e8ce93445dd4a74",  // Hyaluronic Acid Hydrating Serum
  "cbbade2b6092b11b2ae29db67",  // Hydra-Boost Gel Moisturiser
  "c25582c8cf4c29c3f8aae3f4c",  // Hydrogel Sheet Mask Pack
  "c482ca9b2d98ab8dde851f774",  // Micellar Cleansing Water
  "cec60a289613c21fb8259dbe0",  // Mineral SPF 50+ Sunscreen
  "c1c1416af978ba421d3e81bd9",  // Niacinamide 10% + Zinc Serum
  "c41e28d462b11698dac40358e",  // Oil Balancing Gel Cleanser
  "c2e2393947ea11ceb92eac484",  // Peptide Complex Anti-Ageing Serum
  "cdc6bc95a669558da8a371288",  // Pro-Aging Eye Concentrate
  "c87868720da9fde40a917f5f3",  // Retinol Night Serum 0.3%
  "cbfd1d533e93219ddbebe337d",  // Rich Repair Night Cream
  "c9450240777da79e81618b1cd",  // Sensitive Skin Calming Serum
  "c079c0002072190a2c36c3a27",  // Skin Glow Starter Kit
  "cc75d9f3a4ef1190ce0f85894",  // Soothing Centella Toner
  "cb1272781ea018f83095fe043",  // Tinted Mineral SPF 30
  "c729b870ef53542709c84ec2d",  // Vitamin C Brightening Serum
  "caf5fd7b485c3c267c5b35e7a",  // Beautiful Eyes Tenor Sans (duplicate)
];

// ── 2. UPDATES: id → patch data ───────────────────────────────────────────────
const UPDATES = [
  {
    id: "f74bae7b-f889-460e-9745-47c823351b19",
    data: {
      name: "Beautiful Eyes Tenor Sans",
      price: 69,
      images: ["https://kentelle.com/cdn/shop/files/Kentelle_Beautiful_Eyes_Tenor_Sans.jpg"],
      description: "Electronic eye contour treatment device with vibration massage technology. Addresses puffiness, dark circles, and fine lines around the eye area.",
      howToUse: "Cleanse and pat eye area dry. Apply a small amount of serum in circular motions. Activate vibration switch and glide tip around eye contour. Switch off and pat remaining serum with fingertips. Use nightly only. Refrigerate applicator for enhanced cooling effect.",
      ingredients: "Water, Ethylhexyl Palmitate, Polyglyceryl-2 Stearate, Glycerin, Propylene Glycol, Glycereth-26, Carbomer, Cetearyl Alcohol, PEG-40 Stearate, Phenoxyethanol, Sodium Hydroxide, Polyglyceryl-3 Methylglucose Distearate, Xanthan Gum, CI 19140, CI 42090",
      cautions: "Contains electronics — do not submerge in water. External use only. Avoid direct eye contact. Not suitable for broken or irritated skin.",
    },
  },
  {
    id: "e6410f6d-83c1-4b3b-ad20-752975ef9187",
    data: {
      name: "Bio-Ferment Barrier Cream",
      price: 89,
      images: ["https://kentelle.com/cdn/shop/files/20260324_093631.jpg"],
      description: "Barrier cream with Bifida Ferment Lysate and Niacinamide. Restores and reinforces the skin barrier. Recommended after sun exposure.",
      howToUse: "Apply 1–2 pumps to entire face after cleansing. Use 1–3 times daily, day and night.",
      ingredients: "Aqua, Niacinamide (Vitamin B3), Glycerin, Helianthus Annuus Seed Oil, Bifida Ferment Lysate, Cetearyl Alcohol, Caprylic/Capric Triglyceride, Butyrospermum Parkii Butter, Tocopherol, Parfum, Phenoxyethanol, Ceteareth-20, Stearic Acid, Caprylyl Glycol, Carbomer, Dimethicone, Sodium Hydroxide",
      cautions: "For external use only. Avoid contact with eyes.",
    },
  },
  {
    id: "1ba3b996-b81d-4a7b-9514-b73588ffe82b",
    data: {
      name: "Ceramide Cleanser",
      price: 89,
      images: ["https://kentelle.com/cdn/shop/files/20260416_115031_1.jpg"],
      description: "Gentle facial cleanser enriched with Ceramides NP, AP, and EOP plus Panthenol. Supports the skin barrier and is recommended for all skin types, particularly post-dermal procedures.",
      howToUse: "Dispense 1–2 pumps. Gently massage in circular motions. Rinse with lukewarm water and pat dry. Follow with Vitamin B Facial Toner.",
      ingredients: "Ceramide NP, Ceramide AP, Ceramide EOP, Cholesterol, Phytosphingosine, Panthenol (Vitamin B5), Helianthus Annuus Seed Oil (Sunflower), plus emulsifiers and preservatives",
      cautions: "For external use only. Avoid contact with eyes.",
    },
  },
  {
    id: "027745db-cc8c-4c72-bc84-d35b1c2f9499",
    data: {
      name: "Chonofirm Peptide Matrix Ampoules",
      slug: "chonofirm-peptide-matrix-ampoules",
      price: 135,
      images: ["https://kentelle.com/cdn/shop/files/PeptideChonoFirmMatrix.png"],
      description: "High-concentration peptide matrix ampoules (5ml × 6) with a cooling metal rollerball applicator. Targets anti-aging, firming, and facial contouring with intensive portioned doses.",
      howToUse: "Cleanse and tone face. Dispense serum via air pump at ampoule base. Apply with slow upward strokes along jawline, cheeks, and neck using rollerball. Use minimal pressure around eyes. Pat remaining product in. Apply at night. Follow with serum, Vitamin C, and moisturizer.",
      ingredients: "Water, Glycerin, Butyrospermum Parkii Butter, Palmitoyl Tetrapeptide-7, Palmitoyl Tripeptide-1, Palmitoyl Tripeptide-38, Sodium Hyaluronate, Aloe Barbadensis, Cucumis Sativus Fruit Extract, Retinyl Palmitate, Citrus Aurantium Dulcis (Orange) Peel Oil",
      cautions: "For external use only. Avoid contact with eyes.",
    },
  },
  {
    id: "b5a928f0-b145-4ca9-9578-0aab893dc0fa",
    data: {
      name: "Collagen Capsules",
      price: 89,
      description: "Anti-wrinkle capsule cream combining Hydrolysed Collagen to rebuild skin structure and Acetyl Hexapeptide-8 to relax facial muscles. Microencapsulation technology for enhanced absorption.",
      howToUse: "Apply after cleansing — scoop cream with applicator, distribute evenly across face and neck, massage until absorbed. Use day and night. Apply sunscreen after daytime use.",
      ingredients: "Water, Glycerin, Hydrolyzed Collagen, Sodium Hyaluronate, Acetyl Hexapeptide-8, Squalane, Aloe Barbadensis, Chamomilla, Centella Asiatica",
      cautions: "For external use only. Avoid contact with eyes.",
    },
  },
  {
    id: "796f298f-9d9c-4718-88cf-e3232e4c8ecb",
    data: {
      name: "Collagen Cream",
      price: 89,
      description: "Pump cream with Marine Collagen, Vitamin C (Ascorbic Acid), and Shea Butter for structural skin support. Lifts, repairs, and restores moisture while improving skin texture.",
      howToUse: "Cleanse and tone first. Dispense 2–3 pumps and press gently into face, neck, and décolletage after serums. Pat remaining cream until absorbed. Apply at night. Can be used AM/PM.",
      ingredients: "Hydrolyzed Marine Collagen, Glycerin, Helianthus Annuus Seed Oil, Butylene Glycol, Butyrospermum Parkii Butter (Shea Butter), Ascorbic Acid, Tocopherol (Natural Vitamin E), Cucumis Sativus Fruit Extract, emulsifiers and preservatives",
      cautions: "For external use only. Avoid contact with eyes.",
    },
  },
  {
    id: "ac8a035a-29d6-42a3-8ee3-5297d2326b9b",
    data: {
      name: "Derma Glycolic 10 Serum Ampoules",
      price: 120,
      images: ["https://kentelle.com/cdn/shop/files/DermaGlycol_10_Serum.jpg"],
      description: "Glycolic acid serum in ampoule form (5ml × 6) with a rollerball applicator. Morning treatment for exfoliation, tone correction, brightening, and unclogging pores. Fades sun damage.",
      howToUse: "Start with a clean face. Press air pump at ampoule bottom to dispense serum to rollerball tip. Glide across face and neck in a thin layer. Allow absorption before continuing routine. Use daily in the morning. Avoid 3–7 days after superficial treatments, 7–10 days after clinical dermal treatments.",
      ingredients: "Glycolic Acid, Triethanolamine, Allantoin, Xanthan Gum, Dimethicone, Tocopheryl Acetate, preservatives",
      cautions: "Do not use on broken skin, open wounds, or after recent sun exposure. Always apply sunscreen afterward.",
    },
  },
  {
    id: "74b18878-fedb-4e05-a043-731938f98748",
    data: {
      name: "Derma Moisture Fix",
      price: 89,
      images: ["https://kentelle.com/cdn/shop/files/20260420_113441.jpg"],
      description: "Ceramide-rich moisturising serum with a cooling metal rollerball tip (30ml). Restores, hydrates, and reduces redness. Essential when using retinol or glycolic treatments and for post-clinical dermal procedures.",
      howToUse: "Cleanse and tone. Press air pump to release serum to rollerball tip. Glide cooling tip across face and neck in upward strokes. Pat lightly with fingertips. Allow 30–60 seconds for absorption. Apply day or night.",
      ingredients: "Water, Glycerin, Helianthus Annuus Seed Oil, Cetearyl Alcohol, Caprylic/Capric Triglyceride, Ceramide NP, Ceramide AP, Ceramide EOP, Phytosphingosine, Cholesterol, Xanthan Gum, Butyrospermum Parkii Butter, Allantoin, Beta Glucan, Tocopherol (Vitamin E), Phenoxyethanol",
      cautions: "For external use only. Avoid direct eye contact.",
    },
  },
  {
    id: "78c1eb92-3cfa-4065-af86-0eb601f5d18a",
    data: {
      name: "Derma Moisture Fix Ampoules",
      price: 120,
      images: ["https://kentelle.com/cdn/shop/files/Kenntelle_Derma_Moisture_Fix.jpg"],
      description: "Ampoule version of Derma Moisture Fix (5ml × 6) with cooling metal rollerball. Higher-concentration portioned doses for intensive hydration and barrier restoration. Ideal for sensitive and dry skin.",
      howToUse: "Cleanse and tone. Press air pump at ampoule base to release serum to rollerball tip. Glide gently across face and neck in upward strokes. Massage areas of concern. Pat lightly with fingertips. Allow 30–60 seconds for absorption. Apply day or night.",
      ingredients: "Water, Glycerin, Helianthus Annuus Seed Oil, Cetearyl Alcohol, Caprylic/Capric Triglyceride, Ceramide NP, Ceramide AP, Ceramide EOP, Phytosphingosine, Cholesterol, Butyrospermum Parkii Butter, Allantoin, Beta Glucan, Tocopherol (Vitamin E), emollients and preservatives",
      cautions: "For external use only. Avoid contact with eyes.",
    },
  },
  {
    id: "def80db5-0285-45c0-940d-0f3451114c13",
    data: {
      name: "Derma Peel-Back Retinol 0.01 Ampoules",
      price: 120,
      images: ["https://kentelle.com/cdn/shop/files/DermaPeelBackRetinol.jpg"],
      description: "Retinol 0.01 ampoules (5ml × 6) with fruit acid extracts for gentle nighttime resurfacing, rejuvenation, brightening, and acne control.",
      howToUse: "Apply to clean face with roll-on applicator. Follow with Derma Moisture Fix, Vitamin C, Derma Moisturiser Seal, and broad-spectrum sunblock. Begin with daily nighttime application. Reduce frequency if tingling becomes uncomfortable.",
      ingredients: "Water, Glycerin, Pumice Stone, Vaccinium Myrtillus (Blueberry) Fruit Extract, Saccharum Officinarum (Sugar Cane) Extract, Citrus Aurantium (Orange) Fruit Extract, Citrus Medica Limonum (Lemon) Fruit Extract, Acer Saccharum (Maple), Helianthus Annuus Seed Oil, Butyrospermum Parkii Butter, Tocopherol (Natural Vitamin E)",
      cautions: "For nighttime use only. Always wear broad-spectrum sunscreen during the day. Avoid during pregnancy.",
    },
  },
  {
    id: "30c38f1f-1c02-4556-ba43-8bf10588490b",
    data: {
      name: "Dr Pen H",
      slug: "dr-pen-h",
      price: 2.50,
      description: "Microneedling Infusion K19-12N replacement cartridge for Dr Pen microneedling devices.",
      howToUse: "For professional use with compatible Dr Pen microneedling devices only.",
      cautions: "Single use only. Professional use recommended.",
    },
  },
  {
    id: "1a4dc839-1508-4939-9da6-c4de28f58e97",
    data: {
      name: "Fruit Enzyme Cleanser",
      price: 59,
      description: "Fruit enzyme daily cleanser with antioxidant properties. Suitable for all skin types, particularly pigmented skin. Recommended post-dermal procedure. Available in 30ml and 50ml.",
      howToUse: "Dispense 1–2 pumps. Massage gently in circular motions. Rinse with lukewarm water and pat dry. Apply day or night. Follow with Vitamin B Facial Toner.",
      ingredients: "Aqua, Cocamidopropyl Betaine, Glycerin, Vaccinium Myrtillus (Blueberry) Fruit Extract, Saccharum Officinarum (Sugar Cane) Extract, Citrus Aurantium (Orange) Fruit Extract, Citrus Medica Limonum (Lemon) Fruit Extract, Acer Saccharum (Maple Sap), Ananas Sativus (Pineapple) Fruit Extract, Carica Papaya (Papaya) Fruit Extract, essential oils",
      cautions: "For external use only. Avoid contact with eyes.",
    },
  },
  {
    id: "a177462a-6926-419c-9201-fe3f46211da2",
    data: {
      name: "G Biomed Skin Cleanser",
      price: 89,
      images: ["https://kentelle.com/cdn/shop/files/20260420_133351.jpg"],
      description: "Glycolic acid-based skin cleanser (200ml). Part of the Kentelle Dermal Skin Care professional line for deep cleansing and gentle exfoliation.",
      howToUse: "Apply 1–2 pumps to face. Gently rub in circular motion. Rinse with lukewarm water and pat dry.",
      ingredients: "Water (Aqua), Phenoxyethanol & Methylisothiazolinone, Propanediol, Sodium Laureth Sulfate, Cocamidopropyl Betaine, Disodium Laureth Sulfosuccinate, Glycolic Acid, Triethanolamine, PEG-150 Distearate",
      cautions: "Do not apply on open wounds, broken skin, or immediately after sun exposure. Do not use during pregnancy or breastfeeding.",
    },
  },
  {
    id: "042e7e64-3d26-485b-9492-eaf626665c7d",
    data: {
      name: "GLYCO-15 Body Lotion",
      price: 120,
      description: "15% Glycolic Acid body lotion at pH 2.8. Daily exfoliating body treatment for skin preparation and renewal. 250ml.",
      howToUse: "Prep skin. Dispense onto fingertips. Apply smoothly — do not rinse. Seal with body balm. Apply sunscreen for daytime use. Patch test recommended before first use.",
      ingredients: "Water, Glycolic Acid, Glycerin, Butylene Glycol, Cetyl Alcohol, Sodium Hyaluronate, Centella Asiatica Extract, Niacinamide, Glycyrrhiza Glabra (Licorice Root) Extract, Camellia Sinensis (Green Tea) Extract, Chamomilla Recutita Extract",
      cautions: "External use only. Do not apply on face, open wounds, broken skin, or immediately after sun exposure. Avoid during pregnancy or breastfeeding. Discontinue 3 days before clinical treatments.",
    },
  },
  {
    id: "d2d6e119-ae70-4dda-8d69-659434485359",
    data: {
      name: "GLYCO-40 Liquid Solution (pH 1.0)",
      price: 150,
      images: ["https://kentelle.com/cdn/shop/files/Gemini_Generated_Image_yfx4i5yfx4i5yfx4.png"],
      description: "Professional-use only 40% Glycolic Acid (AHA sourced from sugar cane) liquid solution at pH 1.0. 50ml. Addresses dullness, uneven tone, pore blockage, and acne.",
      howToUse: "PROFESSIONAL USE ONLY.",
      ingredients: "Water, Glycolic Acid, Niacinamide, Phenoxyethanol, Ethylhexylglycerin",
      cautions: "For professional use only. Keep away from eyes and mucous membranes. Not for home use.",
    },
  },
  {
    id: "92e50121-1152-47d4-8491-2225b5773a33",
    data: {
      name: "Hyaluron Booster Capsules",
      price: 89,
      description: "Capsule-based moisturiser with multiple forms of Hyaluronic Acid and Squalane. Microencapsulation technology for enhanced penetration. Delivers hydration, glass finish, and moisture restoration. 50g.",
      howToUse: "Apply to clean face and neck morning and night with provided applicator. Massage until absorbed. Layer with additional skincare or sunscreen during daytime.",
      ingredients: "Multiple forms of Hyaluronic Acid, Squalane, Glycerin, Copper Tripeptide-1, Carnosine, Panthenol, Aloe Barbadensis, Chamomilla, Centella Asiatica, Sodium Hyaluronate",
      cautions: "For external use only. For optimal results, prep skin with Glycolic 10 serum (morning) and Peel-Back treatment (evening).",
    },
  },
  {
    id: "9486cb62-cf73-4f24-9ef3-cf5af8048a0b",
    data: {
      name: "Milk Cleanser",
      price: 0,
      description: "Creamy Australian-botanicals milk cleanser with Apricot Kernel Oil, Desert Lime, and Emu Apple. Gentle, nourishing formula for all skin types.",
      howToUse: "Gently massage in circular motions onto damp skin, avoiding eye area. Rinse with warm water or face cloth. Follow with favourite moisturiser. Use morning and night.",
      ingredients: "Purified Water, Prunus Armeniaca (Apricot) Kernel Oil, Vegetable Glycerine, Cucumis Sativus (Cucumber) Extract, Citrus Glauca (Desert Lime), Behenyl Alcohol, Glyceryl Stearate Citrate, Kunzea Pomifera (Emu Apple), Decyl Glucoside, Xanthan Gum, Phenoxyethanol, Ethylhexylglycerin, Citrus Aurantifolia (Lime) Oil",
      cautions: "For external use only. Avoid contact with eyes.",
    },
  },
  {
    id: "77d1cba5-46b6-4cfd-b676-fee17a6942dc",
    data: {
      name: "Modeling Mask — Collagen",
      price: 120,
      images: ["https://kentelle.com/cdn/shop/files/1000046632_360e9b90-816e-40c5-8168-6f1c231c1fab.jpg"],
      description: "Powder rubber peel-off modeling mask. Mix with water to create a smooth paste. Targets dry and dehydrated skin. Boosts elasticity, moisture, and texture for women and men.",
      howToUse: "Mix powder with water in a glass bowl to create a smooth paste. Apply to face. Leave for 25–30 minutes. Peel off dried mask. Apply moisturiser afterward.",
      ingredients: "Corn Starch, Diatomaceous Earth, Sodium Alginate, Calcium Sulfate, Maltodextrin, Sodium Hyaluronate, Pearl Powder, Hydrolyzed Collagen, Water, Butanediol, Milk Extract, Phenoxyethanol",
      cautions: "Avoid contact with children. Do not use on eczema, wounds, or inflamed skin. Store in a dry place at room temperature away from direct sunlight.",
    },
  },
  {
    id: "6e878f03-c33a-417e-b2de-bf9139700304",
    data: {
      name: "Modeling Mask — Cooling",
      price: 120,
      images: ["https://kentelle.com/cdn/shop/files/1000046630.jpg"],
      description: "Peppermint and Tea Tree peel-off modeling mask powder for cooling, pore care, and clarification. Mix with water to create a smooth paste.",
      howToUse: "Mix powder with water to paste consistency. Apply to face. Allow 25–30 minutes drying time. Gently peel off. Follow with moisturiser.",
      ingredients: "Corn Starch, Diatomaceous Earth, Sodium Alginate, Calcium Sulfate, Maltodextrin, Sodium Hyaluronate, Tea Tree Extract, Tetrasodium Pyrophosphate, Ubiquinone (CoQ10), Peppermint Extract",
      cautions: "Avoid contact with eyes, eczema, wounds, and inflamed skin. Keep from children. Store in a dry place at room temperature.",
    },
  },
  {
    id: "8a17ea5a-0be9-446e-8520-aa45a3d7b21c",
    data: {
      name: "Modeling Mask — Niacinamide",
      price: 120,
      images: ["https://kentelle.com/cdn/shop/files/1000046629_4fe38b13-b2a6-4847-9ed5-9e1ad3bcb982.jpg"],
      description: "Niacinamide-infused peel-off modeling mask powder. Moisturising, brightening, and texture-improving. Mix with water to create a smooth paste.",
      howToUse: "Mix appropriate amount of powder with water into smooth paste. Apply to face. Allow 25–30 minutes drying time. Peel off dried mask. Follow with moisturiser.",
      ingredients: "Corn Starch, Diatomaceous Earth, Sodium Alginate, Calcium Sulfate, Maltodextrin, Sodium Hyaluronate, Hydrolyzed Collagen, Niacinamide",
      cautions: "Avoid contact with eyes, eczema, wounds, and inflamed skin. Keep from children. Store in a dry place at room temperature.",
    },
  },
  {
    id: "c0ff0f7a-d46b-4f7c-818b-3d53059e38d9",
    data: {
      name: "Night Beauty Repair",
      price: 120,
      images: ["https://kentelle.com/cdn/shop/files/IMG-20260226-WA0004_7431f00b-0c79-4baf-a834-6d7185381dc2.jpg"],
      description: "Night cream with Triple Peptides and Sodium Hyaluronate. Addresses fine lines, boosts firmness, and promotes a youthful complexion. Restores, repairs, and provides antioxidant protection overnight.",
      howToUse: "Apply to cleansed face, neck, and body. Massage gently until absorbed. Use once daily or as needed. Optionally chill before use. Suitable for morning and evening. Layer over serum or peptides.",
      ingredients: "Aqua, Glycerin, Butylene Glycol, Capric/Caprylic Triglyceride, Mineral Oil, Almond Sweet Oil, Butyrospermum Parkii Butter, Stearyl Alcohol, Cetearyl Alcohol, Glyceryl Stearate, Dimethicone, Oligopeptide-1, Carnosine, Acetyl Hexapeptide-8, Dexpanthenol, Phenoxyethanol, Tocopherol (Vitamin E), Allantoin, Sodium Hyaluronate, Fragrance",
      cautions: "For external use only. Avoid contact with eyes.",
    },
  },
  {
    id: "349142f9-2bac-4aba-a2a7-ad5b41722ea0",
    data: {
      name: "Nightcare Moisturizer",
      price: 89,
      images: ["https://kentelle.com/cdn/shop/files/20260416_121052_1.jpg"],
      description: "Pump moisturiser for all skin types including post-dermal procedure skin. Works as a sealant to lock in serums and actives overnight. 30ml.",
      howToUse: "Apply 1–2 pumps after toning. Gently massage into face in circular motions. Use 1–2 times daily (day and night).",
      ingredients: "Water, Glycerin, Cetearyl Alcohol, Helianthus Annuus Seed Oil, Butyrospermum Parkii Butter, Niacinamide, Cocos Nucifera (Coconut) Oil, Aloe Vera, Cucumis Sativus (Cucumber) Extract, Marine Collagen (Hydrolyzed), Simmondsia Chinensis (Jojoba) Seed Oil, Sodium Hyaluronate, Pelargonium Graveolens (Geranium) Flower Oil",
      cautions: "For external use only. Avoid contact with eyes.",
    },
  },
  {
    id: "1b3965f1-3eca-4726-bc45-1333604ac08a",
    data: {
      name: "PDRN Pink Bio Cell Ampoules",
      price: 89,
      images: ["https://kentelle.com/cdn/shop/files/PDRNPink.jpg"],
      description: "PDRN (Polydeoxyribonucleotide / Sodium DNA) ampoules (10 × 1.5ml) for deep cellular repair, moisture replenishment, and advanced anti-aging. Boosts natural collagen synthesis and restores skin barrier integrity.",
      howToUse: "After cleansing, apply one ampoule evenly to face and neck, massaging gently until absorbed. Use morning and evening. Follow with Day or Night moisturiser.",
      ingredients: "Aqua, Glycerin, Niacinamide, Sodium Hyaluronate, Sodium DNA (PDRN), Soluble Collagen, Glutathione, Palmitoyl Pentapeptide-4, Acetyl Hexapeptide-8, Palmitoyl Tripeptide-1, Simmondsia Chinensis (Jojoba) Seed Oil, preservatives/stabilizers",
      cautions: "For external use only. Avoid contact with eyes.",
    },
  },
  {
    id: "705a2acc-ff30-45c2-a43f-86bcf3a0e2b1",
    data: {
      name: "Peel Back De-Aging Retinol Serum 0.01",
      slug: "peel-back-de-aging-retinol-serum",
      price: 89,
      images: ["https://kentelle.com/cdn/shop/files/PeelBack.jpg"],
      description: "Retinol 0.01 serum (30ml) with fruit acid extracts and a roll-on applicator. Nighttime resurfacing for rejuvenation, brightening, and acne control. Pairs with Dermal Glycolic Serum in the morning.",
      howToUse: "Cleanse face thoroughly. Apply via roll-on applicator across face, focusing on problem areas. Allow absorption. Follow with Derma Moisture Fix, Vitamin C, Derma Moisturiser Seal, and broad-spectrum sunblock. Begin with daily nighttime application; reduce frequency if tingling becomes uncomfortable.",
      ingredients: "Water, Glycerin, Pumice Stone, Vaccinium Myrtillus (Blueberry) Fruit Extract, Saccharum Officinarum (Sugar Cane) Extract, Citrus Aurantium (Orange) Fruit Extract, Citrus Medica Limonum (Lemon) Fruit Extract, Acer Saccharum (Maple), Helianthus Annuus Seed Oil, Butyrospermum Parkii Butter, Tocopherol (Natural Vitamin E), Mentha Piperita (Peppermint) Leaf Oil",
      cautions: "For nighttime use only. Always apply broad-spectrum sunscreen the following morning. Avoid during pregnancy.",
    },
  },
  {
    id: "3aad6708-adde-45be-a8cf-02ec4dbd739e",
    data: {
      name: "Relaxing & Comforting Mist",
      price: 59,
      images: ["https://kentelle.com/cdn/shop/files/20260416_113029.jpg"],
      description: "Night mist for all skin types with Lavender Oil, Niacinamide, and Aloe Vera. Soothing, hydrating, and sleep-inducing. Ideal post-dermal treatments.",
      howToUse: "Mist directly onto face. Use once daily or as needed. Optionally chill before use. Apply after cleansing, followed by serum and evening skincare routine.",
      ingredients: "Aqua (Demineralised Water), Ethanol, Glycerin, Niacinamide, Lavender Oil, Honey & Sandalwood Fragrance, Bergamot Fruit Oil, Aloe Barbadensis Leaf Juice Powder, Cucumis Sativus (Cucumber) Fruit Extract, Lactic Acid, Phenoxyethanol, Polysorbate 80, Ethylhexylglycerin, Disodium EDTA",
      cautions: "For external use only. Avoid direct eye contact.",
    },
  },
  {
    id: "53c2f56b-dc97-40e4-9bc3-1a9977afe79a",
    data: {
      name: "Vitamin B Facial Toner",
      price: 59,
      images: ["https://kentelle.com/cdn/shop/files/20260416_111147.jpg"],
      description: "Niacinamide (Vitamin B3) and Aloe Vera facial toner mist (125ml). Pore-refining, refreshing, and even-toning. Suitable for all skin types, particularly pigmented skin. Safe for pre- and post-makeup use.",
      howToUse: "Mist directly onto face after cleansing. Use once daily or as needed. Optionally chill before use. Apply morning and night.",
      ingredients: "Aqua, Aloe Barbadensis Leaf Juice, Glycerin, Niacinamide (Vitamin B3), Hamamelis Virginiana Bark/Twig Extract (Witch Hazel), Cucumis Sativus (Cucumber), Phenoxyethanol, Ethylhexylglycerin, Parfum, Tocopherol (Natural Vitamin E), Sodium Chloride",
      cautions: "For external use only. Avoid direct eye contact.",
    },
  },
  {
    id: "52793342-5f84-4187-825f-7f33f57e9262",
    data: {
      name: "Vitamin C 20 Cream",
      price: 89,
      description: "Vitamin C (Ascorbic Acid 20%) cream with Kakadu Plum extract, Green Tea, Shea Butter, and Natural Vitamin E. Strong antioxidant and collagen-stimulating formula. Available as 30ml Air Pump Box ($89) or 5ml × 6 Ampoules ($120).",
      howToUse: "Cleanse and tone. Apply 1–2 pumps and massage gently in circular motions. Follow with moisturiser and sunblock for daytime use. Avoid use for 3–7 days after clinical dermal treatments.",
      ingredients: "Ascorbic Acid (Vitamin C 20%), Glycerin, Helianthus Annuus Seed Oil, Terminalia Ferdinandiana Fruit Extract (Kakadu Plum), Camellia Sinensis Leaf Extract (Green Tea), Butyrospermum Parkii Butter (Shea Butter), Tocopherol (Natural Vitamin E), botanical oils",
      cautions: "For external use only. Always apply sunscreen afterward. Avoid contact with eyes.",
    },
  },
];

// ── 3. INSERT missing products ────────────────────────────────────────────────
const INSERTS = [
  {
    name: "Chonofirm Peptide Matrix Airpump",
    slug: "chonofirm-peptide-matrix-airpump",
    price: 89,
    isActive: true,
    stock: 0,
    images: ["https://kentelle.com/cdn/shop/files/PeptideChonoFirmMatrix.png"],
    description: "Peptide-based anti-aging treatment (30ml) delivered via airpump with a cooling metal rollerball for facial contouring and lifting. Anti-aging, tightening, and firming.",
    howToUse: "Apply nightly — roll cooling tip upward across face and neck using gentle strokes. Use minimal pressure around eyes. Follow with serums and moisturiser. Layer with retinol for aged skin or after professional dermal treatments.",
    ingredients: "Water, Glycerin, Butyrospermum Parkii Butter (Shea Butter), Palmitoyl Tetrapeptide-7, Palmitoyl Tripeptide-1, Palmitoyl Tripeptide-38, Sodium Hyaluronate, Retinyl Palmitate, Aloe Barbadensis, Cucumis Sativus Fruit Extract, Citrus Aurantium Dulcis (Orange) Peel Oil",
    cautions: "For external use only. Avoid contact with eyes.",
  },
  {
    name: "Day Beauty Radiance",
    slug: "day-beauty-radiance",
    price: 120,
    isActive: true,
    stock: 0,
    description: "Day cream (50ml) for firming, hydration, and antioxidant skin barrier protection. Firming & Tightening · Moisturising & Hydrating · Antioxidant Skin Barrier.",
    howToUse: "Apply to cleansed face and neck each morning. Follow with broad-spectrum sunscreen.",
    cautions: "For external use only. Avoid contact with eyes.",
  },
  {
    name: "Dr Pen Size 12 Needles",
    slug: "dr-pen-size-12-needles",
    price: 2.50,
    isActive: true,
    stock: 0,
    description: "Needle cartridges for Dr Pen 6 and Dr Pen 8 microneedling devices.",
    howToUse: "For professional use with compatible Dr Pen microneedling devices only.",
    cautions: "Single use only. Professional use recommended.",
  },
  {
    name: "Skin Nutrition",
    slug: "skin-nutrition",
    price: 0,
    isActive: false,
    stock: 0,
    description: "Coming soon.",
  },
];

// ── Run ───────────────────────────────────────────────────────────────────────
console.log("Disabling", DISABLE.length, "extra products...");
for (const id of DISABLE) {
  await patch(id, { isActive: false });
  process.stdout.write(".");
}
console.log(" done");

console.log("\nUpdating", UPDATES.length, "products...");
for (const { id, data } of UPDATES) {
  await patch(id, data);
  process.stdout.write(".");
}
console.log(" done");

console.log("\nInserting", INSERTS.length, "new products...");
for (const item of INSERTS) {
  await insert(item);
}

console.log("\n✓ Sync complete");
