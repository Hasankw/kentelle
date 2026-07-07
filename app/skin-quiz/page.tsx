"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, ChevronRight, ChevronLeft, Check } from "lucide-react";

type Option = { value: string; label: string; desc?: string; emoji?: string };

const QUESTIONS: { key: string; title: string; options: Option[] }[] = [
  {
    key: "middaySkin",
    title: "How does your skin feel by midday?",
    options: [
      { value: "oily", label: "Oily / Shiny", desc: "Visible shine, especially the T-zone", emoji: "💧" },
      { value: "dry", label: "Dry / Tight", desc: "Feels tight, sometimes flaky", emoji: "🏜️" },
      { value: "normal", label: "Normal", desc: "Comfortable and balanced", emoji: "✨" },
    ],
  },
  {
    key: "breakouts",
    title: "Do you get breakouts often?",
    options: [
      { value: "often", label: "Yes, often", desc: "Regular spots or congestion", emoji: "😣" },
      { value: "sometimes", label: "Sometimes", desc: "The occasional breakout", emoji: "🤔" },
      { value: "rarely", label: "Rarely / Never", desc: "Breakouts aren't my problem", emoji: "😌" },
    ],
  },
  {
    key: "sensitivity",
    title: "Does your skin sting or go red easily?",
    options: [
      { value: "very", label: "Yes, very reactive", desc: "New products often irritate me", emoji: "🌡️" },
      { value: "sometimes", label: "Sometimes", desc: "Certain actives can sting", emoji: "🌸" },
      { value: "no", label: "No", desc: "My skin tolerates most things", emoji: "💪" },
    ],
  },
  {
    key: "experience",
    title: "How many skincare steps do you use now?",
    options: [
      { value: "beginner", label: "0–3 steps", desc: "Keeping it simple (beginner)", emoji: "🌱" },
      { value: "advanced", label: "4+ steps", desc: "Layered routine (advanced)", emoji: "🧪" },
    ],
  },
  {
    key: "concern",
    title: "What's your biggest concern?",
    options: [
      { value: "oil", label: "Shine / Oil", desc: "Managing excess oil through the day", emoji: "🫧" },
      { value: "dryness", label: "Dryness / Flaking", desc: "Skin needs deeper moisture", emoji: "🧴" },
      { value: "acne", label: "Acne / Clogs", desc: "Breakouts and congestion", emoji: "🎯" },
      { value: "redness", label: "Redness / Irritation", desc: "Calming and strengthening", emoji: "🍃" },
    ],
  },
];

export default function SkinQuizPage() {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const totalSteps = QUESTIONS.length + 1; // +1 for the email step
  const onEmailStep = stepIndex === QUESTIONS.length;
  const question = QUESTIONS[stepIndex];
  const progressPct = ((stepIndex + 1) / totalSteps) * 100;

  const selectAnswer = (key: string, value: string) => {
    setAnswers((p) => ({ ...p, [key]: value }));
    setTimeout(() => setStepIndex((i) => Math.min(i + 1, QUESTIONS.length)), 200);
  };

  const handleSubmit = async (withEmail: boolean) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...answers,
          email: withEmail && email.trim() ? email.trim() : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong");
      router.push(data.redirect);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong — please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-16">
      <div className="text-center mb-8">
        <p className="text-xs font-heading font-bold tracking-widest uppercase text-brand-blue mb-2">
          Your Skin, Your Routine
        </p>
        <h1 className="font-heading font-bold text-2xl text-brand-navy">
          Find Your Perfect Routine
        </h1>
        <p className="font-body text-xs text-brand-contrast mt-1">
          Step {stepIndex + 1} of {totalSteps} · takes 60 seconds
        </p>
      </div>

      <div className="h-1.5 bg-brand-contrast/15 rounded-full mb-10 overflow-hidden">
        <div
          className="h-full bg-brand-accent rounded-full transition-all duration-400"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {!onEmailStep && (
        <div>
          <h2 className="font-heading font-bold text-lg text-brand-navy mb-6 text-center">
            {question.title}
          </h2>
          <div className="space-y-3">
            {question.options.map((o) => (
              <button
                key={o.value}
                onClick={() => selectAnswer(question.key, o.value)}
                className={`w-full flex items-center gap-4 px-5 py-4 border-2 text-left transition-colors ${
                  answers[question.key] === o.value
                    ? "border-brand-navy bg-brand-navy/5"
                    : "border-brand-contrast/20 hover:border-brand-navy/40"
                }`}
              >
                {o.emoji && <span className="text-2xl">{o.emoji}</span>}
                <div className="flex-1">
                  <p className="font-heading font-bold text-sm text-brand-navy">{o.label}</p>
                  {o.desc && <p className="font-body text-xs text-brand-contrast">{o.desc}</p>}
                </div>
                {answers[question.key] === o.value && (
                  <Check size={16} className="text-brand-navy shrink-0" />
                )}
              </button>
            ))}
          </div>
          {stepIndex > 0 && (
            <button
              onClick={() => setStepIndex((i) => i - 1)}
              className="mt-8 inline-flex items-center gap-2 text-xs font-heading font-bold uppercase tracking-widest text-brand-contrast hover:text-brand-navy transition-colors"
            >
              <ChevronLeft size={14} /> Back
            </button>
          )}
        </div>
      )}

      {onEmailStep && (
        <div>
          <h2 className="font-heading font-bold text-lg text-brand-navy mb-2 text-center">
            Where should we send your routine?
          </h2>
          <p className="text-center text-xs text-brand-contrast font-body mb-6">
            Optional — we&apos;ll email your personalised routine so you can come back to it anytime.
          </p>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full px-5 py-4 border-2 border-brand-contrast/20 focus:border-brand-navy outline-none font-body text-sm text-brand-navy mb-6"
          />
          {error && (
            <p className="text-center text-xs text-red-600 font-body mb-4">{error}</p>
          )}
          <div className="flex gap-3">
            <button
              onClick={() => setStepIndex((i) => i - 1)}
              className="flex-1 py-3 border border-brand-contrast/30 text-brand-contrast text-xs font-heading font-bold uppercase tracking-widest hover:border-brand-navy hover:text-brand-navy transition-colors flex items-center justify-center gap-2"
            >
              <ChevronLeft size={16} /> Back
            </button>
            <button
              onClick={() => handleSubmit(true)}
              disabled={loading}
              className="flex-1 py-3 bg-brand-accent text-brand-navy rounded text-xs font-heading font-bold uppercase tracking-widest hover:bg-brand-accent/85 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <><Sparkles size={14} /> See My Routine</>
              )}
            </button>
          </div>
          <button
            onClick={() => handleSubmit(false)}
            disabled={loading}
            className="w-full mt-4 text-center text-xs text-brand-contrast font-body underline underline-offset-2 disabled:opacity-50"
          >
            Skip — just show my routine <ChevronRight size={12} className="inline" />
          </button>
        </div>
      )}
    </div>
  );
}
