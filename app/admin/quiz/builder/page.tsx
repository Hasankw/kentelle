"use client";

import { useEffect, useMemo, useState } from "react";
import { Metadata } from "next";
import { Plus, Trash2, ChevronDown, ChevronUp, GripVertical, Loader2 } from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";
import QuizAdminTabs from "@/components/admin/QuizAdminTabs";

type Product = { id: string; name: string; slug: string; images: string[]; quizStep: string | null; quizTags: string[] };

type Concern = {
  id: string;
  key: string;
  label: string;
  note: string | null;
  poolKey: string;
  sortOrder: number;
  enabled: boolean;
};

type Option = {
  id?: string;
  value: string;
  label: string;
  note: string | null;
  productIds: string[];
  flags: string[];
};

type Question = {
  id: string;
  poolKey: string;
  prompt: string;
  subtitle: string | null;
  why: string | null;
  type: "single" | "multi" | "text";
  placeholder: string | null;
  sortOrder: number;
  enabled: boolean;
  options: Option[];
};

const KNOWN_POOLS = [
  { key: "profile", label: "Profile (Name Step)" },
  { key: "sensitivity", label: "Sensitivity" },
  { key: "aging", label: "Fine Lines & Firmness" },
  { key: "dryness", label: "Dryness" },
  { key: "acne", label: "Breakouts" },
  { key: "redness", label: "Redness" },
  { key: "pigment", label: "Pigmentation" },
  { key: "oily", label: "Oil & Pores" },
  { key: "posttreatment", label: "Recovery" },
  { key: "lifestyle", label: "Lifestyle & Safety" },
];

