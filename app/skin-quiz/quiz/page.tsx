"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Loader2 } from "lucide-react";
import QuizProgressBar from "@/components/quiz/QuizHeader";
import QuizOptionCard from "@/components/quiz/QuizOptionCard";
import ProductCard from "@/components/store/ProductCard";
import { resolveRoutine, type RoutineResult, type RoutineGroup } from "@/lib/quiz/engine";
import type { QuizConfig, QuizQuestionDto } from "@/lib/quiz/db-config";

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
  const [config, setConfig] = useState<QuizConfig | null>(null);
  const [configError, setConfigError] = useState(false);
  const [concerns, setConcerns] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [responses, setResponses] = useState<Record<string, string | string[]>>({});
  const [email, setEmail] = useState("");
  const [stepIndex, setStepIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<RoutineResult | null>(null);

  useEffect(() => {
    fetch("/api/quiz/config")
      .then((r) => r.json())
      .then(setConfig)
      .catch(() => setConfigError(true));
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

  if (!config || !step) {
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

  if (result) {
    return <ResultsView name={name} result={result} />;
  }

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

function ResultsView({ name, result }: { name: string; result: RoutineResult }) {
  const allProducts = [...result.am, ...result.pm].flatMap((g) => [...g.products, ...g.choices.flatMap((c) => c.options)]);
  const hasRoutine = !result.mappingError && allProducts.length > 0;
  const needsTitration = allProducts.some((p) => p.frequency.toLowerCase().includes("pm only"));
  const { primaryConcern, secondaryConcerns } = result.skinProfile;

  return (
    <div className="flex flex-col min-h-screen bg-brand-bg">
      <main className="flex-grow pt-12 pb-20 px-5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <p className="font-heading text-xs font-bold tracking-[0.3em] uppercase text-brand-accent mb-3">
              {name ? `${name}'s Skin Profile` : "Your Skin Profile"}
            </p>
            <h1 className="font-heading font-bold text-2xl md:text-3xl text-brand-navy mb-3">
              Your Personalised Skin Profile
            </h1>
            <p className="font-body text-sm text-brand-contrast max-w-md mx-auto">
              Here&apos;s what your answers told us, and the KENTELLE routine we&apos;ve built around it.
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

          {/* Your Recommended Kentelle Routine */}
          {hasRoutine ? (
            <>
              <h2 className="text-center font-heading font-bold text-xl text-brand-navy mb-8">Your Recommended Kentelle Routine</h2>
              <RoutineSection title="Morning Routine" groups={result.am} />
              <RoutineSection title="Evening Routine" groups={result.pm} />
            </>
          ) : (
            <div className="max-w-3xl mx-auto mb-10 bg-brand-pink border-l-2 border-brand-accent rounded p-6 text-center">
              <p className="font-body text-sm text-brand-navy">
                We&apos;re finalising your product matches by hand — our team will follow up shortly with your personalised picks. In the meantime, feel free to browse the full range below.
              </p>
            </div>
          )}

          {/* Why These Products? — advisories (SPF etc.) */}
          {result.advisories.length > 0 && (
            <div className="bg-brand-pink border-l-2 border-brand-accent rounded p-5 mb-6 space-y-2 max-w-3xl mx-auto">
              {result.advisories.map((n, i) => (
                <p key={i} className="font-body text-xs text-brand-navy leading-relaxed">{n}</p>
              ))}
            </div>
          )}
          {result.notes.length > 0 && (
            <div className="bg-white border border-brand-contrast/10 rounded p-5 mb-10 space-y-2 max-w-3xl mx-auto">
              {result.notes.map((n, i) => (
                <p key={i} className="font-body text-xs text-brand-contrast leading-relaxed">{n}</p>
              ))}
            </div>
          )}

          {/* How To Introduce Your Routine */}
          {hasRoutine && (
            <div className="max-w-3xl mx-auto mb-10 bg-white border border-brand-contrast/10 rounded p-6">
              <p className="font-heading font-bold text-[10px] uppercase tracking-widest text-brand-blue mb-2">How To Introduce Your Routine</p>
              <p className="font-body text-xs text-brand-contrast leading-relaxed">
                {needsTitration
                  ? "Start any active treatment 2–3 nights a week and build up gradually as your skin adjusts — introduce one new active at a time rather than all at once."
                  : "Introduce each new product one at a time over the first couple of weeks so you can see how your skin responds before layering in the next."}
              </p>
            </div>
          )}

          {/* Shop Your Personalised Routine */}
          <div className="flex flex-col sm:flex-row gap-3 max-w-3xl mx-auto mb-10">
            {hasRoutine && (
              <Link
                href="/shop"
                className="flex-1 text-center py-4 bg-brand-accent text-brand-navy font-heading font-bold text-xs uppercase tracking-widest rounded hover:bg-brand-accent/85 transition-colors"
              >
                Shop This Routine
              </Link>
            )}
            <Link
              href="/skin-quiz"
              className="flex-1 text-center py-4 border-2 border-brand-navy text-brand-navy font-heading font-bold text-xs uppercase tracking-widest rounded hover:bg-brand-navy hover:text-brand-white transition-colors"
            >
              Retake the Quiz
            </Link>
          </div>

          {/* Need Professional Advice? */}
          <div className="max-w-3xl mx-auto text-center bg-brand-navy rounded p-8">
            <p className="font-heading font-bold text-sm uppercase tracking-widest text-brand-white mb-2">Need Professional Advice?</p>
            <p className="font-body text-xs text-brand-white/70 mb-5 max-w-sm mx-auto">
              Book a personalised consultation with our Beaubelle-trained team in Perth.
            </p>
            <a
              href="tel:0892280191"
              className="inline-block px-6 py-3 bg-brand-white text-brand-navy font-heading font-bold text-xs uppercase tracking-widest rounded hover:bg-brand-accent transition-colors"
            >
              Call (08) 9228 0191
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}

function RoutineSection({ title, groups }: { title: string; groups: RoutineGroup[] }) {
  if (!groups.length) return null;
  return (
    <div className="mb-12 max-w-3xl mx-auto">
      <p className="font-heading font-bold text-sm uppercase tracking-widest text-brand-navy mb-6 pb-2 border-b border-brand-contrast/15">{title}</p>
      <div className="space-y-8">
        {groups.map((g) => (
          <div key={g.step}>
            <p className="font-heading font-bold text-xs uppercase tracking-widest text-brand-blue mb-4">{g.label}</p>
            {g.products.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                {g.products.map((p) => (
                  <div key={p.id}>
                    <ProductCard product={p} />
                    <p className="font-body text-[11px] text-brand-contrast leading-relaxed mt-2">{p.reason}</p>
                  </div>
                ))}
              </div>
            )}
            {g.choices.map((choice) => (
              <div key={choice.groupKey} className="mb-4">
                <p className="font-body text-[11px] text-brand-contrast uppercase tracking-wider mb-2">Choose one</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 items-start">
                  {choice.options.map((p, i) => (
                    <div key={p.id} className="relative">
                      {i > 0 && (
                        <span className="absolute -left-3 top-1/2 -translate-y-1/2 -translate-x-full font-heading font-bold text-[10px] uppercase text-brand-contrast/60 hidden sm:block">
                          or
                        </span>
                      )}
                      <ProductCard product={p} />
                      <p className="font-body text-[11px] text-brand-contrast leading-relaxed mt-2">{p.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
