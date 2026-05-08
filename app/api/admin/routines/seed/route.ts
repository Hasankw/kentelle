import { NextResponse } from "next/server";
import { db } from "@/lib/db";

const ROUTINES = [
  {
    title: "Everyday Essential Facial Regime",
    slug: "everyday-essential",
    tagline: "The perfect baseline for a healthy, glowing complexion.",
    category: "routine",
    sortOrder: 1,
    steps: [
      {
        number: 1,
        name: "CLEANSE",
        choices: "Milk Cleanser or Ceramide Cleanser.",
        description: "Purify without stripping. These gentle formulas remove impurities while respecting the skin's natural barrier.",
      },
      {
        number: 2,
        name: "TONE",
        choices: "Vitamin B Toner (AM) or Relaxing & Comforting Mist (PM).",
        description: "Balance and prep. Use Vitamin B to energise your skin for the day, and our calming mist to soothe it before bed.",
      },
      {
        number: 3,
        name: "SERUM",
        choices: "Moisture Fix or Hyaluron Booster Capsule.",
        description: "Deep hydration. Direct moisture to the deeper layers of the skin for a plump, dewy finish.",
      },
      {
        number: 4,
        name: "ANTIOXIDANT",
        choices: "Vitamin C 20% or Bio-Ferment Barrier Cream.",
        description: "Strengthen and protect. Neutralise environmental stressors and fortify your skin's resilience.",
      },
      {
        number: 5,
        name: "MOISTURISE",
        choices: "Day Care, Night Care, Day Beauty Radiant, Night Beauty Repair, or Aqua Moisturiser (Day & Night).",
        description: "Lock it in. Choose your texture to provide a final veil of nourishment and comfort.",
      },
      {
        number: 6,
        name: "PROTECTION",
        choices: "Sunscreen with at least SPF 30 (Essential for AM).",
        description: "The ultimate anti-ageing step. Shield your skin from UV damage every single day.",
      },
    ],
    tips: {
      suitability: "Best for: Dry, Normal, Sensitive and Calming red skin types. Ideal for: Those who prefer a streamlined, effective, and results-driven routine.",
      items: [
        { label: "Looking for instant radiance?", content: "Transition to our Peel and Glow regime to resurface and brighten." },
        { label: "Need deeper nourishment?", content: "Discover the Skin Nutrients regime, designed to feed your skin with intense vitamins and minerals." },
      ],
    },
  },
  {
    title: "Peel and Glow Facial Regime",
    slug: "peel-and-glow",
    tagline: "The pro-dermal routine for resurfacing, clarity, and that 'glass skin' finish.",
    category: "routine",
    sortOrder: 2,
    steps: [
      {
        number: 1,
        name: "CLEANSE",
        choices: "Milk Cleanser, Ceramide Cleanser, or Fruit Enzyme Cleanser.",
        description: "Prep your canvas. Use the Fruity Cleanser for a deeper, enzymatic clean.",
      },
      {
        number: 2,
        name: "TONE",
        choices: "Vitamin B Toner (AM) or Relaxing & Comforting Mist (PM).",
        description: "Balance and calm. Ensure skin is prepped to receive high-performance actives.",
      },
      {
        number: 3,
        name: "SERUM",
        choices: "Moisture Fix or Hyaluron Booster Capsule (AM & PM).",
        description: "Deep hydration. Essential support to keep skin plump while using active peels.",
      },
      {
        number: 4,
        name: "PEEL",
        subtitle: "The Game Changer",
        choices: "Glyco-10 (AM) | Retinol/Retinal alternate with UMMF Correcting Serum (PM).",
        description: "Resurface and renew. Shed dead skin cells and stimulate collagen while UMMF targets uneven tone and pigmentation for ultimate radiance.",
      },
      {
        number: 5,
        name: "ANTIOXIDANT",
        choices: "Vitamin C 20% or Bio-Ferment Barrier Cream (AM & PM).",
        description: "Fortify. Shield your freshly peeled skin from environmental damage and support the barrier.",
      },
      {
        number: 6,
        name: "MOISTURISE",
        choices: "Day Care, Night Care Moisturiser, Day Beauty Radiant, Night Beauty Repair, or Aqua Moisturiser (Day & Night).",
        description: "Seal and heal. Provide the necessary nourishment to support the skin's renewal process.",
      },
      {
        number: 7,
        name: "PROTECTION",
        choices: "Sunscreen SPF 30 (Daily Essential).",
        description: "Non-negotiable. Protect your new, glowing skin from UV sensitivity.",
      },
    ],
    tips: {
      suitability: "Best for: Oily, Blocked Pores, Acne-Prone, Pigmented, Sun-Damaged, or Ageing skin. Also ideal for maintaining Healthy & Glowing \"Glass Skin\".",
      items: [
        { label: "The Skin Prep", content: "Use this routine for 6 weeks prior to IPL, Laser, Deep Peels, or Cosmetic Injectables to achieve the best results and minimise complications." },
        { label: "Post-Treatment Care", content: "Stop this active routine for 7–15 days after cosmetic treatments (or until healed). Switch to our Everyday Essential or Skin Nutrients routine during this time." },
        { label: "Start Slow", content: "When introducing Retinol, Retinal, or Glyco-10, start with one application per week and slowly increase frequency as tolerated." },
        { label: "Professional Help", content: "For deep congestion or acne, professional intervention is best. Book in for extractions or microdermabrasion at your preferred dermal clinic." },
      ],
    },
  },
  {
    title: "Skin Nutrients Facial Regime",
    slug: "skin-nutrients",
    tagline: "The ultimate feast for your skin. Feed your glow to stay healthy, resilient, and youthful.",
    category: "routine",
    sortOrder: 3,
    steps: [
      {
        number: 1,
        name: "CLEANSE",
        choices: "Milk Cleanser, Ceramide Cleanser, or Fruity Cleanser.",
        description: "Start fresh. A gentle, clean base ensures your skin is ready to absorb every nutrient.",
      },
      {
        number: 2,
        name: "TONE",
        choices: "Vitamin B Toner (AM) or Relaxing & Comforting Mist (PM).",
        description: "Prep and soothe. Create the perfect environment for deep nutrient delivery.",
      },
      {
        number: 3,
        name: "SERUM",
        choices: "Moisture Fix or Hyaluron Booster Capsule (AM & PM).",
        description: "Hydration foundation. A plump, hydrated skin cell is a hungry skin cell, ready for nourishment.",
      },
      {
        number: 4,
        name: "ANTIOXIDANT",
        choices: "Vitamin C 20% or Bio-Ferment Barrier Cream (AM & PM).",
        description: "Shield and fortify. Protect your skin's vitality from environmental stressors and internal imbalances.",
      },
      {
        number: 5,
        name: "NOURISH",
        subtitle: "The Power Step",
        choices: "Chronofirm Peptide Matrix, Collagen Cream, Collagen Capsules, or PDRN Pink Bio-Cell Ampoules.",
        description: "Feed the skin. Infuse your complexion with high-grade peptides and nutrients to support repair and density.",
      },
      {
        number: 6,
        name: "MOISTURISE",
        choices: "Day Care, Night Care Moisturiser, Day Beauty Radiant, Night Beauty Repair, or Aqua Moisturiser (Day & Night).",
        description: "Envelop and lock in. A final layer of comfort to seal in your nutrients.",
      },
      {
        number: 7,
        name: "PROTECTION",
        choices: "Sunscreen SPF 30 (Daily Essential).",
        description: "Preserve your progress. Never let UV damage undo the work of your skin's nutrients.",
      },
    ],
    tips: {
      suitability: "Best for: All Skin Types. Every skin needs nutrients to function at its best!",
      items: [
        { label: "The Ageing Rule", content: "The more mature the skin, the more nourishment it requires to prevent disorders like pigmentation and slow down the ageing process." },
        { label: "Post-Treatment Recovery", content: "This is the perfect follow-up routine after professional dermal facials to deeply replenish and soothe the skin during the healing phase." },
        { label: "The Philosophy", content: "In short, feed your skin daily to keep it healthy, vibrant, and youthful." },
      ],
    },
  },
  {
    title: "Clinical Treatment: Acne Rosacea",
    slug: "acne-rosacea",
    tagline: "A gentle, targeted approach to calm inflammation, manage flares, and restore skin health.",
    category: "clinical",
    sortOrder: 1,
    steps: [
      {
        number: 1,
        name: "CLEANSE",
        subtitle: "Strictly Mild",
        choices: "Milk Cleanser or Ceramide Cleanser.",
        description: "Gentle is key. Purify without irritation to keep the skin barrier calm and intact.",
      },
      {
        number: 2,
        name: "TONE",
        choices: "Vitamin B Toner (AM) or Relaxing & Comforting Mist (PM).",
        description: "Soothe and prep. Hydrate and balance the skin's pH to reduce heat and redness.",
      },
      {
        number: 3,
        name: "TOPICAL ACTIVES",
        subtitle: "Medical Support",
        choices: "Topical Antibiotics (e.g., Clindamycin 1%).",
        description: "Targeted Care: Doctor's prescription required. Apply only to localised or infected areas as professionally advised.",
      },
      {
        number: 4,
        name: "SERUM",
        choices: "Moisture Fix or Hyaluron Booster Capsule (AM & PM).",
        description: "Weightless hydration. Replenish moisture levels to support the skin's natural healing process.",
      },
      {
        number: 5,
        name: "ANTIOXIDANT",
        choices: "Vitamin C 20% or Bio-Ferment Barrier Cream (AM & PM).",
        description: "Protect and Fortify. Build skin resilience against environmental triggers that cause flaring.",
      },
      {
        number: 6,
        name: "MOISTURISE",
        choices: "Day Care, Night Care Moisturiser, Day Beauty Radiant, Night Beauty Repair, or Aqua Moisturiser (Day & Night).",
        description: "Provide a final layer of protection to soothe and nourish reactive skin.",
      },
      {
        number: 7,
        name: "PROTECTION",
        choices: "Sunscreen SPF 30 (Daily Essential).",
        description: "UV rays are a major rosacea trigger. Shield your skin every morning without fail.",
      },
    ],
    tips: {
      suitability: "Best for: Rosacea-prone skin with active flares, persistent redness, or sensitivity.",
      items: [
        { label: "Manage the Flare", content: "Stress is a significant trigger for Acne Rosacea. Incorporate relaxation — like meditation or breathwork — into your daily routine to help keep flaring at bay." },
        { label: "Internal Support", content: "Consider high-dosage Fish Oil and Vitamin C supplements to support skin health from the inside out." },
        { label: "Clinical Maintenance", content: "Once the skin is stable, maintain results with mild Microdermabrasion, superficial AHA peels, and eventually IPL treatments at Beaubelle Beauty Clinic. LED light is recommended for best results." },
        { label: "Not sure if this is for you?", content: "If you have persistent redness without active infection or bumps, our Skin Nutrients Regime is the perfect baseline to calm and comfort your complexion." },
      ],
    },
  },
  {
    title: "Clinical Treatment: Acne Vulgaris & Cystic Acne",
    slug: "acne-vulgaris",
    tagline: "A high-performance regime designed to clear congestion, control infection, and accelerate skin repair.",
    category: "clinical",
    sortOrder: 2,
    steps: [
      {
        number: 1,
        name: "CLEANSE",
        choices: "Fruit Enzyme Cleanser or G Biomed Cleanser (Glycolic 12%).",
        description: "Deep purification. Note: No skin is the same — if irritation occurs, switch to our Milk or Ceramide Cleanser when using active peeling agents.",
      },
      {
        number: 2,
        name: "TONE",
        choices: "Vitamin B Toner (Day).",
        description: "Prep and balance. Build resilience in the skin to better tolerate active treatments.",
      },
      {
        number: 3,
        name: "TOPICAL ACTIVES",
        subtitle: "Medical Support",
        choices: "Topical Antibiotics (e.g., Clindamycin 1%).",
        description: "Targeted Care: Doctor's prescription required. Apply only to localised or infected areas as professionally advised.",
      },
      {
        number: 4,
        name: "SERUM",
        choices: "Moisture Fix or Hyaluron Booster Capsule (AM & PM).",
        description: "Hydrate to heal. Keeping skin hydrated is critical to reducing irritation while using clinical actives.",
      },
      {
        number: 5,
        name: "PEEL & CORRECT",
        subtitle: "The Power Step",
        choices: "Glyco-10 (AM) | Retinol/Retinal alternate with UMMF Correcting Serum (PM).",
        description: "Resurface and brighten. Clear blocked pores and stimulate renewal while UMMF targets post-acne marks and uneven tone.",
      },
      {
        number: 6,
        name: "ANTIOXIDANT",
        choices: "Vitamin C 20% or Bio-Ferment Barrier Cream (AM & PM).",
        description: "Fortify. Support the skin's recovery and protect against environmental scarring triggers.",
      },
      {
        number: 7,
        name: "MOISTURISE",
        choices: "Day Care, Night Care Moisturiser, Day Beauty Radiant, Night Beauty Repair, or Aqua Moisturiser (Day & Night).",
        description: "Soothe and seal. Maintain the skin barrier to prevent dryness and peeling.",
      },
      {
        number: 8,
        name: "PROTECTION",
        choices: "Sunscreen SPF 30 (Daily Essential).",
        description: "Critical step. Antibiotics increase photosensitivity; shielding your skin is a must to prevent UV damage.",
      },
    ],
    tips: {
      suitability: "Best for: Acne Vulgaris, Cystic Acne, Congested Skin, Post-Acne Marks.",
      items: [
        { label: "The Clinical Strategy", content: "For cystic acne, professional peels are recommended before microdermabrasion. Medical prescriptions and dermal treatments must work together. Blue light therapy is recommended for best results." },
        { label: "Patience is Key", content: "Treatment typically takes 3–6 months or more. The sooner you begin, the lower the risk of long-term scarring." },
        { label: "Transitioning", content: "Once skin improves, reduce the frequency of Retinol/Glycolic and increase nourishment with our Skin Nutrients Regime." },
        { label: "The Golden Rule", content: "DO NOT PICK. Picking leads to inflammation and permanent scarring. Let the products and your therapist do the work!" },
        { label: "Important Safety Disclaimer", content: "Roaccutane (Isotretinoin) Users: This active regime is not recommended while under a Roaccutane prescription. Please consult your specialist or dermal therapist for a modified, ultra-gentle routine during your medication course and for 6 months after finishing." },
      ],
    },
  },
  {
    title: "Clinical Treatment: Pigmentation",
    slug: "pigmentation",
    tagline: "A targeted regime to lighten, brighten, and even out skin tone while suppressing future pigment formation.",
    category: "clinical",
    sortOrder: 3,
    steps: [
      {
        number: 1,
        name: "CLEANSE",
        choices: "Milk Cleanser, Ceramide Cleanser, or Fruit Enzyme Cleanser (Best for Oily Skin).",
        description: "Start with a clear canvas. The Fruit Enzyme option provides a gentle enzymatic exfoliation to prep the skin.",
      },
      {
        number: 2,
        name: "TONE",
        choices: "Vitamin B Toner (Day & Night).",
        description: "Strengthen and prep. Vitamin B is essential for supporting the skin barrier during a brightening regime.",
      },
      {
        number: 3,
        name: "SERUM",
        choices: "Moisture Fix or Hyaluron Booster Capsule (AM & PM).",
        description: "Weightless hydration. Replenish moisture levels to support the skin's natural healing process.",
      },
      {
        number: 4,
        name: "PEEL & CORRECT",
        choices: "Glyco-10 (AM) | Retinol/Retinal alternate with UMMF Correcting Serum, Arbutin, or Niacinamide (PM).",
        description: "Note for Prescription Users: If your GP has prescribed Hydroquinone for stubborn areas, apply sparingly to localised areas before Retinol at night. During the day, proceed with Glyco-10.",
      },
      {
        number: 5,
        name: "ANTIOXIDANT",
        choices: "Vitamin C 20% or Bio-Ferment Barrier Cream (AM & PM).",
        description: "Protect and Fortify. Shield your freshly peeled skin from environmental damage and support the barrier to prevent further pigmentation.",
      },
      {
        number: 6,
        name: "MOISTURISE",
        choices: "Day Care, Night Care Moisturiser, Day Beauty Radiant, Night Beauty Repair, or Aqua Moisturiser (Day & Night).",
        description: "Seal and heal. Provide the necessary nourishment to support the skin's renewal process and maintain a healthy glow.",
      },
      {
        number: 7,
        name: "PROTECTION",
        choices: "Sunscreen SPF 30 (Daily Essential).",
        description: "Non-negotiable. UV rays are a primary trigger; protect your new, glowing skin from sensitivity to keep the condition at bay.",
      },
    ],
    tips: {
      suitability: "Best for: Hormonal pigmentation, sun damage, post-inflammatory hyperpigmentation, uneven skin tone.",
      items: [
        { label: "Identify the Trigger", content: "Pigmentation can be caused by hormonal shifts (such as pregnancy), sun damage, post-treatment recovery, or medical factors like chemotherapy." },
        { label: "Consistency is Key", content: "This is a complex condition that is difficult to treat. Results take time and require dedicated, daily application." },
        { label: "Long-Term Maintenance", content: "Pigmentation is persistent; even after successful treatment, the condition may return if the routine is not maintained." },
        { label: "Pre-Treatment Prep", content: "For the best clinical results, use this routine for 6 weeks prior to IPL, Laser, or Deep Peels to minimize complications." },
        { label: "Professional Intervention", content: "For stubborn pigmentation, professional treatments are advised." },
      ],
    },
  },
];

export async function POST() {
  try {
    const results = [];
    for (const routine of ROUTINES) {
      const existing = await db.routine.findUnique({ where: { slug: routine.slug } });
      if (existing) {
        results.push({ slug: routine.slug, status: "skipped" });
        continue;
      }
      await db.routine.create({ data: routine });
      results.push({ slug: routine.slug, status: "created" });
    }
    return NextResponse.json({ ok: true, results });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
