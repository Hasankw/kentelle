export const dynamic = "force-dynamic";

import { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import AdminShell from "@/components/admin/AdminShell";

export const metadata: Metadata = { title: "Customers" };

const STATUS_STYLES: Record<string, string> = {
  approved: "bg-green-100 text-green-700",
  pending:  "bg-yellow-100 text-yellow-700",
  retail:   "bg-brand-contrast/10 text-brand-contrast",
};

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const { filter } = await searchParams;

  const customers = await db.customer.findMany({
    where: filter === "pending" ? { proStatus: "pending" } : undefined,
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { orders: true } } },
  });

  const pendingCount = await db.customer.count({ where: { proStatus: "pending" } });

  return (
    <AdminShell>
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-heading font-bold text-2xl text-brand-navy">
            Customers ({customers.length})
          </h1>
          <div className="flex gap-2">
            <Link
              href="/admin/customers"
              className={`px-4 py-2 text-xs font-heading font-bold uppercase tracking-wider rounded transition-colors ${
                !filter
                  ? "bg-brand-navy text-white"
                  : "border border-brand-contrast/20 text-brand-contrast hover:text-brand-navy"
              }`}
            >
              All
            </Link>
            <Link
              href="/admin/customers?filter=pending"
              className={`px-4 py-2 text-xs font-heading font-bold uppercase tracking-wider rounded transition-colors flex items-center gap-2 ${
                filter === "pending"
                  ? "bg-yellow-500 text-white"
                  : "border border-brand-contrast/20 text-brand-contrast hover:text-brand-navy"
              }`}
            >
              Pending Pro
              {pendingCount > 0 && (
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold">
                  {pendingCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        <div className="bg-white border border-brand-contrast/10 shadow-sm overflow-x-auto">
          <table className="w-full text-sm font-body">
            <thead>
              <tr className="border-b border-brand-contrast/10 bg-[#F8F9FC]">
                {["Name", "Email", "Phone", "Pro Status", "Orders", "Joined", ""].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-heading font-bold uppercase tracking-wider text-brand-contrast whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-contrast/10">
              {customers.map((c) => {
                const status = c.proStatus ?? "retail";
                return (
                  <tr key={c.id} className="hover:bg-[#F8F9FC] transition-colors">
                    <td className="px-5 py-3 font-bold text-brand-navy">{c.name}</td>
                    <td className="px-5 py-3 text-brand-contrast">{c.email}</td>
                    <td className="px-5 py-3 text-brand-contrast">{c.phone ?? "—"}</td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-0.5 text-[10px] font-heading font-bold uppercase tracking-wide rounded ${STATUS_STYLES[status] ?? STATUS_STYLES.retail}`}>
                        {status}
                      </span>
                    </td>
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
                );
              })}
              {customers.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-brand-contrast">
                    No customers found.
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
