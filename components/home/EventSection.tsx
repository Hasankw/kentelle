import ProductCard from "@/components/store/ProductCard";
import type { Product } from "@/types";

interface EventSectionProps {
  title: string;
  subtitle?: string | null;
  products: Pick<Product, "id" | "name" | "slug" | "price" | "salePrice" | "images" | "stock">[];
}

export default function EventSection({ title, subtitle, products }: EventSectionProps) {
  if (!products.length) return null;

  return (
    <section className="py-16 px-4" style={{ background: "linear-gradient(180deg, #F5EEF3 0%, #FAF8F7 100%)" }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="h-px w-12 bg-brand-accent/60" />
            <span className="text-[10px] font-heading font-bold uppercase tracking-[4px] text-brand-accent">Featured Event</span>
            <span className="h-px w-12 bg-brand-accent/60" />
          </div>
          <h2 className="font-heading font-bold text-3xl md:text-4xl text-brand-navy">{title}</h2>
          {subtitle && (
            <p className="font-body text-sm text-brand-contrast mt-2 max-w-md">{subtitle}</p>
          )}
        </div>

        {/* Products */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
