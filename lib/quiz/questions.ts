import type { ConcernKey, QuizQuestion } from "./types";

export const CONCERN_OPTIONS: { value: ConcernKey; label: string; note?: string }[] = [
  { value: "acne", label: "Breakouts & Blemishes" },
  { value: "redness", label: "Redness & Flushing" },
  { value: "sensitivity", label: "Environmental Sensitivity" },
  { value: "lines", label: "Fine Lines & Wrinkles" },
  { value: "firmness", label: "Loss of Elasticity / Firmness" },
  { value: "pigment", label: "Dark Spots & Uneven Tone" },
  { value: "dryness", label: "Persistent Dryness / Flaking" },
  { value: "shine", label: "Excessive Shine & Visible Pores" },
  { value: "posttreatment", label: "Recovering From a Clinical Treatment", note: "Recent laser, peel, or microneedling" },
];

export const NAME_QUESTION: QuizQuestion = {
  id: "name",
  prompt: "To begin your analysis, what is your first name?",
  type: "text",
  placeholder: "Your first name",
};

// ─── Stage 3: per-concern question pools ───────────────────────────────────

const sensitivity: QuizQuestion[] = [
  {
    id: "sens_1_1",
    prompt: "On a scale of 1 to 5, how inherently vulnerable or reactive does your skin feel on a daily basis?",
    why: "Wrinkles and reactivity share the same root: your baseline sensitivity sets how strong your whole routine needs to be.",
    type: "single",
    options: [
      { value: "1", label: "1 — Highly Resilient", note: "Rarely reacts to anything", products: ["ceramide-cleanser", "moisture-fix", "vitamin-c-cream", "daycare"] },
      { value: "2", label: "2 — Mildly Tolerant", note: "Occasional seasonal changes cause slight shifts", products: ["milk-cleanser", "vitamin-b-toner", "moisture-fix", "daycare"] },
      { value: "3", label: "3 — Moderately Reactive", note: "Prone to occasional flare-ups", products: ["ceramide-cleanser", "cica-peptide-concentrate", "turmeric-exosome", "moisture-fix", "nightcare"] },
      { value: "4", label: "4 — Noticeably Sensitive", note: "Must be cautious with skincare choices", products: ["ceramide-cleanser", "relaxing-mist", "cica-peptide-concentrate", "bio-ferment-cream", "cucumber-exosome"], flags: ["avoid_aggressive_actives"] },
      { value: "5", label: "5 — Hyper-Reactive", note: "Reacts to almost everything, easily thrown off balance", products: ["ceramide-cleanser", "pdrn-ampoules", "moisture-fix", "bio-ferment-cream", "turmeric-exosome"], flags: ["strict_barrier_rescue", "block_aha", "block_retinoid"] },
    ],
  },
  {
    id: "sens_1_2",
    prompt: "How frequently do newly introduced topical skincare products cause visible irritation, bumps, or adverse reactions?",
    type: "single",
    options: [
      { value: "never", label: "Never" },
      { value: "rarely", label: "Rarely" },
      { value: "occasionally", label: "Occasionally", flags: ["avoid_aggressive_actives"], products: ["ceramide-cleanser", "bio-ferment-cream"] },
      { value: "frequently", label: "Frequently", flags: ["avoid_aggressive_actives"], products: ["fruit-enzyme-cleanser", "ceramide-cleanser", "bio-ferment-cream"] },
    ],
  },
  {
    id: "sens_1_3",
    prompt: "Do you frequently experience a sudden burning, stinging, or prickling sensation when applying standard face creams or washing your face?",
    why: "Highly sensitised skin releases an internal alarm signal (Substance P) that triggers burning. Neuro-calming actives like PDRN and peptides tell those nerve endings to stand down.",
    type: "single",
    options: [
      { value: "yes", label: "Yes", products: ["pdrn-ampoules", "cica-peptide-concentrate", "copper-peptide", "moisture-fix", "bio-ferment-cream"] },
      { value: "no", label: "No" },
    ],
  },
  {
    id: "sens_1_4",
    prompt: "Do you notice predictable, sudden shifts in your skin's behavior — e.g. localized breakouts along the jaw, sudden dry spells, or flaring pigmentation?",
    type: "single",
    options: [
      { value: "cycle", label: "Yes, my skin fluctuates in a predictable monthly cycle", products: ["bha-serum", "ceramide-cleanser", "vitamin-b-toner", "bio-ferment-cream", "moisture-fix", "daycare"], flags: ["hormonal_cycle"] },
      { value: "shift", label: "Yes, my skin permanently shifted recently (pregnancy, postpartum, menopause)", products: ["ceramide-cleanser", "vitamin-b-toner", "moisture-fix", "hyaluron-capsules", "copper-peptide", "cica-collagen-concentrate", "bio-ferment-cream"], flags: ["major_endocrine_shift"] },
      { value: "stable", label: "No, my skin baseline stays relatively consistent" },
    ],
  },
];

