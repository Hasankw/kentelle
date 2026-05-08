"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";

const DEFAULT = {
  heroTitle: "Skincare That Performs, Not Just Promises",
  heroSubtext: "Born from a lifelong devotion to skin science and the absolute trust of thousands of clients.",
  founderName: "Ken Ken",
  founderTitle: "Founder & Formulator, KENTELLE",
  founderBio: `Launching the KENTELLE skincare range is the dazzling realization of a lifelong dream for its founder, Ken Ken. If you meet her today, you will immediately recognize her by her trademark flamboyant red hair, her perfectly painted bold lip, and an energy so magnetic it practically hums. She is a woman who refuses to slow down, splitting her time between tirelessly formulating new products and teaching at the skincare clinic.

The brand itself was born organically from the sheer devotion of her clients. For years, as she treated thousands of faces, her clinic echoed with a familiar, demanding refrain: "Ken, tell me what to do, and I'll do it." That absolute trust became the foundation of KENTELLE — a brand built not just on high-performance ingredients, but on the charismatic, intimate connection Ken Ken shares with every person who seeks her advice.

This unwavering authority was forged during a deeply romantic, globe-trotting journey that began with a very bold leap. Armed with a university degree in pharmacology, a young and ambitious Ken Ken packed her bags for Paris — the undisputed cosmetic capital of the world. Already fluent in a tapestry of Asian languages, she quickly conquered French, charming her European colleagues and clients alike. It was in those Parisian companies that she mastered her signature approach: taking rigid, clinical pharmaceutical science and wrapping it in the indulgent, luxurious sensory experience of French beauty.

She carried this expertise back to Kuala Lumpur to elevate the local skincare industry and join the city's social scene. Always exquisitely dressed and overflowing with an infectious passion, she became a beloved social figure. Her colleagues adored the sophisticated European flair she brought to their clinics, and her vibrant, glittering social life became an extension of her glamorous brand of beauty.

Today, every jar and ampoule of KENTELLE contains a drop of that colourful, well-travelled history. Ken Ken is living proof that true beauty is about unapologetic ambition and living life out loud. Even now, her younger clients regularly sweep her away to glamorous social events where she remains the undisputed life of the party. With KENTELLE, she isn't just selling skincare — she is sharing the brilliant, flamboyant energy that has defined her magnificent life.`,
};

export default function AboutAdminPage() {
  const [form, setForm] = useState(DEFAULT);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/pages/content?key=page_about")
      .then((r) => r.json())
      .then((d) => { if (d.value) setForm(JSON.parse(d.value)); });
  }, []);

  const save = async () => {
    setSaving(true);
    await fetch("/api/admin/pages/content", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: "page_about", value: JSON.stringify(form) }),
    });
    setSaving(false);
    setStatus("Saved!");
    setTimeout(() => setStatus(null), 2000);
  };

  const set = (k: keyof typeof form, v: string) => setForm((p) => ({ ...p, [k]: v }));
  const inputCls = "w-full border border-brand-contrast/20 px-3 py-2.5 text-sm font-body text-brand-navy bg-white focus:outline-none focus:border-brand-blue";
  const labelCls = "block text-xs font-heading font-bold uppercase tracking-wider text-brand-navy mb-1.5";

  return (
    <AdminShell>
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href="/admin/pages" className="text-brand-contrast hover:text-brand-navy"><ArrowLeft size={18} /></Link>
            <h1 className="font-heading font-bold text-2xl text-brand-navy">About Us</h1>
          </div>
          <div className="flex items-center gap-3">
            {status && <span className="text-xs font-heading font-bold text-green-600 uppercase tracking-wider">{status}</span>}
            <button onClick={save} disabled={saving} className="bg-brand-navy text-brand-white rounded px-6 py-2.5 text-xs font-heading font-bold uppercase tracking-widest hover:bg-brand-blue transition-colors disabled:opacity-50">
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </div>

        <div className="bg-white border border-brand-contrast/10 shadow-sm p-6 space-y-5">
          <div>
            <label className={labelCls}>Hero Title</label>
            <input value={form.heroTitle} onChange={(e) => set("heroTitle", e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Hero Subtext</label>
            <textarea rows={2} value={form.heroSubtext} onChange={(e) => set("heroSubtext", e.target.value)} className={`${inputCls} resize-none`} />
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className={labelCls}>Founder Name</label>
              <input value={form.founderName} onChange={(e) => set("founderName", e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Founder Title</label>
              <input value={form.founderTitle} onChange={(e) => set("founderTitle", e.target.value)} className={inputCls} />
            </div>
          </div>
          <div>
            <label className={labelCls}>Founder Bio (separate paragraphs with blank lines)</label>
            <textarea rows={20} value={form.founderBio} onChange={(e) => set("founderBio", e.target.value)} className={`${inputCls} resize-y font-mono text-xs`} />
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
