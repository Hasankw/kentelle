import { notFound } from "next/navigation";
import { Metadata } from "next";
import { db } from "@/lib/db";
import ProductCard from "@/components/store/ProductCard";
import Image from "next/image";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const cat = await db.category.findUnique({ where: { slug } });
  if (!cat) return { title: "Collection Not Found" };
  return {
    title: cat.name,
    description: cat.description ?? undefined,
  };
}

export default async function CollectionPage({ params }: PageProps) {
  const { slug } = await params;

  const category = await db.category.findUnique({
    where: { slug },
    include: {
      products: {
        where: { isActive: true },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          slug: true,
          price: true,
          salePrice: true,
          images: true,
          stock: true,
        },
      },
    },
  });

  if (!category) notFound();

  return (
    <div>
      {/* Collection hero */}
      <div className="relative h-64 md:h-80 bg-brand-navy overflow-hidden">
        {category.image && (
          <Image
            src={category.image}
            alt={category.name}
            fill
            className="object-cover opacity-40"
            priority
            sizes="100vw"
          />
        )}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          {category.tagline && (
            <p className="text-xs font-heading font-bold tracking-widest uppercase text-brand-blue mb-2">
              {category.tagline}
            </p>
          )}
          <h1 className="font-heading font-bold text-4xl md:text-5xl text-brand-white">
            {category.name}
          </h1>
          {category.description && (
            <p className="font-body text-sm text-brand-white/70 max-w-md mt-3">
              {category.description}
            </p>
          )}
        </div>
      </div>

      {/* Products */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <p className="text-sm text-brand-contrast font-body mb-8">
          {category.products.length} product
          {category.products.length !== 1 ? "s" : ""}
        </p>

        {category.products.length === 0 ? (
          <div className="text-center py-20 text-brand-contrast font-body">
            No products in this collection yet.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {category.products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