const aging: QuizQuestion[] = [
  {
    id: "aging_2_1",
    prompt: "Is targeting fine lines a primary focus for your routine today?",
    why: "Collagen production naturally slows over time. Your focus level tells us how strong your formula needs to be — from preventative peptides to high-strength cell renewers.",
    type: "single",
    options: [
      { value: "1", label: "1 — Pure Prevention", note: "No visible lines yet, just looking to protect", products: ["daycare", "aqua-moisturiser", "nightcare", "copper-peptide"] },
      { value: "2", label: "2 — First Signs", note: "Faint lines appear mostly when dehydrated", products: ["retinal", "glyco-10", "chronofirm-peptide", "ginseng-exosome", "nightcare"], flags: ["retinoid_user"] },
      { value: "3", label: "3 — Moderate Focus", note: "Early superficial lines starting to stay visible", products: ["retinal", "glyco-10", "chronofirm-peptide", "ginseng-exosome"], flags: ["retinoid_user"] },
      { value: "4", label: "4 — High Correction", note: "Visible wrinkles becoming more etched in", products: ["retinal", "pdrn-ampoules", "chronofirm-peptide", "lacto-exosome", "night-beauty-repair"], flags: ["retinoid_user"] },
      { value: "5", label: "5 — Intensive Repair", note: "Deeply set lines and noticeable structural changes", products: ["pdrn-ampoules", "chronofirm-peptide", "lacto-exosome", "collagen-cream", "night-beauty-repair"], flags: ["retinoid_user"] },
    ],
  },
  {
    id: "aging_2_2a",
    prompt: "Have you noticed uneven hyperpigmentation, sun spots, or coarse skin texture caused by past sun exposure?",
    type: "single",
    options: [
      { value: "no", label: "No" },
      { value: "yes", label: "Yes", products: ["ceramide-cleanser", "vitamin-b-toner", "vitamin-c-cream", "glyco-10", "pdrn-ampoules", "ginseng-exosome"] },
    ],
  },
  {
    id: "aging_2_2b",
    prompt: "Do you notice deeper creases forming in high-expression areas, like across your forehead or around your mouth?",
    type: "single",
    options: [
      { value: "no", label: "Not really" },
      { value: "moderate", label: "Moderate", products: ["chronofirm-peptide", "pdrn-ampoules", "lacto-exosome", "vitamin-c-cream"] },
      { value: "high", label: "Very noticeably", products: ["chronofirm-peptide", "pdrn-ampoules", "lacto-exosome", "bio-ferment-cream"] },
    ],
  },
  {
    id: "aging_2_3",
    prompt: "Are you experiencing a loss of skin thickness, a paper-like texture, or structural sagging along your jawline or cheeks?",
    why: "True sagging means deep elastin fibers and collagen networks are stretching out — advanced peptides feed the skin what it needs to rebuild.",
    type: "single",
    options: [
      { value: "no", label: "No, my skin still feels firm and plump" },
      { value: "mild", label: "Mild", products: ["collagen-capsules", "retinal", "chronofirm-peptide", "lacto-exosome", "collagen-cream"] },
      { value: "moderate", label: "Moderate", products: ["collagen-capsules", "retinal", "chronofirm-peptide", "ginseng-exosome", "night-beauty-repair"] },
      { value: "severe", label: "Highly noticeably", products: ["collagen-capsules", "retinal", "copper-peptide", "pdrn-ampoules"] },
    ],
  },
  {
    id: "aging_2_4",
    prompt: "How concerned are you with fine lines directly around your eyes?",
    type: "single",
    options: [
      { value: "none", label: "Not a focus for me" },
      { value: "mild", label: "A little concerned" },
      { value: "severe", label: "Highly concerned" },
    ],
  },
  {
    id: "aging_2_5",
    prompt: "When you look closely at your under-eye area, how would you describe the main concern?",
    why: "Bluish means vascular pooling. Brown/grey means true melanin deposits. Hollow means volume loss. Each needs a different active.",
    type: "single",
    options: [
      { value: "vascular", label: "Bluish, purple, or shadowed — worse when tired or stressed", products: ["beautiful-eyes-serum", "vitamin-b-toner", "cucumber-exosome", "copper-peptide", "bio-ferment-cream"] },
      { value: "pigment", label: "Distinctly brown or dark grey, wrapping the eye socket", products: ["beautiful-eyes-serum", "vitamin-c-cream", "lacto-exosome", "cica-peptide-concentrate"] },
      { value: "hollow", label: "Hollow, sunken, or casts a shadow under bright light", products: ["beautiful-eyes-serum", "hyaluron-capsules", "lacto-exosome", "cica-collagen-concentrate"] },
      { value: "puffy", label: "Morning puffiness or fluid retention", products: ["beautiful-eyes-serum", "turmeric-exosome", "cica-collagen-concentrate"] },
      { value: "none", label: "None of the above / uniform" },
    ],
  },
];

