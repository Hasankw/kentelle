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
  quizAltGroup: string | null;
  quizRoutineTiming: string | null;
  quizFrequency: string | null;
  quizPairWithIds: string[];
  quizBestMatchTags: string[];
  quizAlternativeForTags: string[];
};

type Dirty = {
  quizStep: string;
  quizTagsText: string;
  quizAltGroup: string;
  quizRoutineTiming: string;
  quizFrequency: string;
  quizPairWithText: string;
  quizBestMatchText: string;
  quizAlternativeForText: string;
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

// Kentelle's approved usage instruction. Left blank ("— Auto —") falls back
// to the tag heuristic (retinoid/aha => Night); actives are NOT assumed
// Night-only by default — set this explicitly per Kentelle's instructions
// (e.g. Glycolic 10 is normally DAY).
const TIMING_OPTIONS = [
  { value: "", label: "— Auto (from tags) —" },
  { value: "DAY", label: "Day" },
  { value: "NIGHT", label: "Night" },
  { value: "DAY_NIGHT", label: "Day & Night" },
  { value: "SPECIAL", label: "Special / Prescribed Days" },
];

const PLACEHOLDER = "/images/placeholder.svg";

export default function QuizProductsAdminPage() {
  const [products, setProducts] = useState<QuizProduct[] | null>(null);
  const [query, setQuery] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [dirty, setDirty] = useState<Record<string, Dirty>>({});

  useEffect(() => {
    fetch("/api/admin/quiz/products")
      .then((r) => r.json())
      .then((data: QuizProduct[]) => setProducts(data))
      .catch(() => toast("error", "Failed to load products"));
  }, []);

  const bySlug = useMemo(() => new Map((products ?? []).map((p) => [p.slug, p])), [products]);
  const byId = useMemo(() => new Map((products ?? []).map((p) => [p.id, p])), [products]);

  const filtered = useMemo(() => {
    if (!products) return [];
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => p.name.toLowerCase().includes(q));
  }, [products, query]);

  const defaults = (p: QuizProduct): Dirty => ({
    quizStep: p.quizStep ?? "",
    quizTagsText: p.quizTags.join(", "),
    quizAltGroup: p.quizAltGroup ?? "",
    quizRoutineTiming: p.quizRoutineTiming ?? "",
    quizFrequency: p.quizFrequency ?? "",
    quizPairWithText: p.quizPairWithIds.map((id) => byId.get(id)?.slug ?? id).join(", "),
    quizBestMatchText: p.quizBestMatchTags.join(", "),
    quizAlternativeForText: p.quizAlternativeForTags.join(", "),
  });

  const getField = <K extends keyof Dirty>(p: QuizProduct, field: K): Dirty[K] =>
    (dirty[p.id]?.[field] ?? defaults(p)[field]) as Dirty[K];

  const setField = (p: QuizProduct, field: keyof Dirty, value: string) => {
    setDirty((prev) => ({
      ...prev,
      [p.id]: { ...defaults(p), ...prev[p.id], [field]: value },
    }));
  };

  const save = async (p: QuizProduct) => {
    const quizStep = getField(p, "quizStep");
    const quizTags = getField(p, "quizTagsText").split(",").map((t) => t.trim()).filter(Boolean);
    const quizAltGroup = getField(p, "quizAltGroup").trim();
    const quizRoutineTiming = getField(p, "quizRoutineTiming");
    const quizFrequency = getField(p, "quizFrequency").trim();
    const quizPairWithIds = getField(p, "quizPairWithText")
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean)
      .map((slugOrId) => bySlug.get(slugOrId)?.id ?? (byId.has(slugOrId) ? slugOrId : null))
      .filter((id): id is string => Boolean(id));
    const quizBestMatchTags = getField(p, "quizBestMatchText").split(",").map((t) => t.trim()).filter(Boolean);
    const quizAlternativeForTags = getField(p, "quizAlternativeForText").split(",").map((t) => t.trim()).filter(Boolean);

    const patch = {
      id: p.id,
      quizStep: quizStep || null,
      quizTags,
      quizAltGroup: quizAltGroup || null,
      quizRoutineTiming: quizRoutineTiming || null,
      quizFrequency: quizFrequency || null,
      quizPairWithIds,
      quizBestMatchTags,
      quizAlternativeForTags,
    };

    setSavingId(p.id);
    try {
      const res = await fetch("/api/admin/quiz/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) throw new Error();
      setProducts((prev) => prev!.map((row) => (row.id === p.id ? { ...row, ...patch } : row)));
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
        <p className="font-body text-sm text-brand-contrast mb-6 max-w-3xl">
          Assign each product a routine step, Day/Night/Special usage instruction, starting frequency and pairing so
          the Skin Quiz prescription engine knows exactly how to present it — no code change required. Safety Tags are
          free text (e.g. <code className="text-brand-navy">retinoid</code>, <code className="text-brand-navy">high-vitc</code>) — they
          only take effect when they match an <code className="text-brand-navy">excludesTag</code> on a rule in{" "}
          <Link href="/admin/quiz/safety" className="text-brand-blue underline">Safety Flag Rules</Link>. Products
          sharing the same <strong>Alt Group</strong> key are shown as an either/or choice instead of both being
          prescribed. <strong>Pair With</strong> takes a comma-separated list of product slugs. <strong>Best Match
          For</strong> / <strong>Alternative For</strong> take comma-separated concern keys (e.g.{" "}
          <code className="text-brand-navy">dryness</code>, <code className="text-brand-navy">pigment</code>) —
          links this product straight to a concern without needing a question/option edit. Coming Soon is set on the{" "}
          <Link href="/admin/products" className="text-brand-blue underline">main Product page</Link>.
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
                  {["", "Product", "Step", "Timing", "Frequency", "Safety Tags", "Alt Group", "Pair With", "Best Match For", "Alternative For", ""].map((h, i) => (
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
                        value={getField(p, "quizStep")}
                        onChange={(e) => setField(p, "quizStep", e.target.value)}
                        className="text-xs font-body text-brand-navy border border-brand-contrast/20 rounded px-2 py-1.5 outline-none focus:border-brand-navy"
                      >
                        {STEP_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-2.5">
                      <select
                        value={getField(p, "quizRoutineTiming")}
                        onChange={(e) => setField(p, "quizRoutineTiming", e.target.value)}
                        className="text-xs font-body text-brand-navy border border-brand-contrast/20 rounded px-2 py-1.5 outline-none focus:border-brand-navy"
                      >
                        {TIMING_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-2.5 min-w-[160px]">
                      <input
                        value={getField(p, "quizFrequency")}
                        onChange={(e) => setField(p, "quizFrequency", e.target.value)}
                        placeholder="e.g. 1–2x weekly"
                        className="w-full text-xs font-body text-brand-navy border border-brand-contrast/20 rounded px-2 py-1.5 outline-none focus:border-brand-navy"
                      />
                    </td>
                    <td className="px-4 py-2.5 min-w-[200px]">
                      <input
                        value={getField(p, "quizTagsText")}
                        onChange={(e) => setField(p, "quizTagsText", e.target.value)}
                        placeholder="e.g. retinoid, high-vitc"
                        className="w-full text-xs font-body text-brand-navy border border-brand-contrast/20 rounded px-2 py-1.5 outline-none focus:border-brand-navy"
                      />
                    </td>
                    <td className="px-4 py-2.5 min-w-[130px]">
                      <input
                        value={getField(p, "quizAltGroup")}
                        onChange={(e) => setField(p, "quizAltGroup", e.target.value)}
                        placeholder="e.g. am-moisturiser"
                        className="w-full text-xs font-body text-brand-navy border border-brand-contrast/20 rounded px-2 py-1.5 outline-none focus:border-brand-navy"
                      />
                    </td>
                    <td className="px-4 py-2.5 min-w-[180px]">
                      <input
                        value={getField(p, "quizPairWithText")}
                        onChange={(e) => setField(p, "quizPairWithText", e.target.value)}
                        placeholder="e.g. derma-moisture-fix"
                        className="w-full text-xs font-body text-brand-navy border border-brand-contrast/20 rounded px-2 py-1.5 outline-none focus:border-brand-navy"
                      />
                    </td>
                    <td className="px-4 py-2.5 min-w-[160px]">
                      <input
                        value={getField(p, "quizBestMatchText")}
                        onChange={(e) => setField(p, "quizBestMatchText", e.target.value)}
                        placeholder="e.g. dryness, pigment"
                        className="w-full text-xs font-body text-brand-navy border border-brand-contrast/20 rounded px-2 py-1.5 outline-none focus:border-brand-navy"
                      />
                    </td>
                    <td className="px-4 py-2.5 min-w-[160px]">
                      <input
                        value={getField(p, "quizAlternativeForText")}
                        onChange={(e) => setField(p, "quizAlternativeForText", e.target.value)}
                        placeholder="e.g. redness"
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
                    <td colSpan={11} className="px-4 py-8 text-center text-sm font-body text-brand-contrast">
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
