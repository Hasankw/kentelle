import { Metadata } from "next";
import Image from "next/image";
import { Sun, Moon, AlertTriangle, ShieldAlert, Sparkles, Leaf, FlaskConical, Droplets } from "lucide-react";

export const metadata: Metadata = {
  title: "Kentelle Skin Regimen | Your Complete Skincare Layering Guide",
  description:
    "Follow the Kentelle Skin Regimen — a science-backed, step-by-step layering guide designed for Australian skin. From cleansers to SPF, morning to night.",
};

const DayBadge = () => (
  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-heading font-bold uppercase tracking-wider rounded-full">
    <Sun size={9} /> Day
  </span>
);

const NightBadge = () => (
  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-heading font-bold uppercase tracking-wider rounded-full">
    <Moon size={9} /> Night
  </span>
);

const steps = [
  {
    step: "01",
    category: "Cleansers",
    products: ["G Biomed Glycolic Cleanser 12%", "Milk Cleanser", "Fruit Enzyme Cleanser", "Ceramide Cleanser"],
    description:
      "Cleansing and choosing the right cleanser is important. Feeling tightness and redness on skin means the cleanser is not compatible with your skin type. Frequency depends on your skin condition and skin type.",
    day: true,
    night: true,
    icon: <Droplets size={18} className="text-brand-blue" />,
  },
  {
    step: "02",
    category: "Toners",
    products: ["Vitamin B Facial Toner", "Relaxing & Comforting Mist"],
    description:
      "The toners are nourishing, soothing and protecting. Apply as often as desired for refreshing throughout the day.",
    day: true,
    night: true,
    icon: <Leaf size={18} className="text-brand-blue" />,
  },
  {
    step: "03",
    category: "Eye Care",
    products: ["Beautiful Eye Sans Tenor", "Electric Massage Eye Cream"],
    description:
      "Apply gently around the orbital bone using your ring finger. The delicate eye area benefits from targeted ingredients that reduce puffiness, dark circles, and fine lines.",
    day: true,
    night: true,
    icon: <Sparkles size={18} className="text-brand-blue" />,
  },
  {
    step: "04",
    category: "Treatment — Night",
    products: ["Peel-back (Retinal 0.01)", "UMMF (Niacinamide + Vitamin C + TXA 4%)"],
    description:
      "Resurfacing with Peel-back provides even skin tone and rejuvenation. UMMF achieves a 'glass skin' finish — clear, luminous, and glowing. Wait 5 minutes before Step 5. Alternate between Peel-back and UMMF for best results.",
    day: false,
    night: true,
    icon: <FlaskConical size={18} className="text-brand-blue" />,
    highlight: true,
  },
  {
    step: "04",
    category: "Treatment — Day",
    products: ["Glycolic 10"],
    description:
      "Rejuvenation: Reduces blemishes and promotes cell turnover. Evens out skin tone and aids in repairing visible sun damage. Wait 5 minutes before Step 5.",
    day: true,
    night: false,
    icon: <FlaskConical size={18} className="text-brand-blue" />,
    highlight: true,
  },
  {
    step: "05",
    category: "Serum",
    products: ["Moisture Fix + Vitamin C 20%"],
    description:
      "Brighten & Hydrate: Traps moisture, prevents redness, itching, and fine lines. Vitamin C 20% delivers powerful antioxidant defence to neutralise free radicals and brighten the complexion.",
    day: true,
    night: true,
    icon: <Droplets size={18} className="text-brand-blue" />,
  },
  {
    step: "06",
    category: "Probiotic",
    products: ["Bio-ferment"],
    description:
      "Uses probiotics to balance skin flora and strengthen the natural defence barrier. A healthy microbiome is the foundation of calm, resilient skin.",
    day: true,
    night: true,
    icon: <Leaf size={18} className="text-brand-blue" />,
  },
  {
    step: "07",
    category: "Moisturiser",
    products: ["KENTELLE Daycare / Day Beauty", "KENTELLE Nightcare / Night Beauty"],
    description:
      "Seal & Protect: Reduces redness and filters pollutants. Use Day Beauty in the morning and Night Beauty in the evening to give skin the targeted support it needs at each stage of the day.",
    day: true,
    night: true,
    icon: <Sparkles size={18} className="text-brand-blue" />,
  },
  {
    step: "08",
    category: "Sun Block (SPF 30+)",
    products: ["KENTELLE SPF 30+ Sunblock"],
    description:
      "Essential Filter: Provides a 95% filter to prevent cell damage and slow the aging process. Apply every morning as the final skincare step, before makeup. Non-negotiable daily.",
    day: true,
    night: false,
    icon: <Sun size={18} className="text-amber-500" />,
    warning: true,
  },
  {
    step: "09",
    category: "Mineral Makeup",
    products: ["KENTELLE Mineral Foundation"],
    description:
      "Physical Shield: Contains Titanium Oxide (repairing) and Zinc Oxide (UV reflection) for added protection. Provides an extra layer of sun defence while perfecting your complexion. Use daily.",
    day: true,
    night: false,
    icon: <Sparkles size={18} className="text-brand-blue" />,
  },
];

