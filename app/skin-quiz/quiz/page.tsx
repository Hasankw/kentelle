"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Loader2 } from "lucide-react";
import QuizProgressBar from "@/components/quiz/QuizHeader";
import QuizOptionCard from "@/components/quiz/QuizOptionCard";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/store/cart";
import {
  resolveRoutine,
  type RoutineResult,
  type PrescriptionEntry,
  type PrescriptionProduct,
} from "@/lib/quiz/engine";
import type { QuizConfig, QuizQuestionDto } from "@/lib/quiz/db-config";
import { tierDiscountAmount, nextTierMessage, type DiscountTier } from "@/lib/discount-tiers";

const RESULT_STORAGE_KEY = "kentelle-quiz-result";
const PLACEHOLDER_IMG = "/images/placeholder.svg";

type StoredResult = { name: string; result: RoutineResult };

const POOL_LABELS: Record<string, string> = {
  sensitivity: "Sensitivity",
  aging: "Fine Lines & Firmness",
  dryness: "Dryness",
  acne: "Breakouts",
  redness: "Redness",
  pigment: "Pigmentation",
  oily: "Oil & Pores",
  posttreatment: "Recovery",
};

// Supporting visual + copy shown in the right-hand research panel on desktop —
// mirrors the reference site's "materials used" panel next to each question.
const POOL_VISUALS: Record<string, { image: string; caption: string }> = {
  concerns: {
    image: "/images/hero/hero-brand.jpg",
    caption: "Every recommendation below is drawn from Kentelle's dermal-grade formulation range, developed with Beaubelle Beauty Clinic, Perth WA.",
  },
  sensitivity: {
    image: "/images/hero/hero-toners.jpg",
    caption: "Barrier-first actives — Ceramide Cleanser, Cica Peptide Concentrate and Bio-Ferment Barrier Cream — calm reactive skin without stripping it.",
  },
  aging: {
    image: "/images/hero/hero-serums.jpg",
    caption: "Peptide and retinal actives — Chronofirm Peptide Matrix, Peel Back Retinal 0.01 and PDRN Ampoules — rebuild collagen density.",
  },
  dryness: {
    image: "/images/hero/hero-moisturizers.jpg",
    caption: "Ceramide and hyaluronic acid layers — Derma Moisture Fix and Hyaluron Booster Capsules — reseal a compromised moisture barrier.",
  },
  acne: {
    image: "/images/hero/hero-exfoliators.jpg",
    caption: "Targeted exfoliation and barrier support — Derma Glycolic 10, BHA Serum and Bio-Ferment Barrier Cream — clear congestion without overstripping.",
  },
  redness: {
    image: "/images/hero/hero-nutrients.jpg",
    caption: "Vascular-calming botanicals — Cica Collagen Concentrate and Relaxing & Comforting Mist — settle flushing and visible capillaries.",
  },
  pigment: {
    image: "/images/hero/hero-peel-and-glow.jpg",
    caption: "Tyrosinase-inhibiting actives — UMMF Correcting Serum and Vitamin C 20 Cream — fade dark spots and even out tone.",
  },
  oily: {
    image: "/images/hero/hero-cleansers.jpg",
    caption: "Weightless sebum regulation — Vitamin B Facial Toner and Fruit Enzyme Cleanser — balance oil without dehydrating skin.",
  },
  posttreatment: {
    image: "/images/hero/hero-professional-use.jpg",
    caption: "Post-procedure recovery care — Milk Cleanser, Hyaluron Booster Capsules and Bio-Ferment Barrier Cream — rebuild the barrier safely.",
  },
  lifestyle: {
    image: "/images/hero/hero-everyday-essentials.jpg",
    caption: "Your routine is finished by cross-checking pregnancy, allergy and lifestyle factors against Kentelle's full ingredient database.",
  },
};

type Step =
  | { kind: "concerns" }
  | { kind: "name" }
  | { kind: "question"; group: string; poolKey: string; question: QuizQuestionDto }
  | { kind: "email" };

