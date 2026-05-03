"use client";

import { useState, useTransition } from "react";

export default function SettingsForm({ settings }: { settings: Record<string, string> }) {
  const [form, setForm] = useState({
    announcement_text: settings.announcement_text ?? "",
    announcement_enabled: settings.announcement_enabled === "true",
    free_shipping_threshold: settings.free_shipping_threshold ?? "80",
    shipping_type: settings.shipping_type ?? "threshold",
    shipping_rate: settings.shipping_rate ?? "9.95",
    footer_email: settings.footer_email ?? "",
    footer_phone: settings.footer_phone ?? "",
  });
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          announcement_enabled: String(form.announcement_enabled),
        }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    });
  };

  const fieldClass =
    "w-full border border-brand-contrast/20 px-3 py-2.5 text-sm font-body text-brand-navy bg-white focus:outline-none focus:border-brand-blue";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Announcement */}
      <div>
        <h2 className="font-heading font-bold text-sm uppercase tracking-wider text-brand-navy mb-4">
          Announcement Bar
        </h2>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="ann_enabled"
              checked={form.announcement_enabled}
              onChange={(e) => setForm((f) => ({ ...f, announcement_enabled: e.target.checked }))}
              className="accent-brand-blue w-4 h-4"
            />
            <label htmlFor="ann_enabled" className="text-sm font-body text-brand-navy">
              Show announcement bar
            </label>
          </div>
          <div>
            <label className="block text-xs font-heading font-bold uppercase tracking-wider text-brand-navy mb-1.5">
              Announcement Text
            </label>
            <input
              value={form.announcement_text}
              onChange={(e) => setForm((f) => ({ ...f, announcement_text: e.target.value }))}
              className={fieldClass}
            />
          </div>
        </div>
      </div>

      {/* Shipping */}
      <div>
        <h2 className="font-heading font-bold text-sm uppercase tracking-wider text-brand-navy mb-4">
          Shipping (Australia Only)
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-heading font-bold uppercase tracking-wider text-brand-navy mb-1.5">
              Shipping Type
            </label>
            <select
              value={form.shipping_type}
              onChange={(e) => setForm((f) => ({ ...f, shipping_type: e.target.value }))}
              className={`${fieldClass} max-w-xs`}
            >
              <option value="threshold">Free above threshold, otherwise flat rate</option>
              <option value="fixed">Fixed rate always</option>
              <option value="free">Always free</option>
            </select>
          </div>

          {(form.shipping_type === "threshold" || form.shipping_type === "fixed") && (
            <div>
              <label className="block text-xs font-heading font-bold uppercase tracking-wider text-brand-navy mb-1.5">
                Shipping Rate (AUD)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.shipping_rate}
                onChange={(e) => setForm((f) => ({ ...f, shipping_rate: e.target.value }))}
                className={`${fieldClass} max-w-[160px]`}
              />
            </div>
          )}

          {form.shipping_type === "threshold" && (
            <div>
              <label className="block text-xs font-heading font-bold uppercase tracking-wider text-brand-navy mb-1.5">
                Free Shipping Threshold (AUD)
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={form.free_shipping_threshold}
                onChange={(e) => setForm((f) => ({ ...f, free_shipping_threshold: e.target.value }))}
                className={`${fieldClass} max-w-[160px]`}
              />
            </div>
          )}
        </div>
      </div>

      {/* Contact */}
      <div>
        <h2 className="font-heading font-bold text-sm uppercase tracking-wider text-brand-navy mb-4">
          Contact Details
        </h2>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-heading font-bold uppercase tracking-wider text-brand-navy mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={form.footer_email}
              onChange={(e) => setForm((f) => ({ ...f, footer_email: e.target.value }))}
              className={fieldClass}
            />
          </div>
          <div>
            <label className="block text-xs font-heading font-bold uppercase tracking-wider text-brand-navy mb-1.5">
              Phone
            </label>
            <input
              value={form.footer_phone}
              onChange={(e) => setForm((f) => ({ ...f, footer_phone: e.target.value }))}
              className={fieldClass}
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="px-6 py-2.5 bg-brand-navy text-brand-white rounded text-xs font-heading font-bold uppercase tracking-widest hover:bg-brand-blue transition-colors disabled:opacity-50"
      >
        {isPending ? "Saving..." : saved ? "Saved!" : "Save Settings"}
      </button>
    </form>
  );
}
