import { db } from "@/lib/db";

export type RoutineTiming = "DAY" | "NIGHT" | "DAY_NIGHT" | "SPECIAL";

export type QuizProductRef = {
  id: string;
  name: string;
  slug: string;
  step: string | null;
  tags: string[];
  images: string[];
  price: number;
  salePrice: number | null;
  stock: number;
  ingredients: string | null;
  /** Products sharing a group are interchangeable — the results UI shows
   * them as an either/or choice instead of prescribing both. */
  altGroup: string | null;
  /** Admin-set Day/Night/Day & Night/Special classification. Null means
   * "not explicitly set" — the engine falls back to the tag heuristic. */
  routineTiming: RoutineTiming | null;
  /** Admin override for starting-frequency copy (e.g. "1–2x weekly"). */
  frequencyOverride: string | null;
  /** Other product ids this product should be paired with. */
  pairWithIds: string[];
  /** Concern keys this product is Kentelle's best match for — set directly
   * on the product, independent of the question/option builder. */
  bestMatchTags: string[];
  /** Concern keys this product should be offered as an alternative for. */
  alternativeForTags: string[];
  /** Shown but not yet purchasable — excluded from recommendations. */
  comingSoon: boolean;
};

export type QuizOptionDto = {
  id: string;
  value: string;
  label: string;
  note: string | null;
  sortOrder: number;
  productIds: string[];
  flags: string[];
};

export type QuizQuestionDto = {
  id: string;
  poolKey: string;
  prompt: string;
  subtitle: string | null;
  why: string | null;
  type: "single" | "multi" | "text";
  placeholder: string | null;
  sortOrder: number;
  options: QuizOptionDto[];
};

export type QuizConcernDto = {
  id: string;
  key: string;
  label: string;
  note: string | null;
  poolKey: string;
  sortOrder: number;
};

export type QuizFlagRuleDto = {
  id: string;
  flag: string;
  label: string;
  excludesTag: string | null;
  substituteProductId: string | null;
  note: string | null;
};

export type QuizSettingsDto = {
  coreCleanserId: string | null;
  coreTonerId: string | null;
  coreTreatmentId: string | null;
  coreMoisturiserId: string | null;
  maxTreatments: number;
};

export type QuizConfig = {
  concerns: QuizConcernDto[];
  nameQuestion: QuizQuestionDto | null;
  questionsByPool: Record<string, QuizQuestionDto[]>;
  flagRules: QuizFlagRuleDto[];
  settings: QuizSettingsDto;
  products: Record<string, QuizProductRef>;
};

/** Loads the full live quiz configuration from the DB — concerns, every
 * question/option (grouped by pool), safety flag rules, core-routine
 * settings, and every real Product referenced anywhere in that config. This
 * is the single source of truth consumed by both the public quiz UI and the
 * recommendation engine (client + server), replacing the old hardcoded
 * lib/quiz/questions.ts + catalog.ts content now that it's admin-editable.
 */
export async function loadQuizConfig(): Promise<QuizConfig> {
  const [concernRows, questionRows, flagRuleRows, settingsRow] = await Promise.all([
    db.quizConcern.findMany({ where: { enabled: true }, orderBy: { sortOrder: "asc" } }),
    db.quizQuestion.findMany({ where: { enabled: true }, orderBy: { sortOrder: "asc" } }),
    db.quizFlagRule.findMany({}),
    db.quizSettings.find(),
  ]);

  const concerns: QuizConcernDto[] = concernRows;
  const questions: QuizQuestionDto[] = (questionRows as any[]).map((q) => ({
    ...q,
    options: (q.options ?? []).map((o: any) => ({ ...o, productIds: o.productIds ?? [], flags: o.flags ?? [] })),
  }));

  const nameQuestion = questions.find((q) => q.poolKey === "profile") ?? null;
  const questionsByPool: Record<string, QuizQuestionDto[]> = {};
  for (const q of questions) {
    if (q.poolKey === "profile") continue;
    (questionsByPool[q.poolKey] ??= []).push(q);
  }

  const settings: QuizSettingsDto = settingsRow ?? {
    coreCleanserId: null,
    coreTonerId: null,
    coreTreatmentId: null,
    coreMoisturiserId: null,
    maxTreatments: 5,
  };

  const productIds = new Set<string>();
  for (const q of questions) for (const o of q.options) for (const pid of o.productIds) productIds.add(pid);
  for (const r of flagRuleRows as any[]) if (r.substituteProductId) productIds.add(r.substituteProductId);
  [settings.coreCleanserId, settings.coreTonerId, settings.coreTreatmentId, settings.coreMoisturiserId]
    .filter(Boolean)
    .forEach((id) => productIds.add(id as string));

  // Also pull in every product that belongs to an either/or alternative
  // group (e.g. DayCare / Day Beauty Radiance) even if no question option
  // references it directly — its group-mate being recommended is enough to
  // surface the pair as a choice.
  const allActiveProducts = await db.product.findMany({ where: { isActive: true } });
  const altGroupProducts = (allActiveProducts as any[]).filter((p) => p.quizAltGroup);
  altGroupProducts.forEach((p) => productIds.add(p.id));

  // Also pull in every product carrying a direct concern link (Best Match
  // For / Alternative For) set on the product itself — these can recommend
  // a product into the engine without it ever being wired to a question.
  const directLinkProducts = (allActiveProducts as any[]).filter(
    (p) => (p.quizBestMatchTags?.length ?? 0) > 0 || (p.quizAlternativeForTags?.length ?? 0) > 0,
  );
  directLinkProducts.forEach((p) => productIds.add(p.id));

  // Pull in any "pair with" targets so the prescription card can resolve
  // their name/slug even if they weren't independently recommended.
  const byId = new Map((allActiveProducts as any[]).map((p) => [p.id, p]));
  for (const id of [...productIds]) {
    for (const pairId of byId.get(id)?.quizPairWithIds ?? []) productIds.add(pairId);
  }

  const productRows = productIds.size
    ? await db.product.findMany({ where: { id: { in: [...productIds] } } })
    : [];

  const products: Record<string, QuizProductRef> = {};
  for (const p of productRows as any[]) {
    products[p.id] = {
      id: p.id,
      name: p.name,
      slug: p.slug,
      step: p.quizStep ?? null,
      tags: p.quizTags ?? [],
      images: p.images ?? [],
      price: p.price,
      salePrice: p.salePrice,
      stock: p.stock,
      ingredients: p.ingredients ?? null,
      altGroup: p.quizAltGroup ?? null,
      routineTiming: (p.quizRoutineTiming as RoutineTiming | null) ?? null,
      frequencyOverride: p.quizFrequency ?? null,
      pairWithIds: p.quizPairWithIds ?? [],
      bestMatchTags: p.quizBestMatchTags ?? [],
      alternativeForTags: p.quizAlternativeForTags ?? [],
      comingSoon: !!p.comingSoon,
    };
  }

  return { concerns, nameQuestion, questionsByPool, flagRules: flagRuleRows as any, settings, products };
}
