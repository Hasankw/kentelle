"use client";

import { useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";
import QuizAdminTabs from "@/components/admin/QuizAdminTabs";
import { toast } from "@/components/ui/Toast";

type Settings = {
  coreCleanserId: string | null;
  coreTonerId: string | null;
  coreTreatmentId: string | null;
  coreMoisturiserId: string | null;
  maxTreatments: number;
};

type ProductLite = { id: string; name: string; slug: string };

export default function QuizSettingsAdminPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [products, setProducts] = useState<ProductLite[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/quiz/settings").then((r) => r.json()),
      fetch("/api/admin/quiz/products").then((r) => r.json()),
    ])
      .then(([s, p]) => {
        setSettings(s);
        setProducts(p.map((x: any) => ({ id: x.id, name: x.name, slug: x.slug })));
      })
      .catch(() => toast("error", "Failed to load settings"));
  }, []);

  const update = (patch: Partial<Settings>) => setSettings((prev) => (prev ? { ...prev, ...patch } : prev));

  const save = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/quiz/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error();
      toast("success", "Settings saved");
    } catch {
      toast("error", "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminShell>
      <div className="p-8">
        <QuizAdminTabs />

        <h1 className="font-heading font-bold text-2xl text-brand-navy mb-1">Quiz Settings</h1>
        <p className="font-body text-sm text-brand-contrast mb-6 max-w-2xl">
          The four core products are automatically added to <strong>every</strong> computed routine, regardless of the
          user&apos;s answers — they form the baseline Cleanser → Toner/Mist → Treatment → Moisturiser anchor the engine
          builds on top of.
        </p>

        {!settings ? (
          <div className="flex items-center gap-2 text-brand-contrast font-body text-sm py-10">
            <Loader2 size={16} className="animate-spin" /> Loading settings…
          </div>
        ) : (
          <div className="bg-white border border-brand-contrast/10 rounded p-6 max-w-xl space-y-4">
            <ProductPicker
              label="Core Cleanser"
              value={settings.coreCleanserId}
              products={products}
              onChange={(v) => update({ coreCleanserId: v })}
            />
            <ProductPicker
              label="Core Toner / Mist"
              value={settings.coreTonerId}
              products={products}
              onChange={(v) => update({ coreTonerId: v })}
            />
            <ProductPicker
              label="Core Treatment"
              value={settings.coreTreatmentId}
              products={products}
              onChange={(v) => update({ coreTreatmentId: v })}
            />
            <ProductPicker
              label="Core Moisturiser"
              value={settings.coreMoisturiserId}
              products={products}
              onChange={(v) => update({ coreMoisturiserId: v })}
            />

            <div>
              <p className="font-heading text-[10px] font-bold uppercase tracking-widest text-brand-contrast mb-1">
                Max Treatment Products
              </p>
              <p className="font-body text-xs text-brand-contrast/80 mb-2">
                Caps how many "Treatments" step products can stack in one routine before the lowest-priority ones are
                folded out, so users aren't prescribed too many active ingredients at once.
              </p>
              <input
                type="number"
                min={1}
                max={20}
                value={settings.maxTreatments}
                onChange={(e) => update({ maxTreatments: parseInt(e.target.value, 10) || 1 })}
                className="w-24 px-2.5 py-2 text-xs border border-brand-contrast/20 rounded font-body text-brand-navy focus:border-brand-navy outline-none"
              />
            </div>

            <button
              onClick={save}
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-[11px] font-heading font-bold uppercase tracking-widest rounded bg-brand-navy text-white hover:bg-brand-blue transition-colors disabled:opacity-50"
            >
              <Save size={12} /> {saving ? "Saving…" : "Save Settings"}
            </button>
          </div>
        )}
      </div>
    </AdminShell>
  );
}

function ProductPicker({
  label,
  value,
  products,
  onChange,
}: {
  label: string;
  value: string | null;
  products: ProductLite[];
  onChange: (v: string | null) => void;
}) {
  return (
    <div>
      <p className="font-heading text-[10px] font-bold uppercase tracking-widest text-brand-contrast mb-1">{label}</p>
      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value || null)}
        className="w-full px-2.5 py-2 text-xs border border-brand-contrast/20 rounded font-body text-brand-navy focus:border-brand-navy outline-none"
      >
        <option value="">— none —</option>
        {products.map((p) => (
          <option key={p.id} value={p.id}>{p.name}</option>
        ))}
      </select>
    </div>
  );
}
