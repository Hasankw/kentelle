"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Plus, Trash2, Save } from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";
import QuizAdminTabs from "@/components/admin/QuizAdminTabs";
import { toast } from "@/components/ui/Toast";

type FlagRule = {
  id: string;
  flag: string;
  label: string;
  excludesTag: string | null;
  substituteProductId: string | null;
  note: string | null;
  sortOrder: number;
};

type ProductLite = { id: string; name: string; slug: string };

const emptyDraft = () => ({
  flag: "",
  label: "",
  excludesTag: "",
  substituteProductId: "",
  note: "",
  sortOrder: 0,
});

export default function QuizSafetyAdminPage() {
  const [rules, setRules] = useState<FlagRule[] | null>(null);
  const [products, setProducts] = useState<ProductLite[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState(emptyDraft());
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const [r, p] = await Promise.all([
      fetch("/api/admin/quiz/flag-rules").then((res) => res.json()),
      fetch("/api/admin/quiz/products").then((res) => res.json()),
    ]);
    setRules(r);
    setProducts(p.map((x: any) => ({ id: x.id, name: x.name, slug: x.slug })));
  };

  useEffect(() => {
    load().catch(() => toast("error", "Failed to load safety rules"));
  }, []);

  const productById = useMemo(() => Object.fromEntries(products.map((p) => [p.id, p])), [products]);

  const startEdit = (r: FlagRule) => {
    setEditingId(r.id);
    setDraft({
      flag: r.flag,
      label: r.label,
      excludesTag: r.excludesTag ?? "",
      substituteProductId: r.substituteProductId ?? "",
      note: r.note ?? "",
      sortOrder: r.sortOrder,
    });
    setShowAdd(false);
  };

  const startAdd = () => {
    setEditingId(null);
    setDraft({ ...emptyDraft(), sortOrder: rules?.length ?? 0 });
    setShowAdd(true);
  };

  const cancel = () => {
    setEditingId(null);
    setShowAdd(false);
    setDraft(emptyDraft());
  };

  const submit = async () => {
    if (!draft.flag.trim() || !draft.label.trim()) {
      toast("error", "Flag and label are required");
      return;
    }
    setSaving(true);
    const payload = {
      flag: draft.flag.trim(),
      label: draft.label.trim(),
      excludesTag: draft.excludesTag.trim() || null,
      substituteProductId: draft.substituteProductId || null,
      note: draft.note.trim() || null,
      sortOrder: draft.sortOrder,
    };
    try {
      if (editingId) {
        await fetch("/api/admin/quiz/flag-rules", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingId, ...payload }),
        });
        toast("success", "Rule updated");
      } else {
        await fetch("/api/admin/quiz/flag-rules", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        toast("success", "Rule added");
      }
      cancel();
      await load();
    } catch {
      toast("error", "Failed to save rule");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this safety rule? Any answer that sets this flag will stop excluding products because of it.")) return;
    await fetch("/api/admin/quiz/flag-rules", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setRules((prev) => (prev ? prev.filter((r) => r.id !== id) : prev));
    toast("success", "Rule deleted");
  };

  const formOpen = showAdd || editingId !== null;

  return (
    <AdminShell>
      <div className="p-8">
        <QuizAdminTabs />

        <h1 className="font-heading font-bold text-2xl text-brand-navy mb-1">Quiz Safety Rules</h1>
        <p className="font-body text-sm text-brand-contrast mb-6 max-w-2xl">
          Each rule says: when a user&apos;s answer sets a given <strong>flag</strong> (set on an option in the{" "}
          <a href="/admin/quiz/builder" className="text-brand-blue underline">Builder</a>), exclude every recommended
          product carrying the matching <strong>excludes tag</strong> (assigned per-product on the{" "}
          <a href="/admin/quiz/products" className="text-brand-blue underline">Product Tags</a> page), optionally add a
          substitute product, and optionally show an explanatory note in the results. This is how, for example, a
          &quot;pregnant: yes&quot; answer automatically strips retinoids from the routine.
        </p>

        {!rules ? (
          <div className="flex items-center gap-2 text-brand-contrast font-body text-sm py-10">
            <Loader2 size={16} className="animate-spin" /> Loading rules…
          </div>
        ) : (
          <>
            <div className="overflow-x-auto bg-white border border-brand-contrast/10 rounded mb-5">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-brand-contrast/10">
                    {["Flag", "Label", "Excludes Tag", "Substitute", "Note", ""].map((h) => (
                      <th key={h} className="px-4 py-3 text-[10px] font-heading font-bold uppercase tracking-widest text-brand-contrast whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rules.map((r) => (
                    <tr key={r.id} className="border-b border-brand-contrast/5 last:border-b-0 align-top">
                      <td className="px-4 py-2.5 text-xs font-body text-brand-navy whitespace-nowrap"><code>{r.flag}</code></td>
                      <td className="px-4 py-2.5 text-xs font-body text-brand-navy whitespace-nowrap">{r.label}</td>
                      <td className="px-4 py-2.5 text-xs font-body text-brand-contrast whitespace-nowrap">{r.excludesTag ?? "—"}</td>
                      <td className="px-4 py-2.5 text-xs font-body text-brand-contrast whitespace-nowrap">
                        {r.substituteProductId ? productById[r.substituteProductId]?.name ?? "—" : "—"}
                      </td>
                      <td className="px-4 py-2.5 text-xs font-body text-brand-contrast max-w-[240px] truncate" title={r.note ?? ""}>
                        {r.note ?? "—"}
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        <button onClick={() => startEdit(r)} className="text-[10px] font-heading font-bold uppercase tracking-widest text-brand-blue hover:underline mr-3">
                          Edit
                        </button>
                        <button onClick={() => remove(r.id)} className="text-brand-contrast hover:text-red-600 transition-colors">
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {rules.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-sm font-body text-brand-contrast">
                        No safety rules yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {!formOpen && (
              <button
                onClick={startAdd}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-[11px] font-heading font-bold uppercase tracking-widest rounded bg-brand-navy text-white hover:bg-brand-blue transition-colors"
              >
                <Plus size={13} /> Add Rule
              </button>
            )}

            {formOpen && (
              <div className="bg-white border border-brand-contrast/10 rounded p-5 max-w-2xl space-y-3">
                <p className="font-heading text-xs font-bold uppercase tracking-widest text-brand-navy mb-1">
                  {editingId ? "Edit Rule" : "New Rule"}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <LabeledInput label="Flag (must match an option's flag)" value={draft.flag} onChange={(v) => setDraft((d) => ({ ...d, flag: v }))} placeholder="e.g. block_retinoid" />
                  <LabeledInput label="Label (admin-facing)" value={draft.label} onChange={(v) => setDraft((d) => ({ ...d, label: v }))} placeholder="e.g. Block Retinoids" />
                  <LabeledInput label="Excludes Tag" value={draft.excludesTag} onChange={(v) => setDraft((d) => ({ ...d, excludesTag: v }))} placeholder="e.g. retinoid" />
                  <div>
                    <p className="font-heading text-[10px] font-bold uppercase tracking-widest text-brand-contrast mb-1">Substitute Product</p>
                    <select
                      value={draft.substituteProductId}
                      onChange={(e) => setDraft((d) => ({ ...d, substituteProductId: e.target.value }))}
                      className={selectCls}
                    >
                      <option value="">— none —</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <p className="font-heading text-[10px] font-bold uppercase tracking-widest text-brand-contrast mb-1">Note (shown to the user in results, optional)</p>
                  <textarea
                    value={draft.note}
                    onChange={(e) => setDraft((d) => ({ ...d, note: e.target.value }))}
                    rows={2}
                    className={inputCls}
                  />
                </div>
                <div className="flex items-center gap-3 pt-1">
                  <button
                    onClick={submit}
                    disabled={saving}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-[11px] font-heading font-bold uppercase tracking-widest rounded bg-brand-navy text-white hover:bg-brand-blue transition-colors disabled:opacity-50"
                  >
                    <Save size={12} /> {saving ? "Saving…" : "Save Rule"}
                  </button>
                  <button onClick={cancel} className="text-xs font-body text-brand-contrast hover:text-brand-navy">
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AdminShell>
  );
}

function LabeledInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <p className="font-heading text-[10px] font-bold uppercase tracking-widest text-brand-contrast mb-1">{label}</p>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={inputCls} />
    </div>
  );
}

const inputCls = "w-full px-2.5 py-2 text-xs border border-brand-contrast/20 rounded font-body text-brand-navy focus:border-brand-navy outline-none";
const selectCls = inputCls;
