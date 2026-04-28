export const dynamic = "force-dynamic";

import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { db } from "@/lib/db";
import AdminShell from "@/components/admin/AdminShell";
import { formatPrice } from "@/lib/utils";
import OrderStatusForm from "@/components/admin/OrderStatusForm";

export const metadata: Metadata = { title: "Order Detail" };

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  CONFIRMED: "bg-green-100 text-green-700",
  PROCESSING: "bg-blue-100 text-blue-700",
  SHIPPED: "bg-indigo-100 text-indigo-700",
  DELIVERED: "bg-emerald-100 text-emerald-700",
  CANCELLED: "bg-red-100 text-red-700",
  REFUNDED: "bg-gray-100 text-gray-600",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminOrderDetailPage({ params }: PageProps) {
  const { id } = await params;
  const order = await db.order.findUnique({
    where: { id },
    include: { items: true, customer: true },
  });

  if (!order) notFound();

  const address = order.shippingAddress as Record<string, string>;

  return (
    <AdminShell>
      <div className="p-8">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/admin/orders" className="text-brand-contrast hover:text-brand-navy transition-colors">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="font-heading font-bold text-2xl text-brand-navy">
              Order #{order.orderNumber}
            </h1>
            <p className="text-xs text-brand-contrast font-body mt-0.5">
              Placed {new Date(order.createdAt).toLocaleDateString("en-AU", { dateStyle: "full" })}
            </p>
          </div>
          <span className={`ml-auto px-3 py-1 text-[10px] font-heading font-bold uppercase tracking-widest ${statusColors[order.status] ?? "bg-gray-100 text-gray-600"}`}>
            {order.status}
          </span>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Items */}
          <div className="md:col-span-2 space-y-4">
            <div className="bg-white border border-brand-contrast/10 shadow-sm">
              <div className="px-5 py-3 border-b border-brand-contrast/10">
                <h2 className="font-heading font-bold text-sm uppercase tracking-wider text-brand-navy">
                  Items ({order.items.length})
                </h2>
              </div>
              <div className="divide-y divide-brand-contrast/10">
                {order.items.map((item) => (
                  <div key={item.id} className="px-5 py-4 flex items-center gap-4">
                    <div className="w-12 h-12 bg-brand-contrast/10 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-body font-bold text-sm text-brand-navy truncate">{item.name}</p>
                      <p className="text-xs text-brand-contrast font-body">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-body text-sm font-bold text-brand-navy">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>
              <div className="px-5 py-4 border-t border-brand-contrast/10 space-y-2">
                <div className="flex justify-between text-sm font-body text-brand-contrast">
                  <span>Subtotal</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm font-body text-brand-contrast">
                  <span>Shipping</span>
                  <span>{order.shippingCost === 0 ? "Free" : formatPrice(order.shippingCost)}</span>
                </div>
                <div className="flex justify-between text-base font-heading font-bold text-brand-navy pt-2 border-t border-brand-contrast/10">
                  <span>Total</span>
                  <span>{formatPrice(order.total)}</span>
                </div>
              </div>
            </div>

            {/* Update status */}
            <OrderStatusForm orderId={order.id} currentStatus={order.status} />
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="bg-white border border-brand-contrast/10 shadow-sm">
              <div className="px-5 py-3 border-b border-brand-contrast/10">
                <h2 className="font-heading font-bold text-sm uppercase tracking-wider text-brand-navy">
                  Shipping Address
                </h2>
              </div>
              <div className="px-5 py-4 font-body text-sm text-brand-navy/80 space-y-0.5">
                <p className="font-bold text-brand-navy">{address.fullName}</p>
                <p>{address.line1}</p>
                {address.line2 && <p>{address.line2}</p>}
                <p>{address.city}, {address.state} {address.postcode}</p>
                <p>{address.country}</p>
                {address.phone && <p className="mt-1 text-brand-contrast">{address.phone}</p>}
              </div>
            </div>

            <div className="bg-white border border-brand-contrast/10 shadow-sm">
              <div className="px-5 py-3 border-b border-brand-contrast/10">
                <h2 className="font-heading font-bold text-sm uppercase tracking-wider text-brand-navy">
                  Customer
                </h2>
              </div>
              <div className="px-5 py-4 font-body text-sm text-brand-navy/80 space-y-1">
                {order.customer ? (
                  <>
                    <p className="font-bold text-brand-navy">{order.customer.name}</p>
                    <p>{order.customer.email}</p>
                  </>
                ) : (
                  <p>{order.guestEmail ?? "Guest checkout"}</p>
                )}
              </div>
            </div>

            {order.paypalOrderId && (
              <div className="bg-white border border-brand-contrast/10 shadow-sm">
                <div className="px-5 py-3 border-b border-brand-contrast/10">
                  <h2 className="font-heading font-bold text-sm uppercase tracking-wider text-brand-navy">
                    Payment
                  </h2>
                </div>
                <div className="px-5 py-4 font-body text-xs text-brand-contrast">
                  <p>PayPal ID: <span className="text-brand-navy">{order.paypalOrderId}</span></p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
