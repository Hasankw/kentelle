"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";

const DEFAULT_CONTENT = `1. Information We Collect
We collect information you provide when you create an account, place an order, or contact us. This includes your name, email address, shipping address, and payment details (processed securely via PayPal).

2. How We Use Your Information
We use your information to process orders, send order confirmations, provide customer support, and (with your consent) send marketing communications about new products and offers.

3. Data Sharing
We do not sell your personal information. We share data only with service providers necessary to operate our business (payment processors, shipping carriers, email services) and as required by law.

4. Cookies
We use cookies to maintain your session, remember your cart, and improve our service. You can disable cookies in your browser settings, though some site features may not function correctly.

5. Your Rights
You have the right to access, correct, or delete your personal data. To make a request, contact us at privacy@kentelle.com.au.

6. Contact
For privacy enquiries, email us at privacy@kentelle.com.au.`;

export default function PrivacyAdminPage() {
  const [lastUpdated, setLastUpdated] = useState("January 2025");
  const [content, setContent] = useState(DEFAULT_CONTENT);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/pages/content?key=page_privacy")
      .then((r) => r.json())
      .then((d) => {
        if (d.value) {
          const parsed = JSON.parse(d.value);
          setLastUpdated(parsed.lastUpdated ?? "January 2025");
          setContent(parsed.content ?? DEFAULT_CONTENT);
        }
      });
  }, []);

  const save = async () => {
    setSaving(true);
    await fetch("/api/admin/pages/content", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: "page_privacy", value: JSON.stringify({ lastUpdated, content }) }),
    });
    setSaving(false);
    setStatus("Saved!");
    setTimeout(() => setStatus(null), 2000);
  };

  const inputCls = "w-full border border-brand-contrast/20 px-3 py-2.5 text-sm font-body text-brand-navy bg-white focus:outline-none focus:border-brand-blue";
  const labelCls = "block text-xs font-heading font-bold uppercase tracking-wider text-brand-navy mb-1.5";

  return (
    <AdminShell>
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href="/admin/pages" className="text-brand-contrast hover:text-brand-navy"><ArrowLeft size={18} /></Link>
            <h1 className="font-heading font-bold text-2xl text-brand-navy">Privacy Policy</h1>
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
            <label className={labelCls}>Last Updated</label>
            <input value={lastUpdated} onChange={(e) => setLastUpdated(e.target.value)} className={`${inputCls} max-w-xs`} placeholder="January 2025" />
          </div>
          <div>
            <label className={labelCls}>Content (plain text — use numbered sections)</label>
            <textarea rows={28} value={content} onChange={(e) => setContent(e.target.value)} className={`${inputCls} resize-y font-mono text-xs`} />
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