const topicalTreatments = [
  {
    name: "Niacinamide (10%) & Arbutin (10%)",
    desc: "Controls oil and fades marks. Safe for daily use to brighten and repair the skin barrier. KENTELLE Ummf is a potent and safe pigmentation corrector.",
  },
  {
    name: "Clindamycin (1%)",
    desc: "Kills acne bacteria. Apply first and wait 5 minutes before applying spot gels or Benzac.",
  },
  {
    name: "Hydroquinone (4%)",
    desc: "Lightens dark spots. Night use only. Apply strictly to pigmented areas. Requires a GP Prescription.",
    nightOnly: true,
    rx: true,
  },
  {
    name: "Salicylic Acid (BHA)",
    desc: "An oil-soluble acid that deep-cleans pores. Excellent for blackheads and congestion. Use sparingly to avoid dryness when combined with other actives.",
  },
  {
    name: "Tretinoin (Retin-A / Steiva-A)",
    desc: "A powerful Vitamin A cream for cell turnover. Night use only. Start 2–3 times a week to avoid redness/peeling. Stop using at least 7 days before any clinical treatment (peels, waxing, or laser) to prevent skin tearing.",
    nightOnly: true,
    rx: true,
  },
];

const oralMeds = [
  {
    name: "Antibiotics (Minomycin / Doxycycline)",
    desc: "Used for 3–6 months for severe acne. Causes photosensitivity — SPF 50+ mandatory daily.",
    rx: true,
  },
  {
    name: "Roaccutane (Isotretinoin)",
    desc: "A powerful Vitamin A derivative that shrinks oil glands. Contraindication for many clinical treatments (peels, lasers). You must inform your therapist if you are taking it. Causes severe dryness and skin thinning.",
    rx: true,
  },
];

const nutrients = [
  {
    name: "Chronofirm Peptide Matrix",
    action: "Structural Support",
    benefit: "Stimulates collagen and elastin to firm the skin, improve elasticity, and deliver anti-aging results.",
    day: true,
    night: true,
  },
  {
    name: "Vitamin C 20%",
    action: "Antioxidant Defence",
    benefit: "Neutralises free radicals, reduces redness, brightens the complexion, and aids UV recovery.",
    day: true,
    night: false,
  },
  {
    name: "Moisture Fix Serum",
    action: "Intense Hydration",
    benefit: "Instantly binds moisture to the skin to soothe and prevent dehydration.",
    day: true,
    night: true,
  },
  {
    name: "Collagen Cream",
    action: "Deep Nourishment",
    benefit: "Replenishes essential proteins to keep skin plump and resilient.",
    day: false,
    night: true,
  },
];

