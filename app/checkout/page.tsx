"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import Input from "@/components/ui/Input";
import { useCartStore } from "@/store/cart";
import { formatPrice } from "@/lib/utils";
import type { ShippingAddress } from "@/types";

const PayPalSection = dynamic(() => import("@/components/store/PayPalSection"), { ssr: false });

const schema = z.object({
  fullName: z.string().min(2, "Full name required"),
  email: z.string().email("Valid email required"),
  phone: z.string().min(6, "Phone required"),
  line1: z.string().min(3, "Address required"),
  line2: z.string().optional(),
  city: z.string().min(2, "City required"),
  state: z.string().min(2, "State required"),
  postcode: z.string().min(4, "Postcode required"),
});

type FormData = z.infer<typeof schema>;

const SHIPPING_THRESHOLD = 80;
const SHIPPING_COST = 9.95;

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, clearCart } = useCartStore();
  const [shippingLocked, setShippingLocked] = useState(false);
  const [lockedAddress, setLockedAddress] = useState<ShippingAddress | null>(null);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isValid },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onChange",
  });

  const subtotal = total();
  const shippingCost = subtotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const orderTotal = subtotal + shippingCost;

  if (items.length === 0) {
    router.replace("/cart");
    return null;
  }

  const lockShipping = handleSubmit((data) => {
    setLockedAddress({
      fullName: data.fullName,
      line1: data.line1,
      line2: data.line2,
      city: data.city,
      state: data.state,
      postcode: data.postcode,
      country: "AU",
      phone: data.phone,
    });
    setShippingLocked(true);
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="font-heading font-bold text-3xl text-brand-navy mb-8">
        Checkout
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
        {/* Left: Shipping form */}
        <div className="md:col-span-3 space-y-4">
          <h2 className="font-heading font-bold text-sm uppercase tracking-widest text-brand-navy mb-4">
            Shipping Information
          </h2>

          <Input
            label="Full Name"
            id="fullName"
            {...register("fullName")}
            error={errors.fullName?.message}
            disabled={shippingLocked}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Email"
              id="email"
              type="email"
              {...register("email")}
              error={errors.email?.message}
              disabled={shippingLocked}
            />
            <Input
              label="Phone"
              id="phone"
              type="tel"
              {...register("phone")}
              error={errors.phone?.message}
              disabled={shippingLocked}
            />
          </div>
          <Input
            label="Address Line 1"
            id="line1"
            {...register("line1")}
            error={errors.line1?.message}
            disabled={shippingLocked}
          />
          <Input
            label="Address Line 2 (optional)"
            id="line2"
            {...register("line2")}
            disabled={shippingLocked}
          />
          <div className="grid grid-cols-3 gap-3">
            <Input
              label="City"
              id="city"
              {...register("city")}
              error={errors.city?.message}
              disabled={shippingLocked}
            />
            <Input
              label="State"
              id="state"
              {...register("state")}
              error={errors.state?.message}
              disabled={shippingLocked}
            />
            <Input
              label="Postcode"
              id="postcode"
              {...register("postcode")}
              error={errors.postcode?.message}
              disabled={shippingLocked}
            />
          </div>

          {!shippingLocked && (
            <button
              onClick={lockShipping}
              disabled={!isValid}
              className="w-full mt-2 bg-brand-accent text-brand-navy py-3 text-xs font-heading font-bold uppercase tracking-widest hover:bg-brand-accent/85 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue to Payment
            </button>
          )}

          {shippingLocked && (
            <button
              onClick={() => setShippingLocked(false)}
              className="text-xs text-brand-blue underline underline-offset-2"
            >
              Edit address
            </button>
          )}
        </div>

        {/* Right: Summary + PayPal */}
        <div className="md:col-span-2 space-y-4">
          {/* Order summary */}
          <div className="border border-brand-contrast/20 bg-brand-white p-5 space-y-3">
            <h3 className="font-heading font-bold text-xs uppercase tracking-widest text-brand-navy">
              Order Summary
            </h3>
            <ul className="divide-y divide-brand-contrast/10 text-sm font-body">
              {items.map((item) => (
                <li key={item.id} className="flex justify-between py-2">
                  <span className="text-brand-navy">
                    {item.name} × {item.quantity}
                  </span>
                  <span className="font-bold text-brand-navy">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="border-t border-brand-contrast/20 pt-3 space-y-1 text-sm font-body">
              <div className="flex justify-between">
                <span className="text-brand-contrast">Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-contrast">Shipping</span>
                <span>{shippingCost === 0 ? "Free" : formatPrice(shippingCost)}</span>
              </div>
            </div>
            <div className="border-t border-brand-contrast/20 pt-3 flex justify-between font-heading font-bold">
              <span>Total</span>
              <span>{formatPrice(orderTotal)}</span>
            </div>
          </div>

          {/* PayPal */}
          {shippingLocked && lockedAddress && (
            <div>
              <p className="text-xs font-heading font-bold uppercase tracking-widest text-brand-navy mb-3">
                Payment
              </p>
              <PayPalSection
                items={items}
                lockedAddress={lockedAddress}
                email={getValues("email")}
                orderTotal={orderTotal}
                onSuccess={(orderNumber) => {
                  clearCart();
                  router.push(`/order-confirmation/${orderNumber}`);
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
