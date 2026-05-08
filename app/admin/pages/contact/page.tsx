"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";

const DEFAULT = {
  email: "hello@kentelle.com.au",
  phone: "",
  address: "",
  hours: "",
  mapLink: "",
};

export default function ContactAdminPage() {
  const [form, setForm] = useState(DEFAULT);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/pages/content?key=page_contact")
      .then((r) => r.json())
      .then((d) => { if (d.value) setForm(JSON.parse(d.value)); });
  }, []);

  const save = async () => {
    setSaving(true);
    await fetch("/api/admin/pages/content", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: "page_contact", value: JSON.stringify(form) }),
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
            <h1 className="font-heading font-bold text-2xl text-brand-navy">Contact Us</h1>
          </div>
          <div className="flex items-center gap-3">
            {status && <span className="text-xs font-heading font-bold text-green-600 uppercase tracking-wider">{status}</span>}
            <button onClick={save} disabled={saving} className="bg-brand-navy text-brand-white rounded px-6 py-2.5 text-xs font-heading font-bold uppercase tracking-widest hover:bg-brand-blue transition-colors disabled:opacity-50">
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </div>

        <div className="bg-white border border-brand-contrast/10 shadow-sm p-6 space-y-5">
          <p className="text-xs font-body text-brand-contrast">These details appear on the Contact page alongside the enquiry form.</p>
          <div>
            <label className={labelCls}>Email Address</label>
            <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} className={inputCls} placeholder="hello@kentelle.com.au" />
          </div>
          <div>
            <label className={labelCls}>Phone Number</label>
            <input value={form.phone} onChange={(e) => set("phone", e.target.value)} className={inputCls} placeholder="+61 4XX XXX XXX" />
          </div>
          <div>
            <label className={labelCls}>Address</label>
            <textarea rows={2} value={form.address} onChange={(e) => set("address", e.target.value)} className={`${inputCls} resize-none`} placeholder="123 Example St, Perth WA 6000" />
          </div>
          <div>
            <label className={labelCls}>Opening Hours</label>
            <textarea rows={3} value={form.hours} onChange={(e) => set("hours", e.target.value)} className={`${inputCls} resize-none`} placeholder="Mon–Fri: 9am–5pm&#10;Sat: 10am–3pm&#10;Sun: Closed" />
          </div>
          <div>
            <label className={labelCls}>Google Maps Link (optional)</label>
            <input value={form.mapLink} onChange={(e) => set("mapLink", e.target.value)} className={inputCls} placeholder="https://maps.google.com/..." />
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
