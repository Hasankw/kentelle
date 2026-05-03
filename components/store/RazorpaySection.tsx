"use client";

import { useState } from "react";
import { useCartStore } from "@/store/cart";
import type { CartItem, ShippingAddress, BillingAddress } from "@/types";

interface Props {
  items: CartItem[];
  lockedAddress: ShippingAddress;
  billingAddress?: BillingAddress;
  email: string;
  orderTotal: number;
  onSuccess: (orderNumber: string) => void;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

function loadScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return; }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function RazorpaySection({ items, lockedAddress, billingAddress, email, orderTotal, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { coupon, giftCard, discount } = useCartStore();

  const handlePay = async () => {
    setLoading(true);
    setError("");

    try {
      const loaded = await loadScript();
      if (!loaded) {
        setError("Could not load payment gateway. Check your connection.");
        setLoading(false);
        return;
      }

      const appliedDiscount = discount();
      const couponCode = coupon?.code;

      const res = await fetch("/api/checkout/razorpay-create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          shippingAddress: lockedAddress,
          ...(billingAddress ? { billingAddress } : {}),
          email,
          total: orderTotal,
          ...(couponCode ? { couponCode } : {}),
          ...(appliedDiscount > 0 ? { discount: appliedDiscount } : {}),
        }),
      });

      const order = await res.json();
      if (!res.ok) {
        setError(order.error ?? "Failed to create order. Please try again.");
        setLoading(false);
        return;
      }

      const rzp = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: "Kentelle Skincare",
        description: `Order Payment${couponCode ? ` (${couponCode})` : ""}`,
        order_id: order.rzOrderId,
        prefill: {
          email,
          contact: lockedAddress.phone,
          name: lockedAddress.fullName,
        },
        theme: { color: "#D4A5B5" },
        handler: async (response: any) => {
          setLoading(true);
          try {
            const verify = await fetch("/api/checkout/razorpay-verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                rzOrderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
              }),
            });
            const result = await verify.json();
            if (result.success) onSuccess(result.orderNumber);
            else setError(result.error ?? "Payment verification failed. Contact support.");
          } catch {
            setError("Verification failed. Contact support if payment was deducted.");
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: () => setLoading(false),
        },
      });

      rzp.open();
      setLoading(false);
    } catch (err: any) {
      setError(err?.message ?? "Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      {error && (
        <p className="text-xs text-red-500 font-body bg-red-50 border border-red-200 px-3 py-2">
          {error}
        </p>
      )}
      <button
        onClick={handlePay}
        disabled={loading}
        className="w-full bg-brand-navy text-brand-white rounded py-3.5 text-sm font-heading font-bold uppercase tracking-widest hover:bg-brand-blue transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Processing...
          </>
        ) : (
          `Pay ${new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD" }).format(orderTotal)}`
        )}
      </button>
      <p className="text-center text-[11px] text-brand-contrast/60 font-body">
        Secured by Razorpay · Test mode
      </p>
    </div>
  );
}
