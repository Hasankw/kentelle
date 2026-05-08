"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, Eye, EyeOff } from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";

interface Badge { id: string; icon: string; label: string; enabled: boolean; }

const DEFAULTS: Badge[] = [
  { id: "1", icon: "🌿", label: "100% Vegan", enabled: true },
  { id: "2", icon: "🐰", label: "Cruelty-Free", enabled: true },
  { id: "3", icon: "🧪", label: "Dermatologist Tested", enabled: true },
  { id: "4", icon: "🇦🇺", label: "Made in Australia", enabled: true },
  { id: "5", icon: "♻️", label: "Sustainable Packaging", enabled: true },
];

export default function TrustStripAdminPage() {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/pages/content?key=trust_strip")
      .then((r) => r.json())
      .then((d) => setBadges(d.value ? JSON.parse(d.value) : DEFAULTS));
  }, []);

  const save = async (b: Badge[]) => {
    setSaving(true);
    await fetch("/api/admin/pages/content", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: "trust_strip", value: JSON.stringify(b) }),
    });
    setSaving(false);
    setStatus("Saved!");
    setTimeout(() => setStatus(null), 2000);
  };

  const update = (id: string, field: keyof Badge, val: string | boolean) => {
    setBadges((prev) => prev.map((b) => b.id === id ? { ...b, [field]: val } : b));
  };

  const remove = (id: string) => {
    if (!confirm("Delete this badge?")) return;
    const next = badges.filter((b) => b.id !== id);
    setBadges(next); save(next);
  };

  const add = () => {
    const next = [...badges, { id: crypto.randomUUID(), icon: "✨", label: "New Badge", enabled: true }];
    setBadges(next);
  };

  const inputCls = "border border-brand-contrast/20 px-3 py-2 text-sm font-body text-brand-navy bg-white focus:outline-none focus:border-brand-blue";

  return (
    <AdminShell>
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href="/admin/pages" className="text-brand-contrast hover:text-brand-navy"><ArrowLeft size={18} /></Link>
            <h1 className="font-heading font-bold text-2xl text-brand-navy">Trust Strip</h1>
          </div>
          <div className="flex items-center gap-3">
            {status && <span className="text-xs font-heading font-bold text-green-600 uppercase tracking-wider">{status}</span>}
            <button onClick={add} className="flex items-center gap-2 border border-brand-contrast/20 text-brand-contrast rounded px-4 py-2.5 text-xs font-heading font-bold uppercase tracking-widest hover:bg-[#F8F9FC] transition-colors">
              <Plus size={14} /> Add Badge
            </button>
            <button
              onClick={() => save(badges)}
              disabled={saving}
              className="bg-brand-navy text-brand-white rounded px-6 py-2.5 text-xs font-heading font-bold uppercase tracking-widest hover:bg-brand-blue transition-colors disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save All"}
            </button>
          </div>
        </div>

        <div className="bg-white border border-brand-contrast/10 shadow-sm divide-y divide-brand-contrast/10">
          {badges.map((badge) => (
            <div key={badge.id} className={`flex items-center gap-4 px-5 py-4 ${!badge.enabled ? "opacity-50" : ""}`}>
              <input
                value={badge.icon}
                onChange={(e) => update(badge.id, "icon", e.target.value)}
                className={`${inputCls} w-16 text-center text-xl`}
                maxLength={4}
              />
              <input
                value={badge.label}
                onChange={(e) => update(badge.id, "label", e.target.value)}
                className={`${inputCls} flex-1`}
              />
              <button
                onClick={() => { update(badge.id, "enabled", !badge.enabled); }}
                className={`flex items-center gap-1.5 text-[10px] font-heading font-bold uppercase tracking-wider px-3 py-1.5 transition-colors shrink-0 ${
                  badge.enabled ? "bg-green-50 text-green-700 hover:bg-green-100" : "bg-[#F8F9FC] text-brand-contrast hover:bg-brand-contrast/10"
                }`}
              >
                {badge.enabled ? <Eye size={11} /> : <EyeOff size={11} />}
                {badge.enabled ? "Enabled" : "Disabled"}
              </button>
              <button onClick={() => remove(badge.id)} className="text-red-400 hover:text-red-600 transition-colors shrink-0"><Trash2 size={14} /></button>
            </div>
          ))}
        </div>

        <p className="text-xs font-body text-brand-contrast mt-4">Click "Save All" to apply changes to the live site.</p>
      </div>
    </AdminShell>
  );
}