function buildSteps(config: QuizConfig, concerns: string[]): Step[] {
  const poolKeys = [...new Set(
    concerns
      .map((key) => config.concerns.find((c) => c.key === key)?.poolKey)
      .filter((k): k is string => Boolean(k))
  )];

  const steps: Step[] = [{ kind: "concerns" }, { kind: "name" }];
  for (const key of poolKeys) {
    const label = POOL_LABELS[key] ?? key;
    for (const q of config.questionsByPool[key] ?? []) {
      steps.push({ kind: "question", group: label, poolKey: key, question: q });
    }
  }
  for (const q of config.questionsByPool["lifestyle"] ?? []) {
    steps.push({ kind: "question", group: "Lifestyle & Safety", poolKey: "lifestyle", question: q });
  }
  steps.push({ kind: "email" });
  return steps;
}

export default function SkinQuizFlowPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-brand-bg">
        <Loader2 className="animate-spin text-brand-navy" size={28} />
      </div>
    }>
      <SkinQuizFlowInner />
    </Suspense>
  );
}

function SkinQuizFlowInner() {
  const searchParams = useSearchParams();
  const isPreview = searchParams.get("preview") === "1";
  const [config, setConfig] = useState<QuizConfig | null>(null);
  const [configError, setConfigError] = useState(false);
  const [concerns, setConcerns] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [responses, setResponses] = useState<Record<string, string | string[]>>({});
  const [email, setEmail] = useState("");
  const [stepIndex, setStepIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<RoutineResult | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    fetch("/api/quiz/config")
      .then((r) => r.json())
      .then(setConfig)
      .catch(() => setConfigError(true));
  }, []);

  // Restore a previously computed result — so following "View Product
  // Details" to a product page and coming back doesn't lose the quiz.
  useEffect(() => {
    if (isPreview) {
      setHydrated(true);
      return;
    }
    try {
      const raw = window.sessionStorage.getItem(RESULT_STORAGE_KEY);
      if (raw) {
        const stored: StoredResult = JSON.parse(raw);
        setName(stored.name);
        setResult(stored.result);
      }
    } catch {
      // ignore — worst case the customer retakes the quiz
    } finally {
      setHydrated(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const steps = useMemo(() => (config ? buildSteps(config, concerns) : []), [config, concerns]);
  const step = steps[stepIndex];

  const groupSequence = useMemo(() => {
    const seen: string[] = [];
    for (const s of steps) {
      const label = s.kind === "concerns" ? "Skin Concerns" : s.kind === "name" ? "About You" : s.kind === "email" ? "Almost Done" : s.group;
      if (!seen.includes(label)) seen.push(label);
    }
    return seen;
  }, [steps]);

  if (configError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-brand-bg px-5 text-center">
        <p className="font-heading font-bold text-brand-navy mb-2">Couldn&apos;t load the quiz</p>
        <p className="font-body text-sm text-brand-contrast">Please refresh the page to try again.</p>
      </div>
    );
  }

  if (result) {
    return (
      <ResultsView
        name={name}
        result={result}
        isPreview={isPreview}
        onRetake={() => {
          try {
            window.sessionStorage.removeItem(RESULT_STORAGE_KEY);
          } catch {
            // ignore
          }
        }}
      />
    );
  }

  if (!hydrated || !config || !step) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-brand-bg">
        <Loader2 className="animate-spin text-brand-navy" size={28} />
      </div>
    );
  }

  const currentGroupLabel =
    step.kind === "concerns" ? "Skin Concerns" : step.kind === "name" ? "About You" : step.kind === "email" ? "Almost Done" : step.group;
  const groupIndex = groupSequence.indexOf(currentGroupLabel);
  const percent = ((stepIndex + 1) / steps.length) * 100;

  const goNext = () => setStepIndex((i) => Math.min(i + 1, steps.length - 1));
  const goBack = () => setStepIndex((i) => Math.max(i - 1, 0));

  const toggleConcern = (value: string) => {
    setConcerns((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]));
  };

  const setResponse = (id: string, value: string | string[]) => {
    setResponses((prev) => ({ ...prev, [id]: value }));
  };

  const selectSingle = (id: string, value: string, autoAdvance = true) => {
    setResponse(id, value);
    if (autoAdvance) setTimeout(goNext, 220);
  };

  const toggleMulti = (id: string, value: string) => {
    setResponses((prev) => {
      const current = Array.isArray(prev[id]) ? (prev[id] as string[]) : [];
      const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
      return { ...prev, [id]: next };
    });
  };

  const submit = async (withEmail: boolean) => {
    setSubmitting(true);
    const finalEmail = withEmail && email.trim() ? email.trim() : undefined;
    const computed = resolveRoutine(config, { concerns, name, responses });
    setResult(computed);
    try {
      if (!isPreview) window.sessionStorage.setItem(RESULT_STORAGE_KEY, JSON.stringify({ name, result: computed }));
    } catch {
      // non-blocking — persistence is a convenience, not required to see the result
    }

    // Preview/Test Mode (admin) never writes a submission or sends an
    // email — it's purely for checking how a set of answers resolves
    // before publishing config changes.
    if (isPreview) {
      setSubmitting(false);
      return;
    }

    try {
      await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email: finalEmail, concerns, responses }),
      });
    } catch {
      // Non-blocking — the routine is already computed and shown either way.
    } finally {
      setSubmitting(false);
    }
  };

  const canProceed =
    step.kind === "concerns" ? true :
    step.kind === "name" ? name.trim().length > 0 :
    step.kind === "email" ? true :
    step.question.type === "text" ? true :
    step.question.type === "multi" ? true :
    Boolean(responses[step.question.id]);

  return (
    <div className="flex flex-col min-h-screen bg-brand-bg">
      <QuizProgressBar
        onBack={goBack}
        stageLabel={currentGroupLabel}
        stageIndex={groupIndex}
        stageCount={groupSequence.length}
        percent={percent}
      />

      <main className="flex-grow pt-8 pb-32 px-5">
        <AnimatePresence mode="wait">
          <motion.div
            key={stepIndex}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.25 }}
          >
            {step.kind === "concerns" && (
              <QuestionLayout
                heading="What are your main skin concerns?"
                subtitle="Select all that apply"
                visual={POOL_VISUALS.concerns}
              >
                <div className="space-y-3">
                  {config.concerns.map((o) => (
                    <QuizOptionCard
                      key={o.key}
                      label={o.label}
                      note={o.note ?? undefined}
                      multi
                      selected={concerns.includes(o.key)}
                      onClick={() => toggleConcern(o.key)}
                    />
                  ))}
                </div>
              </QuestionLayout>
            )}

            {step.kind === "name" && config.nameQuestion && (
              <div className="max-w-xl mx-auto">
                <div className="text-center mb-8">
                  <h1 className="font-heading font-bold text-xl md:text-2xl text-brand-navy mb-2">{config.nameQuestion.prompt}</h1>
                </div>
                <input
                  autoFocus
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={config.nameQuestion.placeholder ?? undefined}
                  className="w-full px-5 py-4 border-2 border-brand-contrast/20 focus:border-brand-navy outline-none rounded font-body text-sm text-brand-navy bg-brand-white"
                />
              </div>
            )}

            {step.kind === "question" && (
              <QuestionLayout
                heading={step.question.prompt}
                subtitle={step.question.subtitle ?? undefined}
                why={step.question.why ?? undefined}
                visual={POOL_VISUALS[step.poolKey]}
              >
                {step.question.type === "text" ? (
                  <input
                    autoFocus
                    type="text"
                    value={(responses[step.question.id] as string) ?? ""}
                    onChange={(e) => setResponse(step.question!.id, e.target.value)}
                    placeholder={step.question.placeholder ?? undefined}
                    className="w-full px-5 py-4 border-2 border-brand-contrast/20 focus:border-brand-navy outline-none rounded font-body text-sm text-brand-navy bg-brand-white"
                  />
                ) : (
                  <div className="space-y-3">
                    {step.question.options?.map((o) => {
                      const isMulti = step.question!.type === "multi";
                      const current = responses[step.question!.id];
                      const selected = isMulti
                        ? Array.isArray(current) && current.includes(o.value)
                        : current === o.value;
                      return (
                        <QuizOptionCard
                          key={o.id}
                          label={o.label}
                          note={o.note ?? undefined}
                          multi={isMulti}
                          selected={selected}
                          onClick={() =>
                            isMulti ? toggleMulti(step.question!.id, o.value) : selectSingle(step.question!.id, o.value)
                          }
                        />
                      );
                    })}
                  </div>
                )}
              </QuestionLayout>
            )}

            {step.kind === "email" && (
              <div className="max-w-xl mx-auto">
                <div className="text-center mb-8">
                  <h1 className="font-heading font-bold text-xl md:text-2xl text-brand-navy mb-2">
                    Where should we send your routine?
                  </h1>
                  <p className="font-body text-xs text-brand-contrast">
                    Optional — we&apos;ll email your personalised routine so you can find it again anytime.
                  </p>
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-5 py-4 border-2 border-brand-contrast/20 focus:border-brand-navy outline-none rounded font-body text-sm text-brand-navy bg-brand-white mb-4"
                />
                <button
                  onClick={() => submit(false)}
                  disabled={submitting}
                  className="w-full text-center text-xs text-brand-contrast font-body underline underline-offset-2 disabled:opacity-50"
                >
                  Skip — just show my routine
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Fixed bottom action bar — mirrors the cloned quiz-question footer */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-brand-contrast/15 bg-brand-bg px-5 py-4">
        <div className="max-w-xl mx-auto">
          <button
            type="button"
            disabled={!canProceed || submitting}
            onClick={() => (step.kind === "email" ? submit(true) : goNext())}
            className="w-full py-3.5 bg-brand-navy text-brand-white font-heading font-bold text-xs uppercase tracking-[0.15em] rounded hover:bg-brand-navy/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {step.kind === "email" ? (
              submitting ? "Building Your Routine…" : (<><Sparkles size={14} /> See My Routine</>)
            ) : (
              "Next"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// Question shell: prompt + answers on the left, a supporting Kentelle
// materials image + caption in a sticky panel on the right (desktop) —
// mirrors the reference site's split question / research-panel layout.
function QuestionLayout({
  heading,
  subtitle,
  why,
  visual,
  children,
}: {
  heading: string;
  subtitle?: string;
  why?: string;
  visual?: { image: string; caption: string };
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-[1fr_320px] gap-10 md:gap-14 items-start">
      <div>
        <div className="mb-7">
          <h1 className="font-heading font-bold text-xl md:text-2xl text-brand-navy mb-2">{heading}</h1>
          {subtitle && <p className="font-body text-xs text-brand-contrast">{subtitle}</p>}
        </div>

        {children}

        {why && (
          <div className="mt-6 bg-brand-pink border-l-2 border-brand-accent rounded p-4">
            <p className="font-heading text-[10px] font-bold uppercase tracking-widest text-brand-blue mb-1.5">
              Backed By Research
            </p>
            <p className="font-body text-xs text-brand-navy leading-relaxed">{why}</p>
          </div>
        )}
      </div>

      {visual && (
        <div className="hidden md:block sticky top-24">
          <div className="relative h-72 rounded overflow-hidden mb-3 bg-brand-pink">
            <Image src={visual.image} alt="" fill className="object-cover" />
          </div>
          <p className="font-heading text-[10px] font-bold uppercase tracking-widest text-brand-blue mb-1.5">
            The Materials
          </p>
          <p className="font-body text-xs text-brand-contrast leading-relaxed">{visual.caption}</p>
        </div>
      )}
    </div>
  );
}


// Per Kentelle's approved routine order — eye care always sits right after
// toning, as step 3, ahead of treatment serums.
const STEP_ORDER = ["cleanser", "toner", "eye", "treatment", "moisturiser", "special"];

const STEP_META: Record<string, { label: string; blurb: string }> = {
  cleanser: { label: "Cleanse", blurb: "Lift away dirt, oil, SPF and makeup." },
  toner: { label: "Tone", blurb: "Rebalance and prep the skin after cleansing." },
  eye: { label: "Eye Care", blurb: "Target the delicate eye area." },
  treatment: {
    label: "Treat",
    blurb: "Targeted serums and actives for your concerns — check each product's own Day/Night guidance below, as this varies by ingredient.",
  },
  moisturiser: { label: "Moisturise", blurb: "Lock in hydration to finish your routine." },
  special: { label: "Special Care", blurb: "Follow the specific timing noted on each product below." },
};

function entryStep(entry: PrescriptionEntry): string {
  const p = entry.kind === "product" ? entry.product : entry.options[0];
  return p?.step ?? "special";
}

function ResultsView({
  name,
  result,
  onRetake,
  isPreview = false,
}: {
  name: string;
  result: RoutineResult;
  onRetake: () => void;
  isPreview?: boolean;
}) {
  const prescription = result.prescription ?? [];
  const hasRoutine = !result.mappingError && prescription.length > 0;
  const { primaryConcern, secondaryConcerns } = result.skinProfile;
  const addItem = useCartStore((s) => s.addItem);
  const router = useRouter();

  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [choiceSelection, setChoiceSelection] = useState<Record<string, string>>({});
  const [discountTiers, setDiscountTiers] = useState<DiscountTier[]>([]);

  useEffect(() => {
    const sel: Record<string, boolean> = {};
    const choice: Record<string, string> = {};
    for (const entry of prescription) {
      sel[entry.id] = true;
      if (entry.kind === "choice") choice[entry.id] = entry.options[0]?.id ?? "";
    }
    setSelected(sel);
    setChoiceSelection(choice);
    // Only re-derive when the result itself changes (new quiz submission).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result]);

  useEffect(() => {
    fetch("/api/discount-tiers")
      .then((r) => r.json())
      .then((d) => setDiscountTiers(d.tiers ?? []))
      .catch(() => {});
  }, []);

  const entryProduct = (entry: PrescriptionEntry): PrescriptionProduct | undefined =>
    entry.kind === "product"
      ? entry.product
      : entry.options.find((o) => o.id === choiceSelection[entry.id]) ?? entry.options[0];

  const selectedEntries = prescription.filter((e) => selected[e.id] !== false);
  const selectedProducts = selectedEntries.map(entryProduct).filter((p): p is PrescriptionProduct => Boolean(p));
  const total = selectedProducts.reduce((sum, p) => sum + (p.salePrice ?? p.price), 0);

  const discountableItems = useMemo(
    () => selectedProducts.map((p) => ({ price: p.salePrice ?? p.price, quantity: 1, categoryIds: p.categoryIds })),
    [selectedProducts],
  );
  const discountAmount = tierDiscountAmount(discountableItems, discountTiers);
  const finalTotal = Math.max(total - discountAmount, 0);
  const tierMessage = nextTierMessage(discountableItems, discountTiers);

  const hasSkinNutrients = prescription.some((e) => {
    const p = entryProduct(e);
    return p?.emphasisCategory === "Skin Nutrients";
  });

  const stepSections = STEP_ORDER
    .map((step) => ({ step, entries: prescription.filter((e) => entryStep(e) === step) }))
    .filter((s) => s.entries.length > 0);

  const addRoutineToCart = () => {
    for (const p of selectedProducts) {
      addItem({ id: p.id, name: p.name, slug: p.slug, image: p.images[0] || PLACEHOLDER_IMG, price: p.salePrice ?? p.price, categoryIds: p.categoryIds });
    }
    router.push("/cart");
  };

  return (
    <div className="flex flex-col min-h-screen bg-brand-bg">
      <main className="flex-grow pt-12 pb-20 px-5">
        <div className="max-w-6xl mx-auto">
          {isPreview && (
            <div className="mb-8 max-w-3xl mx-auto bg-amber-100 border border-amber-400 rounded p-3 text-center">
              <p className="font-heading font-bold text-[11px] uppercase tracking-widest text-amber-800">
                Admin Preview / Test Mode — this result is not saved and no email is sent
              </p>
            </div>
          )}
          <div className="text-center mb-10 max-w-3xl mx-auto">
            <p className="font-heading text-xs font-bold tracking-[0.3em] uppercase text-brand-accent mb-3">
              {name ? `${name}'s Skin Profile` : "Your Skin Profile"}
            </p>
            <h1 className="font-heading font-bold text-2xl md:text-3xl text-brand-navy mb-3">
              {hasRoutine ? `Your ${stepSections.length}-Step Kentelle Routine` : "Your Personalised Skin Profile"}
            </h1>
            <p className="font-body text-sm text-brand-contrast max-w-md mx-auto">
              {hasRoutine
                ? "Based on your answers, here's the routine we recommend — deselect anything you'd rather leave out, then add it all to your cart."
                : "Here's what your answers told us, and the KENTELLE prescription we've built around it."}
            </p>
          </div>

          {/* Your Skin Profile */}
          {(primaryConcern || secondaryConcerns.length > 0) && (
            <div className="max-w-3xl mx-auto mb-12 bg-white border border-brand-contrast/10 rounded p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {primaryConcern && (
                <div>
                  <p className="font-heading font-bold text-[10px] uppercase tracking-widest text-brand-blue mb-1">Primary Skin Concern</p>
                  <p className="font-body text-sm text-brand-navy">{primaryConcern}</p>
                </div>
              )}
              {secondaryConcerns.length > 0 && (
                <div>
                  <p className="font-heading font-bold text-[10px] uppercase tracking-widest text-brand-blue mb-1">Secondary Concern{secondaryConcerns.length > 1 ? "s" : ""}</p>
                  <p className="font-body text-sm text-brand-navy">{secondaryConcerns.join(", ")}</p>
                </div>
              )}
            </div>
          )}

          {hasRoutine ? (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 lg:gap-10 items-start mb-10">
              {/* Steps */}
              <div>
                {stepSections.map(({ step, entries }, i) => (
                  <StepSection
                    key={step}
                    stepNumber={i + 1}
                    stepKey={step}
                    entries={entries}
                    selected={selected}
                    onToggle={(id) => setSelected((s) => ({ ...s, [id]: s[id] === false }))}
                    choiceSelection={choiceSelection}
                    onSelectOption={(entryId, optionId) => setChoiceSelection((s) => ({ ...s, [entryId]: optionId }))}
                  />
                ))}

                {/* Layering & Usage Guidelines */}
                <div className="mb-10 bg-white border border-brand-contrast/10 rounded p-6">
                  <p className="font-heading font-bold text-[10px] uppercase tracking-widest text-brand-blue mb-3">Layering &amp; Usage Guidelines</p>
                  <ul className="space-y-2 list-disc pl-4">
                    <li className="font-body text-xs text-brand-contrast leading-relaxed">
                      Every routine should include a moisture step — <strong className="text-brand-navy">Derma Moisture Fix</strong> or{" "}
                      <strong className="text-brand-navy">Hyaluron Booster Capsules</strong> is essential to lock in your results.
                    </li>
                    <li className="font-body text-xs text-brand-contrast leading-relaxed">
                      Routines are capped at a maximum of three treatment layers to avoid overloading your skin — we&apos;ve already applied this above.
                    </li>
                    {hasSkinNutrients && (
                      <li className="font-body text-xs text-brand-contrast leading-relaxed">
                        Your Skin Nutrients product (peptides, PDRN, collagen or exosomes) can be used every morning, every night, or on alternate days — choose
                        whichever rhythm suits you to get its full benefit.
                      </li>
                    )}
                  </ul>
                </div>

                {/* Advisories (SPF etc.) */}
                {result.advisories.length > 0 && (
                  <div className="bg-brand-pink border-l-2 border-brand-accent rounded p-5 mb-6 space-y-2">
                    {result.advisories.map((n, i) => (
                      <p key={i} className="font-body text-xs text-brand-navy leading-relaxed">{n}</p>
                    ))}
                  </div>
                )}
                {result.notes.length > 0 && (
                  <div className="bg-white border border-brand-contrast/10 rounded p-5 mb-10 space-y-2">
                    {result.notes.map((n, i) => (
                      <p key={i} className="font-body text-xs text-brand-contrast leading-relaxed">{n}</p>
                    ))}
                  </div>
                )}

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white border border-brand-contrast/10 rounded p-6">
                  <p className="font-body text-sm text-brand-navy text-center sm:text-left">
                    Prefer expert guidance? Find a skin professional near you for a tailored, in-person consultation.
                  </p>
                  <a
                    href="tel:0892280191"
                    className="shrink-0 px-5 py-2.5 border-2 border-brand-navy text-brand-navy font-heading font-bold text-xs uppercase tracking-widest rounded hover:bg-brand-navy hover:text-white transition-colors whitespace-nowrap"
                  >
                    Call (08) 9228 0191
                  </a>
                </div>
              </div>

              {/* Sidebar — sticky on desktop, drops below the steps on mobile */}
              <RoutineSidebar
                selectedProducts={selectedProducts}
                total={total}
                discountAmount={discountAmount}
                finalTotal={finalTotal}
                tierMessage={tierMessage}
                onAddToCart={addRoutineToCart}
              />
            </div>
          ) : (
            <div className="max-w-3xl mx-auto mb-10 bg-brand-pink border-l-2 border-brand-accent rounded p-6 text-center">
              <p className="font-body text-sm text-brand-navy">
                We&apos;re finalising your product matches by hand — our team will follow up shortly with your personalised picks. In the meantime, feel free to browse the full range below.
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 max-w-3xl mx-auto mb-10">
            <Link
              href="/skin-quiz"
              onClick={onRetake}
              className="flex-1 text-center py-4 border-2 border-brand-navy text-brand-navy font-heading font-bold text-xs uppercase tracking-widest rounded hover:bg-brand-navy hover:text-brand-white transition-colors"
            >
              Retake the Quiz
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

// One numbered step of the routine (Cleanse, Tone, Treat…) — a short blurb
// plus a grid of prescription cards for whatever's prescribed at that step.
function StepSection({
  stepNumber,
  stepKey,
  entries,
  selected,
  onToggle,
  choiceSelection,
  onSelectOption,
}: {
  stepNumber: number;
  stepKey: string;
  entries: PrescriptionEntry[];
  selected: Record<string, boolean>;
  onToggle: (entryId: string) => void;
  choiceSelection: Record<string, string>;
  onSelectOption: (entryId: string, optionId: string) => void;
}) {
  const meta = STEP_META[stepKey] ?? { label: stepKey, blurb: "" };
  const singles = entries.filter((e) => e.kind === "product");
  const choices = entries.filter((e) => e.kind === "choice");

  return (
    <div className="mb-10">
      <div className="flex items-center gap-3 mb-2 pb-3 border-b-2 border-brand-navy">
        <span className="flex items-center justify-center w-9 h-9 shrink-0 rounded-full bg-brand-navy text-white font-heading font-bold text-base">
          {stepNumber}
        </span>
        <div>
          <p className="font-heading text-[10px] font-bold uppercase tracking-widest text-brand-blue leading-none mb-0.5">Step {stepNumber}</p>
          <h2 className="font-heading font-bold text-xl text-brand-navy leading-tight">{meta.label}</h2>
        </div>
      </div>
      {meta.blurb && <p className="font-body text-xs text-brand-contrast mb-4 max-w-lg">{meta.blurb}</p>}

      {singles.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
          {singles.map((entry) => (
            <PrescriptionCard
              key={entry.id}
              product={(entry as Extract<PrescriptionEntry, { kind: "product" }>).product}
              checked={selected[entry.id] !== false}
              onToggle={() => onToggle(entry.id)}
            />
          ))}
        </div>
      )}

      {choices.map((entry) => {
        if (entry.kind !== "choice") return null;
        const activeId = choiceSelection[entry.id] ?? entry.options[0]?.id;
        return (
          <div key={entry.id} className="mb-4">
            <p className="font-body text-[10px] uppercase tracking-wider text-brand-contrast mb-2">Choose one</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {entry.options.map((option) => (
                <PrescriptionCard
                  key={option.id}
                  product={option}
                  checked={selected[entry.id] !== false}
                  onToggle={() => onToggle(entry.id)}
                  radioGroup={entry.id}
                  radioChecked={option.id === activeId}
                  onSelectRadio={() => onSelectOption(entry.id, option.id)}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// A single prescription card in the step grid — image with a select
// checkbox (or a "choose one" radio for either/or options) overlaid,
// short function tag, category emphasis, price and a link to the real
// product page.
function PrescriptionCard({
  product,
  checked,
  onToggle,
  radioGroup,
  radioChecked,
  onSelectRadio,
}: {
  product: PrescriptionProduct;
  checked: boolean;
  onToggle: () => void;
  radioGroup?: string;
  radioChecked?: boolean;
  onSelectRadio?: () => void;
}) {
  const image = product.images[0] || PLACEHOLDER_IMG;
  const discounted = product.salePrice != null && product.salePrice < product.price;
  const isChoice = Boolean(radioGroup);

  return (
    <div className={`border rounded overflow-hidden bg-white transition-opacity ${checked ? "border-brand-contrast/15" : "border-brand-contrast/10 opacity-50"}`}>
      <label className="block cursor-pointer">
        <div className="relative aspect-square bg-brand-bg">
          <Image src={image} alt={product.name} fill className="object-cover" unoptimized={image.startsWith("http")} />
          <input
            type={isChoice ? "radio" : "checkbox"}
            name={radioGroup}
            checked={isChoice ? Boolean(radioChecked) : checked}
            onChange={isChoice ? onSelectRadio : onToggle}
            onClick={(e) => e.stopPropagation()}
            className="absolute top-2 left-2 w-4 h-4 accent-brand-navy"
          />
          {product.emphasisCategory && (
            <span className="absolute top-2 right-2 bg-brand-navy text-white text-[9px] font-heading font-bold uppercase tracking-wide px-1.5 py-0.5 rounded">
              {product.emphasisCategory}
            </span>
          )}
        </div>
        <div className="p-3" onClick={isChoice ? onSelectRadio : onToggle}>
          <p className="font-body text-[9px] uppercase tracking-widest text-brand-contrast/70 mb-1">{product.timingLabel}</p>
          <p className="font-heading font-bold text-sm text-brand-navy leading-tight mb-1">{product.name}</p>
          {product.functionTag && (
            <p className="font-body text-xs text-brand-contrast leading-snug mb-1.5">{product.functionTag}</p>
          )}
          <Link
            href={`/products/${product.slug}`}
            onClick={(e) => e.stopPropagation()}
            className="inline-block font-body text-[11px] text-brand-blue underline underline-offset-2 mb-1.5"
          >
            View Product Details
          </Link>
          <div className="flex items-center gap-2">
            {discounted ? (
              <>
                <span className="font-body text-sm font-bold text-brand-blue">{formatPrice(product.salePrice!)}</span>
                <span className="font-body text-xs text-brand-contrast line-through">{formatPrice(product.price)}</span>
              </>
            ) : (
              <span className="font-body text-sm text-brand-navy">{formatPrice(product.price)}</span>
            )}
          </div>
        </div>
      </label>
    </div>
  );
}

// Sticky-on-desktop / drops-below-steps-on-mobile cart summary — the one
// place the routine total, automatic discount and "add all" action live.
function RoutineSidebar({
  selectedProducts,
  total,
  discountAmount,
  finalTotal,
  tierMessage,
  onAddToCart,
}: {
  selectedProducts: PrescriptionProduct[];
  total: number;
  discountAmount: number;
  finalTotal: number;
  tierMessage: string | null;
  onAddToCart: () => void;
}) {
  return (
    <div className="bg-white border border-brand-contrast/15 rounded p-6 lg:sticky lg:top-24">
      <p className="font-heading font-bold text-sm uppercase tracking-widest text-brand-navy mb-4">Your Routine</p>
      <div className="space-y-2 mb-4 max-h-72 overflow-y-auto pr-1">
        {selectedProducts.map((p) => (
          <div key={p.id} className="flex items-start justify-between gap-3 text-xs font-body">
            <span className="text-brand-navy">{p.name}</span>
            <span className="text-brand-contrast whitespace-nowrap">{formatPrice(p.salePrice ?? p.price)}</span>
          </div>
        ))}
        {selectedProducts.length === 0 && (
          <p className="font-body text-xs text-brand-contrast">Select products above to build your routine.</p>
        )}
      </div>
      <div className="border-t border-brand-contrast/15 pt-3 space-y-1.5 mb-4">
        <div className="flex items-center justify-between text-xs font-body text-brand-contrast">
          <span>Subtotal</span>
          <span>{formatPrice(total)}</span>
        </div>
        {discountAmount > 0 && (
          <div className="flex items-center justify-between text-xs font-body text-green-700">
            <span>Routine saving</span>
            <span>−{formatPrice(discountAmount)}</span>
          </div>
        )}
        <div className="flex items-center justify-between font-heading font-bold text-sm text-brand-navy pt-1">
          <span>Total</span>
          <span>{formatPrice(finalTotal)}</span>
        </div>
      </div>
      {tierMessage && (
        <p className="font-body text-[11px] text-brand-blue mb-4 leading-relaxed">{tierMessage}</p>
      )}
      <button
        type="button"
        onClick={onAddToCart}
        disabled={selectedProducts.length === 0}
        className="w-full py-3.5 bg-brand-accent text-brand-navy font-heading font-bold text-xs uppercase tracking-widest rounded hover:bg-brand-accent/85 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Add All To Cart ({selectedProducts.length})
      </button>
    </div>
  );
}
