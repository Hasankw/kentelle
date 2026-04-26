"use client";

import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, X, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/store/cart";
import Button from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";

export default function CartPage() {
  const { items, removeItem, updateQuantity, total } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 px-4">
        <ShoppingBag size={56} className="text-brand-contrast opacity-40" />
        <h1 className="font-heading font-bold text-2xl text-brand-navy">
          Your cart is empty
        </h1>
        <p className="font-body text-sm text-brand-contrast">
          Looks like you haven&apos;t added anything yet.
        </p>
        <Link href="/shop">
          <Button size="lg">Start Shopping</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="font-heading font-bold text-3xl text-brand-navy mb-8">
        Your Cart
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Items */}
        <div className="md:col-span-2 space-y-0 divide-y divide-brand-contrast/10 border-t border-brand-contrast/10">
          {items.map((item) => (
            <div key={item.id} className="flex gap-4 py-5">
              <div className="relative w-20 h-20 bg-brand-contrast/10 shrink-0">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </div>
              <div className="flex-1 min-w-0">
                <Link
                  href={`/products/${item.slug}`}
                  className="font-heading font-bold text-sm text-brand-navy hover:text-brand-blue transition-colors block truncate"
                >
                  {item.name}
                </Link>
                <p className="font-body text-sm text-brand-blue mt-0.5">
                  {formatPrice(item.price)}
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="w-7 h-7 border border-brand-contrast/30 flex items-center justify-center hover:border-brand-navy transition-colors"
                  >
                    <Minus size={12} />
                  </button>
                  <span className="w-8 text-center text-sm font-body">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="w-7 h-7 border border-brand-contrast/30 flex items-center justify-center hover:border-brand-navy transition-colors"
                  >
                    <Plus size={12} />
                  </button>
                </div>
              </div>
              <div className="flex flex-col items-end justify-between">
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-brand-contrast hover:text-red-500 transition-colors"
                >
                  <X size={16} />
                </button>
                <p className="font-heading font-bold text-sm text-brand-navy">
                  {formatPrice(item.price * item.quantity)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="bg-brand-white border border-brand-contrast/20 p-6 h-fit space-y-4">
          <h2 className="font-heading font-bold text-sm uppercase tracking-widest text-brand-navy">
            Order Summary
          </h2>
          <div className="flex justify-between text-sm font-body">
            <span className="text-brand-contrast">Subtotal</span>
            <span className="font-bold text-brand-navy">
              {formatPrice(total())}
            </span>
          </div>
          <div className="flex justify-between text-sm font-body">
            <span className="text-brand-contrast">Shipping</span>
            <span className="text-brand-navy">
              {total() >= 80 ? "Free" : "Calculated at checkout"}
            </span>
          </div>
          <div className="border-t border-brand-contrast/20 pt-4 flex justify-between font-heading font-bold">
            <span className="text-brand-navy">Total</span>
            <span className="text-brand-navy">{formatPrice(total())}</span>
          </div>
          <Link href="/checkout" className="block">
            <Button className="w-full" size="lg">
              Proceed to Checkout
            </Button>
          </Link>
          <Link
            href="/shop"
            className="block text-center text-xs text-brand-contrast hover:text-brand-navy underline underline-offset-2 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
