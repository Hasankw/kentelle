import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle, Package, MapPin, Tag } from "lucide-react";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";

interface PageProps {
  params: Promise<{ orderNumber: string }>;
}

export default async function OrderConfirmationPage({ params }: PageProps) {
  const { orderNumber } = await params;

  const order = await db.order.findUnique({
    where: { orderNumber },
    include: { items: true },
  }) as any;

  if (!order) notFound();

  const address = order.shippingAddress as {
    fullName: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postcode: string;
    country?: string;
    phone?: string;
    billingAddress?: {
      fullName: string;
      line1: string;
      line2?: string;
      city: string;
      state: string;
      postcode: string;
    };
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      {/* Hero */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
          <CheckCircle size={36} className="text-green-600" />
        </div>
        <h1 className="font-heading font-bold text-3xl text-brand-navy mb-2">
          Order Confirmed!
        </h1>
        <p className="font-body text-brand-contrast text-sm">
          Thank you, <strong>{address.fullName}</strong>. Your order has been placed successfully.
        </p>
        <div className="inline-block mt-3 px-4 py-1.5 bg-brand-accent/15 text-brand-navy rounded text-xs font-heading font-bold uppercase tracking-widest">
          Order #{orderNumber}
        </div>
      </div>

      {/* Items */}
      <div className="border border-brand-contrast/15 bg-white mb-4">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-brand-contrast/10">
          <Package size={16} className="text-brand-navy" />
          <h2 className="font-heading font-bold text-xs uppercase tracking-widest text-brand-navy">
            Items Ordered
          </h2>
        </div>
        <ul className="divide-y divide-brand-contrast/10">
          {(order.items as any[]).map((item: any) => (
            <li key={item.id} className="flex items-center gap-4 px-5 py-4">
              {item.image ? (
                <div className="relative w-14 h-14 shrink-0 bg-brand-contrast/10 overflow-hidden">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="56px"
                  />
                </div>
              ) : (
                <div className="w-14 h-14 shrink-0 bg-brand-contrast/10 flex items-center justify-center">
                  <Package size={20} className="text-brand-contrast/40" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-heading font-bold text-sm text-brand-navy">{item.name}</p>
                <p className="text-xs text-brand-contrast font-body mt-0.5">Qty: {item.quantity}</p>
              </div>
              <p className="font-heading font-bold text-sm text-brand-navy shrink-0">
                {formatPrice(item.price * item.quantity)}
              </p>
            </li>
          ))}
        </ul>

        {/* Totals */}
        <div className="px-5 py-4 border-t border-brand-contrast/10 space-y-2">
          <div className="flex justify-between text-sm font-body text-brand-contrast">
            <span>Subtotal</span>
            <span>{formatPrice(order.subtotal)}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-sm font-body text-green-600">
              <span className="flex items-center gap-1">
                <Tag size={12} />
                {order.couponCode ? `Coupon (${order.couponCode})` : "Discount"}
              </span>
              <span>−{formatPrice(order.discount)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm font-body text-brand-contrast">
            <span>Shipping</span>
            <span>{order.shippingCost === 0 ? "Free" : formatPrice(order.shippingCost)}</span>
          </div>
          <div className="flex justify-between font-heading font-bold text-brand-navy pt-2 border-t border-brand-contrast/10">
            <span>Total Paid</span>
            <span>{formatPrice(order.total)}</span>
          </div>
        </div>
      </div>

      {/* Addresses */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="border border-brand-contrast/15 bg-white">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-brand-contrast/10">
            <MapPin size={16} className="text-brand-navy" />
            <h2 className="font-heading font-bold text-xs uppercase tracking-widest text-brand-navy">
              Shipping To
            </h2>
          </div>
          <div className="px-5 py-4 font-body text-sm text-brand-contrast space-y-0.5">
            <p className="font-bold text-brand-navy">{address.fullName}</p>
            <p>{address.line1}{address.line2 ? `, ${address.line2}` : ""}</p>
            <p>{address.city} {address.state} {address.postcode}</p>
            <p>Australia</p>
            {address.phone && <p className="text-brand-contrast/60 text-xs mt-1">{address.phone}</p>}
          </div>
        </div>
        <div className="border border-brand-contrast/15 bg-white">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-brand-contrast/10">
            <MapPin size={16} className="text-brand-navy" />
            <h2 className="font-heading font-bold text-xs uppercase tracking-widest text-brand-navy">
              Billing To
            </h2>
          </div>
          <div className="px-5 py-4 font-body text-sm text-brand-contrast space-y-0.5">
            {address.billingAddress ? (
              <>
                <p className="font-bold text-brand-navy">{address.billingAddress.fullName}</p>
                <p>{address.billingAddress.line1}{address.billingAddress.line2 ? `, ${address.billingAddress.line2}` : ""}</p>
                <p>{address.billingAddress.city} {address.billingAddress.state} {address.billingAddress.postcode}</p>
                <p>Australia</p>
              </>
            ) : (
              <p className="italic text-brand-contrast/60">Same as shipping address</p>
            )}
          </div>
        </div>
      </div>

      {/* What's next */}
      <div className="bg-brand-accent/10 border border-brand-accent/30 px-5 py-4 mb-8 text-sm font-body text-brand-navy rounded">
        <p className="font-heading font-bold text-xs uppercase tracking-widest mb-1">What happens next?</p>
        <p>We&apos;ll email you when your order ships. Delivery typically takes 3–7 business days within Australia.</p>
      </div>

      <div className="flex gap-4 justify-center">
        <Link
          href="/shop"
          className="px-6 py-3 border-2 border-brand-navy text-brand-navy text-xs font-heading font-bold uppercase tracking-widest hover:bg-brand-navy hover:text-white rounded transition-colors"
        >
          Continue Shopping
        </Link>
        <Link
          href="/account/orders"
          className="px-6 py-3 bg-brand-navy text-white rounded text-xs font-heading font-bold uppercase tracking-widest hover:bg-brand-blue transition-colors"
        >
          My Orders
        </Link>
      </div>
    </div>
  );
}
