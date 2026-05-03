"use client";

import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import type { CartItem, ShippingAddress, BillingAddress } from "@/types";

interface Props {
  items: CartItem[];
  lockedAddress: ShippingAddress;
  billingAddress?: BillingAddress;
  email: string;
  orderTotal: number;
  clientId: string;
  onSuccess: (orderNumber: string) => void;
}

export default function PayPalSection({ items, lockedAddress, billingAddress, email, orderTotal, clientId, onSuccess }: Props) {
  return (
    <PayPalScriptProvider
      options={{ clientId: clientId || "sb", currency: "AUD" }}
    >
      <div className="space-y-2">
        <PayPalButtons
          style={{ layout: "vertical", color: "gold", label: "pay", shape: "rect" }}
          createOrder={async () => {
            const res = await fetch("/api/checkout/create-order", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ items, shippingAddress: lockedAddress, ...(billingAddress ? { billingAddress } : {}), email, total: orderTotal }),
            });
            const data = await res.json();
            return data.paypalOrderId;
          }}
          onApprove={async (data) => {
            const res = await fetch("/api/checkout/capture-order", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ paypalOrderId: data.orderID }),
            });
            const result = await res.json();
            if (result.success) onSuccess(result.orderNumber);
          }}
          onError={(err) => console.error("PayPal error:", err)}
        />
        <p className="text-center text-[11px] text-brand-contrast/60 font-body">
          Secured by PayPal · AUD
        </p>
      </div>
    </PayPalScriptProvider>
  );
}