const dryness: QuizQuestion[] = [
  {
    id: "dry_3_1",
    prompt: "How consistently does your skin feel tight, dry, or parched throughout the day?",
    why: "Constant dryness means your skin's natural moisture blanket is missing its essential oils, leaving microscopic gaps that let hydration evaporate.",
    type: "single",
    options: [
      { value: "1", label: "1 — Never", note: "My skin generally feels comfortable or oily", products: ["ceramide-cleanser", "moisture-fix", "vitamin-c-cream", "daycare"] },
      { value: "2", label: "2 — Seldom", note: "Only during sudden winter weather shifts", products: ["vitamin-c-cream", "moisture-fix", "nightcare"] },
      { value: "3", label: "3 — Occasionally", note: "Skin feels tight a few hours after morning wash", products: ["hyaluron-capsules", "moisture-fix", "daycare"] },
      { value: "4", label: "4 — Frequently", note: "Regularly need to reapply lotion to stay comfortable", products: ["cucumber-exosome", "moisture-fix", "bio-ferment-cream", "daycare"] },
      { value: "5", label: "5 — Constantly", note: "Continuously parched, tight, and uncomfortable", products: ["cucumber-exosome", "hyaluron-capsules", "bio-ferment-cream", "collagen-capsules"] },
    ],
  },
  {
    id: "dry_3_2",
    prompt: "Does your face ever feel itchy, sensitive, or uncomfortable, particularly in the evening or right before bed?",
    why: "Skin repairs itself while you sleep — without a healthy barrier, that nighttime recovery cycle can trigger mild irritation and itching.",
    type: "single",
    options: [
      { value: "never", label: "Never" },
      { value: "rarely", label: "Rarely" },
      { value: "occasionally", label: "Occasionally", products: ["turmeric-exosome", "relaxing-mist", "cica-peptide-concentrate", "bio-ferment-cream"], flags: ["nocturnal_itching"] },
      { value: "frequently", label: "Frequently", products: ["turmeric-exosome", "relaxing-mist", "cica-peptide-concentrate", "hyaluron-capsules", "bio-ferment-cream"], flags: ["nocturnal_itching"] },
    ],
  },
  {
    id: "dry_3_3",
    prompt: "Do you notice visible flaking, peeling, or rough, scaly patches on your skin?",
    why: "Flaking happens when dead cells lose their ability to shed naturally. Ultra-gentle polishing dissolves that cellular glue instead of scrubbing it off.",
    type: "single",
    options: [
      { value: "no", label: "No — my skin looks smooth, even if it feels dry", products: ["daycare", "hyaluron-capsules"] },
      { value: "mild", label: "Sometimes — localized flaking around my nose, mouth, or eyebrows", products: ["glyco-10", "hyaluron-capsules", "moisture-fix"] },
      { value: "severe", label: "Yes — I regularly see visible peeling or rough texture patches", products: ["ceramide-cleanser", "glyco-10", "hyaluron-capsules", "moisture-fix", "retinal", "night-beauty-repair"] },
    ],
  },
];

const acne: QuizQuestion[] = [
  {
    id: "acne_4_1",
    prompt: "How often do you typically experience breakouts or active blemishes on your face?",
    type: "single",
    options: [
      { value: "1", label: "1 — Never", note: "My skin stays completely clear" },
      { value: "2", label: "2 — Seldom", note: "Only a random spot once every few months" },
      { value: "3", label: "3 — Cyclical", note: "They hit predictably, during hormonal shifts or high-stress weeks", products: ["bha-serum", "retinal", "ceramide-cleanser", "vitamin-b-toner", "bio-ferment-cream", "moisture-fix"] },
      { value: "4", label: "4 — Frequently", note: "I almost always have a few active spots somewhere", products: ["fruit-enzyme-cleanser", "glyco-10", "bio-ferment-cream", "moisture-fix", "daycare", "ceramide-cleanser", "retinal", "night-beauty-repair"] },
      { value: "5", label: "5 — Constantly", note: "Persistent, widespread breakouts that don't clear up", products: ["fruit-enzyme-cleanser", "glyco-10", "bha-serum", "bio-ferment-cream", "moisture-fix", "ceramide-cleanser", "retinal", "night-beauty-repair"] },
    ],
  },
  {
    id: "acne_4_2",
    prompt: "Do you struggle with surface texture like blackheads (clogged, dark pores) or tiny white bumps (whiteheads)?",
    type: "single",
    options: [
      { value: "no", label: "Not really — my skin texture feels mostly smooth", products: ["ceramide-cleanser"] },
      { value: "occasional", label: "Occasionally — around my nose, chin, or forehead", products: ["fruit-enzyme-cleanser"] },
      { value: "frequent", label: "Frequently — widespread clogged pores and rough texture", products: ["ceramide-cleanser", "vitamin-b-toner", "vitamin-c-cream", "glyco-10", "moisture-fix", "daycare", "fruit-enzyme-cleanser", "retinal", "night-beauty-repair"] },
    ],
  },
  {
    id: "acne_4_3",
    prompt: "Do you get small, tender, pink or red bumps that feel swollen and sore to the touch?",
    type: "single",
    options: [
      { value: "1", label: "Not at all" },
      { value: "2", label: "Rarely", products: ["relaxing-mist"] },
      { value: "3", label: "Moderate", products: ["ceramide-cleanser", "bha-serum", "bio-ferment-cream"] },
      { value: "4", label: "A lot", products: ["ceramide-cleanser", "bha-serum", "bio-ferment-cream"] },
    ],
  },
  {
    id: "acne_4_4",
    prompt: "Do you experience larger, deep-set, painful blemishes that stay under the skin and take a long time to go away?",
    why: "Deep cystic blemishes live lower in the skin matrix. They carry a higher risk of leaving marks, so we prioritize barrier-safe healing support over aggressive surface treatment.",
    type: "single",
    options: [
      { value: "never", label: "Never" },
      { value: "occasionally", label: "Occasionally", products: ["glyco-10", "bha-serum", "moisture-fix", "bio-ferment-cream", "retinal"] },
      { value: "regularly", label: "Regularly", products: ["glyco-10", "bha-serum", "moisture-fix", "bio-ferment-cream", "retinal"] },
    ],
  },
];

