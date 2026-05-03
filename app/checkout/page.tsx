"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { Check } from "lucide-react";
import Input from "@/components/ui/Input";
import { useCartStore } from "@/store/cart";
import { formatPrice } from "@/lib/utils";
import type { ShippingAddress, BillingAddress } from "@/types";
import dynamic from "next/dynamic";

const RazorpaySection = dynamic(() => import("@/components/store/RazorpaySection"), { ssr: false });
const PayPalSection = dynamic(() => import("@/components/store/PayPalSection"), { ssr: false });

const AU_STATES = [
  { value: "NSW", label: "New South Wales" },
  { value: "VIC", label: "Victoria" },
  { value: "QLD", label: "Queensland" },
  { value: "WA", label: "Western Australia" },
  { value: "SA", label: "South Australia" },
  { value: "TAS", label: "Tasmania" },
  { value: "ACT", label: "Australian Capital Territory" },
  { value: "NT", label: "Northern Territory" },
];

const addressSchema = z.object({
  fullName: z.string().min(2, "Full name required"),
  email: z.string().email("Valid email required"),
  phone: z.string().min(6, "Phone required"),
  line1: z.string().min(3, "Address required"),
  line2: z.string().optional(),
  city: z.string().min(2, "City required"),
  state: z.enum(["NSW", "VIC", "QLD", "WA", "SA", "TAS", "ACT", "NT"]),
  postcode: z.string().min(4, "Postcode required"),
});

type FormData = z.infer<typeof addressSchema>;

type ShippingConfig = { type: string; rate: number; threshold: number };

