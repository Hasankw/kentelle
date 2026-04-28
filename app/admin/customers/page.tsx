export const dynamic = "force-dynamic";

import { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import AdminShell from "@/components/admin/AdminShell";

export const metadata: Metadata = { title: "Customers" };

export default async function AdminCustomersPage() {
  const customers = await db.customer.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { orders: true } } },
  });

  return (
    <AdminShell>
      <div className="p-8">
        <h1 className="font-heading font-bold text-2xl text-brand-navy mb-6">
          Customers ({customers.length})
        </h1>

        <div className="bg-white border border-brand-contrast/10 shadow-sm overflow-x-auto">
          <table className="w-full text-sm font-body">
            <thead>
              <tr className="border-b border-brand-contrast/10 bg-[#F8F9FC]">
                {["Name", "Email", "Phone", "Orders", "Joined", ""].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-heading font-bold uppercase tracking-wider text-brand-contrast whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-contrast/10">
              {customers.map((c) => (
                <tr key={c.id} className="hover:bg-[#F8F9FC] transition-colors">
                  <td className="px-5 py-3 font-bold text-brand-navy">{c.name}</td>
                  <td className="px-5 py-3 text-brand-contrast">{c.email}</td>
                  <td className="px-5 py-3 text-brand-contrast">{c.phone ?? "—"}</td>
                  <td className="px-5 py-3 text-brand-contrast">{c._count.orders}</td>
                  <td className="px-5 py-3 text-brand-contrast whitespace-nowrap">
                    {new Date(c.createdAt).toLocaleDateString("en-AU")}
                  </td>
                  <td className="px-5 py-3">
                    <Link
                      href={`/admin/customers/${c.id}`}
                      className="text-xs font-heading font-bold uppercase tracking-wider text-brand-blue hover:underline"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
              {customers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-brand-contrast">
                    No customers yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  );
}
