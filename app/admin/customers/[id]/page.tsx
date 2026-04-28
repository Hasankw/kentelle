export const dynamic = "force-dynamic";

import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { db } from "@/lib/db";
import AdminShell from "@/components/admin/AdminShell";
import CustomerEditForm from "@/components/admin/CustomerEditForm";

export const metadata: Metadata = { title: "Edit Customer" };

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminCustomerEditPage({ params }: PageProps) {
  const { id } = await params;
  const customer = await db.customer.findUnique({ where: { id }, include: { orders: true } }) as any;
  if (!customer) notFound();

  return (
    <AdminShell>
      <div className="p-8 max-w-2xl">
        <Link
          href="/admin/customers"
          className="inline-flex items-center gap-2 text-xs font-heading font-bold uppercase tracking-widest text-brand-contrast hover:text-brand-navy mb-6"
        >
          <ArrowLeft size={14} /> Back to Customers
        </Link>

        <h1 className="font-heading font-bold text-2xl text-brand-navy mb-6">
          Edit Customer
        </h1>

        <CustomerEditForm customer={customer} />

        {/* Order history */}
        {customer.orders?.length > 0 && (
          <div className="mt-8">
            <h2 className="font-heading font-bold text-sm uppercase tracking-widest text-brand-navy mb-3">
              Order History
            </h2>
            <div className="bg-white border border-brand-contrast/10 overflow-hidden">
              <table className="w-full text-sm font-body">
                <thead>
                  <tr className="border-b border-brand-contrast/10 bg-[#F8F9FC]">
                    {["Order #", "Date", "Total", "Status"].map((h) => (
                      <th key={h} className="px-4 py-2 text-left text-xs font-heading font-bold uppercase tracking-wider text-brand-contrast">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-contrast/10">
                  {customer.orders.map((o: any) => (
                    <tr key={o.id} className="hover:bg-[#F8F9FC]">
                      <td className="px-4 py-2 font-bold text-brand-navy">
                        <Link href={`/admin/orders/${o.id}`} className="hover:underline">{o.orderNumber}</Link>
                      </td>
                      <td className="px-4 py-2 text-brand-contrast">{new Date(o.createdAt).toLocaleDateString("en-AU")}</td>
                      <td className="px-4 py-2 text-brand-contrast">${(o.total / 100).toFixed(2)}</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-0.5 text-[10px] font-heading font-bold uppercase ${
                          o.status === "CONFIRMED" ? "bg-green-100 text-green-700" :
                          o.status === "SHIPPED" ? "bg-blue-100 text-blue-700" :
                          "bg-yellow-100 text-yellow-700"
                        }`}>
                          {o.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
