export const dynamic = "force-dynamic";

import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { db } from "@/lib/db";
import AdminShell from "@/components/admin/AdminShell";
import ProductForm from "@/components/admin/ProductForm";

export const metadata: Metadata = { title: "New Product" };

export default async function AdminProductNewPage() {
  const categories = await db.category.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <AdminShell>
      <div className="p-8">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/admin/products" className="text-brand-contrast hover:text-brand-navy transition-colors">
            <ArrowLeft size={18} />
          </Link>
          <h1 className="font-heading font-bold text-2xl text-brand-navy">
            New Product
          </h1>
        </div>
        <div className="bg-white border border-brand-contrast/10 shadow-sm p-6">
          <ProductForm categories={categories} />
        </div>
      </div>
    </AdminShell>
  );
}
