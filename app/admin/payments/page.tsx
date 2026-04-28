"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CreditCard, Check, Eye, EyeOff, Link2 } from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";

type Settings = {
  payment_portal: string;
  razorpay_key_id: string;
  razorpay_key_secret: string;
  paypal_client_id: string;
  paypal_secret: string;
};

const DEFAULTS: Settings = {
  payment_portal: "razorpay",
  razorpay_key_id: "",
  razorpay_key_secret: "",
  paypal_client_id: "",
  paypal_secret: "",
};

function PayPalStatus() {
  const searchParams = useSearchParams();
  const paypalConnected = searchParams.get("paypal_connected");
  const paypalError = searchParams.get("paypal_error");

  if (paypalConnected) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 text-green-700 text-xs font-body">
        <Check size={14} /> Connected as: <strong>{paypalConnected}</strong>
      </div>
    );
  }
  if (paypalError) {
    return (
      <div className="px-3 py-2 bg-red-50 border border-red-200 text-red-600 text-xs font-body">
        PayPal connection failed:{" "}
        {paypalError === "access_denied"
          ? "You declined the request."
          : "Token exchange error. Check your Client ID and Secret."}
      </div>
    );
  }
  return null;
}

export default function AdminPaymentsPage() {
  const [settings, setSettings] = useState<Settings>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showRzSecret, setShowRzSecret] = useState(false);
  const [showPpSecret, setShowPpSecret] = useState(false);

  useEffect(() => {
    fetch("/api/admin/payments")
      .then((r) => r.json())
      .then((data) => {
        setSettings({ ...DEFAULTS, ...data });
        setLoading(false);
      });
  }, []);

  const save = async (patch: Partial<Settings>) => {
    setSaving(true);
    const next = { ...settings, ...patch };
    setSettings(next);
    await fetch("/api/admin/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(next),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const activate = (portal: string) => save({ payment_portal: portal });

  const fieldClass =
    "w-full border border-brand-contrast/20 px-3 py-2.5 text-sm font-body text-brand-navy bg-white focus:outline-none focus:border-brand-blue";

  const isRzActive = settings.payment_portal === "razorpay";
  const isPpActive = settings.payment_portal === "paypal";

  if (loading) {
    return (
      <AdminShell>
        <div className="p-8">
          <p className="text-sm font-body text-brand-contrast">Loading...</p>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <div className="p-8 max-w-3xl">
        <div className="flex items-center gap-3 mb-2">
          <CreditCard size={22} className="text-brand-navy" />
          <h1 className="font-heading font-bold text-2xl text-brand-navy">Payment Portals</h1>
        </div>
        <p className="text-sm font-body text-brand-contrast mb-8">
          Activate one payment portal at a time. Keys are stored securely in the database.
        </p>

        {saved && (
          <div className="mb-6 flex items-center gap-2 px-4 py-3 bg-green-50 border border-green-200 text-green-700 text-sm font-body">
            <Check size={16} />
            Settings saved successfully.
          </div>
        )}

        {/* ── Razorpay ─────────────────────────────────────── */}
        <div className={`border-2 rounded-none mb-6 ${isRzActive ? "border-brand-accent" : "border-brand-contrast/20"}`}>
          <div className="flex items-center justify-between px-6 py-4 border-b border-brand-contrast/10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#072654] flex items-center justify-center">
                <span className="text-white font-bold text-xs">Rz</span>
              </div>
              <div>
                <p className="font-heading font-bold text-sm text-brand-navy">Razorpay</p>
                <p className="text-xs text-brand-contrast font-body">Recommended for testing (INR)</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {isRzActive ? (
                <span className="flex items-center gap-1.5 px-3 py-1 bg-brand-accent/20 text-brand-navy text-xs font-heading font-bold uppercase tracking-wider">
                  <Check size={12} /> Active
                </span>
              ) : (
                <button
                  onClick={() => activate("razorpay")}
                  disabled={saving}
                  className="px-4 py-1.5 border border-brand-navy text-brand-navy text-xs font-heading font-bold uppercase tracking-wider hover:bg-brand-navy hover:text-white transition-colors disabled:opacity-50"
                >
                  Activate
                </button>
              )}
            </div>
          </div>

          <div className="px-6 py-5 space-y-4">
            <div>
              <label className="block text-xs font-heading font-bold uppercase tracking-wider text-brand-navy mb-1.5">
                API Key ID (Public)
              </label>
              <input
                value={settings.razorpay_key_id}
                onChange={(e) => setSettings((s) => ({ ...s, razorpay_key_id: e.target.value }))}
                className={fieldClass}
                placeholder="rzp_test_xxxxxxxxxx"
              />
            </div>
            <div>
              <label className="block text-xs font-heading font-bold uppercase tracking-wider text-brand-navy mb-1.5">
                Key Secret
              </label>
              <div className="relative">
                <input
                  type={showRzSecret ? "text" : "password"}
                  value={settings.razorpay_key_secret}
                  onChange={(e) => setSettings((s) => ({ ...s, razorpay_key_secret: e.target.value }))}
                  className={`${fieldClass} pr-10`}
                  placeholder="Your Razorpay secret"
                />
                <button
                  type="button"
                  onClick={() => setShowRzSecret((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-contrast hover:text-brand-navy"
                >
                  {showRzSecret ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button
              onClick={() => save({ razorpay_key_id: settings.razorpay_key_id, razorpay_key_secret: settings.razorpay_key_secret })}
              disabled={saving}
              className="px-5 py-2 bg-brand-navy text-white text-xs font-heading font-bold uppercase tracking-widest hover:bg-brand-blue transition-colors disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Razorpay Keys"}
            </button>
          </div>
        </div>

        {/* ── PayPal ───────────────────────────────────────── */}
        <div className={`border-2 rounded-none mb-6 ${isPpActive ? "border-brand-accent" : "border-brand-contrast/20"}`}>
          <div className="flex items-center justify-between px-6 py-4 border-b border-brand-contrast/10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#003087] flex items-center justify-center">
                <span className="text-white font-bold text-xs">PP</span>
              </div>
              <div>
                <p className="font-heading font-bold text-sm text-brand-navy">PayPal</p>
                <p className="text-xs text-brand-contrast font-body">Use for live / AUD production</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {isPpActive ? (
                <span className="flex items-center gap-1.5 px-3 py-1 bg-brand-accent/20 text-brand-navy text-xs font-heading font-bold uppercase tracking-wider">
                  <Check size={12} /> Active
                </span>
              ) : (
                <button
                  onClick={() => activate("paypal")}
                  disabled={saving}
                  className="px-4 py-1.5 border border-brand-navy text-brand-navy text-xs font-heading font-bold uppercase tracking-wider hover:bg-brand-navy hover:text-white transition-colors disabled:opacity-50"
                >
                  Activate
                </button>
              )}
            </div>
          </div>

          <div className="px-6 py-5 space-y-4">
            <div>
              <label className="block text-xs font-heading font-bold uppercase tracking-wider text-brand-navy mb-1.5">
                Client ID (Public)
              </label>
              <input
                value={settings.paypal_client_id}
                onChange={(e) => setSettings((s) => ({ ...s, paypal_client_id: e.target.value }))}
                className={fieldClass}
                placeholder="AaBbCcDd... (from PayPal Developer Dashboard)"
              />
            </div>
            <div>
              <label className="block text-xs font-heading font-bold uppercase tracking-wider text-brand-navy mb-1.5">
                Client Secret
              </label>
              <div className="relative">
                <input
                  type={showPpSecret ? "text" : "password"}
                  value={settings.paypal_secret}
                  onChange={(e) => setSettings((s) => ({ ...s, paypal_secret: e.target.value }))}
                  className={`${fieldClass} pr-10`}
                  placeholder="Your PayPal secret"
                />
                <button
                  type="button"
                  onClick={() => setShowPpSecret((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-contrast hover:text-brand-navy"
                >
                  {showPpSecret ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={() => save({ paypal_client_id: settings.paypal_client_id, paypal_secret: settings.paypal_secret })}
                disabled={saving}
                className="px-5 py-2 bg-brand-navy text-white text-xs font-heading font-bold uppercase tracking-widest hover:bg-brand-blue transition-colors disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save PayPal Keys"}
              </button>
              {settings.paypal_client_id && settings.paypal_secret && (
                <a
                  href="/api/auth/paypal"
                  className="px-5 py-2 border-2 border-[#003087] text-[#003087] text-xs font-heading font-bold uppercase tracking-widest hover:bg-[#003087] hover:text-white transition-colors flex items-center gap-2"
                >
                  <Link2 size={13} />
                  Connect PayPal Account
                </a>
              )}
            </div>
            <Suspense fallback={null}>
              <PayPalStatus />
            </Suspense>
            {!settings.paypal_client_id && (
              <p className="text-xs text-brand-contrast/60 font-body">
                Save your Client ID and Secret first to enable the Connect button.
              </p>
            )}
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 px-4 py-3 text-xs font-body text-yellow-800">
          <strong>Note:</strong> Razorpay test mode processes in INR. Switch to PayPal when going live with AUD.
          Only one portal is active at a time — the active portal handles all checkout and gift card payments.
        </div>
      </div>
    </AdminShell>
  );
}
