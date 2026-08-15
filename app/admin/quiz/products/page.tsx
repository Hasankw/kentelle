"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, Loader2, Search } from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";
import QuizAdminTabs from "@/components/admin/QuizAdminTabs";
import { toast } from "@/components/ui/Toast";

type QuizProduct = {
  id: string;
  name: string;
  slug: string;
  images: string[];
  quizStep: string | null;
  quizTags: string[];
};

const STEP_OPTIONS = [
  { value: "", label: "— Not in quiz —" },
  { value: "cleanser", label: "Cleanser" },
  { value: "toner", label: "Toner / Mist" },
  { value: "treatment", label: "Treatment" },
  { value: "moisturiser", label: "Moisturiser" },
  { value: "eye", label: "Eye Care" },
  { value: "special", label: "Special Care" },
];

const PLACEHOLDER = "/images/placeholder.svg";

export default function QuizProductsAdminPage() {
  const [products, setProducts] = useState<QuizProduct[] | null>(null);
  const [query, setQuery] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [dirty, setDirty] = useState<Record<string, { quizStep: string; quizTagsText: string }>>({});

  useEffect(() => {
    fetch("/api/admin/quiz/products")
      .then((r) => r.json())
      .then((data: QuizProduct[]) => setProducts(data))
      .catch(() => toast("error", "Failed to load products"));
  }, []);

  const filtered = useMemo(() => {
    if (!products) return [];
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => p.name.toLowerCase().includes(q));
  }, [products, query]);

  const getStep = (p: QuizProduct) => dirty[p.id]?.quizStep ?? p.quizStep ?? "";
  const getTagsText = (p: QuizProduct) => dirty[p.id]?.quizTagsText ?? p.quizTags.join(", ");

  const setField = (p: QuizProduct, field: "quizStep" | "quizTagsText", value: string) => {
    setDirty((prev) => ({
      ...prev,
      [p.id]: {
        quizStep: field === "quizStep" ? value : (prev[p.id]?.quizStep ?? p.quizStep ?? ""),
        quizTagsText: field === "quizTagsText" ? value : (prev[p.id]?.quizTagsText ?? p.quizTags.join(", ")),
      },
    }));
  };

  const save = async (p: QuizProduct) => {
    const quizStep = getStep(p);
    const quizTags = getTagsText(p)
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    setSavingId(p.id);
    try {
      const res = await fetch("/api/admin/quiz/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: p.id, quizStep: quizStep || null, quizTags }),
      });
      if (!res.ok) throw new Error();
      setProducts((prev) => prev!.map((row) => (row.id === p.id ? { ...row, quizStep: quizStep || null, quizTags } : row)));
      setDirty((prev) => {
        const next = { ...prev };
        delete next[p.id];
        return next;
      });
      setSavedId(p.id);
      setTimeout(() => setSavedId((cur) => (cur === p.id ? null : cur)), 1800);
    } catch {
      toast("error", `Failed to save "${p.name}"`);
    } finally {
      setSavingId(null);
    }
  };

  const isDirty = (p: QuizProduct) => Boolean(dirty[p.id]);

  return (
    <AdminShell>
      <div className="p-8">
        <QuizAdminTabs />

        <h1 className="font-heading font-bold text-2xl text-brand-navy mb-1">Quiz Product Tags</h1>
        <p className="font-body text-sm text-brand-contrast mb-6 max-w-2xl">
          Assign each product a routine step and safety tags so the Skin Quiz recommendation engine knows where it
          belongs and when to exclude it. Tags are free text (e.g. <code className="text-brand-navy">retinoid</code>,{" "}
          <code className="text-brand-navy">exfoliant-acid</code>, <code className="text-brand-navy">high-vitc</code>)
          — they only take effect when they exactly match an <code className="text-brand-navy">excludesTag</code> on a
          rule in{" "}
          <Link href="/admin/quiz/safety" className="text-brand-blue underline">
            Safety Flag Rules
          </Link>
          .
        </p>

        <div className="relative max-w-sm mb-5">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-contrast/50" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products…"
            className="w-full pl-9 pr-3 py-2 border border-brand-contrast/20 rounded text-sm font-body text-brand-navy outline-none focus:border-brand-navy"
          />
        </div>

        {!products ? (
          <div className="flex items-center gap-2 text-brand-contrast font-body text-sm py-10">
            <Loader2 size={16} className="animate-spin" /> Loading products…
          </div>
        ) : (
          <div className="overflow-x-auto bg-white border border-brand-contrast/10 rounded">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-brand-contrast/10">
                  {["", "Product", "Routine Step", "Safety Tags", ""].map((h, i) => (
                    <th key={i} className="px-4 py-3 text-[10px] font-heading font-bold uppercase tracking-widest text-brand-contrast whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="border-b border-brand-contrast/5 last:border-b-0 align-middle">
                    <td className="px-4 py-2.5">
                      <div className="relative w-10 h-10 rounded overflow-hidden bg-brand-bg shrink-0">
                        <Image src={p.images[0] || PLACEHOLDER} alt="" fill className="object-cover" />
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-sm font-body text-brand-navy whitespace-nowrap">{p.name}</td>
                    <td className="px-4 py-2.5">
                      <select
                        value={getStep(p)}
                        onChange={(e) => setField(p, "quizStep", e.target.value)}
                        className="text-xs font-body text-brand-navy border border-brand-contrast/20 rounded px-2 py-1.5 outline-none focus:border-brand-navy"
                      >
                        {STEP_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-2.5 min-w-[220px]">
                      <input
                        value={getTagsText(p)}
                        onChange={(e) => setField(p, "quizTagsText", e.target.value)}
                        placeholder="e.g. retinoid, exfoliant-acid"
                        className="w-full text-xs font-body text-brand-navy border border-brand-contrast/20 rounded px-2 py-1.5 outline-none focus:border-brand-navy"
                      />
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      {savedId === p.id ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-heading font-bold uppercase tracking-widest text-green-700">
                          <Check size={13} /> Saved
                        </span>
                      ) : (
                        <button
                          onClick={() => save(p)}
                          disabled={!isDirty(p) || savingId === p.id}
                          className="px-3 py-1.5 text-[10px] font-heading font-bold uppercase tracking-widest rounded bg-brand-navy text-white hover:bg-brand-blue transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          {savingId === p.id ? "Saving…" : "Save"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-sm font-body text-brand-contrast">
                      No products match &quot;{query}&quot;.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
