"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";

interface Review { id: string; name: string; body: string; product: string; rating: number; }

const DEFAULT_HEADER = {
  tagline: "Real Results",
  title: "What Our Customers Say",
  ratingText: "4.9 from 2,400+ reviews",
};

const DEFAULT_REVIEWS: Review[] = [
  { id: "1", name: "Sarah M.", body: "My skin has never looked better. The serum transformed my texture in just 3 weeks.", product: "Vitamin C Brightening Serum", rating: 5 },
  { id: "2", name: "Jessica L.", body: "Finally a moisturiser that doesn't clog my pores. I'm obsessed!", product: "Hydra-Boost Moisturiser", rating: 5 },
  { id: "3", name: "Amanda K.", body: "The cleanser leaves my skin feeling clean without that tight, dry feeling.", product: "Gentle Foam Cleanser", rating: 5 },
];

export default function ReviewsAdminPage() {
  const [header, setHeader] = useState(DEFAULT_HEADER);
  const [reviews, setReviews] = useState<Review[]>(DEFAULT_REVIEWS);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/pages/content?key=home_reviews")
      .then((r) => r.json())
      .then((d) => {
        if (d.value) {
          const parsed = JSON.parse(d.value);
          setHeader({ ...DEFAULT_HEADER, tagline: parsed.tagline ?? DEFAULT_HEADER.tagline, title: parsed.title ?? DEFAULT_HEADER.title, ratingText: parsed.ratingText ?? DEFAULT_HEADER.ratingText });
          setReviews(parsed.reviews ?? DEFAULT_REVIEWS);
        }
      });
  }, []);

  const save = async (h = header, r = reviews) => {
    setSaving(true);
    await fetch("/api/admin/pages/content", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: "home_reviews", value: JSON.stringify({ ...h, reviews: r }) }),
    });
    setSaving(false);
    setStatus("Saved!");
    setTimeout(() => setStatus(null), 2000);
  };

  const setH = (k: keyof typeof header, v: string) => setHeader((p) => ({ ...p, [k]: v }));

  const updateReview = (id: string, field: keyof Review, val: string | number) =>
    setReviews((prev) => prev.map((r) => r.id === id ? { ...r, [field]: val } : r));

  const move = (id: string, dir: -1 | 1) => {
    const idx = reviews.findIndex((r) => r.id === id);
    if (idx + dir < 0 || idx + dir >= reviews.length) return;
    const next = [...reviews];
    [next[idx], next[idx + dir]] = [next[idx + dir], next[idx]];
    setReviews(next);
  };

  const remove = (id: string) => {
    if (!confirm("Delete this review?")) return;
    const next = reviews.filter((r) => r.id !== id);
    setReviews(next); save(header, next);
  };

  const add = () => {
    const newId = crypto.randomUUID();
    setReviews((prev) => [...prev, { id: newId, name: "", body: "", product: "", rating: 5 }]);
    setEditing(newId);
  };

  const inputCls = "w-full border border-brand-contrast/20 px-3 py-2 text-sm font-body text-brand-navy bg-white focus:outline-none focus:border-brand-blue";
  const labelCls = "block text-xs font-heading font-bold uppercase tracking-wider text-brand-navy mb-1.5";

  return (
    <AdminShell>
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href="/admin/pages" className="text-brand-contrast hover:text-brand-navy"><ArrowLeft size={18} /></Link>
            <div>
              <h1 className="font-heading font-bold text-2xl text-brand-navy">Reviews Banner</h1>
              <p className="text-xs font-body text-brand-contrast mt-0.5">{reviews.length} reviews</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {status && <span className="text-xs font-heading font-bold text-green-600 uppercase tracking-wider">{status}</span>}
            <button onClick={add} className="flex items-center gap-2 border border-brand-contrast/20 text-brand-contrast rounded px-4 py-2.5 text-xs font-heading font-bold uppercase tracking-widest hover:bg-[#F8F9FC] transition-colors">
              <Plus size={14} /> Add Review
            </button>
            <button onClick={() => save()} disabled={saving} className="bg-brand-navy text-brand-white rounded px-6 py-2.5 text-xs font-heading font-bold uppercase tracking-widest hover:bg-brand-blue transition-colors disabled:opacity-50">
              {saving ? "Saving…" : "Save All"}
            </button>
          </div>
        </div>

        {/* Section header */}
        <div className="bg-white border border-brand-contrast/10 shadow-sm p-6 space-y-4 mb-5">
          <p className="text-xs font-heading font-bold uppercase tracking-wider text-brand-contrast/60">Section Header</p>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>Tagline</label>
              <input value={header.tagline} onChange={(e) => setH("tagline", e.target.value)} className={inputCls} placeholder="Real Results" />
            </div>
            <div>
              <label className={labelCls}>Title</label>
              <input value={header.title} onChange={(e) => setH("title", e.target.value)} className={inputCls} placeholder="What Our Customers Say" />
            </div>
            <div>
              <label className={labelCls}>Rating Text</label>
              <input value={header.ratingText} onChange={(e) => setH("ratingText", e.target.value)} className={inputCls} placeholder="4.9 from 2,400+ reviews" />
            </div>
          </div>
        </div>

        {/* Reviews list */}
        <div className="space-y-2">
          {reviews.map((review, i) => (
            <div key={review.id} className="bg-white border border-brand-contrast/10">
              <div className="flex items-center gap-3 px-5 py-4">
                <div className="flex flex-col gap-0.5">
                  <button onClick={() => move(review.id, -1)} disabled={i === 0} className="text-brand-contrast/40 hover:text-brand-navy disabled:opacity-20"><ChevronUp size={13} /></button>
                  <button onClick={() => move(review.id, 1)} disabled={i === reviews.length - 1} className="text-brand-contrast/40 hover:text-brand-navy disabled:opacity-20"><ChevronDown size={13} /></button>
                </div>
                <span className="text-xs font-heading font-bold text-brand-contrast/40 w-5">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-heading font-bold text-brand-navy truncate">{review.name || <span className="text-brand-contrast/40 font-normal">Unnamed reviewer</span>}</p>
                  <p className="text-xs font-body text-brand-contrast truncate">{review.body || "No quote yet"}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => setEditing(editing === review.id ? null : review.id)} className="text-[10px] font-heading font-bold uppercase tracking-wider px-3 py-1.5 border border-brand-contrast/20 text-brand-contrast hover:text-brand-navy hover:border-brand-navy transition-colors">
                    {editing === review.id ? "Close" : "Edit"}
                  </button>
                  <button onClick={() => remove(review.id)} className="text-red-400 hover:text-red-600 transition-colors p-1"><Trash2 size={14} /></button>
                </div>
              </div>

              {editing === review.id && (
                <div className="border-t border-brand-contrast/10 p-5 bg-[#F8F9FC] space-y-3">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-heading font-bold uppercase tracking-wider text-brand-contrast mb-1">Reviewer Name</label>
                      <input value={review.name} onChange={(e) => updateReview(review.id, "name", e.target.value)} className={inputCls} placeholder="Sarah M." />
                    </div>
                    <div>
                      <label className="block text-[10px] font-heading font-bold uppercase tracking-wider text-brand-contrast mb-1">Product</label>
                      <input value={review.product} onChange={(e) => updateReview(review.id, "product", e.target.value)} className={inputCls} placeholder="Vitamin C Brightening Serum" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-heading font-bold uppercase tracking-wider text-brand-contrast mb-1">Quote</label>
                    <textarea rows={3} value={review.body} onChange={(e) => updateReview(review.id, "body", e.target.value)} className={`${inputCls} resize-none`} placeholder="My skin has never looked better..." />
                  </div>
                  <div className="flex gap-3 pt-1">
                    <button onClick={() => { setEditing(null); save(); }} className="px-6 py-2.5 bg-brand-navy text-brand-white rounded text-xs font-heading font-bold uppercase tracking-widest hover:bg-brand-blue transition-colors">Save</button>
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
