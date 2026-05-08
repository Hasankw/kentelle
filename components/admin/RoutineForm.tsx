"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { slugify } from "@/lib/utils";

interface Step {
  number: number;
  name: string;
  subtitle?: string;
  choices: string;
  description: string;
}

interface Tip {
  label: string;
  content: string;
}

interface RoutineData {
  id?: string;
  title: string;
  slug: string;
  tagline: string;
  category: string;
  sortOrder: number;
  published: boolean;
  steps: Step[];
  tips: { suitability: string; items: Tip[] };
}

export default function RoutineForm({ routine }: { routine?: Partial<RoutineData> }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [form, setForm] = useState<RoutineData>({
    id: routine?.id,
    title: routine?.title ?? "",
    slug: routine?.slug ?? "",
    tagline: routine?.tagline ?? "",
    category: routine?.category ?? "routine",
    sortOrder: routine?.sortOrder ?? 0,
    published: routine?.published !== false,
    steps: routine?.steps ?? [],
    tips: routine?.tips ?? { suitability: "", items: [] },
  });

  const set = <K extends keyof RoutineData>(key: K, value: RoutineData[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleTitleChange = (v: string) => {
    set("title", v);
    if (!routine?.id) set("slug", slugify(v));
  };

  // Steps
  const addStep = () => {
    const steps = [...form.steps, { number: form.steps.length + 1, name: "", choices: "", description: "" }];
    set("steps", steps);
  };
  const updateStep = (i: number, key: keyof Step, val: string | number) => {
    const steps = form.steps.map((s, idx) => idx === i ? { ...s, [key]: val } : s);
    set("steps", steps);
  };
  const removeStep = (i: number) => {
    const steps = form.steps.filter((_, idx) => idx !== i).map((s, idx) => ({ ...s, number: idx + 1 }));
    set("steps", steps);
  };

  // Tips
  const addTip = () => {
    const items = [...form.tips.items, { label: "", content: "" }];
    set("tips", { ...form.tips, items });
  };
  const updateTip = (i: number, key: keyof Tip, val: string) => {
    const items = form.tips.items.map((t, idx) => idx === i ? { ...t, [key]: val } : t);
    set("tips", { ...form.tips, items });
  };
  const removeTip = (i: number) => {
    const items = form.tips.items.filter((_, idx) => idx !== i);
    set("tips", { ...form.tips, items });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const url = form.id ? `/api/admin/routines/${form.id}` : "/api/admin/routines";
      const method = form.id ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, tips: form.tips.items.length || form.tips.suitability ? form.tips : null }),
      });
      if (res.ok) router.push("/admin/routines");
    });
  };

  const handleDelete = () => {
    if (!form.id || !confirm("Delete this routine?")) return;
    startTransition(async () => {
      await fetch(`/api/admin/routines/${form.id}`, { method: "DELETE" });
      router.push("/admin/routines");
    });
  };

  const inputCls = "w-full border border-brand-contrast/20 px-3 py-2.5 text-sm font-body text-brand-navy bg-white focus:outline-none focus:border-brand-blue";
  const labelCls = "block text-xs font-heading font-bold uppercase tracking-wider text-brand-navy mb-1.5";

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic info */}
      <div className="grid md:grid-cols-2 gap-5">
        <div>
          <label className={labelCls}>Title *</label>
          <input required value={form.title} onChange={(e) => handleTitleChange(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Slug *</label>
          <input required value={form.slug} onChange={(e) => set("slug", e.target.value)} className={`${inputCls} font-mono`} />
        </div>
      </div>

      <div>
        <label className={labelCls}>Tagline</label>
        <input value={form.tagline} onChange={(e) => set("tagline", e.target.value)} className={inputCls} />
      </div>

      <div className="grid md:grid-cols-3 gap-5">
        <div>
          <label className={labelCls}>Category *</label>
          <select value={form.category} onChange={(e) => set("category", e.target.value)} className={inputCls}>
            <option value="routine">Skincare Routine</option>
            <option value="clinical">Clinical Treatment</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>Sort Order</label>
          <input type="number" value={form.sortOrder} onChange={(e) => set("sortOrder", Number(e.target.value))} className={inputCls} />
        </div>
        <div className="flex items-end pb-2.5">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) => set("published", e.target.checked)}
              className="accent-brand-blue w-4 h-4"
            />
            <span className="text-sm font-body text-brand-navy">Published</span>
          </label>
        </div>
      </div>

      {/* Steps */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-heading font-bold uppercase tracking-wider text-brand-navy">Steps</h2>
          <button type="button" onClick={addStep} className="flex items-center gap-1.5 text-xs font-heading font-bold uppercase tracking-wider text-brand-blue hover:text-brand-navy transition-colors">
            <Plus size={13} /> Add Step
          </button>
        </div>
        <div className="space-y-4">
          {form.steps.map((step, i) => (
            <div key={i} className="border border-brand-contrast/10 p-4 bg-[#F8F9FC]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-heading font-bold uppercase tracking-wider text-brand-contrast">Step {step.number}</span>
                <button type="button" onClick={() => removeStep(i)} className="text-red-400 hover:text-red-600 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="grid md:grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-[10px] font-heading font-bold uppercase tracking-wider text-brand-contrast mb-1">Step Name *</label>
                  <input required value={step.name} onChange={(e) => updateStep(i, "name", e.target.value)} placeholder="e.g. CLEANSE" className={inputCls} />
                </div>
                <div>
                  <label className="block text-[10px] font-heading font-bold uppercase tracking-wider text-brand-contrast mb-1">Subtitle (optional)</label>
                  <input value={step.subtitle ?? ""} onChange={(e) => updateStep(i, "subtitle", e.target.value)} placeholder="e.g. The Game Changer" className={inputCls} />
                </div>
              </div>
              <div className="mb-3">
                <label className="block text-[10px] font-heading font-bold uppercase tracking-wider text-brand-contrast mb-1">Product Choices *</label>
                <input required value={step.choices} onChange={(e) => updateStep(i, "choices", e.target.value)} placeholder="e.g. Milk Cleanser or Ceramide Cleanser" className={inputCls} />
              </div>
              <div>
                <label className="block text-[10px] font-heading font-bold uppercase tracking-wider text-brand-contrast mb-1">Description *</label>
                <textarea required rows={2} value={step.description} onChange={(e) => updateStep(i, "description", e.target.value)} className={`${inputCls} resize-none`} />
              </div>
            </div>
          ))}
          {form.steps.length === 0 && (
            <p className="text-sm font-body text-brand-contrast/50 text-center py-6 border border-dashed border-brand-contrast/20">
              No steps yet. Click "Add Step" to begin.
            </p>
          )}
        </div>
      </div>

      {/* Tips */}
      <div>
        <h2 className="text-xs font-heading font-bold uppercase tracking-wider text-brand-navy mb-3">Tips & Suitability</h2>
        <div className="mb-4">
          <label className={labelCls}>Suitability (Best for / Ideal for)</label>
          <textarea rows={2} value={form.tips.suitability} onChange={(e) => set("tips", { ...form.tips, suitability: e.target.value })} className={`${inputCls} resize-none`} />
        </div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-heading font-bold uppercase tracking-wider text-brand-contrast">Tip Items</span>
          <button type="button" onClick={addTip} className="flex items-center gap-1.5 text-xs font-heading font-bold uppercase tracking-wider text-brand-blue hover:text-brand-navy transition-colors">
            <Plus size={13} /> Add Tip
          </button>
        </div>
        <div className="space-y-3">
          {form.tips.items.map((tip, i) => (
            <div key={i} className="border border-brand-contrast/10 p-4 bg-[#F8F9FC] grid md:grid-cols-[1fr_2fr_auto] gap-3 items-start">
              <div>
                <label className="block text-[10px] font-heading font-bold uppercase tracking-wider text-brand-contrast mb-1">Label</label>
                <input value={tip.label} onChange={(e) => updateTip(i, "label", e.target.value)} placeholder="e.g. Start Slow" className={inputCls} />
              </div>
              <div>
                <label className="block text-[10px] font-heading font-bold uppercase tracking-wider text-brand-contrast mb-1">Content</label>
                <textarea rows={2} value={tip.content} onChange={(e) => updateTip(i, "content", e.target.value)} className={`${inputCls} resize-none`} />
              </div>
              <button type="button" onClick={() => removeTip(i)} className="text-red-400 hover:text-red-600 transition-colors mt-6">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="px-6 py-2.5 bg-brand-navy text-brand-white rounded text-xs font-heading font-bold uppercase tracking-widest hover:bg-brand-blue transition-colors disabled:opacity-50"
        >
          {isPending ? "Saving..." : form.id ? "Update Routine" : "Create Routine"}
        </button>
        {form.id && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={isPending}
            className="px-6 py-2.5 border border-red-200 text-red-600 text-xs font-heading font-bold uppercase tracking-widest hover:bg-red-50 transition-colors disabled:opacity-50"
          >
            Delete
          </button>
        )}
      </div>
    </form>
  );
}
