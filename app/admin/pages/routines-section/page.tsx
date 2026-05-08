"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";

const DEFAULT = {
  tagline: "Expert Guidance",
  title: "Your Skincare Routine Guide",
  subtitle: "Curated step-by-step regimes for every skin type — from daily essentials to clinical-grade treatments.",
  routinesTitle: "Skincare Routines",
  routinesDesc: "Daily rituals for healthy, radiant skin. Choose from foundational essentials to advanced resurfacing.",
  routinesLink: "Explore Skincare Routines",
  clinicalTitle: "Clinical Treatments",
  clinicalDesc: "Targeted protocols for specific concerns — acne, rosacea, pigmentation and more.",
  clinicalLink: "Explore Clinical Treatments",
};

export default function RoutinesSectionAdminPage() {
  const [form, setForm] = useState(DEFAULT);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/pages/content?key=home_routines_section")
      .then((r) => r.json())
      .then((d) => { if (d.value) setForm({ ...DEFAULT, ...JSON.parse(d.value) }); });
  }, []);

  const save = async () => {
    setSaving(true);
    await fetch("/api/admin/pages/content", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: "home_routines_section", value: JSON.stringify(form) }),
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
            <h1 className="font-heading font-bold text-2xl text-brand-navy">Routines Section</h1>
          </div>
          <div className="flex items-center gap-3">
            {status && <span className="text-xs font-heading font-bold text-green-600 uppercase tracking-wider">{status}</span>}
            <button onClick={save} disabled={saving} className="bg-brand-navy text-brand-white rounded px-6 py-2.5 text-xs font-heading font-bold uppercase tracking-widest hover:bg-brand-blue transition-colors disabled:opacity-50">
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Section header */}
          <div className="bg-white border border-brand-contrast/10 shadow-sm p-6 space-y-5">
            <p className="text-xs font-heading font-bold uppercase tracking-wider text-brand-contrast/60">Section Header</p>
            <div>
              <label className={labelCls}>Tagline</label>
              <input value={form.tagline} onChange={(e) => set("tagline", e.target.value)} className={`${inputCls} max-w-sm`} placeholder="Expert Guidance" />
            </div>
            <div>
              <label className={labelCls}>Title</label>
              <input value={form.title} onChange={(e) => set("title", e.target.value)} className={inputCls} placeholder="Your Skincare Routine Guide" />
            </div>
            <div>
              <label className={labelCls}>Subtitle</label>
              <textarea rows={2} value={form.subtitle} onChange={(e) => set("subtitle", e.target.value)} className={`${inputCls} resize-none`} />
            </div>
          </div>

          {/* Cards */}
          <div className="grid md:grid-cols-2 gap-5">
            <div className="bg-white border border-brand-contrast/10 shadow-sm p-6 space-y-4">
              <div className="h-1 bg-brand-accent -mx-6 -mt-6 mb-5 rounded-t" />
              <p className="text-xs font-heading font-bold uppercase tracking-wider text-brand-contrast/60">Skincare Routines Card</p>
              <div>
                <label className={labelCls}>Card Title</label>
                <input value={form.routinesTitle} onChange={(e) => set("routinesTitle", e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Description</label>
                <textarea rows={3} value={form.routinesDesc} onChange={(e) => set("routinesDesc", e.target.value)} className={`${inputCls} resize-none`} />
              </div>
              <div>
                <label className={labelCls}>Link Label</label>
                <input value={form.routinesLink} onChange={(e) => set("routinesLink", e.target.value)} className={inputCls} />
              </div>
            </div>

            <div className="bg-white border border-brand-contrast/10 shadow-sm p-6 space-y-4">
              <div className="h-1 bg-brand-navy -mx-6 -mt-6 mb-5 rounded-t" />
              <p className="text-xs font-heading font-bold uppercase tracking-wider text-brand-contrast/60">Clinical Treatments Card</p>
              <div>
                <label className={labelCls}>Card Title</label>
                <input value={form.clinicalTitle} onChange={(e) => set("clinicalTitle", e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Description</label>
                <textarea rows={3} value={form.clinicalDesc} onChange={(e) => set("clinicalDesc", e.target.value)} className={`${inputCls} resize-none`} />
              </div>
              <div>
                <label className={labelCls}>Link Label</label>
                <input value={form.clinicalLink} onChange={(e) => set("clinicalLink", e.target.value)} className={inputCls} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
