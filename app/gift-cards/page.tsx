"use client";

import { useState } from "react";
import { Gift, Check } from "lucide-react";
import { formatPrice } from "@/lib/utils";

const PRESET_AMOUNTS = [100, 200, 300];

declare global {
  interface Window { Razorpay: any; }
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return; }
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

export default function GiftCardsPage() {
  const [amount, setAmount] = useState<number>(100);
  const [customAmount, setCustomAmount] = useState("");
  const [useCustom, setUseCustom] = useState(false);

  const [recipientEmail, setRecipientEmail] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [senderName, setSenderName] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [message, setMessage] = useState("");

  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<{ code: string; amount: number } | null>(null);

  const finalAmount = useCustom ? parseFloat(customAmount) || 0 : amount;

  const isFormValid =
    finalAmount >= 10 &&
    recipientEmail.includes("@") &&
    senderName.trim().length > 0 &&
    senderEmail.includes("@");

  const fieldClass =
    "w-full border border-brand-contrast/20 px-3 py-2.5 text-sm font-body text-brand-navy bg-white focus:outline-none focus:border-brand-blue";

  const handlePay = async () => {
    if (!isFormValid) return;
    setPaying(true);
    setError("");

    const loaded = await loadRazorpayScript();
    if (!loaded) {
      setError("Could not load payment gateway. Check your internet connection.");
      setPaying(false);
      return;
    }

    const res = await fetch("/api/gift-cards/razorpay-create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: finalAmount }),
    });
    const order = await res.json();
    if (!res.ok) { setError(order.error ?? "Failed to initiate payment"); setPaying(false); return; }

    const rzp = new window.Razorpay({
      key: order.keyId,
      amount: order.amount,
      currency: order.currency,
      name: "Kentelle Gift Card",
      description: `Gift Card — ${formatPrice(finalAmount)}`,
      order_id: order.rzOrderId,
      prefill: { email: senderEmail, name: senderName },
      theme: { color: "#D4A5B5" },
      handler: async (response: any) => {
        setPaying(true);
        const capture = await fetch("/api/gift-cards/razorpay-capture", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            rzOrderId: response.razorpay_order_id,
            paymentId: response.razorpay_payment_id,
            signature: response.razorpay_signature,
            amount: finalAmount,
            recipientEmail,
            recipientName,
            senderEmail,
            senderName,
            message,
          }),
        });
        const result = await capture.json();
        setPaying(false);
        if (result.success) setSuccess({ code: result.code, amount: finalAmount });
        else setError(result.error ?? "Payment verification failed. Contact support.");
      },
      modal: { ondismiss: () => setPaying(false) },
    });

    rzp.open();
    setPaying(false);
  };

  if (success) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 bg-brand-accent/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check size={32} className="text-brand-navy" />
        </div>
        <h1 className="font-heading font-bold text-2xl text-brand-navy mb-2">Gift Card Sent!</h1>
        <p className="font-body text-sm text-brand-contrast mb-6">
          Your {formatPrice(success.amount)} gift card has been sent to {recipientEmail}.
        </p>
        <div className="bg-[#F8F9FC] border border-brand-contrast/10 p-6 mb-6">
          <p className="text-xs font-heading font-bold uppercase tracking-widest text-brand-contrast mb-3">
            Gift Card Code
          </p>
          <p className="font-mono font-bold text-2xl tracking-[6px] text-brand-navy">{success.code}</p>
          <p className="text-xs text-brand-contrast font-body mt-3">
            The recipient can redeem this at checkout.
          </p>
        </div>
        <button
          onClick={() => {
            setSuccess(null);
            setAmount(100);
            setRecipientEmail("");
            setRecipientName("");
            setSenderName("");
            setSenderEmail("");
            setMessage("");
          }}
          className="text-sm text-brand-blue underline underline-offset-2 font-body"
        >
          Send another gift card
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <div className="text-center mb-10">
        <div className="w-14 h-14 bg-brand-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Gift size={28} className="text-brand-navy" />
        </div>
        <h1 className="font-heading font-bold text-3xl text-brand-navy mb-2">Gift Cards</h1>
        <p className="font-body text-sm text-brand-contrast">
          Give the gift of beautiful skin. Delivered instantly by email.
        </p>
      </div>

      <div className="space-y-8">
        {/* Amount */}
        <div>
          <h2 className="font-heading font-bold text-xs uppercase tracking-widest text-brand-navy mb-4">
            1. Select Amount
          </h2>
          <div className="grid grid-cols-3 gap-3 mb-3">
            {PRESET_AMOUNTS.map((a) => (
              <button
                key={a}
                onClick={() => { setAmount(a); setUseCustom(false); }}
                className={`py-3 border text-sm font-heading font-bold transition-colors ${
                  !useCustom && amount === a
                    ? "border-brand-navy bg-brand-navy text-brand-white rounded"
                    : "border-brand-contrast/30 text-brand-navy hover:border-brand-navy"
                }`}
              >
                {formatPrice(a)}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setUseCustom(true)}
              className={`py-2 px-4 border text-xs font-heading font-bold transition-colors ${
                useCustom
                  ? "border-brand-navy bg-brand-navy text-brand-white rounded"
                  : "border-brand-contrast/30 text-brand-navy hover:border-brand-navy"
              }`}
            >
              Custom Amount
            </button>
            {useCustom && (
              <div className="flex items-center border border-brand-contrast/30 focus-within:border-brand-navy transition-colors">
                <span className="pl-3 text-sm font-body text-brand-contrast">$</span>
                <input
                  type="number"
                  min="10"
                  step="1"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="w-28 px-2 py-2.5 text-sm font-body text-brand-navy bg-transparent focus:outline-none"
                  placeholder="50"
                  autoFocus
                />
                <span className="pr-3 text-xs text-brand-contrast font-body">AUD</span>
              </div>
            )}
          </div>
          {useCustom && parseFloat(customAmount) > 0 && parseFloat(customAmount) < 10 && (
            <p className="text-xs text-red-500 font-body mt-1">Minimum is $10</p>
          )}
        </div>

        {/* Recipient */}
        <div>
          <h2 className="font-heading font-bold text-xs uppercase tracking-widest text-brand-navy mb-4">
            2. Recipient Details
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-heading font-bold uppercase tracking-wider text-brand-navy mb-1.5">
                Recipient Name
              </label>
              <input value={recipientName} onChange={(e) => setRecipientName(e.target.value)} className={fieldClass} placeholder="Jane Doe" />
            </div>
            <div>
              <label className="block text-xs font-heading font-bold uppercase tracking-wider text-brand-navy mb-1.5">
                Recipient Email *
              </label>
              <input type="email" required value={recipientEmail} onChange={(e) => setRecipientEmail(e.target.value)} className={fieldClass} placeholder="jane@example.com" />
            </div>
          </div>
        </div>

        {/* Sender */}
        <div>
          <h2 className="font-heading font-bold text-xs uppercase tracking-widest text-brand-navy mb-4">
            3. From
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-heading font-bold uppercase tracking-wider text-brand-navy mb-1.5">
                Your Name *
              </label>
              <input required value={senderName} onChange={(e) => setSenderName(e.target.value)} className={fieldClass} placeholder="John Doe" />
            </div>
            <div>
              <label className="block text-xs font-heading font-bold uppercase tracking-wider text-brand-navy mb-1.5">
                Your Email *
              </label>
              <input type="email" required value={senderEmail} onChange={(e) => setSenderEmail(e.target.value)} className={fieldClass} placeholder="john@example.com" />
            </div>
          </div>
        </div>

        {/* Message */}
        <div>
          <label className="block text-xs font-heading font-bold uppercase tracking-wider text-brand-navy mb-1.5">
            Personal Message (optional)
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            maxLength={300}
            className="w-full border border-brand-contrast/20 px-3 py-2.5 text-sm font-body text-brand-navy bg-white focus:outline-none focus:border-brand-blue resize-none"
            placeholder="Wishing you glowing skin! ✨"
          />
          <p className="text-xs text-brand-contrast/60 font-body mt-1">{message.length}/300</p>
        </div>

        {/* Summary + Pay */}
        <div className="border border-brand-contrast/20 bg-[#F8F9FC] p-5 space-y-4">
          <h3 className="font-heading font-bold text-xs uppercase tracking-widest text-brand-navy">
            4. Review & Pay
          </h3>
          <div className="text-sm font-body space-y-1">
            <div className="flex justify-between">
              <span className="text-brand-contrast">Gift Card Value</span>
              <span className="font-bold text-brand-navy">{finalAmount >= 10 ? formatPrice(finalAmount) : "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-brand-contrast">To</span>
              <span className="text-brand-navy">{recipientName || recipientEmail || "—"}</span>
            </div>
          </div>

          {error && <p className="text-xs text-red-500 font-body">{error}</p>}

          <button
            onClick={handlePay}
            disabled={!isFormValid || paying}
            className="w-full bg-brand-navy text-brand-white rounded py-3.5 text-sm font-heading font-bold uppercase tracking-widest hover:bg-brand-blue transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {paying ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Processing...
              </>
            ) : (
              `Pay ${finalAmount >= 10 ? formatPrice(finalAmount) : ""} — Send Gift Card`
            )}
          </button>

          {!isFormValid && (
            <p className="text-center text-xs text-brand-contrast/60 font-body">
              {finalAmount < 10 ? "Enter a valid amount (min $10)" : "Fill in all required fields (*) above"}
            </p>
          )}

          <p className="text-center text-[11px] text-brand-contrast/60 font-body">
            Secured by Razorpay
          </p>
        </div>
      </div>
    </div>
  );
}
