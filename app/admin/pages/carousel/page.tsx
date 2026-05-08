"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, Eye, EyeOff, GripVertical, ChevronUp, ChevronDown } from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";

interface Slide {
  id: string;
  tagline: string;
  headline: string;
  sub: string;
  ctaLabel: string;
  ctaHref: string;
  cta2Label: string;
  cta2Href: string;
  image: string;
  enabled: boolean;
  sortOrder: number;
}

const DEFAULTS: Slide[] = [
  { id: "1", tagline: "Science-Backed Skincare", headline: "KENTELLE", sub: "Treat yourself, beauty you can telle.", ctaLabel: "Shop All", ctaHref: "/shop", cta2Label: "About Us", cta2Href: "/about", image: "/images/hero/hero-slide1.png", enabled: true, sortOrder: 0 },
  { id: "2", tagline: "Everyday Essentials", headline: "Everyday\nEssentials Care", sub: "It's a lifetime care, no shortcuts.", ctaLabel: "Shop Collection", ctaHref: "/collections/everyday-essentials", cta2Label: "", cta2Href: "", image: "/images/hero/hero-slide2.jpg", enabled: true, sortOrder: 1 },
  { id: "3", tagline: "Peel & Glow", headline: "Peel and\nGlow", sub: "Absorb, resurfacing, restore and anti-ageing.", ctaLabel: "Shop Collection", ctaHref: "/collections/peel-and-glow", cta2Label: "", cta2Href: "", image: "https://siwgptjhirmkabyjmddm.supabase.co/storage/v1/object/public/products/hero-peel-and-glow-new.jpg", enabled: true, sortOrder: 2 },
  { id: "4", tagline: "Skin Nutrients", headline: "Skin\nNutrients", sub: "Feed the skin to stay youthful.", ctaLabel: "Shop Collection", ctaHref: "/collections/skin-nutrients", cta2Label: "", cta2Href: "", image: "/images/hero/hero-slide4.jpg", enabled: true, sortOrder: 3 },
  { id: "5", tagline: "Beauty Accessories", headline: "Beauty\nAccessories", sub: "The support act your skin deserves.", ctaLabel: "Shop Collection", ctaHref: "/collections/beauty-accessories", cta2Label: "", cta2Href: "", image: "/images/hero/hero-beauty-accessories.jpg", enabled: true, sortOrder: 4 },
  { id: "6", tagline: "Professional Use", headline: "The Professional's\nSecret", sub: "KENTELLE: The Professional's Secret to Clinical Excellence.", ctaLabel: "Shop Collection", ctaHref: "/collections/professional-use", cta2Label: "", cta2Href: "", image: "/images/hero/hero-professional-use.jpg", enabled: true, sortOrder: 5 },
  { id: "7", tagline: "Diagnosis & Prescription", headline: "What's Your\nSkin Concern?", sub: "Personalised skin diagnosis and product prescription to find your perfect routine.", ctaLabel: "Find Your Routine", ctaHref: "/find-your-routine", cta2Label: "", cta2Href: "", image: "/images/hero/hero-slide7.jpg", enabled: true, sortOrder: 6 },
];

