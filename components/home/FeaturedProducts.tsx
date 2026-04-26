import Link from "next/link";
import ProductCard from "@/components/store/ProductCard";
import Button from "@/components/ui/Button";
import type { Product } from "@/types";

interface FeaturedProductsProps {
  products: Pick<
    Product,
    "id" | "name" | "slug" | "price" | "salePrice" | "images" | "stock"
  >[];
  title?: string;
  subtitle?: string;
  viewAllHref?: string;
}

export default function FeaturedProducts({
  products,
  title = "Bestsellers",
  subtitle = "The products everyone's talking about",
  viewAllHref = "/shop",
}: FeaturedProductsProps) {
  return (
    <section className="py-16 px-4 max-w-7xl mx-auto">
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-xs font-heading font-bold tracking-widest uppercase text-brand-blue mb-2">
            Customer Favourites
          </p>
          <h2 className="font-heading font-bold text-3xl md:text-4xl text-brand-navy">
            {title}
          </h2>
          <p className="font-body text-sm text-brand-contrast mt-2">{subtitle}</p>
        </div>
        <Link href={viewAllHref} className="hidden md:block">
          <Button variant="outline" size="sm">
            View All
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>

      <div className="mt-8 text-center md:hidden">
        <Link href={viewAllHref}>
          <Button variant="outline" size="sm">
            View All Products
          </Button>
        </Link>
      </div>
    </section>
  );
}
