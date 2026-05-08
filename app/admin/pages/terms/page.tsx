"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";

const DEFAULT_CONTENT = `1. Acceptance
By accessing or purchasing from Kentelle Skincare, you agree to these terms. If you do not agree, please do not use our site.

2. Products
All products are subject to availability. We reserve the right to limit quantities and discontinue products at any time. Product images are for illustrative purposes and may vary slightly from the actual product.

3. Pricing
All prices are in Australian Dollars (AUD) and include GST. We reserve the right to change prices without notice. Your order total is confirmed at the time of purchase.

4. Shipping
Orders are dispatched within 2–3 business days. Delivery times vary by location. We are not responsible for delays caused by carriers or customs.

5. Returns
We accept returns within 30 days of delivery for unused, unopened items in original packaging. Contact us at hello@kentelle.com.au to initiate a return. Sale items are final sale.

6. Limitation of Liability
To the maximum extent permitted by Australian law, Kentelle Skincare is not liable for any indirect, incidental, or consequential damages arising from the use of our products or website.

7. Contact
Questions? Email us at hello@kentelle.com.au.`;

export default function TermsAdminPage() {
  const [lastUpdated, setLastUpdated] = useState("January 2025");
  const [content, setContent] = useState(DEFAULT_CONTENT);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/pages/content?key=page_terms")
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
      body: JSON.stringify({ key: "page_terms", value: JSON.stringify({ lastUpdated, content }) }),
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
            <h1 className="font-heading font-bold text-2xl text-brand-navy">Terms & Conditions</h1>
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
            <input value={lastUpdated} onChange={(e) => setLastUpdated(e.target.value)} className={`${inputCls} max-w-xs`} />
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