const redness: QuizQuestion[] = [
  {
    id: "red_5_1",
    prompt: "How consistently do you notice an unprompted pink or red flush across your face?",
    type: "single",
    options: [
      { value: "1", label: "1 — Never", note: "My skin tone is uniformly even", products: ["milk-cleanser", "vitamin-b-toner"] },
      { value: "2", label: "2 — Rarely", note: "Only after high-intensity workouts or extreme heat", products: ["milk-cleanser", "vitamin-b-toner"] },
      { value: "3", label: "3 — Occasionally", note: "Noticeable patches a few times a week", products: ["relaxing-mist", "cica-collagen-concentrate", "daycare"] },
      { value: "4", label: "4 — Frequently", note: "Redness is a daily baseline feature for my skin", products: ["cucumber-exosome", "vitamin-c-cream", "cica-collagen-concentrate", "bio-ferment-cream"] },
      { value: "5", label: "5 — Constantly", note: "My skin looks intensely red or flushed all day long", products: ["cucumber-exosome", "vitamin-c-cream", "chronofirm-peptide", "bio-ferment-cream"] },
    ],
  },
  {
    id: "red_5_2",
    prompt: "When you trace the pattern of the redness, where does it primarily live?",
    why: "Lingering marks from old blemishes just need gentle brightening. A widespread facial flush means blood vessels are dilating — over-exfoliating that skin only makes it worse.",
    type: "single",
    options: [
      { value: "post_inflammatory", label: "Strictly blemish-related — flat marks lingering where past pimples used to be" },
      { value: "mixed", label: "A combination — lingering marks and a general all-over flush", products: ["ceramide-cleanser", "relaxing-mist", "bio-ferment-cream", "collagen-capsules", "cica-peptide-concentrate"] },
      { value: "vascular", label: "A separate flush — spreads uniformly across my nose, cheeks or center face", products: ["ceramide-cleanser", "relaxing-mist", "bio-ferment-cream"], flags: ["block_aha", "block_retinoid"] },
    ],
  },
  {
    id: "red_5_3",
    prompt: "Have you ever been formally diagnosed by a doctor or dermatologist with any of these clinical skin conditions?",
    subtitle: "Select all that apply",
    why: "Diagnosed conditions follow specific inflammatory pathways — your routine will automatically skip common triggering ingredients.",
    type: "multi",
    options: [
      { value: "rosacea", label: "Rosacea", products: ["turmeric-exosome", "bio-ferment-cream", "vitamin-b-toner"], flags: ["block_aha", "block_retinoid"] },
      { value: "seb-derm", label: "Seborrheic Dermatitis", products: ["turmeric-exosome", "bio-ferment-cream", "vitamin-b-toner"], flags: ["block_aha", "block_retinoid"] },
      { value: "eczema", label: "Eczema / Atopic Dermatitis", products: ["turmeric-exosome", "bio-ferment-cream", "vitamin-b-toner"], flags: ["block_aha", "block_retinoid"] },
      { value: "psoriasis", label: "Facial Psoriasis", products: ["ceramide-cleanser", "turmeric-exosome", "cica-collagen-concentrate", "bio-ferment-cream"], flags: ["block_aha", "block_retinoid"] },
      { value: "per-derm", label: "Perioral Dermatitis", products: ["turmeric-exosome", "bio-ferment-cream"], flags: ["block_aha", "block_retinoid"] },
      { value: "cont-derm", label: "Contact Dermatitis (Allergic or Irritant)", products: ["ceramide-cleanser", "relaxing-mist", "bio-ferment-cream", "moisture-fix"], flags: ["block_aha", "block_retinoid"] },
      { value: "none", label: "None of these / I'm not entirely sure" },
    ],
  },
  {
    id: "red_5_4",
    prompt: "Does your facial redness remain visible all day long, or does it hit in sudden, temporary waves?",
    type: "single",
    options: [
      { value: "chronic", label: "It's persistent — the baseline redness is always there", products: ["turmeric-exosome", "bio-ferment-cream"] },
      { value: "reactive", label: "It's situational — normal most of the time, flares with triggers", products: ["relaxing-mist", "daycare"] },
    ],
  },
  {
    id: "red_5_5",
    prompt: "How easily does your skin blush, flash warm, or splotch red under stress, hot drinks, or spicy food?",
    type: "single",
    options: [
      { value: "none", label: "Not at all — my skin remains stable" },
      { value: "mild", label: "Mildly — a brief warm flush that fades quickly" },
      { value: "moderate", label: "Moderately — a noticeable, lasting flush", products: ["cica-collagen-concentrate", "relaxing-mist", "bio-ferment-cream"] },
      { value: "intense", label: "Intensely — I flush or splotch instantly", products: ["cica-collagen-concentrate", "relaxing-mist", "bio-ferment-cream"] },
    ],
  },
];