const peelAndGlow = [
  {
    product: "Gluco 12 Cleanser",
    notes: "Active cleansing to prep the skin.",
    day: true,
    night: true,
  },
  {
    product: "Glyco 10 Skin Cream",
    notes: "Start once a week; increase frequency gradually. Apply serum on top, then seal with moisturiser and sunblock.",
    day: false,
    night: true,
  },
  {
    product: "Vitamin A (Retinol / Retinal 0.01)",
    notes: "Start once a week; increase frequency gradually. Apply serum first, then Vitamin A, seal with moisturiser.",
    day: false,
    night: true,
  },
  {
    product: "Vitamin C 20%",
    notes: "Best used with Vitamin A to stimulate collagen and reduce redness.",
    day: true,
    night: false,
  },
  {
    product: "Niacinamide 5–10% & Arbutin 5–10%",
    notes: "Apply to clean skin to control oil, fade pigment, and repair the barrier.",
    day: true,
    night: true,
  },
  {
    product: "Glyco 15 Body Exfoliator",
    notes: "STRICTLY for body rejuvenation only. Do not use on the face. Always follow with a deeply moisturising or ceramide cream. Do not use strong shower gels.",
    day: false,
    night: true,
    bodyOnly: true,
  },
  {
    product: "Glyco 40",
    notes: "STRICTLY PROFESSIONAL USE ONLY. Never for home application.",
    professional: true,
    day: false,
    night: false,
  },
];

