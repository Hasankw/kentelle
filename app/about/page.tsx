import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "About Kentelle Skincare | Perth WA",
  description: "Learn about Kentelle Skincare — science-backed, cruelty-free formulas crafted for Australian skin, developed in partnership with Beaubelle Beauty Clinic in Perth WA.",
  robots: { index: true, follow: true },
};

const DEFAULT = {
  heroTitle: "Skincare That Performs, Not Just Promises",
  heroSubtext: "Born from a lifelong devotion to skin science and the absolute trust of thousands of clients.",
  founderName: "Ken Ken",
  founderTitle: "Founder & Formulator, KENTELLE",
  founderBio: `Launching the KENTELLE skincare range is the dazzling realization of a lifelong dream for its founder, Ken Ken. If you meet her today, you will immediately recognize her by her trademark flamboyant red hair, her perfectly painted bold lip, and an energy so magnetic it practically hums. She is a woman who refuses to slow down, splitting her time between tirelessly formulating new products and teaching at the skincare clinic.

The brand itself was born organically from the sheer devotion of her clients. For years, as she treated thousands of faces, her clinic echoed with a familiar, demanding refrain: "Ken, tell me what to do, and I'll do it." That absolute trust became the foundation of KENTELLE — a brand built not just on high-performance ingredients, but on the charismatic, intimate connection Ken Ken shares with every person who seeks her advice.

This unwavering authority was forged during a deeply romantic, globe-trotting journey that began with a very bold leap. Armed with a university degree in pharmacology, a young and ambitious Ken Ken packed her bags for Paris — the undisputed cosmetic capital of the world. Already fluent in a tapestry of Asian languages, she quickly conquered French, charming her European colleagues and clients alike. It was in those Parisian companies that she mastered her signature approach: taking rigid, clinical pharmaceutical science and wrapping it in the indulgent, luxurious sensory experience of French beauty.

She carried this expertise back to Kuala Lumpur to elevate the local skincare industry and join the city's social scene. Always exquisitely dressed and overflowing with an infectious passion, she became a beloved social figure. Her colleagues adored the sophisticated European flair she brought to their clinics, and her vibrant, glittering social life became an extension of her glamorous brand of beauty.

Today, every jar and ampoule of KENTELLE contains a drop of that colourful, well-travelled history. Ken Ken is living proof that true beauty is about unapologetic ambition and living life out loud. Even now, her younger clients regularly sweep her away to glamorous social events where she remains the undisputed life of the party. With KENTELLE, she isn't just selling skincare — she is sharing the brilliant, flamboyant energy that has defined her magnificent life.`,
};

async function getContent() {
  try {
    const rows = await db.content.findMany({ where: { key: "page_about" } });
    if (rows[0]?.value) return { ...DEFAULT, ...JSON.parse(rows[0].value) };
  } catch {}
  return DEFAULT;
}

export default async function AboutPage() {
  const data = await getContent();
  const paragraphs = data.founderBio.split(/\n\n+/).filter(Boolean);

  return (
    <div>
      {/* Hero */}
      <section className="relative h-[55vh] min-h-[400px] overflow-hidden">
        <Image
          src="/images/about/about-banner.jpg"
          alt="Kentelle skincare"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-brand-navy/40 via-brand-navy/50 to-brand-navy/85" />
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-16 px-4 text-center">
          <p className="text-[10px] font-heading font-bold tracking-[0.3em] uppercase text-brand-accent mb-3">
            Our Story
          </p>
          <h1 className="font-heading font-bold text-4xl md:text-5xl leading-tight text-white mb-4">
            {data.heroTitle}
          </h1>
          <p className="font-body text-white/70 text-base leading-relaxed max-w-xl mx-auto">
            {data.heroSubtext}
          </p>
        </div>
      </section>

      {/* Founder Story */}
      <section className="max-w-6xl mx-auto px-4 py-20 grid md:grid-cols-2 gap-14 items-start">
        {/* Portrait */}
        <div className="relative">
          <div className="relative aspect-[3/4] overflow-hidden rounded-sm shadow-lg">
            <Image
              src="/images/about/ken-profile.jpg"
              alt={`${data.founderName} — Founder of KENTELLE`}
              fill
              className="object-cover object-top"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
          <div className="mt-4 text-center">
            <p className="font-heading font-bold text-sm text-brand-navy uppercase tracking-widest">{data.founderName}</p>
            <p className="font-body text-xs text-brand-contrast mt-1">{data.founderTitle}</p>
          </div>
        </div>

        {/* Bio */}
        <div className="pt-2">
          <p className="text-xs font-heading font-bold tracking-widest uppercase text-brand-blue mb-3">
            Meet the Founder
          </p>
          <h2 className="font-heading font-bold text-3xl md:text-4xl text-brand-navy leading-tight mb-8">
            The Woman Behind<br />the Brand
          </h2>

          <div className="space-y-5 font-body text-sm text-brand-navy/80 leading-relaxed">
            {paragraphs.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>

          <div className="mt-10">
            <Link href="/shop">
              <Button>Shop the Range</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
