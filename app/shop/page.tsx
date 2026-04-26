export const dynamic = "force-dynamic";

import { Metadata } from "next";
import { db } from "@/lib/db";
import ProductCard from "@/components/store/ProductCard";
import ShopFilters from "@/components/store/ShopFilters";
import type { SortOption } from "@/types";

export const metadata: Metadata = {
  title: "Shop All Products",
  description: "Browse Kentelle's complete range of skincare products.",
};

interface PageProps {
  searchParams: Promise<{
    sort?: string;
    category?: string;
    min?: string;
    max?: string;
    page?: string;
  }>;
}

const PAGE_SIZE = 16;

async function getProducts(params: Awaited<PageProps["searchParams"]>) {
  const sort = (params.sort as SortOption) ?? "featured";
  const page = Math.max(1, parseInt(params.page ?? "1"));
  const skip = (page - 1) * PAGE_SIZE;

  const orderBy = {
    featured: { createdAt: "desc" as const },
    newest: { createdAt: "desc" as const },
    oldest: { createdAt: "asc" as const },
    price_asc: { price: "asc" as const },
    price_desc: { price: "desc" as const },
    alpha_asc: { name: "asc" as const },
    alpha_desc: { name: "desc" as const },
    best_selling: { createdAt: "desc" as const },
  }[sort] ?? { createdAt: "desc" as const };

  const where = {
    isActive: true,
    ...(params.category && {
      categories: { some: { slug: params.category } },
    }),
    ...(params.min || params.max
      ? {
          price: {
            ...(params.min ? { gte: parseFloat(params.min) } : {}),
            ...(params.max ? { lte: parseFloat(params.max) } : {}),
          },
        }
      : {}),
  };

  const [products, total] = await Promise.all([
    db.product.findMany({
      where,
      orderBy,
      take: PAGE_SIZE,
      skip,
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        salePrice: true,
        images: true,
        stock: true,
      },
    }),
    db.product.count({ where }),
  ]);

  return { products, total, page, totalPages: Math.ceil(total / PAGE_SIZE) };
}

async function getCategories() {
  return db.category.findMany({ orderBy: { sortOrder: "asc" } });
}

export default async function ShopPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const [{ products, total, page, totalPages }, categories] = await Promise.all(
    [getProducts(params), getCategories()]
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-10">
        <h1 className="font-heading font-bold text-4xl text-brand-navy">
          Shop All Products
        </h1>
        <p className="text-brand-contrast font-body text-sm mt-2">
          {total} product{total !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Filters sidebar */}
        <aside className="md:w-56 shrink-0">
          <ShopFilters categories={categories} />
        </aside>

        {/* Products grid */}
        <div className="flex-1">
          {products.length === 0 ? (
            <div className="text-center py-20 text-brand-contrast font-body">
              No products found.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-12">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (p) => (
                      <a
                        key={p}
                        href={`/shop?page=${p}&sort=${params.sort ?? ""}&category=${params.category ?? ""}`}
                        className={`w-9 h-9 flex items-center justify-center text-xs font-heading font-bold border transition-colors ${
                          p === page
                            ? "bg-brand-accent text-brand-navy border-brand-accent"
                            : "border-brand-contrast/30 text-brand-navy hover:border-brand-navy"
                        }`}
                      >
                        {p}
                      </a>
                    )
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
