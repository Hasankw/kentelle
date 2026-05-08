"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, Eye, EyeOff, ChevronUp, ChevronDown } from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";

interface FaqItem { id: string; title: string; content: string; enabled: boolean; }

const DEFAULTS: FaqItem[] = [
  { id: "1", title: "How do I know which products are right for my skin?", content: "We recommend taking our Skin Quiz for personalised recommendations based on your skin type, concerns, and goals. You can also contact our skincare experts via the Contact page for personalised advice.", enabled: true },
  { id: "2", title: "Are your products suitable for sensitive skin?", content: "Many of our products are formulated specifically for sensitive skin, including our Gentle Foam Cleanser, Sensitive Skin Calming Serum, and Soothing Centella Toner. All products are fragrance-free and dermatologist-tested. Always patch-test before full application.", enabled: true },
  { id: "3", title: "Are Kentelle products vegan and cruelty-free?", content: "Yes! All Kentelle products are 100% vegan and cruelty-free. We never use animal-derived ingredients and never test on animals.", enabled: true },
  { id: "4", title: "What is your shipping policy?", content: "We offer free shipping on all orders over $80 AUD. Standard shipping (3–7 business days) is $9.95 for orders under $80. Express shipping is available at checkout. We ship Australia-wide.", enabled: true },
  { id: "5", title: "Can I return or exchange a product?", content: "We offer a 30-day satisfaction guarantee. If you're not completely happy with your purchase, contact us within 30 days of receiving your order for a full refund or exchange. Products must be at least 50% full to be eligible.", enabled: true },
  { id: "6", title: "How long does shipping take?", content: "Standard shipping takes 3–7 business days within Australia. Express shipping takes 1–2 business days. Orders are processed within 1 business day of being placed.", enabled: true },
  { id: "7", title: "Can I use multiple Kentelle products together?", content: "Yes! Our products are designed to work together. However, some active ingredients like retinol and AHAs should not be used on the same evening. Check each product's How to Use section for guidance.", enabled: true },
  { id: "8", title: "Are your products safe during pregnancy?", content: "We recommend consulting with your healthcare provider during pregnancy. As a general guideline, avoid retinol and high-concentration AHA/BHA products.", enabled: true },
  { id: "9", title: "How do I track my order?", content: "Once your order ships, you'll receive a tracking email with your tracking number. You can also track your order from your account page.", enabled: true },
  { id: "10", title: "Do you offer a rewards program?", content: "We're working on a loyalty rewards program — coming soon! Subscribe to our newsletter to be the first to know.", enabled: true },
];

