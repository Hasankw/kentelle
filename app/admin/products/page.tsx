export const dynamic = "force-dynamic";

import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Plus, Pencil } from "lucide-react";
import { db } from "@/lib/db";
import AdminShell from "@/components/admin/AdminShell";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = { title: "Products" };

type ProductRow = { id: string; name: string; slug: string; price: number; salePrice: number | null; stock: number; isActive: boolean; images: string[]; categories: Array<{ name: string }> };

export default async function AdminProductsPage() {
  const products = (await db.product.findMany({
    orderBy: { createdAt: "desc" },
  })) as ProductRow[];

  return (
    <AdminShell>
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-heading font-bold text-2xl text-brand-navy">
            Products ({products.length})
          </h1>
          <Link
            href="/admin/products/new"
            className="flex items-center gap-2 bg-brand-accent text-brand-navy px-4 py-2.5 text-xs font-heading font-bold uppercase tracking-widest hover:bg-brand-accent/85 transition-colors"
          >
            <Plus size={14} />
            Add Product
          </Link>
        </div>

        <div className="bg-white border border-brand-contrast/10 shadow-sm overflow-x-auto">
          <table className="w-full text-sm font-body">
            <thead>
              <tr className="border-b border-brand-contrast/10 bg-[#F8F9FC]">
                {["Image", "Name", "Category", "Price", "Stock", "Status", ""].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-heading font-bold uppercase tracking-wider text-brand-contrast whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-contrast/10">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-[#F8F9FC] transition-colors">
                  <td className="px-5 py-3">
                    <div className="relative w-10 h-10 bg-brand-contrast/10">
                      {p.images[0] && (
                        <Image src={p.images[0]} alt={p.name} fill className="object-cover" sizes="40px" />
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3 font-bold text-brand-navy max-w-[200px] truncate">
                    {p.name}
                  </td>
                  <td className="px-5 py-3 text-brand-contrast">
                    {p.categories.map((c) => c.name).join(", ") || "—"}
                  </td>
                  <td className="px-5 py-3 text-brand-navy">
                    {p.salePrice ? (
                      <span>
                        <span className="text-brand-blue font-bold">{formatPrice(p.salePrice)}</span>
                        <span className="text-brand-contrast line-through ml-1 text-xs">{formatPrice(p.price)}</span>
                      </span>
                    ) : (
                      formatPrice(p.price)
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`font-bold ${p.stock === 0 ? "text-red-500" : p.stock < 5 ? "text-yellow-600" : "text-green-600"}`}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 text-[10px] font-heading font-bold uppercase tracking-wider ${
                      p.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                    }`}>
                      {p.isActive ? "Active" : "Draft"}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <Link href={`/admin/products/${p.id}`} className="text-brand-blue hover:text-brand-navy transition-colors">
                      <Pencil size={15} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  );
}