function calcShipping(config: ShippingConfig, subtotal: number): number {
  if (config.type === "free") return 0;
  if (config.type === "fixed") return config.rate;
  return subtotal >= config.threshold ? 0 : config.rate;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, discountedTotal, clearCart, coupon, giftCard } = useCartStore();
  const [authChecked, setAuthChecked] = useState(false);
  const [navigating, setNavigating] = useState(false);
  const [shippingLocked, setShippingLocked] = useState(false);
  const [lockedAddress, setLockedAddress] = useState<ShippingAddress | null>(null);
  const [lockedBilling, setLockedBilling] = useState<BillingAddress | undefined>(undefined);
  const [billingSameAsShipping, setBillingSameAsShipping] = useState(true);
  const [billingFields, setBillingFields] = useState({
    fullName: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    postcode: "",
  });
  const [billingErrors, setBillingErrors] = useState<Record<string, string>>({});
  const [shippingConfig, setShippingConfig] = useState<ShippingConfig>({
    type: "threshold",
    rate: 9.95,
    threshold: 80,
  });
  const [paymentSettings, setPaymentSettings] = useState<{
    razorpayEnabled: boolean;
    paypalEnabled: boolean;
    razorpayKeyId: string;
    paypalClientId: string;
  }>({ razorpayEnabled: true, paypalEnabled: false, razorpayKeyId: "", paypalClientId: "" });

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    supabase.auth.getUser().then(({ data }) => {
      if (!data?.user) {
        router.replace("/login?redirect=/checkout");
      } else {
        setAuthChecked(true);
      }
    });
  }, [router]);

  useEffect(() => {
    fetch("/api/settings/shipping")
      .then((r) => r.json())
      .then(setShippingConfig)
      .catch(() => {});
    fetch("/api/settings/payment")
      .then((r) => r.json())
      .then((d) => setPaymentSettings({
        razorpayEnabled: d.razorpayEnabled ?? true,
        paypalEnabled: d.paypalEnabled ?? false,
        razorpayKeyId: d.razorpayKeyId ?? "",
        paypalClientId: d.paypalClientId ?? "",
      }))
      .catch(() => {});
  }, []);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isValid },
  } = useForm<FormData>({
    resolver: zodResolver(addressSchema),
    mode: "onChange",
  });

  const subtotal = discountedTotal();
  const shippingCost = calcShipping(shippingConfig, subtotal);
  const orderTotal = subtotal + shippingCost;

  if (!authChecked || navigating) return null;

  if (items.length === 0) {
    router.replace("/cart");
    return null;
  }

  const validateBilling = (): boolean => {
    if (billingSameAsShipping) return true;
    const errs: Record<string, string> = {};
    if (!billingFields.fullName.trim()) errs.fullName = "Name required";
    if (!billingFields.line1.trim() || billingFields.line1.trim().length < 3) errs.line1 = "Address required";
    if (!billingFields.city.trim() || billingFields.city.trim().length < 2) errs.city = "City required";
    if (!billingFields.state) errs.state = "State required";
    if (!billingFields.postcode.trim() || billingFields.postcode.trim().length < 4) errs.postcode = "Postcode required";
    setBillingErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const lockShipping = handleSubmit((data) => {
    if (!validateBilling()) return;

    const shipping: ShippingAddress = {
      fullName: data.fullName,
      line1: data.line1,
      line2: data.line2,
      city: data.city,
      state: data.state,
      postcode: data.postcode,
      country: "AU",
      phone: data.phone,
    };

    const billing: BillingAddress | undefined = billingSameAsShipping
      ? undefined
      : {
          fullName: billingFields.fullName,
          line1: billingFields.line1,
          line2: billingFields.line2 || undefined,
          city: billingFields.city,
          state: billingFields.state,
          postcode: billingFields.postcode,
        };

    setLockedAddress(shipping);
    setLockedBilling(billing);
    setShippingLocked(true);
  });

  const selectClass =
    "w-full border border-brand-contrast/20 px-3 py-2.5 text-sm font-body text-brand-navy bg-white focus:outline-none focus:border-brand-blue";
  const fieldClass =
    "w-full border border-brand-contrast/20 px-3 py-2.5 text-sm font-body text-brand-navy bg-white focus:outline-none focus:border-brand-blue";

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="font-heading font-bold text-3xl text-brand-navy mb-2">Checkout</h1>
      <p className="text-xs font-body text-brand-contrast mb-8 flex items-center gap-1">
        🇦🇺 Shipping within Australia only
      </p>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
        {/* Left: Shipping + Billing form */}
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
              label="City / Suburb"
              id="city"
              {...register("city")}
              error={errors.city?.message}
              disabled={shippingLocked}
            />
            <div>
              <label className="block text-xs font-heading font-bold uppercase tracking-wider text-brand-navy mb-1.5">
                State *
              </label>
              <select
                {...register("state")}
                disabled={shippingLocked}
                className={`${selectClass} ${errors.state ? "border-red-400" : ""} disabled:opacity-60`}
              >
                <option value="">State</option>
                {AU_STATES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.value}
                  </option>
                ))}
              </select>
              {errors.state && (
                <p className="text-xs text-red-500 mt-1 font-body">{errors.state.message}</p>
              )}
            </div>
            <Input
              label="Postcode"
              id="postcode"
              {...register("postcode")}
              error={errors.postcode?.message}
              disabled={shippingLocked}
            />
          </div>

          <div className="flex items-center gap-2 text-xs font-body text-brand-contrast border border-brand-contrast/10 bg-[#F8F9FC] px-3 py-2.5">
            🇦🇺 <span>Country: <strong>Australia</strong></span>
          </div>

          {/* ── Billing Address ─────────────────────────────── */}
          <div className="pt-4 border-t border-brand-contrast/10">
            <h2 className="font-heading font-bold text-sm uppercase tracking-widest text-brand-navy mb-4">
              Billing Address
            </h2>

            {!shippingLocked && (
              <label className="flex items-center gap-2.5 cursor-pointer mb-4 select-none">
                <div
                  onClick={() => setBillingSameAsShipping((v) => !v)}
                  className={`w-5 h-5 border-2 flex items-center justify-center flex-shrink-0 transition-colors cursor-pointer ${
                    billingSameAsShipping
                      ? "bg-brand-navy border-brand-navy"
                      : "border-brand-contrast/40 bg-white"
                  }`}
                >
                  {billingSameAsShipping && <Check size={12} className="text-white" strokeWidth={3} />}
                </div>
                <span className="text-sm font-body text-brand-navy">Same as shipping address</span>
              </label>
            )}

            {shippingLocked && lockedBilling === undefined && (
              <p className="text-sm font-body text-brand-contrast/70 italic mb-2">Same as shipping address</p>
            )}

            {!billingSameAsShipping && !shippingLocked && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-heading font-bold uppercase tracking-wider text-brand-navy mb-1.5">Full Name *</label>
                  <input
                    value={billingFields.fullName}
                    onChange={(e) => setBillingFields((f) => ({ ...f, fullName: e.target.value }))}
                    className={`${fieldClass} ${billingErrors.fullName ? "border-red-400" : ""}`}
                    placeholder="Cardholder name"
                  />
                  {billingErrors.fullName && <p className="text-xs text-red-500 mt-1 font-body">{billingErrors.fullName}</p>}
                </div>
                <div>
                  <label className="block text-xs font-heading font-bold uppercase tracking-wider text-brand-navy mb-1.5">Address Line 1 *</label>
                  <input
                    value={billingFields.line1}
                    onChange={(e) => setBillingFields((f) => ({ ...f, line1: e.target.value }))}
                    className={`${fieldClass} ${billingErrors.line1 ? "border-red-400" : ""}`}
                    placeholder="Street address"
                  />
                  {billingErrors.line1 && <p className="text-xs text-red-500 mt-1 font-body">{billingErrors.line1}</p>}
                </div>
                <div>
                  <label className="block text-xs font-heading font-bold uppercase tracking-wider text-brand-navy mb-1.5">Address Line 2 (optional)</label>
                  <input
                    value={billingFields.line2}
                    onChange={(e) => setBillingFields((f) => ({ ...f, line2: e.target.value }))}
                    className={fieldClass}
                    placeholder="Apt, suite, unit..."
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-heading font-bold uppercase tracking-wider text-brand-navy mb-1.5">City *</label>
                    <input
                      value={billingFields.city}
                      onChange={(e) => setBillingFields((f) => ({ ...f, city: e.target.value }))}
                      className={`${fieldClass} ${billingErrors.city ? "border-red-400" : ""}`}
                      placeholder="City"
                    />
                    {billingErrors.city && <p className="text-xs text-red-500 mt-1 font-body">{billingErrors.city}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-heading font-bold uppercase tracking-wider text-brand-navy mb-1.5">State *</label>
                    <select
                      value={billingFields.state}
                      onChange={(e) => setBillingFields((f) => ({ ...f, state: e.target.value }))}
                      className={`${selectClass} ${billingErrors.state ? "border-red-400" : ""}`}
                    >
                      <option value="">State</option>
                      {AU_STATES.map((s) => (
                        <option key={s.value} value={s.value}>{s.value}</option>
                      ))}
                    </select>
                    {billingErrors.state && <p className="text-xs text-red-500 mt-1 font-body">{billingErrors.state}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-heading font-bold uppercase tracking-wider text-brand-navy mb-1.5">Postcode *</label>
                    <input
                      value={billingFields.postcode}
                      onChange={(e) => setBillingFields((f) => ({ ...f, postcode: e.target.value }))}
                      className={`${fieldClass} ${billingErrors.postcode ? "border-red-400" : ""}`}
                      placeholder="0000"
                    />
                    {billingErrors.postcode && <p className="text-xs text-red-500 mt-1 font-body">{billingErrors.postcode}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs font-body text-brand-contrast border border-brand-contrast/10 bg-[#F8F9FC] px-3 py-2.5">
                  🇦🇺 <span>Country: <strong>Australia</strong></span>
                </div>
              </div>
            )}

            {shippingLocked && lockedBilling && (
              <div className="text-sm font-body text-brand-contrast/80 space-y-0.5">
                <p className="font-bold text-brand-navy">{lockedBilling.fullName}</p>
                <p>{lockedBilling.line1}{lockedBilling.line2 ? `, ${lockedBilling.line2}` : ""}</p>
                <p>{lockedBilling.city} {lockedBilling.state} {lockedBilling.postcode}</p>
                <p>Australia</p>
              </div>
            )}
          </div>

          {!shippingLocked && (
            <button
              onClick={lockShipping}
              disabled={!isValid}
              className="w-full mt-2 bg-brand-accent text-brand-navy rounded py-3 text-xs font-heading font-bold uppercase tracking-widest hover:bg-brand-accent/85 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

        {/* Right: Summary + Payment */}
        <div className="md:col-span-2 space-y-4">
          <div className="border border-brand-contrast/20 bg-brand-white p-5 space-y-3">
            <h3 className="font-heading font-bold text-xs uppercase tracking-widest text-brand-navy">
              Order Summary
            </h3>
            <ul className="divide-y divide-brand-contrast/10 text-sm font-body">
              {items.map((item) => (
                <li key={item.id} className="flex justify-between py-2">
                  <span className="text-brand-navy">{item.name} × {item.quantity}</span>
                  <span className="font-bold text-brand-navy">{formatPrice(item.price * item.quantity)}</span>
                </li>
              ))}
            </ul>
            <div className="border-t border-brand-contrast/20 pt-3 space-y-1 text-sm font-body">
              {(coupon || giftCard) && (
                <div className="flex justify-between text-green-600 text-xs font-heading font-bold">
                  <span>Discount applied</span>
                  <span>−{formatPrice(useCartStore.getState().discount())}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-brand-contrast">Subtotal (after discount)</span>
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

          {shippingLocked && lockedAddress && (
            <div>
              <p className="text-xs font-heading font-bold uppercase tracking-widest text-brand-navy mb-3">
                Payment
              </p>
              <div className="space-y-3">
                {paymentSettings.razorpayEnabled && (
                  <RazorpaySection
                    items={items}
                    lockedAddress={lockedAddress}
                    billingAddress={lockedBilling}
                    email={getValues("email")}
                    orderTotal={orderTotal}
                    onSuccess={(orderNumber) => { setNavigating(true); clearCart(); router.push(`/order-confirmation/${orderNumber}`); }}
                  />
                )}
                {paymentSettings.razorpayEnabled && paymentSettings.paypalEnabled && (
                  <div className="flex items-center gap-3 my-1">
                    <div className="flex-1 h-px bg-brand-contrast/20" />
                    <span className="text-[11px] text-brand-contrast/50 font-body uppercase tracking-widest">or</span>
                    <div className="flex-1 h-px bg-brand-contrast/20" />
                  </div>
                )}
                {paymentSettings.paypalEnabled && (
                  <PayPalSection
                    items={items}
                    lockedAddress={lockedAddress}
                    billingAddress={lockedBilling}
                    email={getValues("email")}
                    orderTotal={orderTotal}
                    clientId={paymentSettings.paypalClientId}
                    onSuccess={(orderNumber) => { setNavigating(true); clearCart(); router.push(`/order-confirmation/${orderNumber}`); }}
                  />
                )}
                {!paymentSettings.razorpayEnabled && !paymentSettings.paypalEnabled && (
                  <p className="text-sm text-brand-contrast font-body text-center py-4">
                    No payment method is currently enabled. Please contact support.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
