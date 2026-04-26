export const dynamic = "force-dynamic";

import { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import AdminShell from "@/components/admin/AdminShell";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = { title: "Orders" };

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  CONFIRMED: "bg-green-100 text-green-700",
  PROCESSING: "bg-blue-100 text-blue-700",
  SHIPPED: "bg-indigo-100 text-indigo-700",
  DELIVERED: "bg-emerald-100 text-emerald-700",
  CANCELLED: "bg-red-100 text-red-700",
  REFUNDED: "bg-gray-100 text-gray-600",
};

export default async function AdminOrdersPage() {
  const orders = await db.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { items: { take: 1 } },
  });

  return (
    <AdminShell>
      <div className="p-8">
        <h1 className="font-heading font-bold text-2xl text-brand-navy mb-6">
          Orders ({orders.length})
        </h1>

        <div className="bg-white border border-brand-contrast/10 shadow-sm overflow-x-auto">
          <table className="w-full text-sm font-body">
            <thead>
              <tr className="border-b border-brand-contrast/10 bg-[#F8F9FC]">
                {["Order #", "Date", "Customer", "Items", "Total", "Status", ""].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-heading font-bold uppercase tracking-wider text-brand-contrast whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-contrast/10">
              {orders.map((order) => {
                const address = order.shippingAddress as { fullName?: string };
                return (
                  <tr key={order.id} className="hover:bg-[#F8F9FC] transition-colors">
                    <td className="px-5 py-3 font-bold text-brand-navy">{order.orderNumber}</td>
                    <td className="px-5 py-3 text-brand-contrast whitespace-nowrap">
                      {new Date(order.createdAt).toLocaleDateString("en-AU")}
                    </td>
                    <td className="px-5 py-3 text-brand-navy">
                      {address.fullName ?? order.guestEmail ?? "Guest"}
                    </td>
                    <td className="px-5 py-3 text-brand-contrast">
                      {order.items[0]?.name}
                    </td>
                    <td className="px-5 py-3 font-bold text-brand-navy">
                      {formatPrice(order.total)}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-0.5 text-[10px] font-heading font-bold uppercase tracking-wider ${statusColors[order.status] ?? "bg-gray-100 text-gray-600"}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <Link href={`/admin/orders/${order.id}`} className="text-brand-blue text-xs hover:underline">
                        View
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-brand-contrast">
                    No orders yet.
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
