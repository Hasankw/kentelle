import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Button from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "About Kentelle",
  description: "The story behind Kentelle Skincare — science-backed formulas crafted for Australian skin.",
};

export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-brand-navy text-brand-white py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs font-heading font-bold tracking-widest uppercase text-brand-blue mb-3">
            Our Story
          </p>
          <h1 className="font-heading font-bold text-4xl md:text-5xl leading-tight mb-5">
            Skincare That Performs,<br />Not Just Promises
          </h1>
          <p className="font-body text-brand-white/70 text-base leading-relaxed max-w-xl mx-auto">
            Kentelle was founded with a simple belief: everyone deserves access to
            high-performance skincare formulated with integrity, science, and care.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="max-w-5xl mx-auto px-4 py-20 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <p className="text-xs font-heading font-bold tracking-widest uppercase text-brand-blue mb-3">
            Our Mission
          </p>
          <h2 className="font-heading font-bold text-3xl text-brand-navy mb-5">
            Rooted in Science.<br />Grounded in Ethics.
          </h2>
          <p className="font-body text-sm text-brand-navy/80 leading-relaxed mb-4">
            Every Kentelle formula is developed by our team of cosmetic chemists and
            dermatologists, using only clinically validated ingredients at effective
            concentrations. No fillers. No fluff. Just results you can see and feel.
          </p>
          <p className="font-body text-sm text-brand-navy/80 leading-relaxed mb-6">
            We are proudly 100% vegan, cruelty-free, and committed to sustainable
            packaging. Because beautiful skin shouldn't come at the planet's expense.
          </p>
          <Link href="/shop">
            <Button>Shop Our Range</Button>
          </Link>
        </div>
        <div className="relative aspect-square bg-brand-contrast/10">
          <Image
            src="/images/about-lab.jpg"
            alt="Kentelle lab"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
      </section>

      {/* Values */}
      <section className="bg-brand-navy py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-heading font-bold text-3xl text-brand-white text-center mb-12">
            What We Stand For
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: "🌿", title: "Clean Formulas", desc: "No parabens, sulphates, or synthetic fragrances" },
              { icon: "🐰", title: "Cruelty-Free", desc: "Never tested on animals. Ever." },
              { icon: "🌱", title: "Vegan", desc: "Zero animal-derived ingredients" },
              { icon: "🇦🇺", title: "Australian Made", desc: "Proudly formulated and manufactured in Australia" },
            ].map((v) => (
              <div key={v.title} className="text-center">
                <span className="text-4xl">{v.icon}</span>
                <h3 className="font-heading font-bold text-sm text-brand-white uppercase tracking-wider mt-3 mb-2">
                  {v.title}
                </h3>
                <p className="font-body text-xs text-brand-contrast leading-relaxed">
                  {v.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