const pigment: QuizQuestion[] = [
  {
    id: "pig_6_1",
    prompt: "How much of a priority is fading dark spots or evening out your skin tone right now?",
    why: "Melanocytes go into overdrive and dump too much pigment into one localized area. Your intensity choice tells us how aggressively to approach brightening — safely.",
    type: "single",
    options: [
      { value: "1", label: "1 — Not a concern", note: "My skin tone feels completely even", products: ["ceramide-cleanser", "moisture-fix", "vitamin-c-cream", "daycare"] },
      { value: "2", label: "2 — A little concerned", note: "Slightly dull or minor shadowing in a few areas", products: ["fruit-enzyme-cleanser", "ummf-serum"] },
      { value: "3", label: "3 — Somewhat concerned", note: "Noticeable spots I choose to cover with makeup", products: ["glyco-10", "vitamin-b-toner", "vitamin-c-cream", "ummf-serum", "copper-peptide", "bio-ferment-cream"] },
      { value: "4", label: "4 — Highly concerned", note: "Prominent dark patches that don't fade easily", products: ["glyco-10", "vitamin-c-cream", "moisture-fix", "retinal", "copper-peptide", "bio-ferment-cream"] },
      { value: "5", label: "5 — Extremely concerned", note: "Deep, widespread discoloration is my primary skin battle", products: ["glyco-10", "vitamin-c-cream", "moisture-fix", "retinal", "copper-peptide", "bio-ferment-cream"] },
    ],
  },
  {
    id: "pig_6_2",
    prompt: "Do your dark spots noticeably multiply, darken, or expand after spending time in the sun?",
    type: "single",
    options: [
      { value: "yes", label: "Yes — they flare up almost immediately after outdoor exposure", products: ["turmeric-exosome", "daycare", "ummf-serum", "bio-ferment-cream"], flags: ["sunscreen_advisory"] },
      { value: "partial", label: "Partially — they darken slightly over the summer months", products: ["turmeric-exosome", "daycare", "ummf-serum", "bio-ferment-cream"], flags: ["sunscreen_advisory"] },
      { value: "no", label: "No — the sun doesn't affect their visibility" },
      { value: "unsure", label: "I'm not entirely sure", products: ["daycare", "copper-peptide", "bio-ferment-cream"], flags: ["sunscreen_advisory"] },
    ],
  },
  {
    id: "pig_6_3",
    prompt: "Do the dark spots feel raised, rough, or bumpy compared to the rest of your skin?",
    type: "single",
    options: [
      { value: "no", label: "Not at all", products: ["glyco-10", "copper-peptide", "bio-ferment-cream"] },
      { value: "rarely", label: "Rarely", products: ["fruit-enzyme-cleanser", "daycare", "ummf-serum", "copper-peptide", "bio-ferment-cream"] },
      { value: "moderate", label: "Moderate", products: ["vitamin-b-toner", "turmeric-exosome", "vitamin-c-cream", "cica-collagen-concentrate", "ummf-serum", "bio-ferment-cream"], flags: ["pause_glycolic"] },
      { value: "high", label: "A lot", products: ["vitamin-b-toner", "turmeric-exosome", "vitamin-c-cream", "cica-collagen-concentrate", "ummf-serum", "bio-ferment-cream"], flags: ["pause_glycolic"] },
    ],
  },
  {
    id: "pig_6_4",
    prompt: "Did your dark patches first emerge or worsen during a period of major internal shifts — pregnancy, starting birth control, or high stress?",
    why: "Internal hormonal shifts make pigment cells unstable, creating a shadow-like pattern (melasma). Harsh peels or heat make melasma cells panic and produce more pigment.",
    type: "single",
    options: [
      { value: "hormonal", label: "Yes — symmetrical, cloud-like patches on my upper lip, cheeks, or forehead", products: ["turmeric-exosome", "hyaluron-capsules", "ummf-serum", "bio-ferment-cream", "copper-peptide"], flags: ["block_aha"] },
      { value: "mixed", label: "Partially — connected to lifestyle/hormones, not perfectly symmetrical", products: ["ceramide-cleanser", "ummf-serum", "bio-ferment-cream", "copper-peptide"] },
      { value: "enviro", label: "No — they appear randomly as scattered individual spots" },
      { value: "unsure", label: "Unsure" },
    ],
  },
  {
    id: "pig_6_5",
    prompt: "Are your dark marks primarily left behind in the exact spots where an old breakout, scratch, or irritation recently healed?",
    type: "single",
    options: [
      { value: "post_inflammatory", label: "Yes — most of my marks are footprints of old blemishes", products: ["cica-collagen-concentrate", "vitamin-c-cream", "ummf-serum", "bio-ferment-cream", "copper-peptide"] },
      { value: "mixed_inj", label: "Partially — a mix of old blemish marks and general sun spots", products: ["glyco-10", "vitamin-c-cream", "ummf-serum", "vitamin-b-toner", "bio-ferment-cream", "copper-peptide"] },
      { value: "non_inj", label: "No — my spots appear independent of any skin injuries" },
    ],
  },
];

