export const dynamic = "force-dynamic";

import { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Gift, Tag } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import AccountLogout from "@/components/auth/AccountLogout";

export const metadata: Metadata = { title: "My Account" };

export default async function AccountPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const giftCards = await db.giftCard.findMany({
    where: { recipientEmail: user.email?.toLowerCase() ?? "" },
    orderBy: { createdAt: "desc" },
  });

  const customer = await db.customer.findUnique({
    where: { supabaseUid: user.id },
    include: {
      orders: {
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { items: { take: 1 } },
      },
    },
  });

  // Also fetch guest orders placed with the same email (not yet linked to a customer record)
  const guestOrders = await db.order.findMany({
    where: { guestEmail: user.email?.toLowerCase() ?? "" },
    orderBy: { createdAt: "desc" },
    take: 10,
    include: { items: { take: 1 } },
  });

  // Merge and deduplicate by order id
  const existingIds = new Set((customer?.orders ?? []).map((o: any) => o.id));
  const mergedOrders = [
    ...(customer?.orders ?? []),
    ...((guestOrders as any[]).filter((o) => !existingIds.has(o.id))),
  ].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 10);

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
          { label: "Total Orders", value: mergedOrders.length },
          {
            label: "Total Spent",
            value: formatPrice(mergedOrders.reduce((sum: number, o: any) => sum + o.total, 0)),
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
          {mergedOrders.length > 0 && (
            <Link href="/account/orders" className="text-xs text-brand-blue font-heading font-bold uppercase tracking-wider hover:underline">
              View All
            </Link>
          )}
        </div>
        <div className="divide-y divide-brand-contrast/10">
          {mergedOrders.map((order: any) => (
            <div key={order.id} className="px-6 py-4 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <Link href={`/order-confirmation/${order.orderNumber}`} className="font-heading font-bold text-sm text-brand-navy hover:text-brand-blue transition-colors">
                  {order.orderNumber}
                </Link>
                <p className="text-xs text-brand-contrast font-body mt-0.5">
                  {new Date(order.createdAt).toLocaleDateString("en-AU")} · {order.items[0]?.name}
                  {order.items.length > 1 ? ` +${order.items.length - 1} more` : ""}
                </p>
                {order.couponCode && (
                  <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] font-heading font-bold uppercase tracking-wider">
                    <Tag size={9} /> {order.couponCode} used
                    {order.discount ? ` · -${formatPrice(order.discount)}` : ""}
                  </span>
                )}
              </div>
              <span className={`px-2 py-0.5 text-[10px] font-heading font-bold uppercase tracking-wider shrink-0 ${statusColors[order.status] ?? "bg-gray-100 text-gray-600"}`}>
                {order.status}
              </span>
              <p className="font-body font-bold text-sm text-brand-navy shrink-0">
                {formatPrice(order.total)}
              </p>
            </div>
          ))}
          {mergedOrders.length === 0 && (
            <div className="px-6 py-12 text-center">
              <p className="font-body text-sm text-brand-contrast mb-4">No orders yet.</p>
              <Link
                href="/shop"
                className="inline-block px-6 py-2.5 bg-brand-accent text-brand-navy rounded text-xs font-heading font-bold uppercase tracking-widest hover:bg-brand-accent/85 transition-colors"
              >
                Start Shopping
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Gift Cards */}
      {(giftCards as any[]).length > 0 && (
        <div className="bg-white border border-brand-contrast/10 mt-6">
          <div className="px-6 py-4 border-b border-brand-contrast/10 flex items-center gap-2">
            <Gift size={16} className="text-brand-navy" />
            <h2 className="font-heading font-bold text-base uppercase tracking-wider text-brand-navy">
              My Gift Cards
            </h2>
          </div>
          <div className="divide-y divide-brand-contrast/10">
            {(giftCards as any[]).map((gc) => {
              const isRedeemed = gc.status === "REDEEMED";
              return (
                <div key={gc.id} className={`px-6 py-4 flex items-center justify-between gap-4 ${isRedeemed ? "opacity-50 bg-gray-50" : ""}`}>
                  <div>
                    <p className={`font-mono font-bold text-sm tracking-widest ${isRedeemed ? "text-gray-400 line-through" : "text-brand-navy"}`}>
                      {gc.code}
                    </p>
                    <p className="text-xs text-brand-contrast font-body mt-0.5">
                      From: {gc.senderName || gc.senderEmail} · {new Date(gc.createdAt).toLocaleDateString("en-AU")}
                    </p>
                    {gc.message && (
                      <p className="text-xs text-brand-contrast/70 italic mt-0.5">&ldquo;{gc.message}&rdquo;</p>
                    )}
                    {isRedeemed && gc.redeemedAt && (
                      <p className="text-xs text-gray-400 font-body mt-0.5">
                        Redeemed on {new Date(gc.redeemedAt).toLocaleDateString("en-AU")}
                      </p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`font-heading font-bold text-lg ${isRedeemed ? "text-gray-400" : "text-brand-navy"}`}>
                      {formatPrice(Number(gc.amount))}
                    </p>
                    <span className={`px-2 py-0.5 text-[10px] font-heading font-bold uppercase tracking-wider ${
                      isRedeemed ? "bg-gray-100 text-gray-400" : "bg-green-100 text-green-700"
                    }`}>
                      {isRedeemed ? "Used" : "Active"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
