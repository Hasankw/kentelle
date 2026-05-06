"use client";

import { useEffect, useState, useTransition } from "react";
import AdminShell from "@/components/admin/AdminShell";
import { Star, X, Plus, GripVertical, Check } from "lucide-react";

type Product = { id: string; name: string; price: number; images: string[] };

export default function BestsellersAdminPage() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/bestsellers").then((r) => r.json()),
      fetch("/api/admin/products?limit=200").then((r) => r.json()),
    ]).then(([bs, prods]) => {
      setSelectedIds(bs.ids ?? []);
      setAllProducts((prods.products ?? prods ?? []).filter((p: any) => p.isActive !== false));
    });
  }, []);

  const toggle = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
    setSaved(false);
  };

  const remove = (id: string) => {
    setSelectedIds((prev) => prev.filter((x) => x !== id));
    setSaved(false);
  };

  const moveUp = (i: number) => {
    if (i === 0) return;
    const next = [...selectedIds];
    [next[i - 1], next[i]] = [next[i], next[i - 1]];
    setSelectedIds(next);
    setSaved(false);
  };

  const moveDown = (i: number) => {
    if (i === selectedIds.length - 1) return;
    const next = [...selectedIds];
    [next[i], next[i + 1]] = [next[i + 1], next[i]];
    setSelectedIds(next);
    setSaved(false);
  };

  const save = () => {
    startTransition(async () => {
      await fetch("/api/admin/bestsellers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds }),
      });
      setSaved(true);
    });
  };

  const filtered = allProducts.filter(
    (p) =>
      !selectedIds.includes(p.id) &&
      p.name.toLowerCase().includes(search.toLowerCase())
  );

  const selectedProducts = selectedIds
    .map((id) => allProducts.find((p) => p.id === id))
    .filter(Boolean) as Product[];

  return (
    <AdminShell>
      <div className="p-8 max-w-5xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-heading font-bold text-2xl text-brand-navy">Bestsellers</h1>
            <p className="text-xs font-body text-brand-contrast mt-1">
              Choose up to 12 products shown in the Bestsellers section on the homepage.
            </p>
          </div>
          <button
            onClick={save}
            disabled={isPending}
            className="flex items-center gap-2 px-5 py-2.5 bg-brand-navy text-white text-xs font-heading font-bold uppercase tracking-widest hover:bg-brand-blue transition-colors disabled:opacity-50 rounded"
          >
            {saved ? <Check size={13} /> : <Star size={13} />}
            {saved ? "Saved!" : isPending ? "Saving…" : "Save"}
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Left: current selection */}
          <div>
            <p className="text-xs font-heading font-bold uppercase tracking-widest text-brand-navy mb-3">
              Current ({selectedProducts.length})
            </p>
            {selectedProducts.length === 0 && (
              <p className="text-sm font-body text-brand-contrast/50 italic">No products selected yet.</p>
            )}
            <ul className="space-y-1.5">
              {selectedProducts.map((p, i) => (
                <li
                  key={p.id}
                  className="flex items-center gap-2 bg-white border border-brand-contrast/10 px-3 py-2 rounded"
                >
                  <span className="text-brand-contrast/30 w-5 text-xs font-mono text-center shrink-0">{i + 1}</span>
                  {p.images?.[0] && (
                    <img src={p.images[0]} alt="" className="w-8 h-8 object-cover rounded shrink-0" />
                  )}
                  <span className="text-xs font-body text-brand-navy flex-1 truncate">{p.name}</span>
                  <div className="flex gap-0.5">
                    <button
                      onClick={() => moveUp(i)}
                      disabled={i === 0}
                      className="p-1 text-brand-contrast/40 hover:text-brand-navy disabled:opacity-20"
                      title="Move up"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => moveDown(i)}
                      disabled={i === selectedProducts.length - 1}
                      className="p-1 text-brand-contrast/40 hover:text-brand-navy disabled:opacity-20"
                      title="Move down"
                    >
                      ↓
                    </button>
                  </div>
                  <button
                    onClick={() => remove(p.id)}
                    className="text-red-400 hover:text-red-600 p-1"
                  >
                    <X size={13} />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Right: product picker */}
          <div>
            <p className="text-xs font-heading font-bold uppercase tracking-widest text-brand-navy mb-3">
              Add Products
            </p>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products…"
              className="w-full border border-brand-contrast/20 px-3 py-2 text-sm font-body text-brand-navy mb-3 focus:outline-none focus:border-brand-blue"
            />
            <ul className="space-y-1 max-h-[420px] overflow-y-auto">
              {filtered.map((p) => (
                <li key={p.id}>
                  <button
                    onClick={() => toggle(p.id)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-brand-contrast/5 rounded transition-colors"
                  >
                    {p.images?.[0] && (
                      <img src={p.images[0]} alt="" className="w-8 h-8 object-cover rounded shrink-0" />
                    )}
                    <span className="text-xs font-body text-brand-navy flex-1 truncate">{p.name}</span>
                    <Plus size={13} className="text-brand-accent shrink-0" />
                  </button>
                </li>
              ))}
              {filtered.length === 0 && (
                <li className="text-sm font-body text-brand-contrast/50 italic px-3 py-2">No more products to add.</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
