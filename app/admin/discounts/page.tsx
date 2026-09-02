"use client";

import { useEffect, useState } from "react";
import { Check, Loader2, Plus, Trash2 } from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";
import { toast } from "@/components/ui/Toast";

type Tier = {
  id: string;
  label: string | null;
  threshold: number;
  percent: number;
  active: boolean;
  sortOrder: number;
  eligibleCategoryIds: string[];
};

type Settings = {
  enabled: boolean;
  combinableWithCoupons: boolean;
  freeShippingEligible: boolean;
};

type Category = { id: string; name: string };

export default function DiscountsAdminPage() {
  const [tiers, setTiers] = useState<Tier[] | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [savingId, setSavingId] = useState<string | null>(null);

  const load = () => {
    fetch("/api/admin/discount-tiers").then((r) => r.json()).then(setTiers).catch(() => toast("error", "Failed to load tiers"));
    fetch("/api/admin/discount-settings").then((r) => r.json()).then(setSettings).catch(() => toast("error", "Failed to load settings"));
    fetch("/api/admin/categories").then((r) => r.json()).then(setCategories).catch(() => {});
  };

  useEffect(load, []);

  const patchTier = async (id: string, data: Partial<Tier>) => {
    setTiers((prev) => prev!.map((t) => (t.id === id ? { ...t, ...data } : t)));
    setSavingId(id);
    try {
      await fetch("/api/admin/discount-tiers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...data }),
      });
    } catch {
      toast("error", "Failed to save tier");
    } finally {
      setSavingId(null);
    }
  };

  const addTier = async () => {
    const res = await fetch("/api/admin/discount-tiers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label: "New Tier", threshold: 0, percent: 0, active: true, sortOrder: tiers?.length ?? 0 }),
    });
    const tier = await res.json();
    setTiers((prev) => [...(prev ?? []), tier]);
  };

  const deleteTier = async (id: string) => {
    if (!confirm("Delete this discount tier?")) return;
    setTiers((prev) => prev!.filter((t) => t.id !== id));
    await fetch("/api/admin/discount-tiers", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
  };

  const patchSettings = async (data: Partial<Settings>) => {
    setSettings((prev) => ({ ...(prev as Settings), ...data }));
    try {
      await fetch("/api/admin/discount-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...settings, ...data }),
      });
    } catch {
      toast("error", "Failed to save settings");
    }
  };

  return (
    <AdminShell>
      <div className="p-8 max-w-4xl">
        <h1 className="font-heading font-bold text-2xl text-brand-navy mb-1">Automatic Basket Discount Tiers</h1>
        <p className="font-body text-sm text-brand-contrast mb-6 max-w-2xl">
          Spend-based discounts applied automatically — no coupon code required. Recalculates live whenever the
          customer adds, removes, or changes quantity. Leave <strong>Categories</strong> empty to measure a tier
          against the whole basket; select one or more categories to scope both the threshold and the discount to
          just those items. Changes here take effect immediately, no developer needed.
        </p>

        {!settings ? (
          <div className="flex items-center gap-2 text-brand-contrast font-body text-sm py-6">
            <Loader2 size={16} className="animate-spin" /> Loading…
          </div>
        ) : (
          <div className="bg-white border border-brand-contrast/10 rounded p-5 mb-8 space-y-3">
            <label className="flex items-center gap-2 text-sm font-body text-brand-navy cursor-pointer">
              <input type="checkbox" checked={settings.enabled} onChange={(e) => patchSettings({ enabled: e.target.checked })} className="accent-brand-navy" />
              Enable automatic discount tiers
            </label>
            <label className="flex items-center gap-2 text-sm font-body text-brand-navy cursor-pointer">
              <input type="checkbox" checked={settings.combinableWithCoupons} onChange={(e) => patchSettings({ combinableWithCoupons: e.target.checked })} className="accent-brand-navy" />
              Allow stacking with a manually applied coupon code (off = coupon takes precedence)
            </label>
            <label className="flex items-center gap-2 text-sm font-body text-brand-navy cursor-pointer">
              <input type="checkbox" checked={settings.freeShippingEligible} onChange={(e) => patchSettings({ freeShippingEligible: e.target.checked })} className="accent-brand-navy" />
              Grant free shipping whenever a tier discount is active
            </label>
          </div>
        )}

        {!tiers ? (
          <div className="flex items-center gap-2 text-brand-contrast font-body text-sm py-10">
            <Loader2 size={16} className="animate-spin" /> Loading tiers…
          </div>
        ) : (
          <div className="overflow-x-auto bg-white border border-brand-contrast/10 rounded">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-brand-contrast/10">
                  {["Active", "Label", "Threshold ($)", "Discount (%)", "Categories", "Saving"].map((h) => (
                    <th key={h} className="px-4 py-3 text-[10px] font-heading font-bold uppercase tracking-widest text-brand-contrast whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                  <th />
                </tr>
              </thead>
              <tbody>
                {tiers
                  .slice()
                  .sort((a, b) => a.sortOrder - b.sortOrder)
                  .map((t) => (
                    <tr key={t.id} className="border-b border-brand-contrast/5 last:border-b-0 align-middle">
                      <td className="px-4 py-2.5">
                        <input type="checkbox" checked={t.active} onChange={(e) => patchTier(t.id, { active: e.target.checked })} className="accent-brand-navy" />
                      </td>
                      <td className="px-4 py-2.5">
                        <input
                          value={t.label ?? ""}
                          onChange={(e) => setTiers((prev) => prev!.map((row) => (row.id === t.id ? { ...row, label: e.target.value } : row)))}
                          onBlur={(e) => patchTier(t.id, { label: e.target.value })}
                          className="text-sm font-body text-brand-navy border border-brand-contrast/20 rounded px-2 py-1.5 outline-none focus:border-brand-navy w-32"
                        />
                      </td>
                      <td className="px-4 py-2.5">
                        <input
                          type="number"
                          value={t.threshold}
                          onChange={(e) => setTiers((prev) => prev!.map((row) => (row.id === t.id ? { ...row, threshold: Number(e.target.value) } : row)))}
                          onBlur={(e) => patchTier(t.id, { threshold: Number(e.target.value) })}
                          className="text-sm font-body text-brand-navy border border-brand-contrast/20 rounded px-2 py-1.5 outline-none focus:border-brand-navy w-24"
                        />
                      </td>
                      <td className="px-4 py-2.5">
                        <input
                          type="number"
                          value={t.percent}
                          onChange={(e) => setTiers((prev) => prev!.map((row) => (row.id === t.id ? { ...row, percent: Number(e.target.value) } : row)))}
                          onBlur={(e) => patchTier(t.id, { percent: Number(e.target.value) })}
                          className="text-sm font-body text-brand-navy border border-brand-contrast/20 rounded px-2 py-1.5 outline-none focus:border-brand-navy w-20"
                        />
                      </td>
                      <td className="px-4 py-2.5 min-w-[180px]">
                        <select
                          multiple
                          value={t.eligibleCategoryIds}
                          onChange={(e) => {
                            const selected = [...e.target.selectedOptions].map((o) => o.value);
                            setTiers((prev) => prev!.map((row) => (row.id === t.id ? { ...row, eligibleCategoryIds: selected } : row)));
                            patchTier(t.id, { eligibleCategoryIds: selected });
                          }}
                          className="text-xs font-body text-brand-navy border border-brand-contrast/20 rounded px-2 py-1.5 outline-none focus:border-brand-navy w-full h-20"
                        >
                          {categories.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                        {t.eligibleCategoryIds.length === 0 && (
                          <p className="text-[10px] text-brand-contrast/60 mt-1">Whole basket</p>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-xs font-body text-brand-contrast whitespace-nowrap">
                        {savingId === t.id ? (
                          <Loader2 size={13} className="animate-spin" />
                        ) : (
                          <span className="inline-flex items-center gap-1 text-green-700"><Check size={13} /> Saved</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5">
                        <button onClick={() => deleteTier(t.id)} className="text-brand-contrast hover:text-red-500 transition-colors">
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        <button
          onClick={addTier}
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-brand-navy text-white text-xs font-heading font-bold uppercase tracking-widest rounded hover:bg-brand-blue transition-colors"
        >
          <Plus size={14} /> Add Tier
        </button>
      </div>
    </AdminShell>
  );
}