const oily: QuizQuestion[] = [
  {
    id: "oily_7_1",
    prompt: "How soon after completing your morning skincare routine does your face begin to show noticeable shine?",
    type: "single",
    options: [
      { value: "1", label: "1 — It doesn't", note: "My skin stays matte or velvety all day", products: ["ceramide-cleanser", "moisture-fix", "vitamin-c-cream", "daycare"] },
      { value: "2", label: "2 — By late afternoon", note: "A mild, healthy glow in the T-zone only", products: ["ceramide-cleanser", "moisture-fix", "daycare", "fruit-enzyme-cleanser"] },
      { value: "3", label: "3 — By midday", note: "Blotting papers or powder usually required by lunch", products: ["ceramide-cleanser", "vitamin-b-toner", "moisture-fix", "vitamin-c-cream", "daycare"] },
      { value: "4", label: "4 — Within a few hours", note: "Shine breaks through quickly across my entire face", products: ["ceramide-cleanser", "vitamin-b-toner", "vitamin-c-cream", "moisture-fix", "daycare", "fruit-enzyme-cleanser", "glyco-10", "ummf-serum"] },
      { value: "5", label: "5 — Almost immediately", note: "My skin feels heavy or greasy shortly after washing", products: ["fruit-enzyme-cleanser", "vitamin-b-toner", "vitamin-c-cream", "glyco-10", "moisture-fix", "daycare", "glycolic-cleanser", "retinal", "night-beauty-repair"] },
    ],
  },
  {
    id: "oily_7_2",
    prompt: "When you notice visible or enlarged pores, where are they located and how do they look?",
    why: "Circular oil-stretched pores need oil-dissolving actives. Oval, drooping pores need firming peptides to tighten the surrounding matrix.",
    type: "single",
    options: [
      { value: "tzone", label: "T-Zone Shadowing — small, circular, around my nose and forehead", products: ["ceramide-cleanser", "fruit-enzyme-cleanser"] },
      { value: "stretched", label: "Widespread & Stretched — tiny pinpricks across cheeks and T-zone", products: ["collagen-capsules"] },
      { value: "droplet", label: "Droplet/Oval Shaped — elongated, sagging droplets on my cheeks", products: ["cica-collagen-concentrate", "collagen-capsules", "chronofirm-peptide"] },
      { value: "invisible", label: "Invisible — I can barely see my pores" },
    ],
  },
  {
    id: "oily_7_3",
    prompt: "Does your skin ever feel tight, parched, or dry on the inside, even though there is a layer of oil on the surface?",
    why: "This is \"dehydrated oily skin.\" Stripping cleansers scrape away the water barrier, so the skin blasts out oil to compensate. We rehydrate instead of stripping further.",
    type: "single",
    options: [
      { value: "dehydrated_oil", label: "Yes, frequently — simultaneously stripped and greasy", products: ["ceramide-cleanser", "turmeric-exosome", "moisture-fix", "vitamin-c-cream", "daycare", "hyaluron-capsules", "bio-ferment-cream"], flags: ["block_aha", "block_glycolic_cleanser", "block_retinoid"] },
      { value: "true_oil", label: "No — my skin feels hydrated and comfortable beneath the oil", products: ["ceramide-cleanser", "vitamin-b-toner", "daycare", "moisture-fix", "vitamin-c-cream", "ummf-serum"] },
      { value: "seasonal", label: "Only during seasonal weather shifts", products: ["milk-cleanser", "relaxing-mist", "aqua-moisturiser", "daycare"] },
    ],
  },
  {
    id: "oily_7_4",
    prompt: "Alongside the visible shine, how does the texture of your pores feel?",
    type: "single",
    options: [
      { value: "clear", label: "Smooth Shine — oily but completely flat and free of bumps", products: ["ceramide-cleanser", "vitamin-b-toner", "moisture-fix", "bio-ferment-cream"] },
      { value: "blackheads", label: "Oxidized Congestion — frequent blackheads and hard, dark plugs", products: ["fruit-enzyme-cleanser", "glyco-10", "retinal"] },
      { value: "whiteheads", label: "Bumpy Texturing — small, flesh-colored bumps locked under the skin", products: ["ceramide-cleanser", "vitamin-b-toner", "vitamin-c-cream", "glyco-10", "moisture-fix", "daycare", "fruit-enzyme-cleanser", "retinal", "night-beauty-repair"] },
    ],
  },
  {
    id: "oily_7_5",
    prompt: "What typically happens to your makeup, sunscreen, or daily base creams as the day goes on?",
    type: "single",
    options: [
      { value: "none", label: "Everything stays perfectly locked in place" },
      { value: "low", label: "It gets slightly dewy, but a quick blot fixes it" },
      { value: "severe", label: "My foundation visibly breaks down, slides, or cakes", note: "Apply DayCare or Moisture Fix thinly and let it absorb a full minute before makeup." },
      { value: "na", label: "I don't wear face makeup or daily base products" },
    ],
  },
];

