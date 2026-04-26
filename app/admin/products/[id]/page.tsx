export const dynamic = "force-dynamic";

import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import AdminShell from "@/components/admin/AdminShell";
import ProductForm from "@/components/admin/ProductForm";

export const metadata: Metadata = { title: "Edit Product" };

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminProductEditPage({ params }: PageProps) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    db.product.findUnique({
      where: { id },
      include: { categories: { select: { id: true } } },
    }),
    db.category.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  if (!product) notFound();

  return (
    <AdminShell>
      <div className="p-8">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/admin/products" className="text-brand-contrast hover:text-brand-navy transition-colors">
            <ArrowLeft size={18} />
          </Link>
          <h1 className="font-heading font-bold text-2xl text-brand-navy">
            Edit Product
          </h1>
        </div>
        <div className="bg-white border border-brand-contrast/10 shadow-sm p-6">
          <ProductForm
            categories={categories}
            product={{
              id: product.id,
              name: product.name,
              slug: product.slug,
              description: product.description ?? "",
              ingredients: product.ingredients ?? "",
              howToUse: product.howToUse ?? "",
              routine: product.routine ?? "",
              cautions: product.cautions ?? "",
              price: String(product.price),
              salePrice: product.salePrice ? String(product.salePrice) : "",
              stock: String(product.stock),
              isActive: product.isActive,
              images: product.images,
              categoryIds: product.categories.map((c) => c.id),
            }}
          />
        </div>
      </div>
    </AdminShell>
  );
}