export default function QuizBuilderPage() {
  const [loading, setLoading] = useState(true);
  const [concerns, setConcerns] = useState<Concern[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activePool, setActivePool] = useState("sensitivity");
  const [view, setView] = useState<"pools" | "concerns">("pools");

  const load = async () => {
    setLoading(true);
    const [c, q, p] = await Promise.all([
      fetch("/api/admin/quiz/concerns").then((r) => r.json()),
      fetch("/api/admin/quiz/questions").then((r) => r.json()),
      fetch("/api/admin/quiz/products").then((r) => r.json()),
    ]);
    setConcerns(c);
    setQuestions(q);
    setProducts(p);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const poolList = useMemo(() => {
    const known = new Set(KNOWN_POOLS.map((p) => p.key));
    const extra = [...new Set(questions.map((q) => q.poolKey))].filter((k) => !known.has(k));
    return [...KNOWN_POOLS, ...extra.map((k) => ({ key: k, label: k }))];
  }, [questions]);

  const poolQuestions = useMemo(
    () => questions.filter((q) => q.poolKey === activePool).sort((a, b) => a.sortOrder - b.sortOrder),
    [questions, activePool]
  );

  const productById = useMemo(() => Object.fromEntries(products.map((p) => [p.id, p])), [products]);

  return (
    <AdminShell>
      <div className="p-8">
        <QuizAdminTabs />

        <div className="flex items-center justify-between mb-6">
          <h1 className="font-heading font-bold text-2xl text-brand-navy">Quiz Builder</h1>
          <div className="flex gap-2">
            <TabButton active={view === "pools"} onClick={() => setView("pools")}>
              Questions
            </TabButton>
            <TabButton active={view === "concerns"} onClick={() => setView("concerns")}>
              Stage 1 Concerns
            </TabButton>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-brand-navy" size={24} />
          </div>
        ) : view === "concerns" ? (
          <ConcernsEditor concerns={concerns} poolList={poolList} onChange={load} />
        ) : (
          <div className="grid grid-cols-[220px_1fr] gap-6">
            <div className="bg-white border border-brand-contrast/10 rounded p-2 h-fit sticky top-8">
              {poolList.map((p) => {
                const count = questions.filter((q) => q.poolKey === p.key).length;
                return (
                  <button
                    key={p.key}
                    onClick={() => setActivePool(p.key)}
                    className={`w-full text-left px-3 py-2.5 rounded text-xs font-heading font-bold uppercase tracking-wide flex items-center justify-between transition-colors ${
                      activePool === p.key ? "bg-brand-navy text-white" : "text-brand-navy hover:bg-brand-bg"
                    }`}
                  >
                    <span>{p.label}</span>
                    <span className="opacity-60">{count}</span>
                  </button>
                );
              })}
            </div>

            <div>
              <PoolQuestionsEditor
                poolKey={activePool}
                questions={poolQuestions}
                products={products}
                productById={productById}
                onChange={load}
              />
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded text-xs font-heading font-bold uppercase tracking-widest transition-colors ${
        active ? "bg-brand-navy text-white" : "bg-white border border-brand-contrast/20 text-brand-navy hover:border-brand-navy"
      }`}
    >
      {children}
    </button>
  );
}

// ─── Stage 1 Concerns editor ────────────────────────────────────────────────

function ConcernsEditor({
  concerns,
  poolList,
  onChange,
}: {
  concerns: Concern[];
  poolList: { key: string; label: string }[];
  onChange: () => void;
}) {
  const [rows, setRows] = useState<Concern[]>(concerns);
  useEffect(() => setRows(concerns), [concerns]);

  const patch = (id: string, data: Partial<Concern>) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...data } : r)));
  };

  const save = async (row: Concern) => {
    await fetch("/api/admin/quiz/concerns", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(row),
    });
    onChange();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this concern? Users won't see it in Stage 1 anymore.")) return;
    await fetch("/api/admin/quiz/concerns", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    onChange();
  };

  const addNew = async () => {
    await fetch("/api/admin/quiz/concerns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: `concern_${Date.now()}`, label: "New Concern", poolKey: poolList[1]?.key ?? "sensitivity", sortOrder: rows.length, enabled: true }),
    });
    onChange();
  };

  return (
    <div className="bg-white border border-brand-contrast/10 rounded p-6">
      <p className="font-body text-xs text-brand-contrast mb-4">
        These are the Stage 1 "What are your main skin concerns?" checkboxes. Each concern's Pool Key determines which question set (left tab under Questions) fires when a user selects it.
      </p>
      <div className="space-y-3">
        {rows.map((row) => (
          <div key={row.id} className="grid grid-cols-[1fr_1fr_1fr_140px_60px_auto] gap-2 items-center border-b border-brand-contrast/10 pb-3">
            <input
              value={row.key}
              onChange={(e) => patch(row.id, { key: e.target.value })}
              placeholder="key (e.g. acne)"
              className="px-2 py-1.5 text-xs border border-brand-contrast/20 rounded font-body"
            />
            <input
              value={row.label}
              onChange={(e) => patch(row.id, { label: e.target.value })}
              placeholder="Label shown to users"
              className="px-2 py-1.5 text-xs border border-brand-contrast/20 rounded font-body"
            />
            <input
              value={row.note ?? ""}
              onChange={(e) => patch(row.id, { note: e.target.value || null })}
              placeholder="Note (optional)"
              className="px-2 py-1.5 text-xs border border-brand-contrast/20 rounded font-body"
            />
            <select
              value={row.poolKey}
              onChange={(e) => patch(row.id, { poolKey: e.target.value })}
              className="px-2 py-1.5 text-xs border border-brand-contrast/20 rounded font-body"
            >
              {poolList.map((p) => (
                <option key={p.key} value={p.key}>{p.label}</option>
              ))}
            </select>
            <label className="flex items-center gap-1 text-[10px] font-heading font-bold uppercase text-brand-contrast">
              <input type="checkbox" checked={row.enabled} onChange={(e) => patch(row.id, { enabled: e.target.checked })} />
              On
            </label>
            <div className="flex gap-1">
              <button onClick={() => save(row)} className="px-2 py-1.5 text-[10px] font-heading font-bold uppercase bg-brand-navy text-white rounded">
                Save
              </button>
              <button onClick={() => remove(row.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
      <button
        onClick={addNew}
        className="mt-4 inline-flex items-center gap-1.5 px-3 py-2 text-xs font-heading font-bold uppercase tracking-widest text-brand-navy border border-brand-contrast/20 rounded hover:border-brand-navy"
      >
        <Plus size={14} /> Add Concern
      </button>
    </div>
  );
}

// ─── Questions (per pool) editor ────────────────────────────────────────────

function PoolQuestionsEditor({
  poolKey,
  questions,
  products,
  productById,
  onChange,
}: {
  poolKey: string;
  questions: Question[];
  products: Product[];
  productById: Record<string, Product>;
  onChange: () => void;
}) {
  const [openId, setOpenId] = useState<string | null>(null);

  const addQuestion = async () => {
    const res = await fetch("/api/admin/quiz/questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        poolKey,
        prompt: "New question",
        type: "single",
        sortOrder: questions.length,
        options: [{ value: "yes", label: "Yes" }, { value: "no", label: "No" }],
      }),
    });
    const created = await res.json();
    onChange();
    setOpenId(created.id);
  };

  const reorder = async (q: Question, direction: -1 | 1) => {
    const sorted = [...questions].sort((a, b) => a.sortOrder - b.sortOrder);
    const idx = sorted.findIndex((x) => x.id === q.id);
    const swapWith = sorted[idx + direction];
    if (!swapWith) return;
    await Promise.all([
      fetch("/api/admin/quiz/questions", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: q.id, sortOrder: swapWith.sortOrder }) }),
      fetch("/api/admin/quiz/questions", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: swapWith.id, sortOrder: q.sortOrder }) }),
    ]);
    onChange();
  };

  return (
    <div className="space-y-3">
      {questions.length === 0 && (
        <p className="font-body text-sm text-brand-contrast py-8 text-center bg-white border border-dashed border-brand-contrast/20 rounded">
          No questions in this pool yet.
        </p>
      )}
      {questions.map((q, i) => (
        <QuestionCard
          key={q.id}
          question={q}
          products={products}
          productById={productById}
          open={openId === q.id}
          onToggle={() => setOpenId(openId === q.id ? null : q.id)}
          onMoveUp={i > 0 ? () => reorder(q, -1) : undefined}
          onMoveDown={i < questions.length - 1 ? () => reorder(q, 1) : undefined}
          onChange={onChange}
        />
      ))}
      <button
        onClick={addQuestion}
        className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-heading font-bold uppercase tracking-widest text-brand-navy border border-brand-contrast/20 rounded hover:border-brand-navy bg-white"
      >
        <Plus size={14} /> Add Question to This Pool
      </button>
    </div>
  );
}

function QuestionCard({
  question,
  products,
  productById,
  open,
  onToggle,
  onMoveUp,
  onMoveDown,
  onChange,
}: {
  question: Question;
  products: Product[];
  productById: Record<string, Product>;
  open: boolean;
  onToggle: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onChange: () => void;
}) {
  const [draft, setDraft] = useState<Question>(question);
  useEffect(() => setDraft(question), [question]);

  const save = async () => {
    await fetch("/api/admin/quiz/questions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: draft.id,
        prompt: draft.prompt,
        subtitle: draft.subtitle,
        why: draft.why,
        type: draft.type,
        placeholder: draft.placeholder,
        enabled: draft.enabled,
        options: draft.options,
      }),
    });
    onChange();
  };

  const remove = async () => {
    if (!confirm("Delete this question and all its options?")) return;
    await fetch("/api/admin/quiz/questions", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: draft.id }),
    });
    onChange();
  };

  const patchOption = (idx: number, data: Partial<Option>) => {
    setDraft((prev) => ({ ...prev, options: prev.options.map((o, i) => (i === idx ? { ...o, ...data } : o)) }));
  };

  const addOption = () => {
    setDraft((prev) => ({ ...prev, options: [...prev.options, { value: `opt_${prev.options.length + 1}`, label: "New option", note: null, productIds: [], flags: [] }] }));
  };

  const removeOption = (idx: number) => {
    setDraft((prev) => ({ ...prev, options: prev.options.filter((_, i) => i !== idx) }));
  };

  return (
    <div className="bg-white border border-brand-contrast/10 rounded overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3 cursor-pointer" onClick={onToggle}>
        <GripVertical size={14} className="text-brand-contrast/40 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="font-heading font-bold text-sm text-brand-navy truncate">{question.prompt}</p>
          <p className="font-body text-[11px] text-brand-contrast">
            {question.type} · {question.options.length} option{question.options.length === 1 ? "" : "s"} · {question.enabled ? "enabled" : "disabled"}
          </p>
        </div>
        <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
          {onMoveUp && <button onClick={onMoveUp} className="p-1.5 text-brand-contrast hover:text-brand-navy"><ChevronUp size={14} /></button>}
          {onMoveDown && <button onClick={onMoveDown} className="p-1.5 text-brand-contrast hover:text-brand-navy"><ChevronDown size={14} /></button>}
        </div>
        <button onClick={onToggle} className="p-1.5 text-brand-navy shrink-0">
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-brand-contrast/10 p-4 space-y-4 bg-brand-bg/40">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Prompt (question text)">
              <textarea value={draft.prompt} onChange={(e) => setDraft({ ...draft, prompt: e.target.value })} rows={2} className={inputCls} />
            </Field>
            <Field label="Subtitle (optional)">
              <input value={draft.subtitle ?? ""} onChange={(e) => setDraft({ ...draft, subtitle: e.target.value || null })} className={inputCls} />
            </Field>
          </div>
          <Field label="Why We Ask (research note, optional)">
            <textarea value={draft.why ?? ""} onChange={(e) => setDraft({ ...draft, why: e.target.value || null })} rows={2} className={inputCls} />
          </Field>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Type">
              <select value={draft.type} onChange={(e) => setDraft({ ...draft, type: e.target.value as Question["type"] })} className={inputCls}>
                <option value="single">Single choice</option>
                <option value="multi">Multi choice</option>
                <option value="text">Free text</option>
              </select>
            </Field>
            <Field label="Placeholder (text type)">
              <input value={draft.placeholder ?? ""} onChange={(e) => setDraft({ ...draft, placeholder: e.target.value || null })} className={inputCls} />
            </Field>
            <Field label="Enabled">
              <label className="flex items-center gap-2 h-[38px]">
                <input type="checkbox" checked={draft.enabled} onChange={(e) => setDraft({ ...draft, enabled: e.target.checked })} />
                <span className="font-body text-xs text-brand-navy">Visible in live quiz</span>
              </label>
            </Field>
          </div>

          {draft.type !== "text" && (
            <div>
              <p className="font-heading text-[10px] font-bold uppercase tracking-widest text-brand-contrast mb-2">Options</p>
              <div className="space-y-3">
                {draft.options.map((o, idx) => (
                  <OptionRow
                    key={idx}
                    option={o}
                    products={products}
                    productById={productById}
                    onChange={(data) => patchOption(idx, data)}
                    onRemove={() => removeOption(idx)}
                  />
                ))}
              </div>
              <button onClick={addOption} className="mt-2 inline-flex items-center gap-1 text-xs font-heading font-bold uppercase text-brand-blue">
                <Plus size={12} /> Add Option
              </button>
            </div>
          )}

          <div className="flex items-center gap-2 pt-2">
            <button onClick={save} className="px-4 py-2 text-xs font-heading font-bold uppercase tracking-widest bg-brand-navy text-white rounded">
              Save Question
            </button>
            <button onClick={remove} className="px-3 py-2 text-xs font-heading font-bold uppercase tracking-widest text-red-600 border border-red-200 rounded hover:bg-red-50">
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function OptionRow({
  option,
  products,
  productById,
  onChange,
  onRemove,
}: {
  option: Option;
  products: Product[];
  productById: Record<string, Product>;
  onChange: (data: Partial<Option>) => void;
  onRemove: () => void;
}) {
  const toggleProduct = (id: string) => {
    const has = option.productIds.includes(id);
    onChange({ productIds: has ? option.productIds.filter((p) => p !== id) : [...option.productIds, id] });
  };

  return (
    <div className="border border-brand-contrast/15 rounded p-3 bg-white">
      <div className="grid grid-cols-[1fr_2fr_auto] gap-2 mb-2">
        <input value={option.value} onChange={(e) => onChange({ value: e.target.value })} placeholder="value (e.g. yes)" className={inputCls} />
        <input value={option.label} onChange={(e) => onChange({ label: e.target.value })} placeholder="Label shown to user" className={inputCls} />
        <button onClick={onRemove} className="p-2 text-red-500 hover:bg-red-50 rounded"><Trash2 size={14} /></button>
      </div>
      <input
        value={option.note ?? ""}
        onChange={(e) => onChange({ note: e.target.value || null })}
        placeholder="Note (optional, shown under the label)"
        className={`${inputCls} mb-2`}
      />
      <input
        value={option.flags.join(", ")}
        onChange={(e) => onChange({ flags: e.target.value.split(",").map((f) => f.trim()).filter(Boolean) })}
        placeholder="Flags, comma-separated (e.g. block_retinoid, pregnancy_safe_mode) — see Safety Rules tab"
        className={`${inputCls} mb-2`}
      />
      <details>
        <summary className="text-[11px] font-heading font-bold uppercase text-brand-contrast cursor-pointer">
          Products ({option.productIds.length} selected)
        </summary>
        <div className="mt-2 max-h-40 overflow-y-auto grid grid-cols-2 gap-1 border border-brand-contrast/10 rounded p-2">
          {products.map((p) => (
            <label key={p.id} className="flex items-center gap-1.5 text-[11px] font-body">
              <input type="checkbox" checked={option.productIds.includes(p.id)} onChange={() => toggleProduct(p.id)} />
              <span className="truncate">{p.name}</span>
            </label>
          ))}
        </div>
        {option.productIds.length > 0 && (
          <p className="mt-1 text-[10px] font-body text-brand-contrast truncate">
            {option.productIds.map((id) => productById[id]?.name ?? id).join(" · ")}
          </p>
        )}
      </details>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="font-heading text-[10px] font-bold uppercase tracking-widest text-brand-contrast mb-1">{label}</p>
      {children}
    </div>
  );
}

const inputCls = "w-full px-2.5 py-2 text-xs border border-brand-contrast/20 rounded font-body text-brand-navy focus:border-brand-navy outline-none";
