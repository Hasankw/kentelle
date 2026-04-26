import Link from "next/link";

const concerns = [
  { label: "Acne & Breakouts", slug: "acne" },
  { label: "Anti-Ageing", slug: "anti-ageing" },
  { label: "Dark Spots", slug: "dark-spots" },
  { label: "Dry Skin", slug: "dry-skin" },
  { label: "Dullness", slug: "dullness" },
  { label: "Enlarged Pores", slug: "enlarged-pores" },
  { label: "Fine Lines", slug: "fine-lines" },
  { label: "Hydration", slug: "hydration" },
  { label: "Oily Skin", slug: "oily-skin" },
  { label: "Pigmentation", slug: "pigmentation" },
  { label: "Redness", slug: "redness" },
  { label: "Sensitive Skin", slug: "sensitive-skin" },
  { label: "Under Eye", slug: "under-eye" },
  { label: "Uneven Texture", slug: "uneven-texture" },
  { label: "Wrinkles", slug: "wrinkles" },
];

export default function SkinConcernNav() {
  return (
    <section className="bg-brand-navy py-14 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <p className="text-xs font-heading font-bold tracking-widest uppercase text-brand-blue mb-2">
            Personalised For You
          </p>
          <h2 className="font-heading font-bold text-3xl text-brand-white">
            Shop by Skin Concern
          </h2>
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          {concerns.map((c) => (
            <Link
              key={c.slug}
              href={`/concerns/${c.slug}`}
              className="px-4 py-2 border border-brand-white/20 text-xs font-heading font-bold uppercase tracking-wider text-brand-white hover:bg-brand-white hover:text-brand-navy transition-all duration-200"
            >
              {c.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
