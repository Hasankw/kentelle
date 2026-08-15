import type { QuizConfig, QuizProductRef } from "./db-config";

export type QuizAnswers = {
  concerns: string[];
  name: string;
  /** questionId -> selected option value(s), or free text */
  responses: Record<string, string | string[]>;
};

export type RoutineGroup = { step: string; label: string; products: QuizProductRef[] };
export type RoutineResult = {
  groups: RoutineGroup[];
  notes: string[];
  flags: string[];
};

const STEP_LABELS: Record<string, string> = {
  cleanser: "Cleanser",
  toner: "Toner / Mist",
  treatment: "Treatments",
  moisturiser: "Moisturiser",
  eye: "Eye Care",
  special: "Special Care",
};

const STEP_ORDER = ["cleanser", "toner", "treatment", "eye", "moisturiser", "special"];

/** Resolves quiz answers into a recommended routine using the live,
 * admin-editable config (questions/options/product tags/safety flag rules
 * all loaded from the DB). This is a v1 aggregation engine: it collects the
 * products/flags tagged on every selected answer, applies the configured
 * safety excludes (tag-based, e.g. pregnancy → exclude "retinoid"), then
 * caps treatment steps so the routine doesn't balloon past a sensible
 * number of active ingredients. It does not yet implement the full
 * ingredient-overlap / conflict-priority engine described in the source
 * guide's "Product Synergy" notes.
 */
export function resolveRoutine(config: QuizConfig, answers: QuizAnswers): RoutineResult {
  const flags = new Set<string>();
  const counts = new Map<string, number>();
  const notes: string[] = [];

  const bump = (id: string) => counts.set(id, (counts.get(id) ?? 0) + 1);

  const selectedConcerns = config.concerns.filter((c) => answers.concerns.includes(c.key));
  const poolKeys = new Set(selectedConcerns.map((c) => c.poolKey));
  const allQuestions = [
    ...(config.nameQuestion ? [config.nameQuestion] : []),
    ...[...poolKeys].flatMap((k) => config.questionsByPool[k] ?? []),
    ...(config.questionsByPool["lifestyle"] ?? []),
  ];

  for (const q of allQuestions) {
    const raw = answers.responses[q.id];
    if (!raw || !q.options) continue;
    const values = Array.isArray(raw) ? raw : [raw];
    for (const v of values) {
      const opt = q.options.find((o) => o.value === v);
      if (!opt) continue;
      opt.productIds?.forEach(bump);
      opt.flags?.forEach((f) => flags.add(f));
    }
  }

  // Free-text allergy exclusion — the one free-text lifestyle question.
  const allergyQuestion = (config.questionsByPool["lifestyle"] ?? []).find((q) => q.type === "text");
  const allergyText = allergyQuestion ? String(answers.responses[allergyQuestion.id] ?? "").trim() : "";
  const allergyTerms = allergyText
    .toLowerCase()
    .split(/[,;\n]/)
    .map((s) => s.trim())
    .filter(Boolean);

  // Always anchor the core routine.
  const { coreCleanserId, coreTonerId, coreTreatmentId, coreMoisturiserId, maxTreatments } = config.settings;
  [coreCleanserId, coreTonerId, coreTreatmentId, coreMoisturiserId].filter(Boolean).forEach((id) => bump(id as string));

  // Apply safety flag rules (data-driven — admin editable).
  const excludeTags = new Set<string>();
  const activeRules = config.flagRules.filter((r) => flags.has(r.flag));
  const notedFlags = new Set<string>();
  for (const rule of activeRules) {
    if (rule.excludesTag) excludeTags.add(rule.excludesTag);
    if (rule.substituteProductId) bump(rule.substituteProductId);
    if (rule.note && !notedFlags.has(rule.flag)) {
      notes.push(rule.note);
      notedFlags.add(rule.flag);
    }
  }

  let excludedCount = 0;
  const includedIds = [...counts.keys()].filter((id) => {
    const product = config.products[id];
    if (!product) return false;
    const isExcluded = product.tags?.some((t) => excludeTags.has(t));
    if (isExcluded) excludedCount++;
    const isAllergen = allergyTerms.some((term) => product.name.toLowerCase().includes(term));
    if (isAllergen) excludedCount++;
    return !isExcluded && !isAllergen;
  });

  if (excludedCount > 0 && allergyTerms.length > 0) {
    notes.push(`Products matching your listed ingredients to avoid ("${allergyText}") were excluded from your routine.`);
  }

  // Group by step; cap "treatment" so the routine doesn't balloon past a
  // sensible number of active steps.
  const byStep = new Map<string, QuizProductRef[]>();
  for (const id of includedIds) {
    const product = config.products[id];
    const step = product.step ?? "special";
    const list = byStep.get(step) ?? [];
    list.push(product);
    byStep.set(step, list);
  }
  const treatments = byStep.get("treatment") ?? [];
  if (treatments.length > maxTreatments) {
    const ranked = treatments.slice().sort((a, b) => (counts.get(b.id) ?? 0) - (counts.get(a.id) ?? 0));
    byStep.set("treatment", ranked.slice(0, maxTreatments));
    notes.push(`${ranked.length - maxTreatments} lower-priority treatment step(s) were folded out to avoid over-layering actives — ask in-store for the full list.`);
  }

  if (includedIds.some((id) => config.products[id]?.tags?.includes("exfoliant-acid") || config.products[id]?.tags?.includes("retinoid"))) {
    if (coreTreatmentId && !includedIds.includes(coreTreatmentId)) bump(coreTreatmentId);
    notes.push("A peeling agent is in your routine — always follow with your treatment serum, then moisturiser, to seal the barrier and stop trans-epidermal water loss.");
  }

  notes.push("KENTELLE doesn't currently formulate an SPF — finish every morning routine with a broad-spectrum SPF 30 to protect your active treatments.");

  const groups: RoutineGroup[] = STEP_ORDER
    .map((step) => ({ step, label: STEP_LABELS[step] ?? step, products: byStep.get(step) ?? [] }))
    .filter((g) => g.products.length > 0);

  return { groups, notes: [...new Set(notes)], flags: [...flags] };
}
