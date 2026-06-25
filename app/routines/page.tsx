export const dynamic = "force-dynamic";

import { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";

export const metadata: Metadata = {
  title: "Skincare Routines & Clinical Treatments | Kentelle",
  description: "Expert skincare routines and clinical treatment guides from Kentelle — tailored for every skin type and concern.",
};

interface PageProps {
  searchParams: Promise<{ category?: string }>;
}

export default async function RoutinesPage({ searchParams }: PageProps) {
  const { category } = await searchParams;

  let all: any[] = [];
  try {
    all = (await db.routine.findMany({
      where: { published: true },
      orderBy: { sortOrder: "asc" },
    })) as any[];
  } catch {
    all = [];
  }

  const routines = all.filter((r: any) => r.category === "routine");
  const clinical = all.filter((r: any) => r.category === "clinical");

  // Filter by category param
  const showRoutines = !category || category === "routine";
  const showClinical = !category || category === "clinical";

  const pageTitle =
    category === "routine"
      ? "Skincare Routines"
      : category === "clinical"
      ? "Clinical Treatments"
      : "Your Skincare Guide";

  const pageSubtext =
    category === "routine"
      ? "Daily rituals designed for healthy, radiant skin — from foundational essentials to advanced resurfacing."
      : category === "clinical"
      ? "Targeted, professional-grade protocols for specific skin concerns — formulated with clinical precision."
      : "Expert-crafted routines and clinical protocols to help you build the perfect skincare ritual.";

  return (
    <main className="min-h-screen bg-brand-bg">
      {/* Header */}
      <section className="bg-brand-navy text-brand-white py-16 px-6 text-center">
        <p className="text-xs font-heading font-bold uppercase tracking-widest text-brand-accent mb-3">
          Kentelle Skincare
        </p>
        <h1 className="font-heading font-bold text-3xl md:text-4xl text-brand-white mb-4">
          {pageTitle}
        </h1>
        <p className="font-body text-brand-contrast max-w-xl mx-auto">{pageSubtext}</p>

        {/* Category toggle */}
        <div className="flex items-center justify-center gap-3 mt-8">
          <Link
            href="/routines?category=routine"
            className={`px-5 py-2 text-xs font-heading font-bold uppercase tracking-widest transition-colors rounded ${
              category === "routine"
                ? "bg-brand-accent text-brand-navy"
                : "border border-brand-white/20 text-brand-white/70 hover:text-brand-white"
            }`}
          >
            Skincare Routines
          </Link>
          <Link
            href="/routines?category=clinical"
            className={`px-5 py-2 text-xs font-heading font-bold uppercase tracking-widest transition-colors rounded ${
              category === "clinical"
                ? "bg-brand-accent text-brand-navy"
                : "border border-brand-white/20 text-brand-white/70 hover:text-brand-white"
            }`}
          >
            Clinical Treatments
          </Link>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-6 py-16 space-y-16">
        {showRoutines && (
          <section>
            {!category && (
              <div className="mb-8">
                <p className="text-xs font-heading font-bold uppercase tracking-widest text-brand-accent mb-2">Category 01</p>
                <h2 className="font-heading font-bold text-2xl text-brand-navy">Skincare Routines</h2>
                <p className="font-body text-brand-contrast mt-2">Daily rituals for healthy, radiant skin. From foundational essentials to advanced resurfacing.</p>
              </div>
            )}
            <div className="grid md:grid-cols-3 gap-6">
              {routines.map((r: any) => (
                <RoutineCard key={r.id} routine={r} />
              ))}
            </div>
          </section>
        )}

        {showClinical && (
          <section>
            {!category && (
              <div className="mb-8">
                <p className="text-xs font-heading font-bold uppercase tracking-widest text-brand-accent mb-2">Category 02</p>
                <h2 className="font-heading font-bold text-2xl text-brand-navy">Clinical Treatments</h2>
                <p className="font-body text-brand-contrast mt-2">Targeted, professional-grade protocols for specific skin concerns — formulated with clinical precision.</p>
              </div>
            )}
            <div className="grid md:grid-cols-3 gap-6">
              {clinical.map((r: any) => (
                <RoutineCard key={r.id} routine={r} clinical />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

function RoutineCard({ routine, clinical }: { routine: any; clinical?: boolean }) {
  return (
    <Link
      href={`/routines/${routine.slug}`}
      className="group block bg-white border border-brand-contrast/10 hover:border-brand-accent/40 hover:shadow-md transition-all duration-200"
    >
      <div className={`h-1.5 ${clinical ? "bg-brand-navy" : "bg-brand-accent"}`} />
      <div className="p-6">
        <p className="text-[10px] font-heading font-bold uppercase tracking-widest text-brand-contrast mb-2">
          {clinical ? "Clinical Treatment" : "Skincare Routine"} · {Array.isArray(routine.steps) ? routine.steps.length : 0} Steps
        </p>
        <h3 className="font-heading font-bold text-lg text-brand-navy mb-2 leading-snug group-hover:text-brand-blue transition-colors">
          {routine.title}
        </h3>
        {routine.tagline && (
          <p className="font-body text-sm text-brand-contrast leading-relaxed">{routine.tagline}</p>
        )}
        <div className="mt-4 text-xs font-heading font-bold uppercase tracking-widest text-brand-accent group-hover:text-brand-blue transition-colors">
          View Routine →
        </div>
      </div>
    </Link>
  );
}
