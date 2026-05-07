import Link from "next/link";
import Image from "next/image";

type EventCard = {
  id: string;
  title: string;
  subtitle?: string | null;
  image?: string | null;
};

export default function EventCollectionGrid({
  events,
  sectionTitle,
}: {
  events: EventCard[];
  sectionTitle: string;
}) {
  if (!events.length) return null;

  return (
    <section className="py-16 px-4 max-w-7xl mx-auto">
      <div className="text-center mb-10">
        <p className="text-xs font-heading font-bold tracking-widest uppercase text-brand-blue mb-2">
          Limited Time
        </p>
        <h2 className="font-heading font-bold text-3xl md:text-4xl text-brand-navy">
          {sectionTitle}
        </h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
        {events.map((event) => (
          <Link
            key={event.id}
            href={`/events/${event.id}`}
            className="group relative aspect-[4/5] overflow-hidden bg-brand-navy"
          >
            {event.image ? (
              <Image
                src={event.image}
                alt={event.title}
                fill
                className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
                sizes="(max-width: 768px) 50vw, 33vw"
                unoptimized
              />
            ) : (
              <div
                className="absolute inset-0"
                style={{ background: "linear-gradient(135deg, #D4A5B5 0%, #B5C9C5 100%)" }}
              />
            )}

            <div
              className="absolute inset-0"
              style={{ background: "rgba(20,10,0,0.20)", mixBlendMode: "multiply" }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#3A3240]/90 via-[#3A3240]/20 to-transparent" />

            <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5">
              <h3 className="font-heading font-bold text-sm md:text-base text-white uppercase tracking-wider">
                {event.title}
              </h3>
              {event.subtitle && (
                <p className="text-xs text-white/65 font-body mt-0.5 hidden md:block">
                  {event.subtitle}
                </p>
              )}
              <span className="inline-block mt-2 text-[11px] font-heading font-bold tracking-widest uppercase text-white border-b border-white/40 pb-0.5 group-hover:border-white group-hover:opacity-80 transition-all">
                Shop Now →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
