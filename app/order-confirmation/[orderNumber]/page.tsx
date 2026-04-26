import { notFound } from "next/navigation";
import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import Button from "@/components/ui/Button";

interface PageProps {
  params: Promise<{ orderNumber: string }>;
}

export default async function OrderConfirmationPage({ params }: PageProps) {
  const { orderNumber } = await params;

  const order = await db.order.findUnique({
    where: { orderNumber },
    include: { items: true },
  });

  if (!order) notFound();

  const address = order.shippingAddress as {
    fullName: string;
    line1: string;
    city: string;
    state: string;
    postcode: string;
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <CheckCircle size={56} className="text-green-500 mx-auto mb-4" />
      <h1 className="font-heading font-bold text-3xl text-brand-navy mb-2">
        Order Confirmed!
      </h1>
      <p className="font-body text-brand-contrast text-sm mb-1">
        Thank you for your order, {address.fullName}.
      </p>
      <p className="font-body text-sm text-brand-navy font-bold">
        Order #{orderNumber}
      </p>

      <div className="mt-8 border border-brand-contrast/20 bg-brand-white p-6 text-left space-y-4">
        <h2 className="font-heading font-bold text-sm uppercase tracking-widest text-brand-navy">
          Order Details
        </h2>
        <ul className="divide-y divide-brand-contrast/10">
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between py-3 text-sm font-body">
              <span className="text-brand-navy">
                {item.name} × {item.quantity}
              </span>
              <span className="font-bold text-brand-navy">
                {formatPrice(item.price * item.quantity)}
              </span>
            </li>
          ))}
        </ul>
        <div className="border-t border-brand-contrast/20 pt-4 space-y-1 text-sm font-body">
          <div className="flex justify-between">
            <span className="text-brand-contrast">Subtotal</span>
            <span>{formatPrice(order.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-brand-contrast">Shipping</span>
            <span>{order.shippingCost === 0 ? "Free" : formatPrice(order.shippingCost)}</span>
          </div>
          <div className="flex justify-between font-heading font-bold text-brand-navy pt-2 border-t border-brand-contrast/10">
            <span>Total</span>
            <span>{formatPrice(order.total)}</span>
          </div>
        </div>

        <div className="pt-4 border-t border-brand-contrast/20">
          <p className="text-xs font-heading font-bold uppercase tracking-widest text-brand-navy mb-1">
            Shipping To
          </p>
          <p className="text-sm font-body text-brand-contrast">
            {address.line1}, {address.city} {address.state} {address.postcode}
          </p>
        </div>
      </div>

      <div className="mt-8 flex gap-4 justify-center">
        <Link href="/shop">
          <Button variant="outline">Continue Shopping</Button>
        </Link>
        <Link href="/account/orders">
          <Button>My Orders</Button>
        </Link>
      </div>
    </div>
  );
}
