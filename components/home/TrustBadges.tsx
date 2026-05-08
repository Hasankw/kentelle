interface Badge { id: string; icon: string; label: string; enabled: boolean; }

const DEFAULTS: Badge[] = [
  { id: "1", icon: "🌿", label: "100% Vegan", enabled: true },
  { id: "2", icon: "🐰", label: "Cruelty-Free", enabled: true },
  { id: "3", icon: "🧪", label: "Dermatologist Tested", enabled: true },
  { id: "4", icon: "🇦🇺", label: "Made in Australia", enabled: true },
  { id: "5", icon: "♻️", label: "Sustainable Packaging", enabled: true },
];

export default function TrustBadges({ initialBadges }: { initialBadges?: Badge[] }) {
  const badges = (initialBadges ?? DEFAULTS).filter((b) => b.enabled);

  if (!badges.length) return null;

  return (
    <section className="border-y border-brand-contrast/20 bg-brand-bg">
      <div className="max-w-7xl mx-auto px-4 py-5">
        <ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          {badges.map((b) => (
            <li
              key={b.id}
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
