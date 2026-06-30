export const dynamic = "force-dynamic";

import { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import ProductCard from "@/components/store/ProductCard";
import ShopFilters from "@/components/store/ShopFilters";
import type { SortOption } from "@/types";

export const metadata: Metadata = {
  title: "Shop All Skincare Products",
  description: "Browse Kentelle's complete range of professional-grade Australian skincare — cleansers, serums, moisturisers, eye creams and more. Free shipping on orders over $80.",
  robots: { index: true, follow: true },
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
const PRO_CATEGORY_SLUG = "professional-use";

async function getProAccess(): Promise<boolean> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    const customer = await db.customer.findUnique({
      where: { supabaseUid: user.id },
      select: { proStatus: true },
    });
    return customer?.proStatus === "approved";
  } catch {
    return false;
  }
}

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
        description: true,
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
  const isProfessionalCategory = params.category === PRO_CATEGORY_SLUG;

  const [{ products, total, page, totalPages }, categories, isProApproved] = await Promise.all([
    getProducts(params),
    getCategories(),
    isProfessionalCategory ? getProAccess() : Promise.resolve(true),
  ]);

  const proBlocked = isProfessionalCategory && !isProApproved;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

      {/* Professional Range Banner */}
      {isProfessionalCategory && (
        <div className="mb-10 border border-brand-navy/20 bg-brand-navy text-white rounded-sm overflow-hidden">
          <div className="px-6 py-5 md:px-8 md:py-6">
            <p className="text-[10px] font-heading font-bold tracking-[0.3em] uppercase text-brand-accent mb-2">
              Restricted Access
            </p>
            <h2 className="font-heading font-bold text-xl md:text-2xl mb-3">
              KENTELLE Professional &amp; Clinical Range
            </h2>
            <p className="font-body text-sm text-white/80 leading-relaxed mb-4 max-w-3xl">
              Welcome to the KENTELLE professional backbar. Our clinical-grade formulations feature advanced active delivery systems designed strictly for trained practitioners.
            </p>
            <p className="font-body text-sm text-white/80 leading-relaxed mb-5 max-w-3xl">
              <span className="font-bold text-white">Access Requirements:</span> To purchase from this range, clients must hold verified professional qualifications (Dermal Therapy, aesthetics, or beauty therapy etc.).
            </p>
            {!isProApproved && (
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/login?redirect=/shop?category=professional-use"
                  className="inline-flex items-center px-6 py-2.5 bg-brand-accent text-brand-navy rounded text-xs font-heading font-bold tracking-widest uppercase hover:bg-brand-accent/85 transition-colors"
                >
                  Log In Here
                </Link>
                <Link
                  href="/pro-register"
                  className="inline-flex items-center px-6 py-2.5 border border-white/40 text-white rounded text-xs font-heading font-bold tracking-widest uppercase hover:bg-white/10 transition-colors"
                >
                  Apply for Pro Access
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="text-center mb-10">
        <h1 className="font-heading font-bold text-4xl text-brand-navy">
          {isProfessionalCategory ? "Professional & Clinical Range" : "Shop All Products"}
        </h1>
        <p className="text-brand-contrast font-body text-sm mt-2">
          {total} product{total !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="flex flex-col gap-2 md:flex-row md:gap-8">
        <aside className="md:w-56 shrink-0">
          <ShopFilters categories={categories} />
        </aside>

        <div className="flex-1">
          {products.length === 0 ? (
            <div className="text-center py-20 text-brand-contrast font-body">
              No products found.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} proBlocked={proBlocked} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-12">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <a
                      key={p}
                      href={`/shop?page=${p}&sort=${params.sort ?? ""}&category=${params.category ?? ""}`}
                      className={`w-9 h-9 flex items-center justify-center text-xs font-heading font-bold border transition-colors ${
                        p === page
                          ? "bg-brand-accent text-brand-navy rounded border-brand-accent"
                          : "border-brand-contrast/30 text-brand-navy hover:border-brand-navy"
                      }`}
                    >
                      {p}
                    </a>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
