const concerns = [
  "Acne & Breakouts",
  "Anti-Ageing",
  "Dark Spots",
  "Dry Skin",
  "Dullness",
  "Enlarged Pores",
  "Fine Lines",
  "Hydration",
  "Oily Skin",
  "Pigmentation",
  "Redness",
  "Sensitive Skin",
  "Under Eye",
  "Uneven Texture",
  "Wrinkles",
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
          {concerns.map((label) => (
            <span
              key={label}
              className="px-4 py-2 border border-brand-white/20 text-xs font-heading font-bold uppercase tracking-wider text-brand-white hover:bg-brand-white hover:text-brand-navy transition-all duration-200 cursor-default select-none"
            >
              {label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
