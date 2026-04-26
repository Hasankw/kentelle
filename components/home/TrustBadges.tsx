const badges = [
  { icon: "🌿", label: "100% Vegan" },
  { icon: "🐰", label: "Cruelty-Free" },
  { icon: "🧪", label: "Dermatologist Tested" },
  { icon: "🇦🇺", label: "Made in Australia" },
  { icon: "♻️", label: "Sustainable Packaging" },
];

export default function TrustBadges() {
  return (
    <section className="border-y border-brand-contrast/20 bg-brand-bg">
      <div className="max-w-7xl mx-auto px-4 py-5">
        <ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          {badges.map((b) => (
            <li
              key={b.label}
              className="flex items-center gap-2 text-xs font-heading font-bold uppercase tracking-widest text-brand-navy"
            >
              <span className="text-base">{b.icon}</span>
              {b.label}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
