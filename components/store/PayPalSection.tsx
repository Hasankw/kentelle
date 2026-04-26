"use client";

import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import type { CartItem, ShippingAddress } from "@/types";

interface Props {
  items: CartItem[];
  lockedAddress: ShippingAddress;
  email: string;
  orderTotal: number;
  onSuccess: (orderNumber: string) => void;
}

export default function PayPalSection({ items, lockedAddress, email, orderTotal, onSuccess }: Props) {
  return (
    <PayPalScriptProvider
      options={{
        clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? "sb",
        currency: "AUD",
      }}
    >
      <PayPalButtons
        style={{ layout: "vertical", color: "blue", label: "pay" }}
        createOrder={async () => {
          const res = await fetch("/api/checkout/create-order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ items, shippingAddress: lockedAddress, email, total: orderTotal }),
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
    </PayPalScriptProvider>
  );
}
