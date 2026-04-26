export const dynamic = "force-dynamic";

import { Metadata } from "next";
import { db } from "@/lib/db";
import AdminShell from "@/components/admin/AdminShell";
import { formatPrice } from "@/lib/utils";
import { Package, ShoppingBag, Users, DollarSign } from "lucide-react";

export const metadata: Metadata = { title: "Dashboard" };

async function getStats() {
  const [totalOrders, confirmedOrders, totalProducts, totalCustomers] =
    await Promise.all([
      db.order.count(),
      db.order.findMany({ where: { status: "CONFIRMED" } }),
      db.product.count({ where: { isActive: true } }),
      db.customer.count(),
    ]);

  const totalRevenue = (confirmedOrders as Array<{ total: number }>).reduce((s, o) => s + o.total, 0);

  const recentOrders = await db.order.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: { items: { take: 1 } },
  });

  return { totalOrders, totalRevenue, totalProducts, totalCustomers, recentOrders };
}

export default async function AdminDashboard() {
  const stats = await getStats();

  const cards = [
    { icon: ShoppingBag, label: "Total Orders", value: stats.totalOrders.toString(), color: "bg-brand-blue" },
    { icon: DollarSign, label: "Total Revenue", value: formatPrice(stats.totalRevenue), color: "bg-green-500" },
    { icon: Package, label: "Active Products", value: stats.totalProducts.toString(), color: "bg-brand-navy" },
    { icon: Users, label: "Customers", value: stats.totalCustomers.toString(), color: "bg-purple-600" },
  ];

  return (
    <AdminShell>
      <div className="p-8">
        <h1 className="font-heading font-bold text-2xl text-brand-navy mb-6">
          Dashboard
        </h1>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {cards.map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="bg-white border border-brand-contrast/10 p-5 shadow-sm">
              <div className={`${color} w-9 h-9 flex items-center justify-center mb-3`}>
                <Icon size={18} className="text-white" />
              </div>
              <p className="text-xs font-heading font-bold uppercase tracking-widest text-brand-contrast">
                {label}
              </p>
              <p className="font-heading font-bold text-2xl text-brand-navy mt-1">
                {value}
              </p>
            </div>
          ))}
        </div>

        {/* Recent orders */}
        <div className="bg-white border border-brand-contrast/10 shadow-sm">
          <div className="px-6 py-4 border-b border-brand-contrast/10">
            <h2 className="font-heading font-bold text-sm uppercase tracking-widest text-brand-navy">
              Recent Orders
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-body">
              <thead>
                <tr className="border-b border-brand-contrast/10 bg-[#F8F9FC]">
                  {["Order #", "Date", "Items", "Total", "Status"].map((h) => (
                    <th
                      key={h}
                      className="px-6 py-3 text-left text-xs font-heading font-bold uppercase tracking-wider text-brand-contrast"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-contrast/10">
                {stats.recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-[#F8F9FC] transition-colors">
                    <td className="px-6 py-3 font-bold text-brand-navy">
                      {order.orderNumber}
                    </td>
                    <td className="px-6 py-3 text-brand-contrast">
                      {new Date(order.createdAt).toLocaleDateString("en-AU")}
                    </td>
                    <td className="px-6 py-3 text-brand-contrast">
                      {order.items[0]?.name}{order.items.length > 1 ? ` +${order.items.length - 1}` : ""}
                    </td>
                    <td className="px-6 py-3 font-bold text-brand-navy">
                      {formatPrice(order.total)}
                    </td>
                    <td className="px-6 py-3">
                      <span className={`px-2 py-0.5 text-[10px] font-heading font-bold uppercase tracking-wider ${
                        order.status === "CONFIRMED" ? "bg-green-100 text-green-700" :
                        order.status === "SHIPPED" ? "bg-blue-100 text-blue-700" :
                        order.status === "PENDING" ? "bg-yellow-100 text-yellow-700" :
                        "bg-gray-100 text-gray-700"
                      }`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {stats.recentOrders.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-brand-contrast">
                      No orders yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
