import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Layers, FlaskConical, Droplets, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Product Layering | KENTELLE",
  description:
    "A clinical guide to layering your KENTELLE formulations correctly — from thinnest to thickest — for maximum efficacy and active ingredient delivery.",
  robots: { index: true, follow: true },
};

const rules = [
  {
    n: "01",
    title: "Water-Based Fluids & Serums",
    tag: "Thinnest — Apply First",
    texture: "Aqueous, completely liquid, or lightweight gels.",
    science:
      "These formulas contain low-molecular-weight actives (like Hyaluronic Acid, Vitamin C, or Peptides) designed to penetrate deeply and rapidly into the skin matrix.",
    order: "FIRST. Always apply these directly to clean, toned skin so nothing blocks their absorption.",
  },
  {
    n: "02",
    title: "Gels & Light Lotions",
    tag: "Second Layer",
    texture: "Water-rich, oil-free, or very low-oil semi-solids that melt into the skin.",
    science:
      "Designed to deliver intense hydration and targeted actives without adding heavy lipids.",
    order: "SECOND. These slip perfectly over fluids and provide a smooth, hydrating base.",
  },
  {
    n: "03",
    title: "Oil-in-Water (O/W) Emulsions",
    tag: "Most Creams & Day Moisturisers",
    texture: "Classic, creamy textures that feel hydrating but absorb cleanly without a greasy residue.",
    science:
      "Microscopic oil droplets are suspended inside a water base. The water evaporates or absorbs first, delivering hydration, while the light oils remain on the surface to lock it in.",
    order: "THIRD. These act as your daily hydrators, locking in your underlying fluids and gels.",
  },
  {
    n: "04",
    title: "Water-in-Oil (W/O) Emulsions",
    tag: "Rich Night Creams & Eye Creams",
    texture: "Dense, rich, and deeply emollient.",
    science:
      "Tiny water droplets are trapped inside a rich oil base. This creates a powerful, slow-releasing protective barrier that prevents trans-epidermal water loss (TEWL).",
    order:
      "FOURTH. Because the outer layer is oil, water-based products cannot penetrate through it. This must go near the end of your routine to seal everything in.",
    highlight: true,
  },
  {
    n: "05",
    title: "Pure Oils & Occlusives",
    tag: "Thickest — Apply Last",
    texture: "Liquid lipids or anhydrous (waterless) balms.",
    science:
      "These do not hydrate the skin; instead, they act as an impenetrable atmospheric shield to trap all previous layers of moisture underneath.",
    order:
      "LAST. Oil repels water. If you apply a pure oil first, any serum you put on top will simply slide off.",
    highlight: true,
  },
];

const steps = [
  { n: "1", type: "Cleanse & Tone", emulsion: "Aqueous / Liquid", purpose: "Prep and balance skin pH" },
  { n: "2", type: "Targeted Ampoules & Fluids", emulsion: "Water-Based Fluid", purpose: "Deep active ingredient delivery" },
  { n: "3", type: "Hydrating Gels / Light Serums", emulsion: "Water-Gel", purpose: "Surface plumping and hydration" },
  { n: "4", type: "Day Moisturisers / Lotions", emulsion: "Oil-in-Water (O/W) Cream", purpose: "Nutrient delivery & light protection" },
  { n: "5", type: "Rich Treatment Creams", emulsion: "Water-in-Oil (W/O) Cream", purpose: "Deep overnight barrier repair" },
  { n: "6", type: "Face Oils (If using)", emulsion: "Anhydrous Lipid", purpose: "Final moisture lock" },
];