const posttreatment: QuizQuestion[] = [
  {
    id: "post_8_1",
    prompt: "Which clinical or dermal treatment triggered your skin's current temporary sensitivity or dryness?",
    type: "single",
    options: [
      { value: "thermal", label: "Laser or Light Therapy (e.g. IPL)", products: ["milk-cleanser", "turmeric-exosome", "relaxing-mist", "daycare", "hyaluron-capsules", "bio-ferment-cream"] },
      { value: "chemical", label: "Chemical Resurfacing (deep clinic peels, high-% home acids)", products: ["milk-cleanser", "cucumber-exosome", "moisture-fix", "daycare", "ceramide-cleanser", "hyaluron-capsules", "bio-ferment-cream"] },
      { value: "mechanical", label: "Mechanical / Needle Therapy (microneedling, microdermabrasion)", products: ["ceramide-cleanser", "ginseng-exosome", "cica-collagen-concentrate", "pdrn-ampoules", "bio-ferment-cream"] },
      { value: "cumul", label: "Unsure / cumulative damage from many procedures over time", products: ["milk-cleanser", "lacto-exosome", "relaxing-mist", "daycare", "hyaluron-capsules", "bio-ferment-cream"] },
    ],
  },
  {
    id: "post_8_2",
    prompt: "What is the primary visible issue left behind by the treatment?",
    type: "single",
    options: [
      { value: "hyper", label: "Post-Treatment Darkening — the area turned brown, dark pink, or muddy gray", products: ["milk-cleanser", "vitamin-b-toner", "cica-peptide-concentrate", "turmeric-exosome", "daycare", "ceramide-cleanser", "bio-ferment-cream", "nightcare"], flags: ["block_aha", "block_high_vitc", "block_retinoid"] },
      { value: "hypo", label: "Post-Treatment Lightening — the skin lost color, leaving pale patches", products: ["milk-cleanser", "turmeric-exosome", "cica-collagen-concentrate", "moisture-fix", "daycare", "ceramide-cleanser", "hyaluron-capsules", "bio-ferment-cream", "copper-peptide"], flags: ["block_aha", "block_retinoid", "block_fruit_enzyme"] },
      { value: "vasc", label: "Chronic Vascular Rawness — hot, angry redness or visible thread veins", products: ["milk-cleanser", "relaxing-mist", "cucumber-exosome", "moisture-fix", "cica-collagen-concentrate", "hyaluron-capsules", "daycare", "ceramide-cleanser", "cica-peptide-concentrate", "bio-ferment-cream"] },
      { value: "texture", label: "Textural Scarring / Roughness — orange-peel rough or pin-pricked surface", products: ["ceramide-cleanser", "ginseng-exosome", "cica-collagen-concentrate", "daycare", "copper-peptide", "collagen-cream", "hyaluron-capsules"] },
    ],
  },
  {
    id: "post_8_3",
    prompt: "How does your untreated skin respond to brief sun exposure or a minor scratch?",
    type: "single",
    options: [
      { value: "low", label: "I burn instantly, freckle, and almost never naturally tan", products: ["milk-cleanser", "ceramide-cleanser"], flags: ["no_acid_peels"] },
      { value: "medium", label: "I burn initially but gradually transition into a mild tan", products: ["ceramide-cleanser"] },
      { value: "high", label: "I tan very easily, rarely burn, or have a naturally rich, deep skin tone", products: ["milk-cleanser", "ceramide-cleanser", "cica-peptide-concentrate"], flags: ["cap_glycolic"] },
    ],
  },
  {
    id: "post_8_4",
    prompt: "How long ago did you receive the treatment that caused this damage?",
    why: "In the first few weeks (acute phase) the barrier is chemically compromised — active ingredients too early can cause a secondary injury. Once healed (chronic phase), targeted correcting molecules can safely engage.",
    type: "single",
    options: [
      { value: "acute", label: "Acute — within the last 1 to 4 weeks, skin still feels raw or fresh", products: ["milk-cleanser", "bio-ferment-cream"], flags: ["block_all_actives"] },
      { value: "chronic", label: "Chronic — more than a month ago, marks or texture are stubbornly stuck", products: ["ummf-serum", "chronofirm-peptide", "fruit-enzyme-cleanser", "vitamin-b-toner"] },
    ],
  },
];

export const CONCERN_POOLS: Record<string, QuizQuestion[]> = {
  sensitivity,
  aging,
  dryness,
  acne,
  redness,
  pigment,
  oily,
  posttreatment,
};

// ─── Stage 4/5: lifestyle, safety & profile ────────────────────────────────