export default function SkinRegimenPage() {
  return (
    <div className="bg-white">

      {/* ── HERO ──────────────────────────────────────────────── */}
      <section className="relative h-[75vh] min-h-[520px] flex items-center justify-center overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1570194065650-d99fb4b38e99?w=1600&q=85&auto=format&fit=crop"
          alt="Skincare routine — woman applying serum"
          fill
          className="object-cover object-center"
          priority
          sizes="100vw"
          unoptimized
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-brand-navy/70" />
        <div className="relative z-10 max-w-3xl mx-auto text-center px-4">
          <p className="text-xs font-heading font-bold tracking-[0.3em] uppercase text-brand-accent mb-4">
            Your Science-Backed Guide
          </p>
          <h1 className="font-heading font-bold text-4xl md:text-6xl tracking-widest uppercase mb-6 leading-tight text-brand-white">
            Kentelle Skin<br />Regimen
          </h1>
          <p className="font-body text-base text-brand-contrast leading-relaxed max-w-xl mx-auto">
            A complete layering protocol designed for Australian skin — from first cleanse to final SPF.
            Follow the order, respect the timing, and let science do the work.
          </p>
        </div>
      </section>

      {/* ── LAYERING RULE BANNER ─────────────────────────────── */}
      <section className="bg-brand-accent">
        <div className="max-w-5xl mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-center gap-3 text-center">
          <span className="text-xs font-heading font-bold uppercase tracking-widest text-brand-navy">
            Layering Rule:
          </span>
          <span className="font-body text-sm text-brand-navy">
            Always apply products from <strong>thinnest</strong> (serums & treatments) to <strong>thickest</strong> (moisturisers & SPF) for maximum efficacy.
          </span>
        </div>
      </section>

      {/* ── EVERYDAY ESSENTIAL CARE ──────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 py-20">
        <div className="text-center mb-14">
          <p className="text-xs font-heading font-bold tracking-widest uppercase text-brand-blue mb-3">Section 1</p>
          <h2 className="font-heading font-bold text-3xl md:text-4xl text-brand-navy mb-4">
            Everyday Essential Care
          </h2>
          <p className="font-body text-sm text-brand-contrast max-w-lg mx-auto">
            Your foundational daily and nightly routine. Follow these steps in order every day for a healthy, protected complexion.
          </p>
        </div>

        <div className="space-y-6">
          {steps.map((s, i) => (
            <div
              key={i}
              className={`flex gap-5 md:gap-8 p-6 border-2 transition-colors ${
                s.warning
                  ? "border-amber-300 bg-amber-50"
                  : s.highlight
                  ? "border-brand-accent/60 bg-brand-accent/5"
                  : "border-brand-contrast/10 bg-white hover:border-brand-contrast/25"
              }`}
            >
              {/* Step number */}
              <div className="shrink-0">
                <div className="w-12 h-12 rounded-full bg-brand-navy text-brand-white flex items-center justify-center font-heading font-bold text-sm tracking-wider">
                  {s.step}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  {s.icon}
                  <h3 className="font-heading font-bold text-sm uppercase tracking-widest text-brand-navy">
                    {s.category}
                  </h3>
                  <div className="flex gap-1.5">
                    {s.day && <DayBadge />}
                    {s.night && <NightBadge />}
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-3">
                  {s.products.map((p) => (
                    <span
                      key={p}
                      className="px-2.5 py-1 bg-brand-navy/5 border border-brand-navy/10 text-brand-navy text-xs font-heading font-bold"
                    >
                      {p}
                    </span>
                  ))}
                </div>

                <p className="font-body text-sm text-brand-contrast leading-relaxed">
                  {s.description}
                </p>

                {s.warning && (
                  <p className="mt-2 text-xs font-heading font-bold uppercase tracking-wider text-amber-700 flex items-center gap-1">
                    <AlertTriangle size={12} /> Mandatory every single day — no exceptions
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── EDITORIAL IMAGE BREAK ────────────────────────────── */}
      <div className="relative h-72 md:h-96 overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1522338140262-f46f5913618a?w=1400&q=85&auto=format&fit=crop"
          alt="Skincare layering — applying moisturiser"
          fill
          className="object-cover object-top"
          sizes="100vw"
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/60 via-transparent to-transparent" />
        <div className="absolute bottom-6 left-0 right-0 text-center">
          <span className="inline-block px-5 py-2 bg-brand-accent text-brand-navy text-xs font-heading font-bold uppercase tracking-widest">
            Pre-Treatment Actives — Applied After Step 3
          </span>
        </div>
      </div>

      {/* ── PRE-TREATMENT ────────────────────────────────────── */}
      <section className="bg-[#F8F9FC] py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-heading font-bold tracking-widest uppercase text-brand-blue mb-3">
              Between Steps 3 & 4
            </p>
            <h2 className="font-heading font-bold text-3xl md:text-4xl text-brand-navy mb-4">
              Pre-Treatment
            </h2>
            <p className="font-body text-sm text-brand-contrast max-w-lg mx-auto">
              Acne and Pigmentation Care. Apply these specific treatments after Step 3 and before Step 4.
              These are active ingredients that require careful, targeted application.
            </p>
          </div>

          {/* Topical */}
          <h3 className="font-heading font-bold text-xs uppercase tracking-widest text-brand-navy mb-4 flex items-center gap-2">
            <FlaskConical size={14} /> Topical Treatments & Actives
          </h3>
          <div className="grid md:grid-cols-2 gap-4 mb-10">
            {topicalTreatments.map((t) => (
              <div key={t.name} className="bg-white border border-brand-contrast/10 p-5">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <p className="font-heading font-bold text-sm text-brand-navy">{t.name}</p>
                  {t.nightOnly && <NightBadge />}
                  {t.rx && (
                    <span className="px-2 py-0.5 bg-red-100 text-red-600 text-[10px] font-heading font-bold uppercase tracking-wider">
                      Rx Required
                    </span>
                  )}
                </div>
                <p className="font-body text-xs text-brand-contrast leading-relaxed">{t.desc}</p>
              </div>
            ))}
          </div>

          {/* Others to declare */}
          <div className="bg-amber-50 border border-amber-200 px-5 py-4 mb-10">
            <p className="text-xs font-heading font-bold uppercase tracking-wider text-amber-800 mb-1 flex items-center gap-1.5">
              <AlertTriangle size={12} /> Others to Declare
            </p>
            <p className="font-body text-sm text-amber-900">
              Please inform us if you are using high-strength Glycolic Acid, Benzoyl Peroxide, Prescription Steroid creams, or Antidepressants — these affect skin sensitivity and treatment outcomes.
            </p>
          </div>

          {/* Oral Medications */}
          <h3 className="font-heading font-bold text-xs uppercase tracking-widest text-brand-navy mb-4 flex items-center gap-2">
            <ShieldAlert size={14} /> Oral Medications (Prescription Required)
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {oralMeds.map((m) => (
              <div key={m.name} className="bg-white border border-red-100 p-5">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <p className="font-heading font-bold text-sm text-brand-navy">{m.name}</p>
                  <span className="px-2 py-0.5 bg-red-100 text-red-600 text-[10px] font-heading font-bold uppercase tracking-wider">
                    Prescription
                  </span>
                </div>
                <p className="font-body text-xs text-brand-contrast leading-relaxed">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SUN SAFETY WARNING ───────────────────────────────── */}
      <section className="bg-brand-navy py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-amber-400/20 mb-5">
            <Sun size={28} className="text-amber-400" />
          </div>
          <h2 className="font-heading font-bold text-2xl md:text-3xl text-brand-white mb-4 uppercase tracking-widest">
            Mandatory Sun Safety
          </h2>
          <p className="font-body text-sm text-brand-contrast mb-6 leading-relaxed">
            The following medications cause <strong className="text-brand-white">photosensitivity</strong> — extreme sun sensitivity that can lead to severe burns and scarring without proper protection.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mb-6">
            {["Oral Antibiotics", "Roaccutane (severe dryness & skin thinning)", "Most Antidepressants"].map((item) => (
              <span
                key={item}
                className="px-4 py-2 border border-amber-400/40 text-amber-300 text-xs font-heading font-bold"
              >
                {item}
              </span>
            ))}
          </div>
          <div className="inline-block bg-amber-400 text-brand-navy px-6 py-3 font-heading font-bold text-sm uppercase tracking-widest">
            SPF 50+ is non-negotiable every single day
          </div>
        </div>
      </section>

      {/* ── SKIN NUTRIENTS & POST-PROCEDURE ─────────────────── */}
      <section className="max-w-4xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <p className="text-xs font-heading font-bold tracking-widest uppercase text-brand-blue mb-3">Section 2</p>
          <h2 className="font-heading font-bold text-3xl md:text-4xl text-brand-navy mb-4">
            Skin Nutrients &amp; Post-Procedure Care
          </h2>
          <p className="font-body text-sm text-brand-contrast max-w-lg mx-auto">
            Use these products when the skin is healthy or following a dermal procedure to nourish, repair, and strengthen the tissue.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-5 mb-8">
          {nutrients.map((n, i) => (
            <div key={n.name} className="border border-brand-contrast/10 bg-white p-6">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-brand-accent/20 text-brand-navy font-heading font-bold text-xs flex items-center justify-center shrink-0">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div className="flex gap-1.5">
                  {n.day && <DayBadge />}
                  {n.night && <NightBadge />}
                </div>
              </div>
              <p className="font-heading font-bold text-sm text-brand-navy mb-1">{n.name}</p>
              <p className="text-xs font-heading font-bold uppercase tracking-wider text-brand-blue mb-2">{n.action}</p>
              <p className="font-body text-xs text-brand-contrast leading-relaxed">{n.benefit}</p>
            </div>
          ))}
        </div>

        {/* Post-procedure note */}
        <div className="border-l-4 border-brand-accent bg-brand-accent/5 px-6 py-5">
          <p className="font-heading font-bold text-xs uppercase tracking-wider text-brand-navy mb-1">
            Post-Procedure Protocol
          </p>
          <p className="font-body text-sm text-brand-contrast leading-relaxed">
            If you have just had a dermal treatment (peel, needling, IPL), prioritise <strong>Moisture Fix</strong> and <strong>Chronofirm</strong> to speed healing.
            Always seal with your KENTELLE Day/Night Moisturiser and SPF to lock in these nutrients.
          </p>
        </div>
      </section>

      {/* ── IMAGE + TEXT SPLIT ───────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 py-12 grid md:grid-cols-2 gap-8 items-center">
        <div className="relative h-72 md:h-80 overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1596761052804-01f77c4d3795?w=800&q=85&auto=format&fit=crop"
            alt="Post-procedure skin care — applying serum"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
            unoptimized
          />
        </div>
        <div>
          <p className="text-xs font-heading font-bold tracking-widest uppercase text-brand-blue mb-3">Repair & Restore</p>
          <h3 className="font-heading font-bold text-2xl text-brand-navy mb-4">Skin Heals Fastest<br />When Layered Right</h3>
          <p className="font-body text-sm text-brand-contrast leading-relaxed mb-4">
            After a dermal treatment, your skin barrier is temporarily compromised. The right product sequence — applied in the correct order — creates a protective, healing environment that accelerates recovery and minimises downtime.
          </p>
          <p className="font-body text-sm text-brand-contrast leading-relaxed">
            Start with Moisture Fix to instantly bind hydration, follow with Chronofirm to stimulate repair, and always seal with your KENTELLE moisturiser and SPF.
          </p>
        </div>
      </div>

      {/* ── PEEL & GLOW ──────────────────────────────────────── */}
      <section className="bg-[#F8F9FC] py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-heading font-bold tracking-widest uppercase text-brand-blue mb-3">Section 3</p>
            <h2 className="font-heading font-bold text-3xl md:text-4xl text-brand-navy mb-4">
              Peel and Glow Guidelines
            </h2>
            <p className="font-body text-sm text-brand-contrast max-w-lg mx-auto">
              To be used 3–7 or more days after a dermal treatment (IPL, deep peels, Microdermabrasion, Microneedling), once the skin has stopped peeling or flaking.
            </p>
          </div>

          {/* Tingle note */}
          <div className="bg-white border border-brand-accent/30 px-5 py-4 mb-8 flex gap-3">
            <Sparkles size={16} className="text-brand-accent shrink-0 mt-0.5" />
            <div>
              <p className="font-heading font-bold text-xs uppercase tracking-wider text-brand-navy mb-1">The Tingle</p>
              <p className="font-body text-sm text-brand-contrast">
                A slight tingling sensation is normal with Glyco 10, Vitamin A, and Vitamin C — this is the active ingredients working. If tingling is persistent or causes excessive redness, reduce the frequency of application.
              </p>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white border border-brand-contrast/10 overflow-x-auto">
            <table className="w-full text-sm font-body">
              <thead>
                <tr className="border-b border-brand-contrast/10 bg-brand-navy">
                  <th className="px-5 py-3.5 text-left text-xs font-heading font-bold uppercase tracking-wider text-brand-white">Product</th>
                  <th className="px-5 py-3.5 text-left text-xs font-heading font-bold uppercase tracking-wider text-brand-white">Application Notes</th>
                  <th className="px-5 py-3.5 text-center text-xs font-heading font-bold uppercase tracking-wider text-brand-white">Day</th>
                  <th className="px-5 py-3.5 text-center text-xs font-heading font-bold uppercase tracking-wider text-brand-white">Night</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-contrast/10">
                {peelAndGlow.map((row) => (
                  <tr key={row.product} className={`${row.professional ? "bg-red-50" : row.bodyOnly ? "bg-amber-50" : "hover:bg-[#F8F9FC]"} transition-colors`}>
                    <td className="px-5 py-4 font-heading font-bold text-xs text-brand-navy whitespace-nowrap align-top">
                      {row.product}
                      {row.professional && (
                        <div className="mt-1">
                          <span className="px-2 py-0.5 bg-red-100 text-red-600 text-[9px] font-heading font-bold uppercase tracking-wider">
                            Professional Only
                          </span>
                        </div>
                      )}
                      {row.bodyOnly && (
                        <div className="mt-1">
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[9px] font-heading font-bold uppercase tracking-wider">
                            Body Only
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4 text-brand-contrast text-xs leading-relaxed">{row.notes}</td>
                    <td className="px-5 py-4 text-center">
                      {row.day ? <Sun size={14} className="text-amber-500 mx-auto" /> : <span className="text-brand-contrast/20">—</span>}
                    </td>
                    <td className="px-5 py-4 text-center">
                      {row.night ? <Moon size={14} className="text-indigo-500 mx-auto" /> : <span className="text-brand-contrast/20">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── LAYERING LOGIC SUMMARY ───────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <p className="text-xs font-heading font-bold tracking-widest uppercase text-brand-blue mb-3">Summary</p>
          <h2 className="font-heading font-bold text-3xl md:text-4xl text-brand-navy mb-4">
            Your Daily Layering Order
          </h2>
          <p className="font-body text-sm text-brand-contrast max-w-lg mx-auto">
            At a glance — follow this sequence every morning and evening.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Day */}
          <div className="border-2 border-amber-200 bg-amber-50 p-6">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center">
                <Sun size={16} className="text-white" />
              </div>
              <h3 className="font-heading font-bold text-sm uppercase tracking-widest text-brand-navy">Morning Routine</h3>
            </div>
            <ol className="space-y-3">
              {[
                "Cleanser",
                "Toner",
                "Eye Care",
                "Glycolic 10 (wait 5 min)",
                "Moisture Fix + Vitamin C 20%",
                "Bio-ferment",
                "Day Moisturiser",
                "SPF 30+",
                "Mineral Makeup (optional)",
              ].map((step, i) => (
                <li key={step} className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-full bg-amber-400/30 text-brand-navy font-heading font-bold text-[10px] flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <span className="font-body text-sm text-brand-navy">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Night */}
          <div className="border-2 border-indigo-200 bg-indigo-50 p-6">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center">
                <Moon size={16} className="text-white" />
              </div>
              <h3 className="font-heading font-bold text-sm uppercase tracking-widest text-brand-navy">Evening Routine</h3>
            </div>
            <ol className="space-y-3">
              {[
                "Cleanser",
                "Toner",
                "Eye Care",
                "Peel-back or UMMF (wait 5 min)",
                "Moisture Fix + Vitamin C 20%",
                "Bio-ferment",
                "Night Moisturiser",
              ].map((step, i) => (
                <li key={step} className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-full bg-indigo-300/50 text-indigo-800 font-heading font-bold text-[10px] flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <span className="font-body text-sm text-brand-navy">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ── SKIN CLOSEUP IMAGE ───────────────────────────────── */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=1400&q=85&auto=format&fit=crop&crop=face"
          alt="Healthy glowing skin result"
          fill
          className="object-cover object-center"
          sizes="100vw"
          unoptimized
        />
        <div className="absolute inset-0 bg-brand-navy/50" />
        <div className="absolute inset-0 flex items-center justify-center text-center px-4">
          <div>
            <p className="font-heading font-bold text-2xl md:text-3xl text-brand-white tracking-wider uppercase mb-2">
              The Result Is In The Routine
            </p>
            <p className="font-body text-sm text-brand-contrast max-w-sm mx-auto">
              Consistency with the right products in the right order is what transforms skin over time.
            </p>
          </div>
        </div>
      </div>

      {/* ── CTA STRIP ────────────────────────────────────────── */}
      <section className="bg-brand-navy py-16 px-4 text-center">
        <p className="text-xs font-heading font-bold tracking-widest uppercase text-brand-accent mb-3">
          Ready to Start?
        </p>
        <h2 className="font-heading font-bold text-2xl md:text-3xl text-brand-white mb-4">
          Shop the Full Kentelle Regimen
        </h2>
        <p className="font-body text-sm text-brand-contrast max-w-md mx-auto mb-8">
          Every product in this guide is available in our store. Find your skin type match and build your complete routine.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/find-your-routine"
            className="px-8 py-3.5 bg-brand-accent text-brand-navy text-xs font-heading font-bold uppercase tracking-widest hover:bg-brand-accent/85 transition-colors"
          >
            Find My Routine
          </a>
          <a
            href="/shop"
            className="px-8 py-3.5 border border-brand-white/30 text-brand-white text-xs font-heading font-bold uppercase tracking-widest hover:border-brand-white transition-colors"
          >
            Browse All Products
          </a>
        </div>
      </section>

    </div>
  );
}
