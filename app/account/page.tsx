export const dynamic = "force-dynamic";

import { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import AccountLogout from "@/components/auth/AccountLogout";

export const metadata: Metadata = { title: "My Account" };

export default async function AccountPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const customer = await db.customer.findUnique({
    where: { supabaseUid: user.id },
    include: {
      orders: {
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { items: { take: 1 } },
      },
    },
  });

  const statusColors: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-700",
    CONFIRMED: "bg-green-100 text-green-700",
    PROCESSING: "bg-blue-100 text-blue-700",
    SHIPPED: "bg-indigo-100 text-indigo-700",
    DELIVERED: "bg-emerald-100 text-emerald-700",
    CANCELLED: "bg-red-100 text-red-700",
    REFUNDED: "bg-gray-100 text-gray-600",
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="flex items-start justify-between mb-10">
        <div>
          <p className="text-xs font-heading font-bold tracking-widest uppercase text-brand-blue mb-1">
            My Account
          </p>
          <h1 className="font-heading font-bold text-3xl text-brand-navy">
            {customer?.name ?? user.email?.split("@")[0]}
          </h1>
          <p className="font-body text-sm text-brand-contrast mt-1">{user.email}</p>
        </div>
        <AccountLogout />
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-10">
        {[
          { label: "Total Orders", value: customer?.orders?.length ?? 0 },
          {
            label: "Total Spent",
            value: formatPrice((customer?.orders as Array<{ total: number }> | undefined)?.reduce((sum: number, o: { total: number }) => sum + o.total, 0) ?? 0),
          },
          { label: "Member Since", value: new Date(user.created_at).toLocaleDateString("en-AU", { month: "long", year: "numeric" }) },
        ].map((stat) => (
          <div key={stat.label} className="bg-white border border-brand-contrast/10 px-6 py-5">
            <p className="text-xs font-heading font-bold uppercase tracking-wider text-brand-contrast mb-1">
              {stat.label}
            </p>
            <p className="font-heading font-bold text-2xl text-brand-navy">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-brand-contrast/10">
        <div className="px-6 py-4 border-b border-brand-contrast/10 flex items-center justify-between">
          <h2 className="font-heading font-bold text-base uppercase tracking-wider text-brand-navy">
            Recent Orders
          </h2>
          {(customer?.orders?.length ?? 0) > 0 && (
            <Link href="/account/orders" className="text-xs text-brand-blue font-heading font-bold uppercase tracking-wider hover:underline">
              View All
            </Link>
          )}
        </div>
        <div className="divide-y divide-brand-contrast/10">
          {(customer?.orders as Array<{ id: string; orderNumber: string; createdAt: string; status: string; total: number; items: Array<{ id: string; name: string }> }> ?? []).map((order) => (
            <div key={order.id} className="px-6 py-4 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-heading font-bold text-sm text-brand-navy">{order.orderNumber}</p>
                <p className="text-xs text-brand-contrast font-body mt-0.5">
                  {new Date(order.createdAt).toLocaleDateString("en-AU")} · {order.items[0]?.name}
                  {order.items.length > 1 ? ` +${order.items.length - 1} more` : ""}
                </p>
              </div>
              <span className={`px-2 py-0.5 text-[10px] font-heading font-bold uppercase tracking-wider shrink-0 ${statusColors[order.status] ?? "bg-gray-100 text-gray-600"}`}>
                {order.status}
              </span>
              <p className="font-body font-bold text-sm text-brand-navy shrink-0">
                {formatPrice(order.total)}
              </p>
            </div>
          ))}
          {(customer?.orders?.length ?? 0) === 0 && (
            <div className="px-6 py-12 text-center">
              <p className="font-body text-sm text-brand-contrast mb-4">No orders yet.</p>
              <Link
                href="/shop"
                className="inline-block px-6 py-2.5 bg-brand-navy text-brand-white text-xs font-heading font-bold uppercase tracking-widest hover:bg-brand-blue transition-colors"
              >
                Start Shopping
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