export const LIFESTYLE_QUESTIONS: QuizQuestion[] = [
  {
    id: "pregnancy",
    prompt: "Are you currently pregnant, breastfeeding, or planning to become pregnant in the near future?",
    type: "single",
    options: [
      { value: "yes", label: "Yes", flags: ["pregnancy_safe_mode"] },
      { value: "no", label: "No" },
    ],
  },
  {
    id: "allergies",
    prompt: "Do you have any known allergies or severe skin sensitivities to specific ingredients?",
    type: "text",
    placeholder: "List any ingredients, plant extracts, or nut oils to avoid — leave blank if none",
  },
  {
    id: "prescriptions",
    prompt: "Are you currently using any of these prescription or medical skin treatments?",
    subtitle: "Select all that apply",
    type: "multi",
    options: [
      { value: "steroid", label: "Steroid creams (e.g. Hydrocortisone)", flags: ["block_aha", "block_retinoid"] },
      { value: "retinoid", label: "Prescription retinoids (e.g. Tretinoin, Adapalene)", flags: ["block_aha", "block_retinoid"] },
      { value: "hydroquinone", label: "Prescription brightening creams (e.g. Hydroquinone)", flags: ["block_aha", "block_retinoid"] },
      { value: "accutane", label: "Oral acne medication (e.g. Isotretinoin/Accutane)", flags: ["block_aha", "block_retinoid"] },
      { value: "none", label: "None of the above" },
    ],
  },
  {
    id: "clinic_history",
    prompt: "Have you had any professional in-clinic skin treatments in the last 4 to 6 weeks?",
    subtitle: "Select all that apply",
    type: "multi",
    options: [
      { value: "peel", label: "Chemical peels", flags: ["recent_clinical_procedure"] },
      { value: "laser", label: "Laser resurfacing or IPL", flags: ["recent_clinical_procedure"] },
      { value: "microneedling", label: "Microneedling or RF microneedling", flags: ["recent_clinical_procedure"] },
      { value: "facial", label: "Standard hydrating / relaxing facial" },
      { value: "none", label: "No recent treatments" },
    ],
  },
  {
    id: "barrier_check",
    prompt: "If you wash your face with a gentle cleanser and leave it bare for 30 minutes, how does it feel and look?",
    type: "single",
    options: [
      { value: "tight_dry", label: "Tight, dry, and noticeably flaky" },
      { value: "comfortable", label: "Comfortable, smooth, no shine or tightness" },
      { value: "oily", label: "Shiny or oily all over" },
      { value: "combo", label: "Shiny/oily in the T-zone but tight or dry on the cheeks" },
      { value: "dehydrated_glass", label: "Tight and uncomfortable, yet looks shiny or \"glass-like\"" },
    ],
  },
  {
    id: "reactivity",
    prompt: "How does your skin react to weather shifts, new products, or physical rubbing?",
    type: "single",
    options: [
      { value: "resilient", label: "Resilient — rarely reacts, stings, or flushes" },
      { value: "occasional", label: "Occasional sensitivity — certain strong products cause stinging" },
      { value: "reactive", label: "Highly reactive — frequent redness, burning, itching, or dry patches" },
    ],
  },
  {
    id: "healing_response",
    prompt: "When you get a pimple, bug bite, or minor scratch, what mark does it leave after it heals?",
    type: "single",
    options: [
      { value: "fades", label: "A pink or red mark that fades quickly" },
      { value: "erythema", label: "A persistent red/purple mark (erythema)" },
      { value: "pih", label: "A dark brown or grey spot lasting months" },
      { value: "none", label: "Heals completely without a trace" },
    ],
  },
  {
    id: "current_actives",
    prompt: "Which of these powerful ingredients do you regularly use in your routine?",
    subtitle: "Select all that apply",
    type: "multi",
    options: [
      { value: "retinoid", label: "Retinoids / Retinol / Retinal" },
      { value: "acids", label: "Exfoliating acids (AHA, BHA, PHA)" },
      { value: "vitc", label: "Vitamin C" },
      { value: "gentle", label: "Niacinamide, Hyaluronic Acid, or Peptides" },
      { value: "none", label: "I don't use active ingredients / unsure" },
    ],
  },
  {
    id: "retinol_strength",
    prompt: "If you currently use Retinol or Vitamin A, what strength is your skin accustomed to?",
    type: "single",
    options: [
      { value: "starter", label: "I don't use Retinol / Starter (under 0.1%)" },
      { value: "intermediate", label: "Intermediate (0.1% to 0.3%)" },
      { value: "advanced", label: "Advanced / high strength (0.5% to 1.0%+)" },
      { value: "unsure", label: "Unsure" },
    ],
  },
  {
    id: "age_group",
    prompt: "Which age group do you belong to?",
    type: "single",
    options: [
      { value: "under25", label: "Under 25" },
      { value: "25_34", label: "25 – 34" },
      { value: "35_44", label: "35 – 44" },
      { value: "45_54", label: "45 – 54" },
      { value: "55plus", label: "55+" },
    ],
  },
  {
    id: "gender",
    prompt: "What is your biological sex or gender identity?",
    type: "single",
    options: [
      { value: "female", label: "Female" },
      { value: "male", label: "Male" },
      { value: "nonbinary", label: "Non-binary / prefer not to say" },
    ],
  },
  {
    id: "sleep",
    prompt: "How many hours of restful sleep do you average per night?",
    type: "single",
    options: [
      { value: "under6", label: "Less than 6 hours" },
      { value: "6to8", label: "6 to 8 hours" },
      { value: "8plus", label: "8+ hours" },
    ],
  },
  {
    id: "stress",
    prompt: "How would you rate your daily stress level?",
    type: "single",
    options: [
      { value: "low", label: "Low / minimal" },
      { value: "moderate", label: "Moderate" },
      { value: "high", label: "High or ongoing stress" },
    ],
  },
  {
    id: "water",
    prompt: "How much water do you drink daily on average?",
    type: "single",
    options: [
      { value: "1to3", label: "1 – 3 glasses" },
      { value: "4to6", label: "4 – 6 glasses" },
      { value: "7plus", label: "7+ glasses" },
    ],
  },
  {
    id: "sun",
    prompt: "How many hours a day are you outdoors in direct sunlight?",
    type: "single",
    options: [
      { value: "under1", label: "Less than 1 hour" },
      { value: "1to3", label: "1 to 3 hours" },
      { value: "4plus", label: "4+ hours" },
    ],
  },
  {
    id: "screen",
    prompt: "How many hours a day do you spend in front of digital screens?",
    type: "single",
    options: [
      { value: "under4", label: "Under 4 hours" },
      { value: "4to8", label: "4 to 8 hours" },
      { value: "8plus", label: "8+ hours (most waking hours)" },
    ],
  },
  {
    id: "climate",
    prompt: "Which best describes your daily climate and surroundings?",
    type: "single",
    options: [
      { value: "arid", label: "Dry or arid (low humidity, high sun or wind)" },
      { value: "humid", label: "Hot and humid" },
      { value: "cold", label: "Cold or alpine (freezing temps, indoor heating)" },
      { value: "urban", label: "City / urban (higher pollution exposure)" },
    ],
  },
];
