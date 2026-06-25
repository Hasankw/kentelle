export const dynamic = "force-dynamic";

import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { db } from "@/lib/db";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const routine = (await db.routine.findUnique({ where: { slug } })) as any;
  if (!routine) return { title: "Not Found" };
  return {
    title: `${routine.title} | Kentelle`,
    description: routine.tagline ?? undefined,
  };
}

export default async function RoutinePage({ params }: PageProps) {
  const { slug } = await params;
  const routine = (await db.routine.findUnique({ where: { slug } })) as any;
  if (!routine || !routine.published) notFound();

  const isClinical = routine.category === "clinical";
  const steps: any[] = Array.isArray(routine.steps) ? routine.steps : [];
  const tips = routine.tips as { suitability?: string; items?: { label: string; content: string }[] } | null;

  return (
    <main className="min-h-screen bg-brand-bg">
      {/* Header */}
      <section className="bg-brand-navy py-14 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-heading font-bold uppercase tracking-widest text-brand-accent mb-3">
            {isClinical ? "Clinical Treatment" : "Skincare Routine"}
          </p>
          <h1 className="font-heading font-bold text-3xl md:text-4xl text-brand-white mb-4 leading-tight">
            {routine.title}
          </h1>
          {routine.tagline && (
            <p className="font-body text-brand-contrast text-lg max-w-2xl mx-auto">
              {routine.tagline}
            </p>
          )}
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-6 py-14">
        {/* Back */}
        <Link
          href="/routines"
          className="inline-flex items-center gap-2 text-xs font-heading font-bold uppercase tracking-widest text-brand-contrast hover:text-brand-navy transition-colors mb-12"
        >
          <ArrowLeft size={13} /> Back to All Routines
        </Link>

        {/* Steps — PDF-style alternating left / right layout */}
        <div className="mb-14">
          <h2 className="font-heading font-bold text-xs uppercase tracking-widest text-brand-accent mb-8">
            The {steps.length}-Step Regime
          </h2>

          {/* Vertical centre line */}
          <div className="relative">
            <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px bg-brand-accent/25 hidden md:block" aria-hidden="true" />

            {steps.map((step: any, i: number) => {
              // even index → content on RIGHT, odd index → content on LEFT  (matches PDF)
              const onRight = i % 2 === 0;
              return (
                <div key={i} className="grid grid-cols-1 md:grid-cols-2 border-b border-brand-contrast/5 last:border-b-0">
                  {/* LEFT column */}
                  <div className="md:pr-12 md:text-right py-8 px-4 md:px-0">
                    {!onRight && <StepContent step={step} />}
                  </div>
                  {/* RIGHT column */}
                  <div className="md:pl-12 py-8 px-4 md:px-0 bg-brand-bg/40 md:bg-transparent">
                    {onRight && <StepContent step={step} />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tips & Suitability */}
        {tips && (tips.suitability || (tips.items && tips.items.length > 0)) && (
          <section className="bg-white border border-brand-contrast/10 p-8">
            <h2 className="font-heading font-bold text-center text-sm uppercase tracking-widest text-brand-navy mb-6">
              {isClinical ? "Clinical Tips & Advice" : "Tips & Suitability"}
            </h2>
            {tips.suitability && (
              <div className="text-center mb-6 pb-6 border-b border-brand-contrast/10">
                <p className="font-body text-brand-navy text-sm leading-relaxed">{tips.suitability}</p>
              </div>
            )}
            {tips.items && tips.items.length > 0 && (
              <ul className="space-y-4">
                {tips.items.map((tip: any, i: number) => (
                  <li key={i} className="flex gap-3">
                    <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-brand-accent mt-2" />
                    <p className="font-body text-sm text-brand-navy leading-relaxed">
                      <strong className="font-heading font-bold">{tip.label}:</strong>{" "}
                      {tip.content}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {/* CTA */}
        <div className="mt-12 text-center">
          <p className="font-body text-brand-contrast mb-4">Ready to start your routine?</p>
          <Link
            href="/shop"
            className="inline-block bg-brand-accent text-brand-navy px-8 py-3 text-xs font-heading font-bold uppercase tracking-widest rounded hover:bg-brand-accent/85 transition-colors"
          >
            Shop Products
          </Link>
        </div>
      </div>
    </main>
  );
}

function StepContent({ step }: { step: any }) {
  return (
    <div>
      <p className="text-xs font-heading font-bold uppercase tracking-widest text-brand-accent mb-1">
        Step {step.number}
      </p>
      <h3 className="font-heading font-bold text-base text-brand-navy mb-0.5">
        {step.name}
        {step.subtitle && (
          <span className="text-brand-contrast font-normal"> ({step.subtitle})</span>
        )}
      </h3>
      <p className="font-body text-sm text-brand-contrast mb-2 leading-relaxed">
        <span className="font-bold text-brand-navy">The Choice: </span>
        {step.choices}
      </p>
      <p className="font-body text-sm text-brand-contrast leading-relaxed">{step.description}</p>
    </div>
  );
}
