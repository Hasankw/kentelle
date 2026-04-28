import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Sun, Moon, AlertTriangle, ShieldAlert } from "lucide-react";

export const metadata: Metadata = {
  title: "Kentelle Skin Regimen | Complete Skincare Layering Guide",
  description:
    "Your step-by-step Kentelle skincare layering guide — designed for Australian skin. From cleansers to SPF, morning to night.",
};

const DayBadge = () => (
  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-heading font-bold uppercase tracking-wider">
    <Sun size={9} /> Day
  </span>
);
const NightBadge = () => (
  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-heading font-bold uppercase tracking-wider">
    <Moon size={9} /> Night
  </span>
);

export default function SkinRegimenPage() {
  return (
    <div className="bg-white">

      {/* HERO IMAGE */}
      <div className="relative w-full h-[55vh] min-h-[400px] overflow-hidden">
        <Image
          src="/images/regimen/regimen-banner.webp"
          alt="Skincare routine"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-brand-navy/30 via-brand-navy/40 to-brand-navy/85" />
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-14 px-4 text-center">
          <p className="text-[10px] font-heading font-bold tracking-[0.3em] uppercase text-brand-accent mb-3">
            Science-Backed · Australian Skin
          </p>
          <h1 className="font-heading font-bold text-4xl md:text-6xl tracking-widest uppercase text-white leading-tight">
            Kentelle Skin<br />Regimen
          </h1>
        </div>
      </div>

      {/* INTRO */}
      <div className="max-w-3xl mx-auto px-4 py-14 text-center">
        <p className="font-body text-base text-brand-contrast leading-relaxed mb-6">
          This guide outlines the correct order and logic for layering your Kentelle products — morning and evening. Follow the sequence, respect the timing, and let science do the work.
        </p>
        <div className="inline-block border-t-2 border-brand-accent pt-5">
          <p className="text-xs font-heading font-bold uppercase tracking-widest text-brand-navy">
            Layering Rule: Thinnest to Thickest
          </p>
          <p className="font-body text-sm text-brand-contrast mt-1">
            Always apply from lightest texture (serums, treatments) to heaviest (moisturisers, SPF).
          </p>
        </div>
      </div>

      {/* SECTION 1 — EVERYDAY CARE */}
      <div className="border-t border-brand-contrast/10">
        <div className="relative w-full h-72 md:h-96 overflow-hidden">
          <Image
            src="/images/regimen/regimen-1.jpg"
            alt="Daily skincare routine"
            fill
            className="object-cover object-top"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-brand-navy/55" />
          <div className="absolute inset-0 flex items-center justify-center text-center px-4">
            <div>
              <p className="text-[10px] font-heading font-bold tracking-widest uppercase text-brand-accent mb-2">Section 01</p>
              <h2 className="font-heading font-bold text-3xl md:text-4xl text-white uppercase tracking-widest">
                Everyday Essential Care
              </h2>
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 py-14">
          <p className="font-body text-sm text-brand-contrast leading-relaxed mb-12">
            Your foundational daily and nightly routine. Follow these steps in order for a healthy, protected complexion.
          </p>
          <ol className="space-y-10">
            {[
              { n:"01", cat:"Cleansers", day:true, night:true, products:"G Biomed Glycolic Cleanser 12%, Milk Cleanser, Fruit Enzyme Cleanser, Ceramide Cleanser", desc:"Choose a cleanser suited to your skin type. Tightness or redness after cleansing signals incompatibility. Frequency depends on your skin condition." },
              { n:"02", cat:"Toners", day:true, night:true, products:"Vitamin B Facial Toner, Relaxing & Comforting Mist", desc:"Nourishing, soothing, and protective. Apply as often as desired throughout the day for a refreshing reset." },
              { n:"03", cat:"Eye Care", day:true, night:true, products:"Beautiful Eye Sans Tenor, Electric Massage Eye Cream", desc:"Apply gently around the orbital bone with your ring finger. Targets puffiness, dark circles, and fine lines in the delicate eye area." },
              { n:"04", cat:"Treatment — Night", day:false, night:true, products:"Peel-back (Retinal 0.01)  ·  UMMF (Niacinamide + Vitamin C + TXA 4%)", desc:"Peel-back resurfaces for even tone and rejuvenation. UMMF achieves a glass-skin finish. Wait 5 minutes before Step 5. Alternate between the two for best results.", highlight:true },
              { n:"04", cat:"Treatment — Day", day:true, night:false, products:"Glycolic 10", desc:"Reduces blemishes, promotes cell turnover, and aids in repairing visible sun damage. Wait 5 minutes before Step 5.", highlight:true },
              { n:"05", cat:"Serum", day:true, night:true, products:"Moisture Fix + Vitamin C 20%", desc:"Traps moisture and prevents redness, itching, and fine lines. Vitamin C 20% neutralises free radicals and brightens the complexion." },
              { n:"06", cat:"Probiotic", day:true, night:true, products:"Bio-ferment", desc:"Balances skin flora using probiotics and strengthens the natural defence barrier. A healthy microbiome is the foundation of calm, resilient skin." },
              { n:"07", cat:"Moisturiser", day:true, night:true, products:"KENTELLE Daycare / Day Beauty  ·  KENTELLE Nightcare / Night Beauty", desc:"Seals in all previous layers, reduces redness, and filters pollutants. Use Day Beauty in the morning and Night Beauty in the evening." },
              { n:"08", cat:"Sun Block SPF 30+", day:true, night:false, products:"KENTELLE SPF 30+ Sunblock", desc:"Provides a 95% filter against cell damage and photo-aging. Apply every morning as your final skincare step before makeup. Non-negotiable daily.", warning:true },
              { n:"09", cat:"Mineral Makeup", day:true, night:false, products:"KENTELLE Mineral Foundation", desc:"Contains Titanium Oxide (repairing) and Zinc Oxide (UV reflection) for added physical protection on top of your SPF." },
            ].map((s, i) => (
              <li key={i} className="flex gap-6">
                <div className="shrink-0 pt-0.5">
                  <span className={`flex w-10 h-10 rounded-full items-center justify-center font-heading font-bold text-xs ${s.warning ? "bg-amber-400 text-brand-navy" : s.highlight ? "bg-brand-accent text-brand-navy" : "bg-brand-navy text-white"}`}>
                    {s.n}
                  </span>
                </div>
                <div className="flex-1 border-b border-brand-contrast/10 pb-10">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="font-heading font-bold text-sm uppercase tracking-widest text-brand-navy">{s.cat}</h3>
                    {s.day && <DayBadge />}
                    {s.night && <NightBadge />}
                    {s.warning && <span className="text-[10px] font-heading font-bold uppercase tracking-wider text-amber-700 flex items-center gap-0.5"><AlertTriangle size={10} /> Mandatory daily</span>}
                  </div>
                  <p className="font-heading font-bold text-xs text-brand-blue mb-2">{s.products}</p>
                  <p className="font-body text-sm text-brand-contrast leading-relaxed">{s.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* SECTION 2 — PRE-TREATMENT */}
      <div className="bg-[#F8F9FC] border-t border-brand-contrast/10">
        <div className="relative w-full h-64 md:h-80 overflow-hidden">
          <Image
            src="/images/regimen/regimen-2.jpg"
            alt="Skincare treatment"
            fill
            className="object-cover object-top"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-brand-navy/55" />
          <div className="absolute inset-0 flex items-center justify-center text-center px-4">
            <div>
              <p className="text-[10px] font-heading font-bold tracking-widest uppercase text-brand-accent mb-2">Between Steps 3 &amp; 4</p>
              <h2 className="font-heading font-bold text-3xl md:text-4xl text-white uppercase tracking-widest">Pre-Treatment</h2>
              <p className="font-body text-sm text-brand-contrast mt-2">Acne &amp; Pigmentation Care</p>
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 py-14">
          <p className="font-body text-sm text-brand-contrast leading-relaxed mb-10">
            Apply these specific treatments after Step 3 and before Step 4. These are active ingredients that require careful, targeted application.
          </p>
          <h3 className="font-heading font-bold text-xs uppercase tracking-widest text-brand-navy mb-6">Topical Treatments &amp; Actives</h3>
          <ol className="space-y-6 mb-10">
            {[
              { name:"Niacinamide (10%) & Arbutin (10%)", tags:[], desc:"Controls oil and fades marks. Safe for daily use to brighten and repair the skin barrier. KENTELLE UMMF is a potent and safe pigmentation corrector." },
              { name:"Clindamycin (1%)", tags:[], desc:"Kills acne bacteria. Apply first and wait 5 minutes before applying spot gels or Benzac." },
              { name:"Hydroquinone (4%)", tags:["Night only","Rx Required"], desc:"Lightens dark spots. Night use only. Apply strictly to pigmented areas. Requires a GP Prescription." },
              { name:"Salicylic Acid (BHA)", tags:[], desc:"An oil-soluble acid that deep-cleans pores. Excellent for blackheads and congestion. Use sparingly to avoid dryness when combined with other actives." },
              { name:"Tretinoin (Retin-A / Steiva-A)", tags:["Night only","Rx Required"], desc:"A powerful Vitamin A cream for cell turnover. Start 2-3 times a week. Stop at least 7 days before peels, waxing, or laser to prevent skin tearing." },
            ].map((t) => (
              <li key={t.name} className="flex gap-4 border-b border-brand-contrast/10 pb-6">
                <div className="w-1.5 shrink-0 bg-brand-accent mt-1 self-stretch rounded-full" />
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <p className="font-heading font-bold text-sm text-brand-navy">{t.name}</p>
                    {t.tags.map((tag) => (
                      <span key={tag} className={`px-2 py-0.5 text-[9px] font-heading font-bold uppercase tracking-wider ${tag === "Rx Required" ? "bg-red-100 text-red-600" : "bg-indigo-100 text-indigo-700"}`}>{tag}</span>
                    ))}
                  </div>
                  <p className="font-body text-sm text-brand-contrast leading-relaxed">{t.desc}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="bg-amber-50 border-l-4 border-amber-400 px-5 py-4 mb-10">
            <p className="font-heading font-bold text-xs uppercase tracking-wider text-amber-800 mb-1 flex items-center gap-1.5"><AlertTriangle size={12} /> Others to Declare</p>
            <p className="font-body text-sm text-amber-900">Inform your therapist if you are using high-strength Glycolic Acid, Benzoyl Peroxide, Prescription Steroid creams, or Antidepressants — these affect skin sensitivity and treatment outcomes.</p>
          </div>

          <h3 className="font-heading font-bold text-xs uppercase tracking-widest text-brand-navy mb-6 flex items-center gap-2"><ShieldAlert size={14} /> Oral Medications — Prescription Required</h3>
          <ol className="space-y-6">
            {[
              { name:"Antibiotics (Minomycin / Doxycycline)", desc:"Used for 3-6 months for severe acne. Causes photosensitivity — SPF 50+ is mandatory every day while on this medication." },
              { name:"Roaccutane (Isotretinoin)", desc:"A powerful Vitamin A derivative that shrinks oil glands. Contraindicated for peels and lasers. Causes severe dryness and skin thinning. Always inform your therapist." },
            ].map((m) => (
              <li key={m.name} className="flex gap-4 border-b border-brand-contrast/10 pb-6">
                <div className="w-1.5 shrink-0 bg-red-400 mt-1 self-stretch rounded-full" />
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <p className="font-heading font-bold text-sm text-brand-navy">{m.name}</p>
                    <span className="px-2 py-0.5 text-[9px] font-heading font-bold uppercase tracking-wider bg-red-100 text-red-600">Prescription</span>
                  </div>
                  <p className="font-body text-sm text-brand-contrast leading-relaxed">{m.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* SUN SAFETY */}
      <div className="relative w-full h-64 md:h-80 overflow-hidden">
        <Image
          src="/images/regimen/regimen-3.jpg"
          alt="Sun protection"
          fill
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-brand-navy/75" />
        <div className="absolute inset-0 flex items-center justify-center text-center px-4">
          <div className="max-w-xl">
            <Sun size={32} className="text-amber-400 mx-auto mb-3" />
            <h2 className="font-heading font-bold text-2xl md:text-3xl text-white uppercase tracking-widest mb-3">Mandatory Sun Safety</h2>
            <p className="font-body text-sm text-brand-contrast mb-5">Oral Antibiotics, Roaccutane, and most Antidepressants cause extreme sun sensitivity. Without SPF, this leads to severe burns and permanent scarring.</p>
            <span className="inline-block bg-amber-400 text-brand-navy px-6 py-2 font-heading font-bold text-xs uppercase tracking-widest">SPF 50+ Non-Negotiable — Every Single Day</span>
          </div>
        </div>
      </div>

      {/* SECTION 3 — POST-PROCEDURE */}
      <div className="border-t border-brand-contrast/10">
        <div className="grid md:grid-cols-2">
          <div className="relative h-72 md:h-auto min-h-[320px] overflow-hidden">
            <Image
              src="/images/about/about-2.jpg"
              alt="Serum application — post-procedure care"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
          <div className="bg-brand-navy p-10 md:p-16 flex flex-col justify-center">
            <p className="text-[10px] font-heading font-bold tracking-widest uppercase text-brand-accent mb-3">Section 02</p>
            <h2 className="font-heading font-bold text-2xl md:text-3xl text-white uppercase tracking-widest mb-4">Skin Nutrients &amp; Post-Procedure</h2>
            <p className="font-body text-sm text-brand-contrast leading-relaxed">Use these products when skin is healthy or following a dermal procedure — to nourish, repair, and strengthen the tissue. After a peel or needling, prioritise Moisture Fix and Chronofirm to accelerate healing, then seal with your moisturiser and SPF.</p>
          </div>
        </div>
        <div className="max-w-3xl mx-auto px-4 py-14">
          <ol className="space-y-6">
            {[
              { n:"01", name:"Chronofirm Peptide Matrix", action:"Structural Support", day:true, night:true, desc:"Stimulates collagen and elastin to firm the skin, improve elasticity, and deliver anti-aging results." },
              { n:"02", name:"Vitamin C 20%", action:"Antioxidant Defence", day:true, night:false, desc:"Neutralises free radicals, reduces redness, brightens the complexion, and aids UV recovery." },
              { n:"03", name:"Moisture Fix Serum", action:"Intense Hydration", day:true, night:true, desc:"Instantly binds moisture to the skin to soothe and prevent dehydration." },
              { n:"04", name:"Collagen Cream", action:"Deep Nourishment", day:false, night:true, desc:"Replenishes essential proteins to keep skin plump and resilient." },
            ].map((item) => (
              <li key={item.n} className="flex gap-6 border-b border-brand-contrast/10 pb-6">
                <span className="w-8 h-8 rounded-full bg-brand-accent/20 text-brand-navy font-heading font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">{item.n}</span>
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <p className="font-heading font-bold text-sm text-brand-navy">{item.name}</p>
                    <span className="text-[10px] font-heading font-bold uppercase tracking-wider text-brand-blue">{item.action}</span>
                    {item.day && <DayBadge />}
                    {item.night && <NightBadge />}
                  </div>
                  <p className="font-body text-sm text-brand-contrast leading-relaxed">{item.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* SECTION 4 — PEEL & GLOW */}
      <div className="bg-[#F8F9FC] border-t border-brand-contrast/10">
        <div className="relative w-full h-64 md:h-80 overflow-hidden">
          <Image
            src="/images/library/lib-3.jpg"
            alt="Glowing healthy skin"
            fill
            className="object-cover object-top"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-brand-navy/60" />
          <div className="absolute inset-0 flex items-center justify-center text-center px-4">
            <div>
              <p className="text-[10px] font-heading font-bold tracking-widest uppercase text-brand-accent mb-2">Section 03</p>
              <h2 className="font-heading font-bold text-3xl md:text-4xl text-white uppercase tracking-widest">Peel &amp; Glow Guidelines</h2>
              <p className="font-body text-sm text-brand-contrast mt-2 max-w-sm mx-auto">Use 3-7 days after a dermal treatment, once the skin has stopped peeling or flaking.</p>
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 py-14">
          <div className="border-l-4 border-brand-accent bg-brand-accent/5 px-5 py-4 mb-10">
            <p className="font-heading font-bold text-xs uppercase tracking-wider text-brand-navy mb-1">The Tingle</p>
            <p className="font-body text-sm text-brand-contrast">A slight tingling sensation is normal with Glyco 10, Vitamin A, and Vitamin C — this is the actives working. If tingling is persistent or causes excessive redness, reduce frequency.</p>
          </div>

          <div className="overflow-x-auto bg-white border border-brand-contrast/10 mb-12">
            <table className="w-full text-sm font-body">
              <thead>
                <tr className="border-b border-brand-contrast/10 bg-brand-navy">
                  <th className="px-5 py-3 text-left text-[10px] font-heading font-bold uppercase tracking-wider text-white">Product</th>
                  <th className="px-5 py-3 text-left text-[10px] font-heading font-bold uppercase tracking-wider text-white">Notes</th>
                  <th className="px-4 py-3 text-center text-[10px] font-heading font-bold uppercase tracking-wider text-white"><Sun size={12} className="mx-auto" /></th>
                  <th className="px-4 py-3 text-center text-[10px] font-heading font-bold uppercase tracking-wider text-white"><Moon size={12} className="mx-auto" /></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-contrast/10">
                {[
                  { product:"Gluco 12 Cleanser", notes:"Active cleansing to prep the skin.", day:true, night:true },
                  { product:"Glyco 10 Skin Cream", notes:"Start once a week; increase gradually. Apply serum on top, seal with moisturiser and sunblock.", day:false, night:true },
                  { product:"Vitamin A (Retinol / Retinal 0.01)", notes:"Start once a week; increase gradually. Apply serum first, then Vitamin A, seal with moisturiser.", day:false, night:true },
                  { product:"Vitamin C 20%", notes:"Best used with Vitamin A to stimulate collagen and reduce redness.", day:true, night:false },
                  { product:"Niacinamide 5-10% & Arbutin 5-10%", notes:"Apply to clean skin to control oil, fade pigment, and repair the barrier.", day:true, night:true },
                  { product:"Glyco 15 Body Exfoliator", notes:"Body rejuvenation ONLY — not the face. Always seal with ceramide cream. Avoid strong shower gels.", day:false, night:true, tag:"Body Only" },
                  { product:"Glyco 40", notes:"Professional use only. Never for home application.", day:false, night:false, tag:"Pro Only" },
                ].map((row) => (
                  <tr key={row.product} className={row.tag === "Pro Only" ? "bg-red-50" : row.tag === "Body Only" ? "bg-amber-50" : "hover:bg-[#F8F9FC] transition-colors"}>
                    <td className="px-5 py-4 font-heading font-bold text-xs text-brand-navy align-top">
                      {row.product}
                      {row.tag && <div className="mt-1"><span className={`px-1.5 py-0.5 text-[9px] font-heading font-bold uppercase tracking-wider ${row.tag === "Pro Only" ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-700"}`}>{row.tag}</span></div>}
                    </td>
                    <td className="px-5 py-4 text-xs text-brand-contrast leading-relaxed">{row.notes}</td>
                    <td className="px-4 py-4 text-center">{row.day ? <Sun size={13} className="text-amber-500 mx-auto" /> : <span className="text-brand-contrast/20 text-xs">-</span>}</td>
                    <td className="px-4 py-4 text-center">{row.night ? <Moon size={13} className="text-indigo-500 mx-auto" /> : <span className="text-brand-contrast/20 text-xs">-</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-5"><Sun size={14} className="text-amber-500" /><p className="font-heading font-bold text-xs uppercase tracking-widest text-brand-navy">Day Layering</p></div>
              <ol className="space-y-3">
                {["Cleanse","Moisture Fix Serum","Glyco 10","Moisturiser","Sunblock"].map((s, i) => (
                  <li key={s} className="flex items-center gap-3 text-sm font-body text-brand-contrast">
                    <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 font-heading font-bold text-[10px] flex items-center justify-center shrink-0">{i + 1}</span>{s}
                  </li>
                ))}
              </ol>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-5"><Moon size={14} className="text-indigo-500" /><p className="font-heading font-bold text-xs uppercase tracking-widest text-brand-navy">Night Layering</p></div>
              <ol className="space-y-3">
                {["Cleanse","Serum","Vitamin A","Moisturiser"].map((s, i) => (
                  <li key={s} className="flex items-center gap-3 text-sm font-body text-brand-contrast">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-800 font-heading font-bold text-[10px] flex items-center justify-center shrink-0">{i + 1}</span>{s}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>

      {/* FINAL CTA */}
      <div className="relative w-full h-80 md:h-96 overflow-hidden">
        <Image
          src="/images/about/about-banner.jpg"
          alt="Glowing healthy skin"
          fill
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-brand-navy/65" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <p className="font-heading font-bold text-2xl md:text-3xl text-white uppercase tracking-widest mb-3">The Result Is In The Routine</p>
          <p className="font-body text-sm text-brand-contrast max-w-sm mx-auto mb-7">Consistency with the right products in the right order is what transforms skin over time.</p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/find-your-routine" className="px-8 py-3 bg-brand-accent text-brand-navy text-xs font-heading font-bold uppercase tracking-widest hover:bg-brand-accent/85 transition-colors">Find My Routine</Link>
            <Link href="/shop" className="px-8 py-3 border border-white/40 text-white text-xs font-heading font-bold uppercase tracking-widest hover:border-white transition-colors">Shop All Products</Link>
          </div>
        </div>
      </div>

    </div>
  );
}
