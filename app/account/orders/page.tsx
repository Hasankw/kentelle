export const dynamic = "force-dynamic";

import { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = { title: "My Orders" };

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  CONFIRMED: "bg-green-100 text-green-700",
  PROCESSING: "bg-blue-100 text-blue-700",
  SHIPPED: "bg-indigo-100 text-indigo-700",
  DELIVERED: "bg-emerald-100 text-emerald-700",
  CANCELLED: "bg-red-100 text-red-700",
  REFUNDED: "bg-gray-100 text-gray-600",
};

export default async function AccountOrdersPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const customer = await db.customer.findUnique({
    where: { supabaseUid: user.id },
    include: {
      orders: {
        orderBy: { createdAt: "desc" },
        include: { items: true },
      },
    },
  });

  const orders = customer?.orders ?? [];

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/account" className="text-brand-contrast hover:text-brand-navy transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <h1 className="font-heading font-bold text-3xl text-brand-navy">
          My Orders
        </h1>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="bg-white border border-brand-contrast/10">
            <div className="px-6 py-4 border-b border-brand-contrast/10 flex items-center justify-between">
              <div>
                <p className="font-heading font-bold text-sm text-brand-navy">{order.orderNumber}</p>
                <p className="text-xs text-brand-contrast font-body mt-0.5">
                  {new Date(order.createdAt).toLocaleDateString("en-AU", { dateStyle: "long" })}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className={`px-2 py-0.5 text-[10px] font-heading font-bold uppercase tracking-wider ${statusColors[order.status] ?? "bg-gray-100 text-gray-600"}`}>
                  {order.status}
                </span>
                <p className="font-heading font-bold text-sm text-brand-navy">
                  {formatPrice(order.total)}
                </p>
              </div>
            </div>
            <div className="px-6 py-4 divide-y divide-brand-contrast/10">
              {order.items.map((item) => (
                <div key={item.id} className="py-3 first:pt-0 last:pb-0 flex justify-between items-center gap-4">
                  <div>
                    <p className="font-body text-sm text-brand-navy font-bold">{item.name}</p>
                    <p className="text-xs text-brand-contrast font-body">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-body text-sm text-brand-navy shrink-0">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}

        {orders.length === 0 && (
          <div className="py-20 text-center">
            <p className="font-body text-brand-contrast mb-6">No orders yet.</p>
            <Link
              href="/shop"
              className="inline-block px-6 py-3 bg-brand-navy text-brand-white text-xs font-heading font-bold uppercase tracking-widest hover:bg-brand-blue transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
