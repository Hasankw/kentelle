"use client";

import { useEffect, useState, use } from "react";
import AdminShell from "@/components/admin/AdminShell";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Search, X, ToggleLeft, ToggleRight, Save, Upload } from "lucide-react";

type Product = { id: string; name: string; slug: string; price: number; images: string[]; isActive: boolean };
type EventData = { id: string; title: string; subtitle: string | null; image: string | null; enabled: boolean; products: Product[] };

export default function AdminEventEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [event, setEvent] = useState<EventData | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({ title: "", subtitle: "", image: "" });
  const [uploadingImg, setUploadingImg] = useState(false);

  const load = async () => {
    setLoading(true);
    const [eventRes, productsRes] = await Promise.all([
      fetch(`/api/admin/events/${id}`),
      fetch("/api/admin/products?take=200"),
    ]);
    if (eventRes.ok) {
      const data = await eventRes.json();
      setEvent(data);
      setForm({ title: data.title, subtitle: data.subtitle ?? "", image: data.image ?? "" });
    }
    if (productsRes.ok) {
      const data = await productsRes.json();
      setAllProducts(Array.isArray(data) ? data : data.products ?? []);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, [id]);

  const save = async () => {
    if (!event) return;
    setSaving(true);
    await fetch(`/api/admin/events/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: form.title, subtitle: form.subtitle || null, image: form.image || null }),
    });
    setEvent((e) => e ? { ...e, title: form.title, subtitle: form.subtitle || null, image: form.image || null } : e);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    setSaving(false);
  };

  const handleImageUpload = async (file: File) => {
    setUploadingImg(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (data.url) setForm((f) => ({ ...f, image: data.url }));
    setUploadingImg(false);
  };

  const toggleEnabled = async () => {
    if (!event) return;
    const next = !event.enabled;
    setEvent((e) => e ? { ...e, enabled: next } : e);
    await fetch(`/api/admin/events/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled: next }),
    });
  };

  const addProduct = async (product: Product) => {
    if (!event) return;
    if (event.products.find((p) => p.id === product.id)) return;
    setEvent((e) => e ? { ...e, products: [...e.products, product] } : e);
    await fetch(`/api/admin/events/${id}/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: product.id }),
    });
  };

  const removeProduct = async (productId: string) => {
    if (!event) return;
    setEvent((e) => e ? { ...e, products: e.products.filter((p) => p.id !== productId) } : e);
    await fetch(`/api/admin/events/${id}/products`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId }),
    });
  };

  const taggedIds = new Set(event?.products.map((p) => p.id) ?? []);
  const filtered = allProducts.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) && !taggedIds.has(p.id)
  );

  const fieldClass = "w-full border border-brand-contrast/20 px-3 py-2.5 text-sm font-body text-brand-navy bg-white focus:outline-none focus:border-brand-blue";

  if (loading) return (
    <AdminShell>
      <div className="p-8 text-sm font-body text-brand-contrast">Loading…</div>
    </AdminShell>
  );

  if (!event) return (
    <AdminShell>
      <div className="p-8 text-sm font-body text-red-500">Event not found.</div>
    </AdminShell>
  );

  return (
    <AdminShell>
      <div className="p-8 max-w-5xl">
        <Link href="/admin/events" className="inline-flex items-center gap-2 text-xs font-body text-brand-contrast hover:text-brand-navy mb-6">
          <ArrowLeft size={14} /> All Events
        </Link>

        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="font-heading font-bold text-2xl text-brand-navy">{event.title}</h1>
            <p className="text-xs font-body text-brand-contrast mt-1">{event.products.length} products tagged</p>
          </div>
          {/* Enabled toggle */}
          <button
            onClick={toggleEnabled}
            className="flex items-center gap-2 px-4 py-2 rounded border text-xs font-heading font-bold uppercase tracking-wider transition-colors"
            style={event.enabled
              ? { borderColor: "#3DECC2", color: "#3A3240", background: "#E8FBF6" }
              : { borderColor: "#E0D8E8", color: "#9B8FA0", background: "white" }
            }
          >
            {event.enabled
              ? <><ToggleRight size={16} className="text-brand-blue" /> Live on site</>
              : <><ToggleLeft size={16} /> Hidden</>
            }
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Left: Event details */}
          <div>
            <div className="bg-white border border-brand-contrast/10 rounded p-5 mb-6">
              <h2 className="font-heading font-bold text-sm uppercase tracking-wider text-brand-navy mb-4">Event Details</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-heading font-bold uppercase tracking-wider text-brand-navy mb-1.5">Title *</label>
                  <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className={fieldClass} />
                </div>
                <div>
                  <label className="block text-xs font-heading font-bold uppercase tracking-wider text-brand-navy mb-1.5">Subtitle</label>
                  <input value={form.subtitle} onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))} placeholder="Optional tagline shown below the title" className={fieldClass} />
                </div>
                <div>
                  <label className="block text-xs font-heading font-bold uppercase tracking-wider text-brand-navy mb-1.5">Cover Image</label>
                  {form.image && (
                    <div className="relative mb-2 w-full aspect-video overflow-hidden rounded border border-brand-contrast/10">
                      <img src={form.image} alt="Cover" className="object-cover w-full h-full" />
                      <button type="button" onClick={() => setForm((f) => ({ ...f, image: "" }))} className="absolute top-1.5 right-1.5 bg-red-500 text-white rounded-full p-0.5">
                        <X size={11} />
                      </button>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <input
                      value={form.image}
                      onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
                      placeholder="Paste image URL or upload…"
                      className={`${fieldClass} flex-1 text-xs`}
                    />
                    <label className="flex items-center gap-1.5 px-3 py-2 border border-brand-contrast/20 text-xs font-heading font-bold uppercase tracking-wider text-brand-navy hover:bg-brand-contrast/5 cursor-pointer whitespace-nowrap">
                      {uploadingImg ? "…" : <><Upload size={12} /> Upload</>}
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])} />
                    </label>
                  </div>
                </div>
                <button
                  onClick={save}
                  disabled={saving || !form.title.trim()}
                  className="flex items-center gap-2 px-4 py-2 bg-brand-navy text-white text-xs font-heading font-bold uppercase tracking-widest rounded hover:bg-brand-blue transition-colors disabled:opacity-50"
                >
                  <Save size={13} />
                  {saving ? "Saving…" : saved ? "Saved!" : "Save Details"}
                </button>
              </div>
            </div>

            {/* Tagged products */}
            <div className="bg-white border border-brand-contrast/10 rounded p-5">
              <h2 className="font-heading font-bold text-sm uppercase tracking-wider text-brand-navy mb-4">
                Tagged Products ({event.products.length})
              </h2>
              {event.products.length === 0 ? (
                <p className="text-xs font-body text-brand-contrast/60 py-4 text-center">No products tagged yet — search and add from the right panel</p>
              ) : (
                <div className="space-y-2">
                  {event.products.map((p) => (
                    <div key={p.id} className="flex items-center gap-3 py-2 border-b border-brand-contrast/10 last:border-0">
                      <div className="w-10 h-10 rounded shrink-0 overflow-hidden bg-brand-contrast/5">
                        {p.images?.[0] ? (
                          <Image src={p.images[0]} alt={p.name} width={40} height={40} className="object-cover w-full h-full" />
                        ) : (
                          <div className="w-full h-full bg-brand-contrast/10" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-body font-medium text-brand-navy truncate">{p.name}</p>
                        <p className="text-[11px] font-body text-brand-contrast">${p.price}</p>
                      </div>
                      <button
                        onClick={() => removeProduct(p.id)}
                        className="p-1 text-brand-contrast/40 hover:text-red-500 transition-colors rounded"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Product search */}
          <div className="bg-white border border-brand-contrast/10 rounded p-5">
            <h2 className="font-heading font-bold text-sm uppercase tracking-wider text-brand-navy mb-4">Add Products</h2>
            <div className="relative mb-4">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-contrast/50" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products…"
                className="w-full border border-brand-contrast/20 pl-9 pr-3 py-2.5 text-sm font-body text-brand-navy bg-white focus:outline-none focus:border-brand-blue"
              />
            </div>
            <div className="space-y-1 max-h-[480px] overflow-y-auto" style={{ scrollbarWidth: "thin" }}>
              {filtered.length === 0 ? (
                <p className="text-xs font-body text-brand-contrast/60 text-center py-6">
                  {search ? "No products match your search" : "All products already tagged"}
                </p>
              ) : (
                filtered.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => addProduct(p)}
                    className="w-full flex items-center gap-3 p-2.5 rounded hover:bg-[#F5EEF3] text-left transition-colors group"
                  >
                    <div className="w-9 h-9 rounded shrink-0 overflow-hidden bg-brand-contrast/5">
                      {p.images?.[0] ? (
                        <Image src={p.images[0]} alt={p.name} width={36} height={36} className="object-cover w-full h-full" />
                      ) : (
                        <div className="w-full h-full bg-brand-contrast/10" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-body font-medium text-brand-navy truncate">{p.name}</p>
                      <p className="text-[11px] font-body text-brand-contrast">${p.price}</p>
                    </div>
                    <span className="text-[10px] font-heading font-bold uppercase tracking-wider text-brand-blue opacity-0 group-hover:opacity-100 transition-opacity shrink-0">+ Add</span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