export default function CarouselAdminPage() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/pages/content?key=carousel_slides")
      .then((r) => r.json())
      .then((d) => setSlides(d.value ? JSON.parse(d.value) : DEFAULTS));
  }, []);

  const save = async (s: Slide[]) => {
    setSaving(true);
    await fetch("/api/admin/pages/content", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: "carousel_slides", value: JSON.stringify(s) }),
    });
    setSaving(false);
    setStatus("Saved!");
    setTimeout(() => setStatus(null), 2000);
  };

  const toggle = (id: string) => {
    const next = slides.map((s) => s.id === id ? { ...s, enabled: !s.enabled } : s);
    setSlides(next);
    save(next);
  };

  const move = (id: string, dir: -1 | 1) => {
    const idx = slides.findIndex((s) => s.id === id);
    if (idx + dir < 0 || idx + dir >= slides.length) return;
    const next = [...slides];
    [next[idx], next[idx + dir]] = [next[idx + dir], next[idx]];
    const reordered = next.map((s, i) => ({ ...s, sortOrder: i }));
    setSlides(reordered);
    save(reordered);
  };

  const remove = (id: string) => {
    if (!confirm("Delete this slide?")) return;
    const next = slides.filter((s) => s.id !== id).map((s, i) => ({ ...s, sortOrder: i }));
    setSlides(next);
    save(next);
  };

  const addSlide = () => {
    const newSlide: Slide = {
      id: crypto.randomUUID(),
      tagline: "",
      headline: "",
      sub: "",
      ctaLabel: "Shop Now",
      ctaHref: "/shop",
      cta2Label: "",
      cta2Href: "",
      image: "",
      enabled: true,
      sortOrder: slides.length,
    };
    const next = [...slides, newSlide];
    setSlides(next);
    setEditing(newSlide.id);
  };

  const updateSlide = (id: string, field: keyof Slide, val: string | boolean) => {
    setSlides((prev) => prev.map((s) => s.id === id ? { ...s, [field]: val } : s));
  };

  const saveEditing = () => {
    setEditing(null);
    save(slides);
  };

  const inputCls = "w-full border border-brand-contrast/20 px-3 py-2 text-sm font-body text-brand-navy bg-white focus:outline-none focus:border-brand-blue";
  const labelCls = "block text-[10px] font-heading font-bold uppercase tracking-wider text-brand-contrast mb-1";

  return (
    <AdminShell>
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href="/admin/pages" className="text-brand-contrast hover:text-brand-navy transition-colors">
              <ArrowLeft size={18} />
            </Link>
            <div>
              <h1 className="font-heading font-bold text-2xl text-brand-navy">Home Carousel</h1>
              <p className="text-xs font-body text-brand-contrast mt-0.5">{slides.length} slides · {slides.filter(s => s.enabled).length} enabled</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {status && <span className="text-xs font-heading font-bold text-green-600 uppercase tracking-wider">{status}</span>}
            {saving && <span className="text-xs font-body text-brand-contrast">Saving…</span>}
            <button
              onClick={addSlide}
              className="flex items-center gap-2 bg-brand-accent text-brand-navy rounded px-4 py-2.5 text-xs font-heading font-bold uppercase tracking-widest hover:bg-brand-accent/85 transition-colors"
            >
              <Plus size={14} /> Add Slide
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {slides.map((slide, i) => (
            <div key={slide.id} className={`bg-white border transition-colors ${slide.enabled ? "border-brand-contrast/10" : "border-brand-contrast/5 opacity-60"}`}>
              {/* Slide header */}
              <div className="flex items-center gap-4 px-5 py-4">
                <div className="flex flex-col gap-1">
                  <button onClick={() => move(slide.id, -1)} disabled={i === 0} className="text-brand-contrast/40 hover:text-brand-navy disabled:opacity-20 transition-colors"><ChevronUp size={14} /></button>
                  <button onClick={() => move(slide.id, 1)} disabled={i === slides.length - 1} className="text-brand-contrast/40 hover:text-brand-navy disabled:opacity-20 transition-colors"><ChevronDown size={14} /></button>
                </div>
                <span className="text-xs font-heading font-bold text-brand-contrast/40 w-4">{i + 1}</span>

                {/* Thumbnail */}
                {slide.image && (
                  <div className="w-16 h-10 relative overflow-hidden bg-brand-contrast/5 shrink-0">
                    <img src={slide.image} alt="" className="w-full h-full object-cover" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <p className="font-heading font-bold text-sm text-brand-navy truncate">{slide.headline || <span className="text-brand-contrast/40">Untitled slide</span>}</p>
                  <p className="text-xs font-body text-brand-contrast truncate">{slide.tagline}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => toggle(slide.id)}
                    className={`flex items-center gap-1.5 text-[10px] font-heading font-bold uppercase tracking-wider px-3 py-1.5 transition-colors ${
                      slide.enabled ? "bg-green-50 text-green-700 hover:bg-green-100" : "bg-[#F8F9FC] text-brand-contrast hover:bg-brand-contrast/10"
                    }`}
                  >
                    {slide.enabled ? <Eye size={11} /> : <EyeOff size={11} />}
                    {slide.enabled ? "Enabled" : "Disabled"}
                  </button>
                  <button
                    onClick={() => setEditing(editing === slide.id ? null : slide.id)}
                    className="text-[10px] font-heading font-bold uppercase tracking-wider px-3 py-1.5 border border-brand-contrast/20 text-brand-contrast hover:text-brand-navy hover:border-brand-navy transition-colors"
                  >
                    {editing === slide.id ? "Close" : "Edit"}
                  </button>
                  <button onClick={() => remove(slide.id)} className="text-red-400 hover:text-red-600 transition-colors p-1.5">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Expanded editor */}
              {editing === slide.id && (
                <div className="border-t border-brand-contrast/10 p-5 bg-[#F8F9FC] space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Tagline</label>
                      <input value={slide.tagline} onChange={(e) => updateSlide(slide.id, "tagline", e.target.value)} className={inputCls} placeholder="Science-Backed Skincare" />
                    </div>
                    <div>
                      <label className={labelCls}>Headline (use \n for line breaks)</label>
                      <input value={slide.headline} onChange={(e) => updateSlide(slide.id, "headline", e.target.value)} className={inputCls} placeholder="KENTELLE" />
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Subtext</label>
                    <input value={slide.sub} onChange={(e) => updateSlide(slide.id, "sub", e.target.value)} className={inputCls} placeholder="Treat yourself, beauty you can telle." />
                  </div>
                  <div>
                    <label className={labelCls}>Image URL</label>
                    <input value={slide.image} onChange={(e) => updateSlide(slide.id, "image", e.target.value)} className={inputCls} placeholder="/images/hero/hero-slide1.png or https://..." />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Primary Button Label</label>
                      <input value={slide.ctaLabel} onChange={(e) => updateSlide(slide.id, "ctaLabel", e.target.value)} className={inputCls} placeholder="Shop All" />
                    </div>
                    <div>
                      <label className={labelCls}>Primary Button Link</label>
                      <input value={slide.ctaHref} onChange={(e) => updateSlide(slide.id, "ctaHref", e.target.value)} className={inputCls} placeholder="/shop" />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Secondary Button Label (optional)</label>
                      <input value={slide.cta2Label} onChange={(e) => updateSlide(slide.id, "cta2Label", e.target.value)} className={inputCls} placeholder="About Us" />
                    </div>
                    <div>
                      <label className={labelCls}>Secondary Button Link (optional)</label>
                      <input value={slide.cta2Href} onChange={(e) => updateSlide(slide.id, "cta2Href", e.target.value)} className={inputCls} placeholder="/about" />
                    </div>
                  </div>
                  <div className="flex gap-3 pt-1">
                    <button
                      onClick={saveEditing}
                      className="px-6 py-2.5 bg-brand-navy text-brand-white rounded text-xs font-heading font-bold uppercase tracking-widest hover:bg-brand-blue transition-colors"
                    >
                      Save Slide
                    </button>
                    <button onClick={() => setEditing(null)} className="px-4 py-2.5 text-xs font-heading font-bold uppercase tracking-widest text-brand-contrast hover:text-brand-navy transition-colors">
                      Cancel
                    </button>
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