export default function ProductLayeringPage() {
  return (
    <div className="bg-white">

      {/* HERO */}
      <div className="relative w-full h-[55vh] min-h-[400px] overflow-hidden">
        <Image
          src="/images/regimen/regimen-banner.webp"
          alt="Product layering guide"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-brand-navy/30 via-brand-navy/40 to-brand-navy/85" />
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-14 px-4 text-center">
          <p className="text-[10px] font-heading font-bold tracking-[0.3em] uppercase text-brand-accent mb-3">
            Clinical Formulation Guide
          </p>
          <h1 className="font-heading font-bold text-4xl md:text-6xl tracking-widest uppercase text-white leading-tight">
            The Art of<br />Formulation Layering
          </h1>
        </div>
      </div>

      {/* INTRO */}
      <div className="max-w-3xl mx-auto px-4 py-14 text-center">
        <p className="font-body text-base text-brand-contrast leading-relaxed mb-6">
          To achieve maximum efficacy from your KENTELLE formulations, products must be applied in harmony with their molecular weight, texture, and emulsion type. Layering incorrectly can create a barrier that prevents active ingredients from penetrating the skin.
        </p>
        <div className="inline-block border-t-2 border-brand-accent pt-5">
          <p className="text-xs font-heading font-bold uppercase tracking-widest text-brand-navy">
            The Golden Rule
          </p>
          <p className="font-body text-sm text-brand-contrast mt-1">
            Always layer from thinnest to thickest — water-based before oil-based.
          </p>
        </div>
      </div>

      {/* THE 5 RULES */}
      <div className="border-t border-brand-contrast/10">
        <div className="relative w-full h-72 md:h-96 overflow-hidden">
          <Image
            src="/images/regimen/regimen-1.jpg"
            alt="Texture layering"
            fill
            className="object-cover object-top"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-brand-navy/55" />
          <div className="absolute inset-0 flex items-center justify-center text-center px-4">
            <div>
              <p className="text-[10px] font-heading font-bold tracking-widest uppercase text-brand-accent mb-2">
                Section 01
              </p>
              <h2 className="font-heading font-bold text-3xl md:text-4xl text-white uppercase tracking-widest">
                The 5 Rules of Texture Layering
              </h2>
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 py-14">
          <p className="font-body text-sm text-brand-contrast leading-relaxed mb-12">
            Each texture type has a specific place in the layering sequence. Follow this order to ensure every active reaches its intended depth in the skin.
          </p>
          <ol className="space-y-10">
            {rules.map((rule, i) => (
              <li key={i} className="flex gap-6">
                <div className="shrink-0 pt-0.5">
                  <span
                    className={`flex w-10 h-10 rounded-full items-center justify-center font-heading font-bold text-xs ${
                      rule.highlight
                        ? "bg-brand-accent text-brand-navy"
                        : "bg-brand-navy text-white"
                    }`}
                  >
                    {rule.n}
                  </span>
                </div>
                <div className="flex-1 border-b border-brand-contrast/10 pb-10">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="font-heading font-bold text-sm uppercase tracking-widest text-brand-navy">
                      {rule.title}
                    </h3>
                    <span className="inline-flex items-center px-2 py-0.5 bg-brand-navy/10 text-brand-navy text-[10px] font-heading font-bold uppercase tracking-wider">
                      {rule.tag}
                    </span>
                  </div>
                  <p className="font-heading font-bold text-xs text-brand-blue mb-1">
                    Texture: {rule.texture}
                  </p>
                  <p className="font-body text-sm text-brand-contrast leading-relaxed mb-2">
                    <span className="font-heading font-bold text-brand-navy">The Science: </span>
                    {rule.science}
                  </p>
                  <p className="font-body text-sm text-brand-contrast leading-relaxed">
                    <span className="font-heading font-bold text-brand-navy">Application Order: </span>
                    {rule.order}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* REFERENCE TABLE */}
      <div className="bg-[#F8F9FC] border-t border-brand-contrast/10">
        <div className="relative w-full h-64 md:h-80 overflow-hidden">
          <Image
            src="/images/regimen/regimen-2.jpg"
            alt="Routine reference"
            fill
            className="object-cover object-top"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-brand-navy/55" />
          <div className="absolute inset-0 flex items-center justify-center text-center px-4">
            <div>
              <p className="text-[10px] font-heading font-bold tracking-widest uppercase text-brand-accent mb-2">
                Section 02
              </p>
              <h2 className="font-heading font-bold text-3xl md:text-4xl text-white uppercase tracking-widest">
                Routine Reference Guide
              </h2>
              <p className="font-body text-sm text-brand-contrast mt-2">
                Your complete application sequence at a glance
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 py-14">
          <div className="overflow-x-auto bg-white border border-brand-contrast/10 mb-12">
            <table className="w-full text-sm font-body">
              <thead>
                <tr className="border-b border-brand-contrast/10 bg-brand-navy">
                  <th className="px-5 py-3 text-left text-[10px] font-heading font-bold uppercase tracking-wider text-white">
                    Step
                  </th>
                  <th className="px-5 py-3 text-left text-[10px] font-heading font-bold uppercase tracking-wider text-white">
                    Product Type
                  </th>
                  <th className="px-5 py-3 text-left text-[10px] font-heading font-bold uppercase tracking-wider text-white">
                    Emulsion / Texture
                  </th>
                  <th className="px-5 py-3 text-left text-[10px] font-heading font-bold uppercase tracking-wider text-white">
                    Core Purpose
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-contrast/10">
                {steps.map((step) => (
                  <tr key={step.n} className="hover:bg-[#F8F9FC] transition-colors">
                    <td className="px-5 py-4">
                      <span className="w-7 h-7 rounded-full bg-brand-navy text-white font-heading font-bold text-xs flex items-center justify-center">
                        {step.n}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-heading font-bold text-xs text-brand-navy">
                      {step.type}
                    </td>
                    <td className="px-5 py-4 text-xs text-brand-blue font-heading font-bold">
                      {step.emulsion}
                    </td>
                    <td className="px-5 py-4 text-xs text-brand-contrast leading-relaxed">
                      {step.purpose}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 60 SECOND RULE CALLOUT */}
          <div className="bg-brand-navy/5 border-l-4 border-brand-accent px-6 py-6">
            <div className="flex items-start gap-4">
              <div className="shrink-0 mt-0.5">
                <Clock size={20} className="text-brand-accent" />
              </div>
              <div>
                <p className="font-heading font-bold text-xs uppercase tracking-wider text-brand-navy mb-2 flex items-center gap-2">
                  <FlaskConical size={12} /> Clinical Tip: The 60-Second Rule
                </p>
                <p className="font-body text-sm text-brand-contrast leading-relaxed">
                  Allow each layer to absorb for roughly 30–60 seconds before applying the next texture. This allows the emulsion to settle perfectly into the skin barrier, prevents your formulas from pilling on the surface, and maximises active ingredient delivery.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* WHY LAYERING ORDER MATTERS */}
      <div className="border-t border-brand-contrast/10">
        <div className="grid md:grid-cols-2">
          <div className="relative h-72 md:h-auto min-h-[320px] overflow-hidden">
            <Image
              src="/images/about/about-2.jpg"
              alt="Why layering order matters"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
          <div className="bg-brand-navy p-10 md:p-16 flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-3">
              <Layers size={14} className="text-brand-accent" />
              <p className="text-[10px] font-heading font-bold tracking-widest uppercase text-brand-accent">
                Section 03
              </p>
            </div>
            <h2 className="font-heading font-bold text-2xl md:text-3xl text-white uppercase tracking-widest mb-4">
              Why Order Matters
            </h2>
            <p className="font-body text-sm text-brand-contrast leading-relaxed mb-6">
              The skin is a selective barrier. Molecule size and emulsion type determine how far an ingredient travels through the epidermis. Apply a heavy oil-based product first and you create a lipid barrier that physically blocks everything you apply after it.
            </p>
            <p className="font-body text-sm text-brand-contrast leading-relaxed">
              Applying in the correct sequence — thinnest to thickest — ensures your actives reach the layers of skin where they are most effective, rather than sitting on the surface.
            </p>
          </div>
        </div>
      </div>

      {/* QUICK VISUAL GUIDE */}
      <div className="border-t border-brand-contrast/10 bg-[#F8F9FC]">
        <div className="max-w-3xl mx-auto px-4 py-14">
          <div className="text-center mb-10">
            <p className="text-[10px] font-heading font-bold tracking-widest uppercase text-brand-accent mb-2">
              Section 04
            </p>
            <h2 className="font-heading font-bold text-2xl md:text-3xl text-brand-navy uppercase tracking-widest">
              Quick Layering Reference
            </h2>
          </div>

          <div className="relative">
            <div className="absolute left-5 top-0 bottom-0 w-px bg-brand-contrast/10" />
            <ol className="space-y-6">
              {[
                { label: "Water-Based Serums & Fluids", note: "Thinnest — apply first", color: "bg-brand-accent" },
                { label: "Hydrating Gels & Light Serums", note: "Water-gel textures", color: "bg-brand-accent/75" },
                { label: "Day Moisturisers (O/W Creams)", note: "Oil-in-water emulsions", color: "bg-brand-blue" },
                { label: "Night Creams & Eye Creams (W/O)", note: "Water-in-oil emulsions", color: "bg-brand-navy" },
                { label: "Face Oils & Occlusives", note: "Thickest — apply last", color: "bg-brand-navy" },
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-5 relative pl-12">
                  <span
                    className={`absolute left-0 w-10 h-10 rounded-full ${item.color} text-white font-heading font-bold text-xs flex items-center justify-center shrink-0`}
                  >
                    {i + 1}
                  </span>
                  <div className="flex-1 bg-white border border-brand-contrast/10 px-5 py-4">
                    <p className="font-heading font-bold text-sm text-brand-navy">{item.label}</p>
                    <p className="font-body text-xs text-brand-contrast mt-0.5">{item.note}</p>
                  </div>
                  {i < 4 && (
                    <div className="absolute left-5 top-10 h-6 w-px bg-brand-contrast/20" />
                  )}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="relative w-full h-80 md:h-96 overflow-hidden">
        <Image
          src="/images/about/about-banner.jpg"
          alt="KENTELLE skincare"
          fill
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-brand-navy/65" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <p className="font-heading font-bold text-2xl md:text-3xl text-white uppercase tracking-widest mb-3">
            Layer With Intention
          </p>
          <p className="font-body text-sm text-brand-contrast max-w-sm mx-auto mb-7">
            The right product applied in the wrong order is a wasted product. Follow the science, and let every layer work for you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/skin-regimen"
              className="px-8 py-3 bg-brand-accent text-brand-navy rounded text-xs font-heading font-bold uppercase tracking-widest hover:bg-brand-accent/85 transition-colors"
            >
              Full Skin Regimen
            </Link>
            <Link
              href="/shop"
              className="px-8 py-3 border border-white/40 text-white text-xs font-heading font-bold uppercase tracking-widest hover:border-white transition-colors"
            >
              Shop All Products
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
}