export default function FaqAdminPage() {
  const [items, setItems] = useState<FaqItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/pages/content?key=page_faq")
      .then((r) => r.json())
      .then((d) => setItems(d.value ? JSON.parse(d.value) : DEFAULTS));
  }, []);

  const save = async (list: FaqItem[]) => {
    setSaving(true);
    await fetch("/api/admin/pages/content", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: "page_faq", value: JSON.stringify(list) }),
    });
    setSaving(false);
    setStatus("Saved!");
    setTimeout(() => setStatus(null), 2000);
  };

  const update = (id: string, field: keyof FaqItem, val: string | boolean) =>
    setItems((prev) => prev.map((f) => f.id === id ? { ...f, [field]: val } : f));

  const move = (id: string, dir: -1 | 1) => {
    const idx = items.findIndex((f) => f.id === id);
    if (idx + dir < 0 || idx + dir >= items.length) return;
    const next = [...items];
    [next[idx], next[idx + dir]] = [next[idx + dir], next[idx]];
    setItems(next);
  };

  const remove = (id: string) => {
    if (!confirm("Delete this FAQ?")) return;
    const next = items.filter((f) => f.id !== id);
    setItems(next); save(next);
  };

  const add = () => {
    const newItem = { id: crypto.randomUUID(), title: "", content: "", enabled: true };
    setItems((prev) => [...prev, newItem]);
    setEditing(newItem.id);
  };

  const inputCls = "w-full border border-brand-contrast/20 px-3 py-2 text-sm font-body text-brand-navy bg-white focus:outline-none focus:border-brand-blue";

  return (
    <AdminShell>
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href="/admin/pages" className="text-brand-contrast hover:text-brand-navy"><ArrowLeft size={18} /></Link>
            <div>
              <h1 className="font-heading font-bold text-2xl text-brand-navy">FAQ</h1>
              <p className="text-xs font-body text-brand-contrast mt-0.5">{items.length} questions · {items.filter(f => f.enabled).length} enabled</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {status && <span className="text-xs font-heading font-bold text-green-600 uppercase tracking-wider">{status}</span>}
            <button onClick={add} className="flex items-center gap-2 border border-brand-contrast/20 text-brand-contrast rounded px-4 py-2.5 text-xs font-heading font-bold uppercase tracking-widest hover:bg-[#F8F9FC] transition-colors">
              <Plus size={14} /> Add FAQ
            </button>
            <button onClick={() => save(items)} disabled={saving} className="bg-brand-navy text-brand-white rounded px-6 py-2.5 text-xs font-heading font-bold uppercase tracking-widest hover:bg-brand-blue transition-colors disabled:opacity-50">
              {saving ? "Saving…" : "Save All"}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          {items.map((item, i) => (
            <div key={item.id} className={`bg-white border ${item.enabled ? "border-brand-contrast/10" : "border-brand-contrast/5 opacity-60"}`}>
              <div className="flex items-center gap-3 px-5 py-4">
                <div className="flex flex-col gap-0.5">
                  <button onClick={() => move(item.id, -1)} disabled={i === 0} className="text-brand-contrast/40 hover:text-brand-navy disabled:opacity-20"><ChevronUp size={13} /></button>
                  <button onClick={() => move(item.id, 1)} disabled={i === items.length - 1} className="text-brand-contrast/40 hover:text-brand-navy disabled:opacity-20"><ChevronDown size={13} /></button>
                </div>
                <span className="text-xs font-heading font-bold text-brand-contrast/40 w-5">{i + 1}</span>
                <p className="flex-1 text-sm font-body text-brand-navy truncate">{item.title || <span className="text-brand-contrast/40">Untitled question</span>}</p>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => { update(item.id, "enabled", !item.enabled); }}
                    className={`flex items-center gap-1.5 text-[10px] font-heading font-bold uppercase tracking-wider px-3 py-1.5 ${item.enabled ? "bg-green-50 text-green-700 hover:bg-green-100" : "bg-[#F8F9FC] text-brand-contrast hover:bg-brand-contrast/10"} transition-colors`}
                  >
                    {item.enabled ? <Eye size={11} /> : <EyeOff size={11} />}
                    {item.enabled ? "On" : "Off"}
                  </button>
                  <button onClick={() => setEditing(editing === item.id ? null : item.id)} className="text-[10px] font-heading font-bold uppercase tracking-wider px-3 py-1.5 border border-brand-contrast/20 text-brand-contrast hover:text-brand-navy hover:border-brand-navy transition-colors">
                    {editing === item.id ? "Close" : "Edit"}
                  </button>
                  <button onClick={() => remove(item.id)} className="text-red-400 hover:text-red-600 transition-colors p-1"><Trash2 size={14} /></button>
                </div>
              </div>
              {editing === item.id && (
                <div className="border-t border-brand-contrast/10 p-5 bg-[#F8F9FC] space-y-3">
                  <div>
                    <label className="block text-[10px] font-heading font-bold uppercase tracking-wider text-brand-contrast mb-1">Question</label>
                    <input value={item.title} onChange={(e) => update(item.id, "title", e.target.value)} className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-heading font-bold uppercase tracking-wider text-brand-contrast mb-1">Answer</label>
                    <textarea rows={4} value={item.content} onChange={(e) => update(item.id, "content", e.target.value)} className={`${inputCls} resize-none`} />
                  </div>
                  <div className="flex gap-3 pt-1">
                    <button onClick={() => { setEditing(null); save(items); }} className="px-6 py-2.5 bg-brand-navy text-brand-white rounded text-xs font-heading font-bold uppercase tracking-widest hover:bg-brand-blue transition-colors">Save</button>
                    <button onClick={() => setEditing(null)} className="px-4 py-2.5 text-xs font-heading font-bold uppercase tracking-widest text-brand-contrast hover:text-brand-navy transition-colors">Cancel</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}
