"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";
import type { Category, SortOption } from "@/types";

const sortOptions: { label: string; value: SortOption }[] = [
  { label: "Featured", value: "featured" },
  { label: "Newest", value: "newest" },
  { label: "Price: Low → High", value: "price_asc" },
  { label: "Price: High → Low", value: "price_desc" },
  { label: "A → Z", value: "alpha_asc" },
  { label: "Z → A", value: "alpha_desc" },
];

interface ShopFiltersProps {
  categories: Pick<Category, "id" | "name" | "slug">[];
}

export default function ShopFilters({ categories }: ShopFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(key, value);
      else params.delete(key);
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  const currentSort = searchParams.get("sort") ?? "featured";
  const currentCategory = searchParams.get("category") ?? "";

  const selectClass =
    "w-full appearance-none bg-white border border-brand-contrast/20 rounded text-sm font-body text-brand-navy px-3 py-2.5 pr-8 focus:outline-none focus:border-brand-blue transition-colors cursor-pointer";

  return (
    <>
      {/* ── Mobile: horizontal dropdowns ── */}
      <div className="flex gap-3 md:hidden">
        {/* Category dropdown */}
        {categories.length > 0 && (
          <div className="flex-1 relative">
            <select
              value={currentCategory}
              onChange={(e) => updateParam("category", e.target.value)}
              className={selectClass}
              aria-label="Filter by category"
            >
              <option value="">All Products</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-brand-navy/50 text-xs">▾</span>
          </div>
        )}

        {/* Sort dropdown */}
        <div className="flex-1 relative">
          <select
            value={currentSort}
            onChange={(e) => updateParam("sort", e.target.value)}
            className={selectClass}
            aria-label="Sort products"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-brand-navy/50 text-xs">▾</span>
        </div>
      </div>

      {/* ── Desktop: sidebar list ── */}
      <div className="hidden md:block space-y-6">
        {/* Sort */}
        <div>
          <h3 className="font-heading font-bold text-xs tracking-widest uppercase text-brand-navy mb-3">
            Sort By
          </h3>
          <ul className="space-y-1.5">
            {sortOptions.map((opt) => (
              <li key={opt.value}>
                <button
                  onClick={() => updateParam("sort", opt.value)}
                  className={`text-sm font-body w-full text-left transition-colors ${
                    currentSort === opt.value
                      ? "text-brand-blue font-bold"
                      : "text-brand-navy/70 hover:text-brand-navy"
                  }`}
                >
                  {opt.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Categories */}
        {categories.length > 0 && (
          <div>
            <h3 className="font-heading font-bold text-xs tracking-widest uppercase text-brand-navy mb-3">
              Category
            </h3>
            <ul className="space-y-1.5">
              <li>
                <button
                  onClick={() => updateParam("category", "")}
                  className={`text-sm font-body transition-colors ${
                    !currentCategory
                      ? "text-brand-blue font-bold"
                      : "text-brand-navy/70 hover:text-brand-navy"
                  }`}
                >
                  All Products
                </button>
              </li>
              {categories.map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => updateParam("category", cat.slug)}
                    className={`text-sm font-body transition-colors ${
                      currentCategory === cat.slug
                        ? "text-brand-blue font-bold"
                        : "text-brand-navy/70 hover:text-brand-navy"
                    }`}
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </>
  );
}
