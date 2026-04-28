"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, X, ShoppingBag, ChevronDown, Pencil, Tag, Gift, Check } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";
import { useCartStore } from "@/store/cart";
import Button from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";

type ShippingConfig = { type: string; rate: number; threshold: number };

const DEFAULT_SHIPPING: ShippingConfig = { type: "threshold", rate: 9.95, threshold: 80 };

function calcShipping(config: ShippingConfig, subtotal: number): number {
  if (config.type === "free") return 0;
  if (config.type === "fixed") return config.rate;
  return subtotal >= config.threshold ? 0 : config.rate;
}

export default function CartPage() {
  const {
    items, removeItem, updateQuantity, total,
    coupon, giftCard, applyCoupon, removeCoupon, applyGiftCard, removeGiftCard,
    discount, discountedTotal,
  } = useCartStore();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const [note, setNote] = useState("");

  const [couponInput, setCouponInput] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");

  const [gcInput, setGcInput] = useState("");
  const [gcLoading, setGcLoading] = useState(false);
  const [gcError, setGcError] = useState("");

  const [shipping, setShipping] = useState<ShippingConfig>(DEFAULT_SHIPPING);

  useEffect(() => {
    fetch("/api/settings/shipping")
      .then((r) => r.json())
      .then(setShipping)
      .catch(() => {});
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    supabase.auth.getUser().then(({ data }) => setIsLoggedIn(!!data?.user));
  }, []);

  const subtotal = total();
  const discountAmt = discount();
  const afterDiscount = discountedTotal();
  const shippingCost = calcShipping(shipping, afterDiscount);
  const orderTotal = afterDiscount + shippingCost;

  const remaining = Math.max(shipping.threshold - afterDiscount, 0);
  const progress = Math.min((afterDiscount / shipping.threshold) * 100, 100);

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    setCouponError("");
    const res = await fetch("/api/coupons/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: couponInput.trim(), orderTotal: subtotal }),
    });
    const data = await res.json();
    setCouponLoading(false);
    if (!res.ok) { setCouponError(data.error ?? "Invalid coupon"); return; }
    applyCoupon({ code: data.code, type: data.type, value: data.value });
    setCouponInput("");
  };

  const handleApplyGiftCard = async () => {
    if (!gcInput.trim()) return;
    setGcLoading(true);
    setGcError("");
    const res = await fetch("/api/gift-cards/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: gcInput.trim() }),
    });
    const data = await res.json();
    setGcLoading(false);
    if (!res.ok) { setGcError(data.error ?? "Invalid gift card"); return; }
    applyGiftCard({ code: data.code, amount: data.amount });
    setGcInput("");
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 px-4">
        <ShoppingBag size={56} className="text-brand-contrast opacity-40" />
        <h1 className="font-heading font-bold text-2xl text-brand-navy">Your cart is empty</h1>
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
      <h1 className="font-heading font-bold text-3xl text-brand-navy mb-4 text-center">
        Your Cart
      </h1>

      {/* Free shipping progress bar */}
      {shipping.type === "threshold" && (
        <div className="mb-8 max-w-xl mx-auto">
          {remaining > 0 ? (
            <p className="text-center text-sm font-body text-brand-navy mb-2">
              Spend <span className="font-bold text-brand-blue">{formatPrice(remaining)}</span> more for free shipping!
            </p>
          ) : (
            <p className="text-center text-sm font-bold font-body text-brand-mint mb-2">
              You&apos;ve unlocked free shipping! 🎉
            </p>
          )}
          <div className="h-1.5 bg-brand-contrast/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-accent rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

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
                  unoptimized={item.image.startsWith("http")}
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
                  <span className="w-8 text-center text-sm font-body">{item.quantity}</span>
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

          {/* Order note */}
          <div className="py-3">
            <button
              onClick={() => setNoteOpen((o) => !o)}
              className="flex items-center justify-between w-full py-2 text-sm font-body text-brand-navy hover:text-brand-blue transition-colors"
            >
              <span className="flex items-center gap-2">
                <Pencil size={14} />
                Order note
              </span>
              <ChevronDown
                size={16}
                className={`transition-transform duration-200 ${noteOpen ? "rotate-180" : ""}`}
              />
            </button>
            {noteOpen && (
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a note for your order (gift message, delivery instructions, etc.)"
                rows={3}
                className="mt-2 w-full border border-brand-contrast/30 px-3 py-2 text-sm font-body text-brand-navy placeholder:text-brand-contrast/50 outline-none focus:border-brand-navy transition-colors resize-none"
              />
            )}
          </div>

          {/* Coupon */}
          <div className="py-4">
            <p className="flex items-center gap-2 text-sm font-body text-brand-navy mb-2">
              <Tag size={14} />
              Have a coupon?
            </p>
            {coupon ? (
              <div className="flex items-center justify-between bg-green-50 border border-green-200 px-3 py-2">
                <span className="text-sm font-heading font-bold text-green-700 flex items-center gap-1.5">
                  <Check size={14} />
                  {coupon.code} — {coupon.type === "PERCENTAGE" ? `${coupon.value}% off` : formatPrice(coupon.value) + " off"}
                </span>
                <button
                  onClick={removeCoupon}
                  className="text-green-600 hover:text-red-500 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  value={couponInput}
                  onChange={(e) => { setCouponInput(e.target.value.toUpperCase()); setCouponError(""); }}
                  onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                  placeholder="COUPON CODE"
                  className="flex-1 border border-brand-contrast/30 px-3 py-2 text-sm font-body font-mono text-brand-navy placeholder:text-brand-contrast/40 outline-none focus:border-brand-navy transition-colors uppercase"
                />
                <button
                  onClick={handleApplyCoupon}
                  disabled={couponLoading || !couponInput.trim()}
                  className="px-4 py-2 bg-brand-navy text-brand-white text-xs font-heading font-bold uppercase tracking-widest hover:bg-brand-blue transition-colors disabled:opacity-50"
                >
                  {couponLoading ? "..." : "Apply"}
                </button>
              </div>
            )}
            {couponError && <p className="text-xs text-red-500 font-body mt-1">{couponError}</p>}
          </div>

          {/* Gift Card — logged-in users only */}
          {isLoggedIn && (
            <div className="py-4">
              <p className="flex items-center gap-2 text-sm font-body text-brand-navy mb-2">
                <Gift size={14} />
                Have a gift card?
              </p>
              {giftCard ? (
                <div className="flex items-center justify-between bg-green-50 border border-green-200 px-3 py-2">
                  <span className="text-sm font-heading font-bold text-green-700 flex items-center gap-1.5">
                    <Check size={14} />
                    {giftCard.code} — {formatPrice(giftCard.amount)} gift card
                  </span>
                  <button
                    onClick={removeGiftCard}
                    className="text-green-600 hover:text-red-500 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    value={gcInput}
                    onChange={(e) => { setGcInput(e.target.value.toUpperCase()); setGcError(""); }}
                    onKeyDown={(e) => e.key === "Enter" && handleApplyGiftCard()}
                    placeholder="KENT-XXXX-XXXX"
                    className="flex-1 border border-brand-contrast/30 px-3 py-2 text-sm font-body font-mono text-brand-navy placeholder:text-brand-contrast/40 outline-none focus:border-brand-navy transition-colors uppercase"
                  />
                  <button
                    onClick={handleApplyGiftCard}
                    disabled={gcLoading || !gcInput.trim()}
                    className="px-4 py-2 bg-brand-navy text-brand-white text-xs font-heading font-bold uppercase tracking-widest hover:bg-brand-blue transition-colors disabled:opacity-50"
                  >
                    {gcLoading ? "..." : "Apply"}
                  </button>
                </div>
              )}
              {gcError && <p className="text-xs text-red-500 font-body mt-1">{gcError}</p>}
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="bg-brand-white border border-brand-contrast/20 p-6 h-fit space-y-3">
          <h2 className="font-heading font-bold text-sm uppercase tracking-widest text-brand-navy">
            Order Summary
          </h2>
          <div className="flex justify-between text-sm font-body">
            <span className="text-brand-contrast">Subtotal</span>
            <span className="font-bold text-brand-navy">{formatPrice(subtotal)}</span>
          </div>
          {discountAmt > 0 && (
            <div className="flex justify-between text-sm font-body text-green-600">
              <span>Discount</span>
              <span className="font-bold">−{formatPrice(discountAmt)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm font-body">
            <span className="text-brand-contrast">Shipping</span>
            <span className="text-brand-navy">
              {shippingCost === 0
                ? "Free"
                : shipping.type === "threshold"
                ? "Calculated at checkout"
                : formatPrice(shippingCost)}
            </span>
          </div>
          <div className="border-t border-brand-contrast/20 pt-3 flex justify-between font-heading font-bold">
            <span className="text-brand-navy">Total</span>
            <span className="text-brand-navy">{formatPrice(orderTotal)}</span>
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
