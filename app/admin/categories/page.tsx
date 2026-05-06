"use client";

import { useState, useEffect, useCallback } from "react";
import AdminShell from "@/components/admin/AdminShell";
import { Plus, Pencil, Trash2, Eye, EyeOff, X, Check, Loader2 } from "lucide-react";

type Category = {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  description: string | null;
  image: string | null;
  sortOrder: number;
  _count: { products: number };
};

type FormState = {
  name: string;
  slug: string;
  tagline: string;
  description: string;
  image: string;
  sortOrder: string;
};

const EMPTY_FORM: FormState = { name: "", slug: "", tagline: "", description: "", image: "", sortOrder: "0" };

function slugify(s: string) {
  return s.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [hidden, setHidden] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  const [editTarget, setEditTarget] = useState<Category | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [formSaving, setFormSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [catsRes, visRes] = await Promise.all([
      fetch("/api/admin/categories"),
      fetch("/api/admin/categories/visibility"),
    ]);
    const cats = await catsRes.json();
    const vis = await visRes.json();
    setCategories(cats);
    setHidden(vis.hidden ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function toggleVisibility(slug: string) {
    const isVisible = !hidden.includes(slug);
    setSaving(slug);
    const res = await fetch("/api/admin/categories/visibility", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, visible: !isVisible }),
    });
    const data = await res.json();
    setHidden(data.hidden ?? []);
    setSaving(null);
  }

  function openEdit(cat: Category) {
    setEditTarget(cat);
    setForm({
      name: cat.name,
      slug: cat.slug,
      tagline: cat.tagline ?? "",
      description: cat.description ?? "",
      image: cat.image ?? "",
      sortOrder: String(cat.sortOrder),
    });
    setFormError("");
    setShowAdd(false);
  }

  function openAdd() {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setShowAdd(true);
  }

  function closeModal() {
    setEditTarget(null);
    setShowAdd(false);
    setFormError("");
  }

  async function saveForm() {
    if (!form.name.trim()) { setFormError("Name is required."); return; }
    if (!form.slug.trim()) { setFormError("Slug is required."); return; }
    setFormSaving(true);
    setFormError("");

    try {
      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim(),
        tagline: form.tagline.trim() || null,
        description: form.description.trim() || null,
        image: form.image.trim() || null,
        sortOrder: Number(form.sortOrder) || 0,
      };

      if (editTarget) {
        const res = await fetch(`/api/admin/categories/${editTarget.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(await res.text());
      } else {
        const res = await fetch("/api/admin/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(await res.text());
      }

      closeModal();
      await load();
    } catch (e: any) {
      setFormError(e.message ?? "Something went wrong.");
    } finally {
      setFormSaving(false);
    }
  }

  async function deleteCategory(cat: Category) {
    if (!confirm(`Delete "${cat.name}"? This cannot be undone.`)) return;
    await fetch(`/api/admin/categories/${cat.id}`, { method: "DELETE" });
    await load();
  }

  return (
    <AdminShell>
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-heading font-bold text-2xl text-brand-navy">
            Categories {!loading && `(${categories.length})`}
          </h1>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 bg-brand-accent text-brand-navy rounded px-4 py-2.5 text-xs font-heading font-bold uppercase tracking-widest hover:bg-brand-accent/85 transition-colors"
          >
            <Plus size={14} />
            Add Category
          </button>
        </div>

        <p className="text-xs font-body text-brand-contrast mb-5">
          Toggle <span className="font-bold">Show in Collections</span> to control which categories appear on the public Collections page.
        </p>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 size={24} className="animate-spin text-brand-blue" />
          </div>
        ) : (
          <div className="bg-white border border-brand-contrast/10 shadow-sm overflow-x-auto">
            <table className="w-full text-sm font-body">
              <thead>
                <tr className="border-b border-brand-contrast/10 bg-[#F8F9FC]">
                  {["Name", "Slug", "Tagline", "Products", "Sort", "In Collections", ""].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-heading font-bold uppercase tracking-wider text-brand-contrast whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-contrast/10">
                {categories.map((cat) => {
                  const isVisible = !hidden.includes(cat.slug);
                  const isSaving = saving === cat.slug;
                  return (
                    <tr key={cat.id} className="hover:bg-[#F8F9FC] transition-colors">
                      <td className="px-5 py-3 font-bold text-brand-navy whitespace-nowrap">{cat.name}</td>
                      <td className="px-5 py-3 text-brand-contrast font-mono text-xs">{cat.slug}</td>
                      <td className="px-5 py-3 text-brand-contrast text-xs max-w-[180px] truncate">{cat.tagline ?? "—"}</td>
                      <td className="px-5 py-3 text-brand-contrast text-center">{cat._count.products}</td>
                      <td className="px-5 py-3 text-brand-contrast text-center">{cat.sortOrder}</td>
                      <td className="px-5 py-3">
                        <button
                          onClick={() => toggleVisibility(cat.slug)}
                          disabled={isSaving}
                          title={isVisible ? "Visible in Collections — click to hide" : "Hidden from Collections — click to show"}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-[11px] font-heading font-bold uppercase tracking-wider transition-colors ${
                            isVisible
                              ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                              : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                          } ${isSaving ? "opacity-50 cursor-wait" : ""}`}
                        >
                          {isSaving ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : isVisible ? (
                            <Eye size={12} />
                          ) : (
                            <EyeOff size={12} />
                          )}
                          {isVisible ? "Visible" : "Hidden"}
                        </button>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEdit(cat)}
                            className="p-1.5 rounded text-brand-blue hover:bg-brand-blue/10 transition-colors"
                            title="Edit category"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => deleteCategory(cat)}
                            className="p-1.5 rounded text-red-500 hover:bg-red-50 transition-colors"
                            title="Delete category"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit / Add Modal */}
      {(editTarget || showAdd) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-[6px] shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b border-brand-contrast/10">
              <h2 className="font-heading font-bold text-base text-brand-navy">
                {editTarget ? `Edit: ${editTarget.name}` : "Add New Category"}
              </h2>
              <button onClick={closeModal} className="text-brand-contrast hover:text-brand-navy transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              <Field label="Name *" value={form.name} onChange={(v) => {
                setForm((f) => ({ ...f, name: v, slug: f.slug || slugify(v) }));
              }} />
              <Field label="Slug *" value={form.slug} onChange={(v) => setForm((f) => ({ ...f, slug: slugify(v) }))} mono />
              <Field label="Tagline" value={form.tagline} onChange={(v) => setForm((f) => ({ ...f, tagline: v }))} placeholder="E.g. Daily care for every skin type" />
              <Field label="Description" value={form.description} onChange={(v) => setForm((f) => ({ ...f, description: v }))} textarea />
              <Field label="Image URL" value={form.image} onChange={(v) => setForm((f) => ({ ...f, image: v }))} placeholder="/images/hero/hero-slide2.jpg" />
              <Field label="Sort Order" value={form.sortOrder} onChange={(v) => setForm((f) => ({ ...f, sortOrder: v }))} type="number" />

              {formError && (
                <p className="text-xs text-red-600 font-body">{formError}</p>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-brand-contrast/10">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-xs font-heading font-bold uppercase tracking-wider text-brand-contrast hover:text-brand-navy transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveForm}
                disabled={formSaving}
                className="flex items-center gap-2 px-5 py-2 bg-brand-navy text-white rounded text-xs font-heading font-bold uppercase tracking-widest hover:bg-brand-blue transition-colors disabled:opacity-50"
              >
                {formSaving ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                {editTarget ? "Save Changes" : "Create Category"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}

function Field({
  label, value, onChange, textarea, mono, placeholder, type,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  textarea?: boolean;
  mono?: boolean;
  placeholder?: string;
  type?: string;
}) {
  const base = `w-full border border-brand-contrast/20 rounded px-3 py-2 text-sm font-body text-brand-navy focus:outline-none focus:border-brand-blue transition-colors ${mono ? "font-mono text-xs" : ""}`;
  return (
    <div>
      <label className="block text-[11px] font-heading font-bold uppercase tracking-wider text-brand-contrast mb-1.5">
        {label}
      </label>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className={base}
        />
      ) : (
        <input
          type={type ?? "text"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={base}
        />
      )}
    </div>
  );
}
