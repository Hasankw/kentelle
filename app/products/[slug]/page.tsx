import { notFound } from "next/navigation";
import { Metadata } from "next";
import { db } from "@/lib/db";
import Badge from "@/components/ui/Badge";
import Accordion from "@/components/ui/Accordion";
import StarRating from "@/components/ui/StarRating";
import ProductImageGallery from "@/components/store/ProductImageGallery";
import AddToCartSection from "@/components/store/AddToCartSection";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import { formatPrice, calcDiscount } from "@/lib/utils";
import Link from "next/link";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await db.product.findUnique({
    where: { slug, isActive: true },
  });
  if (!product) return { title: "Product Not Found" };
  return {
    title: product.name,
    description: product.description ?? undefined,
  };
}

async function getProduct(slug: string) {
  return db.product.findUnique({
    where: { slug, isActive: true },
    include: { categories: true },
  });
}

async function getRelated(productId: string, categoryIds: string[]) {
  return db.product.findMany({
    where: {
      isActive: true,
      id: { not: productId },
      categories: { some: { id: { in: categoryIds } } },
    },
    take: 4,
    select: {
      id: true,
      name: true,
      slug: true,
      price: true,
      salePrice: true,
      images: true,
      stock: true,
    },
  });
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) notFound();

  const categoryIds = product.categories.map((c) => c.id);
  const related = await getRelated(product.id, categoryIds);

  const discount = product.salePrice
    ? calcDiscount(product.price, product.salePrice)
    : 0;

  const tabs = [
    product.description && {
      title: "Description",
      content: <p className="whitespace-pre-line">{product.description}</p>,
    },
    product.ingredients && {
      title: "Ingredients",
      content: <p className="whitespace-pre-line">{product.ingredients}</p>,
    },
    product.howToUse && {
      title: "How to Use",
      content: <p className="whitespace-pre-line">{product.howToUse}</p>,
    },
    product.routine && {
      title: "Routine",
      content: <p className="whitespace-pre-line">{product.routine}</p>,
    },
    product.cautions && {
      title: "Cautions",
      content: <p className="whitespace-pre-line">{product.cautions}</p>,
    },
  ].filter(Boolean) as { title: string; content: React.ReactNode }[];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs font-body text-brand-contrast mb-6">
        <Link href="/" className="hover:text-brand-navy transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-brand-navy transition-colors">
          Shop
        </Link>
        {product.categories[0] && (
          <>
            <span>/</span>
            <Link
              href={`/collections/${product.categories[0].slug}`}
              className="hover:text-brand-navy transition-colors"
            >
              {product.categories[0].name}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-brand-navy">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
        {/* Left: Images */}
        <ProductImageGallery images={product.images} name={product.name} />

        {/* Right: Details */}
        <div>
          {/* Categories */}
          {product.categories.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {product.categories.map((c) => (
                <Link key={c.id} href={`/collections/${c.slug}`}>
                  <Badge variant="default" className="text-[10px]">
                    {c.name}
                  </Badge>
                </Link>
              ))}
            </div>
          )}

          <h1 className="font-heading font-bold text-3xl md:text-4xl text-brand-navy leading-tight mb-2">
            {product.name}
          </h1>

          {/* Rating placeholder */}
          <div className="flex items-center gap-2 mb-4">
            <StarRating rating={5} />
            <span className="text-xs text-brand-contrast font-body">
              (4.9) · 124 reviews
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-3 mb-6">
            {product.salePrice ? (
              <>
                <span className="font-heading font-bold text-2xl text-brand-blue">
                  {formatPrice(product.salePrice)}
                </span>
                <span className="font-body text-sm text-brand-contrast line-through">
                  {formatPrice(product.price)}
                </span>
                {discount > 0 && <Badge variant="sale">-{discount}%</Badge>}
              </>
            ) : (
              <span className="font-heading font-bold text-2xl text-brand-navy">
                {formatPrice(product.price)}
              </span>
            )}
          </div>

          {/* Short description */}
          {product.description && (
            <p className="font-body text-sm text-brand-navy/80 leading-relaxed mb-6">
              {product.description.slice(0, 200)}
              {product.description.length > 200 ? "…" : ""}
            </p>
          )}

          {/* Add to cart */}
          <AddToCartSection product={product} />

          {/* Trust mini badges */}
          <div className="flex flex-wrap gap-4 mt-6 pt-6 border-t border-brand-contrast/20">
            {["Cruelty-Free", "Vegan", "Australian Made"].map((b) => (
              <span
                key={b}
                className="text-xs font-heading font-bold text-brand-contrast uppercase tracking-wider"
              >
                ✓ {b}
              </span>
            ))}
          </div>

          {/* Accordion tabs */}
          {tabs.length > 0 && (
            <div className="mt-8">
              <Accordion items={tabs} />
            </div>
          )}
        </div>
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <div className="mt-20">
          <FeaturedProducts
            products={related}
            title="You May Also Like"
            subtitle=""
            viewAllHref="/shop"
          />
        </div>
      )}
    </div>
  );
}
