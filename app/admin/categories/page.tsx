export const dynamic = "force-dynamic";

import { Metadata } from "next";
import { db } from "@/lib/db";
import AdminShell from "@/components/admin/AdminShell";

export const metadata: Metadata = { title: "Categories" };

export default async function AdminCategoriesPage() {
  const categories = await db.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: true } } },
  });

  return (
    <AdminShell>
      <div className="p-8">
        <h1 className="font-heading font-bold text-2xl text-brand-navy mb-6">
          Categories ({categories.length})
        </h1>

        <div className="bg-white border border-brand-contrast/10 shadow-sm overflow-x-auto">
          <table className="w-full text-sm font-body">
            <thead>
              <tr className="border-b border-brand-contrast/10 bg-[#F8F9FC]">
                {["Name", "Slug", "Tagline", "Products", "Sort"].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-heading font-bold uppercase tracking-wider text-brand-contrast">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-contrast/10">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-[#F8F9FC] transition-colors">
                  <td className="px-5 py-3 font-bold text-brand-navy">{cat.name}</td>
                  <td className="px-5 py-3 text-brand-contrast font-mono text-xs">{cat.slug}</td>
                  <td className="px-5 py-3 text-brand-contrast">{cat.tagline ?? "—"}</td>
                  <td className="px-5 py-3 text-brand-contrast">{cat._count.products}</td>
                  <td className="px-5 py-3 text-brand-contrast">{cat.sortOrder}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  );
}
