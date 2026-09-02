import type { QuizConfig, QuizConcernDto, QuizProductRef, RoutineTiming } from "./db-config";

export type QuizAnswers = {
  concerns: string[];
  name: string;
  /** questionId -> selected option value(s), or free text */
  responses: Record<string, string | string[]>;
};

export type PrescriptionProduct = QuizProductRef & {
  reason: string;
  frequency: string;
  timing: RoutineTiming;
  timingLabel: string;
  pairWith: { id: string; name: string; slug: string }[];
};

/** One line of the master prescription — either a single product, or an
 * either/or choice slot (the customer picks one, but it's still one
 * prescription line / one basket item either way). */
export type PrescriptionEntry =
  | { kind: "product"; id: string; product: PrescriptionProduct }
  | { kind: "choice"; id: string; groupKey: string; options: PrescriptionProduct[] };

/** Day/Night routine steps are *instructions* — they reference prescription
 * entries by id in application order, they never carry their own copy of
 * the product/price data and never introduce a product that isn't already
 * on the master prescription. */
export type RoutineRef = { entryId: string };
export type RoutineGroup = { step: string; label: string; refs: RoutineRef[] };

export type RoutineResult = {
  skinProfile: {
    primaryConcern: string | null;
    secondaryConcerns: string[];
  };
  /** "Your Prescribed Kentelle Products" — one line per product, ever. */
  prescription: PrescriptionEntry[];
  /** Morning and evening application order — instructions only, reference `prescription` by id. */
  am: RoutineGroup[];
  pm: RoutineGroup[];
  notes: string[];
  /** SPF / professional-care style callouts — only populated when actually triggered. */
  advisories: string[];
  flags: string[];
  /** True if targeted matching produced nothing and we fell back to the baseline routine — never shown to the customer, logged for internal review. */
  mappingError: boolean;
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

const TIMING_LABELS: Record<RoutineTiming, string> = {
  DAY: "Day",
  NIGHT: "Night",
  DAY_NIGHT: "Day & Night",
  SPECIAL: "Special / Prescribed Days",
};

// Products carrying these tags are sun-sensitising / high-turnover actives —
// used only as a *fallback* when a product has no explicit admin-set
// routineTiming. Per Kentelle's approved instructions, actives are not
// assumed Night-only by default (e.g. Glycolic 10 is normally a Day
// treatment) — admins should set routineTiming explicitly rather than rely
// on this heuristic. Must match the real product tag vocabulary used across
// the catalog (see admin → Quiz → Product Tags): "retinoid", "aha",
// "mild-exfoliant", "high-vitc".
const PM_ONLY_TAGS = new Set(["retinoid", "aha"]);

// Per-step cap on how many *single* (non either/or) products can appear —
// prevents duplicate cleansers/moisturisers when several answers each tag
// their own pick. Either/or (altGroup) choices are exempt — they're meant
// to show as an intentional pair. "treatment" is capped separately by the
// admin-configured maxTreatments setting.
const STEP_SINGLES_CAP: Record<string, number> = { cleanser: 1, toner: 1, moisturiser: 1, eye: 2, special: 2 };

function computeFrequency(tags: string[]): string {
  if (tags.includes("retinoid")) return "PM only — start 2–3x weekly and build up gradually";
  if (tags.includes("aha")) return "2–3x weekly, alternate nights with other actives";
  if (tags.includes("mild-exfoliant")) return "2–3x weekly";
  return "Daily, AM & PM";
}

/** Kentelle's approved timing — explicit admin setting first, tag heuristic
 * only as a fallback for products that haven't been classified yet. */
function resolveTiming(product: QuizProductRef): RoutineTiming {
  if (product.routineTiming) return product.routineTiming;
  return (product.tags ?? []).some((t) => PM_ONLY_TAGS.has(t)) ? "NIGHT" : "DAY_NIGHT";
}

/** Resolves quiz answers into a recommended routine using the live,
 * admin-editable config (questions/options/product tags/safety flag rules
 * all loaded from the DB). Selected concerns are ranked into a primary
 * concern (the one the customer engaged with most — highest weight, drives
 * the hero treatment) and secondary concerns (lower weight, only add
 * support where compatible), rather than flatly unioning every tagged
 * product. Configured safety excludes (tag-based, e.g. pregnancy → exclude
 * "retinoid") and free-text allergy/INCI matching are applied on top.
 *
 * The result is a single deduplicated master `prescription` (one line per
 * product, even if it's used Day & Night) plus `am`/`pm` routine
 * instructions that only reference that prescription by id, in application
 * order — they never introduce a second copy of a product or an extra
 * basket item.
 */
export function resolveRoutine(config: QuizConfig, answers: QuizAnswers): RoutineResult {
  const flags = new Set<string>();
  const counts = new Map<string, number>();
  const scores = new Map<string, number>();
  const reasonLabels = new Map<string, Set<string>>();
  const safetySubIds = new Set<string>();
  const altGroupFromCore = new Set<string>();
  const notes: string[] = [];
  const advisories: string[] = [];

  const bump = (id: string, weight = 1, label?: string) => {
    counts.set(id, (counts.get(id) ?? 0) + 1);
    scores.set(id, (scores.get(id) ?? 0) + weight);
    if (label) {
      const set = reasonLabels.get(id) ?? new Set<string>();
      set.add(label);
      reasonLabels.set(id, set);
    }
  };

  const selectedConcerns = config.concerns.filter((c) => answers.concerns.includes(c.key));

  // Rank selected concerns by how many product-bearing answers the customer
  // actually gave within that concern's question pool — the most-engaged
  // concern becomes primary (weight 3, drives the hero treatment); the rest
  // are secondary (weight 1, only add compatible support) rather than every
  // matched product being added with equal priority.
  const engagement = new Map<string, number>();
  for (const concern of selectedConcerns) {
    let count = 0;
    for (const q of config.questionsByPool[concern.poolKey] ?? []) {
      const raw = answers.responses[q.id];
      if (!raw || !q.options) continue;
      const values = Array.isArray(raw) ? raw : [raw];
      for (const v of values) {
        if (q.options.find((o) => o.value === v)?.productIds?.length) count++;
      }
    }
    engagement.set(concern.key, count);
  }
  const rankedConcerns = selectedConcerns
    .slice()
    .sort((a, b) => (engagement.get(b.key) ?? 0) - (engagement.get(a.key) ?? 0));
  const primaryConcern: QuizConcernDto | null = rankedConcerns[0] ?? null;
  const secondaryConcerns = rankedConcerns.slice(1);
  const concernWeight = new Map<string, number>();
  if (primaryConcern) concernWeight.set(primaryConcern.key, 3);
  for (const c of secondaryConcerns) concernWeight.set(c.key, 1);

  // A pool can host more than one concern (e.g. "aging" hosts both Fine
  // Lines and Firmness) — group selected concerns by pool so a question's
  // weight/reason reflects whichever of those concerns is in play.
  const poolConcerns = new Map<string, QuizConcernDto[]>();
  for (const c of selectedConcerns) {
    const list = poolConcerns.get(c.poolKey) ?? [];
    list.push(c);
    poolConcerns.set(c.poolKey, list);
  }

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
    const poolConcernsForQ = poolConcerns.get(q.poolKey) ?? [];
    const weight = poolConcernsForQ.length
      ? Math.max(...poolConcernsForQ.map((c) => concernWeight.get(c.key) ?? 1))
      : 1;
    const label = poolConcernsForQ.map((c) => c.label).join(" & ") || undefined;
    for (const v of values) {
      const opt = q.options.find((o) => o.value === v);
      if (!opt) continue;
      opt.productIds?.forEach((id) => bump(id, weight, label));
      opt.flags?.forEach((f) => flags.add(f));
    }
  }

  // Direct product-to-concern links — set on the product itself (Best
  // Match For / Alternative For), independent of the question/option
  // builder. Lets an admin hook a product to a concern without wiring any
  // question. Best Match carries the same weight as an answer-driven match;
  // Alternative For is scored lower so it only fills in as a backup.
  const bestMatchIds = new Set<string>();
  const alternativeForIds = new Set<string>();
  for (const product of Object.values(config.products)) {
    for (const concern of selectedConcerns) {
      const weight = concernWeight.get(concern.key) ?? 1;
      if (product.bestMatchTags.includes(concern.key)) {
        bump(product.id, weight, concern.label);
        bestMatchIds.add(product.id);
      }
      if (product.alternativeForTags.includes(concern.key)) {
        bump(product.id, Math.max(weight - 1, 0.5), concern.label);
        alternativeForIds.add(product.id);
      }
    }
  }

  // Free-text allergy exclusion — the one free-text lifestyle question.
  // Matched against each product's full INCI ingredient list (not just its
  // name), per the source guide's "cross-reference against the complete
  // INCI ingredient list of every product" instruction.
  const allergyQuestion = (config.questionsByPool["lifestyle"] ?? []).find((q) => q.type === "text");
  const allergyText = allergyQuestion ? String(answers.responses[allergyQuestion.id] ?? "").trim() : "";
  const allergyTerms = allergyText
    .toLowerCase()
    .split(/[,;\n]/)
    .map((s) => s.trim())
    .filter(Boolean);

  // Always anchor the core routine — weighted so high it always wins its
  // step's singles cap regardless of concern scoring.
  const { coreCleanserId, coreTonerId, coreTreatmentId, coreMoisturiserId, maxTreatments } = config.settings;
  const coreIds = new Set(
    [coreCleanserId, coreTonerId, coreTreatmentId, coreMoisturiserId].filter(Boolean) as string[],
  );
  coreIds.forEach((id) => bump(id, 999));

  // Apply safety flag rules (data-driven — admin editable).
  const excludeTags = new Set<string>();
  const activeRules = config.flagRules.filter((r) => flags.has(r.flag));
  const notedFlags = new Set<string>();
  for (const rule of activeRules) {
    if (rule.excludesTag) excludeTags.add(rule.excludesTag);
    if (rule.substituteProductId) {
      bump(rule.substituteProductId, 5);
      safetySubIds.add(rule.substituteProductId);
    }
    if (rule.note && !notedFlags.has(rule.flag)) {
      notes.push(rule.note);
      notedFlags.add(rule.flag);
    }
  }

  // Either/or alternatives: if a product with an alt-group made it in,
  // pull its group-mate(s) in alongside it — the two get presented as a
  // choice rather than the mate silently never appearing.
  for (const id of [...counts.keys()]) {
    const group = config.products[id]?.altGroup;
    if (!group) continue;
    const inheritedScore = scores.get(id) ?? 1;
    const inheritedLabels = reasonLabels.get(id);
    const sourceIsCore = coreIds.has(id);
    Object.values(config.products)
      .filter((p) => p.altGroup === group && p.id !== id)
      .forEach((p) => {
        bump(p.id, inheritedScore);
        if (sourceIsCore) altGroupFromCore.add(p.id);
        if (inheritedLabels) {
          const set = reasonLabels.get(p.id) ?? new Set<string>();
          inheritedLabels.forEach((l) => set.add(l));
          reasonLabels.set(p.id, set);
        }
      });
  }

  let excludedCount = 0;
  const includedIds = [...counts.keys()].filter((id) => {
    const product = config.products[id];
    if (!product || product.comingSoon) return false;
    const isExcluded = product.tags?.some((t) => excludeTags.has(t));
    if (isExcluded) excludedCount++;
    const haystack = `${product.name} ${product.ingredients ?? ""}`.toLowerCase();
    const isAllergen = allergyTerms.some((term) => haystack.includes(term));
    if (isAllergen) excludedCount++;
    return !isExcluded && !isAllergen;
  });

  if (excludedCount > 0 && allergyTerms.length > 0) {
    notes.push(`Products matching your listed ingredients to avoid ("${allergyText}") were excluded from your routine.`);
  }

  // Group by step, then cap each step's *single* products (dedup — one
  // cleanser/moisturiser role, not several competing picks) using the
  // concern-weighted score rather than raw match count.
  const byStep = new Map<string, string[]>();
  for (const id of includedIds) {
    const step = config.products[id]?.step ?? "special";
    const list = byStep.get(step) ?? [];
    list.push(id);
    byStep.set(step, list);
  }

  const finalByStep = new Map<string, string[]>();
  for (const [step, ids] of byStep) {
    const singles = [...new Set(ids.filter((id) => !config.products[id]?.altGroup))];
    const inGroups = [...new Set(ids.filter((id) => config.products[id]?.altGroup))];
    const cap = step === "treatment" ? maxTreatments : (STEP_SINGLES_CAP[step] ?? 3);
    const ranked = singles.sort((a, b) => (scores.get(b) ?? 0) - (scores.get(a) ?? 0));
    const kept = ranked.slice(0, cap);
    if (ranked.length > kept.length) {
      notes.push(
        `${ranked.length - kept.length} lower-priority ${(STEP_LABELS[step] ?? step).toLowerCase()} option(s) were folded out to keep your routine focused — ask in-store for the full list.`,
      );
    }
    finalByStep.set(step, [...kept, ...inGroups]);
  }

  const allIncludedIds = [...finalByStep.values()].flat();

  if (allIncludedIds.some((id) => {
    const tags = config.products[id]?.tags ?? [];
    return tags.includes("aha") || tags.includes("retinoid");
  })) {
    if (coreTreatmentId && !allIncludedIds.includes(coreTreatmentId)) {
      finalByStep.set("treatment", [...(finalByStep.get("treatment") ?? []), coreTreatmentId]);
    }
    notes.push("A peeling agent is in your routine — always follow with your treatment serum, then moisturiser, to seal the barrier and stop trans-epidermal water loss.");
  }

  // SPF guidance is an advisory, not a blanket disclaimer — only surfaced
  // when the routine actually contains sun-sensitising/brightening actives
  // or targets pigmentation.
  const needsSpfAdvisory =
    primaryConcern?.poolKey === "pigment" ||
    secondaryConcerns.some((c) => c.poolKey === "pigment") ||
    [...allIncludedIds].some((id) => {
      const tags = config.products[id]?.tags ?? [];
      return tags.includes("aha") || tags.includes("retinoid") || tags.includes("high-vitc") || tags.includes("mild-exfoliant");
    });
  if (needsSpfAdvisory) {
    advisories.push("Finish every morning routine with a broad-spectrum SPF 30 — KENTELLE doesn't currently formulate one, so pair your actives with a sunscreen you trust.");
  }

  function toPrescriptionProduct(id: string): PrescriptionProduct {
    const product = config.products[id];
    const labels = reasonLabels.get(id);
    const reason = coreIds.has(id)
      ? "Included in every KENTELLE routine as your baseline step — the foundation the rest of your routine builds on."
      : safetySubIds.has(id)
        ? "Selected as a safer alternative based on your sensitivity, allergy or safety answers."
        : altGroupFromCore.has(id)
          ? "An alternative to your baseline pick — either works, so choose whichever formula and finish suit your skin."
          : bestMatchIds.has(id) && labels && labels.size
            ? `Kentelle's best match for your ${[...labels].join(" & ")} concern${labels.size > 1 ? "s" : ""}.`
            : labels && labels.size
              ? `Recommended for your ${[...labels].join(" & ")} concern${labels.size > 1 ? "s" : ""}, based on your quiz answers.`
              : alternativeForIds.has(id)
                ? "Offered as an alternative option to support your skin concerns."
                : "Selected as a safe match based on your quiz answers.";
    const timing = resolveTiming(product);
    const frequency = product.frequencyOverride ?? (timing === "SPECIAL" ? "As prescribed" : computeFrequency(product.tags ?? []));
    const pairWith = (product.pairWithIds ?? [])
      .map((pid) => config.products[pid])
      .filter((p): p is QuizProductRef => Boolean(p))
      .map((p) => ({ id: p.id, name: p.name, slug: p.slug }));
    return { ...product, reason, frequency, timing, timingLabel: TIMING_LABELS[timing], pairWith };
  }

  // ── Master prescription: one entry per product, ever — even if it's used
  // Day & Night or appears in more than one step's candidate list. ─────────
  const prescription: PrescriptionEntry[] = [];
  const seenSingle = new Set<string>();
  const seenGroup = new Set<string>();
  for (const step of STEP_ORDER) {
    for (const id of finalByStep.get(step) ?? []) {
      const product = config.products[id];
      if (!product) continue;
      if (product.altGroup) {
        if (seenGroup.has(product.altGroup)) continue;
        seenGroup.add(product.altGroup);
        const options = [...new Set(finalByStep.get(step) ?? [])]
          .filter((oid) => config.products[oid]?.altGroup === product.altGroup)
          .map(toPrescriptionProduct);
        prescription.push({ kind: "choice", id: `choice:${product.altGroup}`, groupKey: product.altGroup, options });
      } else {
        if (seenSingle.has(id)) continue;
        seenSingle.add(id);
        prescription.push({ kind: "product", id, product: toPrescriptionProduct(id) });
      }
    }
  }

  // Timing eligibility for an entry — an either/or choice qualifies for a
  // period if any of its options do (each option keeps its own timing on
  // the prescription card; the instructions just place the slot once).
  const entryTiming = (entry: PrescriptionEntry): RoutineTiming[] =>
    entry.kind === "product" ? [entry.product.timing] : entry.options.map((o) => o.timing);
  const qualifiesAm = (t: RoutineTiming[]) => t.some((x) => x === "DAY" || x === "DAY_NIGHT" || x === "SPECIAL");
  const qualifiesPm = (t: RoutineTiming[]) => t.some((x) => x === "NIGHT" || x === "DAY_NIGHT" || x === "SPECIAL");

  function buildInstructions(qualifies: (t: RoutineTiming[]) => boolean): RoutineGroup[] {
    return STEP_ORDER.map((step) => {
      const entries = prescription.filter((e) => {
        const product = e.kind === "product" ? config.products[e.id] : config.products[e.options[0]?.id ?? ""];
        return (product?.step ?? "special") === step && qualifies(entryTiming(e));
      });
      return { step, label: STEP_LABELS[step] ?? step, refs: entries.map((e) => ({ entryId: e.id })) };
    }).filter((g) => g.refs.length > 0);
  }

  const am = buildInstructions(qualifiesAm);
  const pm = buildInstructions(qualifiesPm);

  // Golden rule: never show a customer 0 products. The core anchors above
  // mean this should be unreachable in practice, but if the config is ever
  // missing its core routine settings, flag it for internal review instead
  // of silently showing an empty result.
  const mappingError = prescription.length === 0;
  if (mappingError) {
    notes.push("We couldn't confidently match every answer to a product — showing KENTELLE's everyday essentials while our team reviews your quiz.");
  }

  return {
    skinProfile: {
      primaryConcern: primaryConcern?.label ?? null,
      secondaryConcerns: secondaryConcerns.map((c) => c.label),
    },
    prescription,
    am,
    pm,
    notes: [...new Set(notes)],
    advisories: [...new Set(advisories)],
    flags: [...flags],
    mappingError,
  };
}
