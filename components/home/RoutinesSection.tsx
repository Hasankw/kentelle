import Link from "next/link";

interface Props {
  routines: any[];
  clinical: any[];
}

export default function RoutinesSection({ routines, clinical }: Props) {
  return (
    <section className="py-16 px-6 bg-brand-bg">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs font-heading font-bold uppercase tracking-widest text-brand-accent mb-2">
            Expert Guidance
          </p>
          <h2 className="font-heading font-bold text-2xl md:text-3xl text-brand-navy">
            Your Skincare Routine Guide
          </h2>
          <p className="font-body text-brand-contrast mt-3 max-w-xl mx-auto">
            Curated step-by-step regimes for every skin type — from daily essentials to clinical-grade treatments.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <CategoryCard
            label="Skincare Routines"
            description="Daily rituals for healthy, radiant skin. Choose from foundational essentials to advanced resurfacing."
            accent="bg-brand-accent"
            href="/routines?category=routine"
            exploreLabel="Explore Skincare Routines"
          />
          <CategoryCard
            label="Clinical Treatments"
            description="Targeted protocols for specific concerns — acne, rosacea, pigmentation and more."
            accent="bg-brand-navy"
            href="/routines?category=clinical"
            exploreLabel="Explore Clinical Treatments"
          />
        </div>
      </div>
    </section>
  );
}

function CategoryCard({
  label,
  description,
  accent,
  href,
  exploreLabel,
}: {
  label: string;
  description: string;
  accent: string;
  href: string;
  exploreLabel: string;
}) {
  return (
    <div className="bg-white border border-brand-contrast/10 hover:border-brand-accent/30 hover:shadow-md transition-all duration-200 group">
      <div className={`h-1.5 ${accent}`} />
      <div className="p-7">
        <h3 className="font-heading font-bold text-xl text-brand-navy mb-2">{label}</h3>
        <p className="font-body text-sm text-brand-contrast mb-6 leading-relaxed">{description}</p>
        <Link
          href={href}
          className="inline-block text-xs font-heading font-bold uppercase tracking-widest text-brand-accent group-hover:text-brand-blue transition-colors"
        >
          {exploreLabel} →
        </Link>
      </div>
    </div>
  );
}
