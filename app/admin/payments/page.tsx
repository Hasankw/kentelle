"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CreditCard, Check, Eye, EyeOff, Link2, ToggleLeft, ToggleRight } from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";

type Settings = {
  razorpay_enabled: boolean;
  paypal_enabled: boolean;
  razorpay_key_id: string;
  razorpay_key_secret: string;
  paypal_client_id: string;
  paypal_secret: string;
};

const DEFAULTS: Settings = {
  razorpay_enabled: true,
  paypal_enabled: false,
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

function Toggle({ enabled, onToggle, disabled }: { enabled: boolean; onToggle: () => void; disabled: boolean }) {
  return (
    <button
      onClick={onToggle}
      disabled={disabled}
      aria-label={enabled ? "Disable" : "Enable"}
      className={`flex items-center gap-2 text-xs font-heading font-bold uppercase tracking-wider transition-colors disabled:opacity-50 ${
        enabled ? "text-green-600" : "text-brand-contrast"
      }`}
    >
      {enabled ? (
        <ToggleRight size={28} className="text-green-500" />
      ) : (
        <ToggleLeft size={28} className="text-brand-contrast/40" />
      )}
      {enabled ? "Enabled" : "Disabled"}
    </button>
  );
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
        setSettings({
          ...DEFAULTS,
          ...data,
          razorpay_enabled: data.razorpay_enabled === "true" || data.razorpay_enabled === true,
          paypal_enabled: data.paypal_enabled === "true" || data.paypal_enabled === true,
        });
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
      body: JSON.stringify({
        ...next,
        razorpay_enabled: String(next.razorpay_enabled),
        paypal_enabled: String(next.paypal_enabled),
      }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const fieldClass =
    "w-full border border-brand-contrast/20 px-3 py-2.5 text-sm font-body text-brand-navy bg-white focus:outline-none focus:border-brand-accent";

  if (loading) {
    return (
      <AdminShell>
        <div className="p-8">
          <p className="text-sm font-body text-brand-contrast">Loading...</p>
        </div>
      </AdminShell>
    );
  }

  const activeCount = [settings.razorpay_enabled, settings.paypal_enabled].filter(Boolean).length;

  return (
    <AdminShell>
      <div className="p-8 max-w-3xl">
        <div className="flex items-center gap-3 mb-2">
          <CreditCard size={22} className="text-brand-navy" />
          <h1 className="font-heading font-bold text-2xl text-brand-navy">Payment Portals</h1>
        </div>
        <p className="text-sm font-body text-brand-contrast mb-2">
          Enable one or both payment portals. Both can be active simultaneously at checkout.
        </p>
        <p className="text-xs font-body text-brand-contrast/60 mb-8">
          {activeCount === 0
            ? "⚠ No portals enabled — customers cannot pay."
            : activeCount === 2
            ? "Both portals active — customers choose at checkout."
            : settings.razorpay_enabled
            ? "Razorpay only — customers pay with card/UPI."
            : "PayPal only — customers pay with PayPal."}
        </p>

        {saved && (
          <div className="mb-6 flex items-center gap-2 px-4 py-3 bg-green-50 border border-green-200 text-green-700 text-sm font-body">
            <Check size={16} />
            Settings saved successfully.
          </div>
        )}

        {/* ── Razorpay ─────────────────────────────────────── */}
        <div className={`border-2 rounded-none mb-6 ${settings.razorpay_enabled ? "border-green-400" : "border-brand-contrast/20"}`}>
          <div className="flex items-center justify-between px-6 py-4 border-b border-brand-contrast/10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-brand-navy flex items-center justify-center">
                <span className="text-white font-bold text-xs">Rz</span>
              </div>
              <div>
                <p className="font-heading font-bold text-sm text-brand-navy">Razorpay</p>
                <p className="text-xs text-brand-contrast font-body">Card / UPI / Net Banking (INR)</p>
              </div>
            </div>
            <Toggle
              enabled={settings.razorpay_enabled}
              disabled={saving}
              onToggle={() => save({ razorpay_enabled: !settings.razorpay_enabled })}
            />
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
              className="px-5 py-2 bg-brand-navy text-white rounded text-xs font-heading font-bold uppercase tracking-widest hover:opacity-80 transition-opacity disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Razorpay Keys"}
            </button>
          </div>
        </div>

        {/* ── PayPal ───────────────────────────────────────── */}
        <div className={`border-2 rounded-none mb-6 ${settings.paypal_enabled ? "border-green-400" : "border-brand-contrast/20"}`}>
          <div className="flex items-center justify-between px-6 py-4 border-b border-brand-contrast/10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#003087] flex items-center justify-center">
                <span className="text-white font-bold text-xs">PP</span>
              </div>
              <div>
                <p className="font-heading font-bold text-sm text-brand-navy">PayPal</p>
                <p className="text-xs text-brand-contrast font-body">PayPal / Debit / Credit (AUD live)</p>
              </div>
            </div>
            <Toggle
              enabled={settings.paypal_enabled}
              disabled={saving}
              onToggle={() => save({ paypal_enabled: !settings.paypal_enabled })}
            />
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
                className="px-5 py-2 bg-brand-navy text-white rounded text-xs font-heading font-bold uppercase tracking-widest hover:opacity-80 transition-opacity disabled:opacity-50"
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
          </div>
        </div>

        <div className="bg-brand-pink/20 border border-brand-pink/40 px-4 py-3 text-xs font-body text-brand-navy rounded">
          <strong>Tip:</strong> You can enable both portals at the same time. Customers will see both options at checkout and choose which to use.
        </div>
      </div>
    </AdminShell>
  );
}
