"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Sparkles, ChevronRight, ChevronLeft, Check, RefreshCw } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/store/cart";

const SKIN_TYPES = [
  { value: "oily", label: "Oily", desc: "Shiny, prone to breakouts", emoji: "💧" },
  { value: "dry", label: "Dry", desc: "Tight, flaky, needs moisture", emoji: "🏜️" },
  { value: "combination", label: "Combination", desc: "Oily T-zone, dry cheeks", emoji: "☯️" },
  { value: "normal", label: "Normal", desc: "Balanced, few concerns", emoji: "✨" },
  { value: "sensitive", label: "Sensitive", desc: "Reacts easily, prone to redness", emoji: "🌸" },
];

const CONCERNS = [
  { value: "acne", label: "Acne & Breakouts" },
  { value: "anti-aging", label: "Anti-Aging" },
  { value: "brightening", label: "Brightening & Glow" },
  { value: "hydration", label: "Deep Hydration" },
  { value: "pores", label: "Pore Minimizing" },
  { value: "uneven texture", label: "Uneven Texture" },
  { value: "redness", label: "Redness & Irritation" },
  { value: "dark spots", label: "Dark Spots" },
];

const AGE_RANGES = ["Under 20", "20–30", "30–40", "40+"];
const SKIN_TONES = ["Fair", "Light", "Medium", "Tan", "Dark", "Deep"];

type Step = "type" | "concerns" | "details" | "results";
type ProductRec = { id: string; name: string; slug: string; price: number; salePrice: number | null; images: string[] };

export default function FindYourRoutinePage() {
  const { addItem } = useCartStore();

  const [authChecked, setAuthChecked] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [step, setStep] = useState<Step>("type");
  const [skinType, setSkinType] = useState("");
  const [concerns, setConcerns] = useState<string[]>([]);
  const [ageRange, setAgeRange] = useState("");
  const [skinTone, setSkinTone] = useState("");
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<ProductRec[]>([]);
  const [hasExisting, setHasExisting] = useState(false);

  useEffect(() => {
    fetch("/api/skin-profile")
      .then((r) => {
        if (r.status === 401) { setAuthed(false); setAuthChecked(true); return null; }
        setAuthed(true);
        setAuthChecked(true);
        return r.json();
      })
      .then((profile) => {
        if (profile) {
          setSkinType(profile.skinType ?? "");
          setConcerns(JSON.parse(profile.concerns ?? "[]"));
          setAgeRange(profile.ageRange ?? "");
          setSkinTone(profile.skinTone ?? "");
          setHasExisting(true);
        }
      })
      .catch(() => setAuthChecked(true));
  }, []);

  const toggleConcern = (v: string) =>
    setConcerns((p) => p.includes(v) ? p.filter((c) => c !== v) : [...p, v]);

  const handleSubmit = async () => {
    setLoading(true);
    const res = await fetch("/api/skin-profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ skinType, concerns, ageRange, skinTone }),
    });
    const data = await res.json();
    setRecommendations(data.recommended ?? []);
    setStep("results");
    setLoading(false);
  };

  if (!authChecked) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-pulse text-brand-contrast text-sm font-body">Loading...</div>
      </div>
    );
  }

  // Not logged in — attractive landing
  if (!authed) {
    return (
      <div className="relative overflow-hidden">
        <div className="max-w-3xl mx-auto px-4 py-24 text-center">
          <p className="text-xs font-heading font-bold tracking-widest uppercase text-brand-blue mb-4">
            Personalised For You
          </p>
          <h1 className="font-heading font-bold text-4xl md:text-5xl text-brand-navy leading-tight mb-4">
            Find Your Perfect<br />Skincare Routine
          </h1>
          <p className="font-body text-base text-brand-contrast max-w-md mx-auto mb-10">
            Answer 3 quick questions about your skin and we&apos;ll hand-pick the right Kentelle products — just for you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link
              href="/login?redirect=/find-your-routine"
              className="px-8 py-4 bg-brand-navy text-brand-white text-xs font-heading font-bold uppercase tracking-widest hover:bg-brand-blue transition-colors"
            >
              Get My Recommendations
            </Link>
            <Link
              href="/signup"
              className="px-8 py-4 border-2 border-brand-navy text-brand-navy text-xs font-heading font-bold uppercase tracking-widest hover:bg-brand-navy hover:text-brand-white transition-colors"
            >
              Create Free Account
            </Link>
          </div>

          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-3">
            {["Takes 60 seconds", "Personalised picks", "Saved to your profile", "Free to use"].map((f) => (
              <span key={f} className="px-4 py-2 bg-brand-accent/10 text-brand-navy text-xs font-heading font-bold rounded-full">
                ✓ {f}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // RESULTS
  if (step === "results") {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-accent/15 text-brand-navy text-xs font-heading font-bold uppercase tracking-wider mb-4">
            <Sparkles size={13} /> Your Personalised Picks
          </div>
          <h1 className="font-heading font-bold text-3xl text-brand-navy mb-2">
            Made for Your <span className="capitalize">{skinType}</span> Skin
          </h1>
          {concerns.length > 0 && (
            <p className="font-body text-sm text-brand-contrast">
              Targeting: {concerns.join(" · ")}
            </p>
          )}
        </div>

        {recommendations.length === 0 ? (
          <p className="text-center font-body text-sm text-brand-contrast py-10">
            No matching products yet — check back as we grow our range!
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-12">
            {recommendations.map((p) => (
              <div key={p.id} className="group">
                <Link href={`/products/${p.slug}`}>
                  <div className="relative aspect-square bg-brand-contrast/10 overflow-hidden mb-3">
                    {p.images[0] && (
                      <Image src={p.images[0]} alt={p.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 768px) 50vw, 25vw" />
                    )}
                  </div>
                  <h3 className="font-heading font-bold text-sm text-brand-navy truncate">{p.name}</h3>
                </Link>
                <p className="font-body text-sm text-brand-blue mb-2">
                  {p.salePrice
                    ? <><span className="font-bold">{formatPrice(p.salePrice)}</span><span className="line-through text-brand-contrast/60 text-xs ml-1">{formatPrice(p.price)}</span></>
                    : formatPrice(p.price)
                  }
                </p>
                <button
                  onClick={() => addItem({ id: p.id, name: p.name, slug: p.slug, image: p.images[0] ?? "", price: p.salePrice ?? p.price })}
                  className="w-full py-2 border border-brand-navy text-brand-navy text-xs font-heading font-bold uppercase tracking-widest hover:bg-brand-navy hover:text-brand-white transition-colors"
                >
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="text-center flex items-center justify-center gap-6">
          <button
            onClick={() => { setStep("type"); setRecommendations([]); }}
            className="inline-flex items-center gap-2 text-sm text-brand-blue font-body underline underline-offset-2"
          >
            <RefreshCw size={14} /> Retake Quiz
          </button>
          <Link href="/shop" className="text-sm text-brand-contrast font-body underline underline-offset-2">
            Browse All Products
          </Link>
        </div>
      </div>
    );
  }

  const steps: Step[] = ["type", "concerns", "details"];
  const stepIndex = steps.indexOf(step);
  const progressPct = ((stepIndex + 1) / steps.length) * 100;

  return (
    <div className="max-w-xl mx-auto px-4 py-16">
      <div className="text-center mb-8">
        <p className="text-xs font-heading font-bold tracking-widest uppercase text-brand-blue mb-2">
          Your Skin, Your Routine
        </p>
        <h1 className="font-heading font-bold text-2xl text-brand-navy">
          {hasExisting ? "Update Your Skin Profile" : "Find Your Perfect Match"}
        </h1>
        <p className="font-body text-xs text-brand-contrast mt-1">Step {stepIndex + 1} of {steps.length}</p>
      </div>

      <div className="h-1.5 bg-brand-contrast/15 rounded-full mb-10 overflow-hidden">
        <div className="h-full bg-brand-accent rounded-full transition-all duration-400" style={{ width: `${progressPct}%` }} />
      </div>

      {/* STEP 1 */}
      {step === "type" && (
        <div>
          <h2 className="font-heading font-bold text-lg text-brand-navy mb-6 text-center">
            What best describes your skin?
          </h2>
          <div className="space-y-3">
            {SKIN_TYPES.map((t) => (
              <button
                key={t.value}
                onClick={() => setSkinType(t.value)}
                className={`w-full flex items-center gap-4 px-5 py-4 border-2 text-left transition-colors ${skinType === t.value ? "border-brand-navy bg-brand-navy/5" : "border-brand-contrast/20 hover:border-brand-navy/40"}`}
              >
                <span className="text-2xl">{t.emoji}</span>
                <div className="flex-1">
                  <p className="font-heading font-bold text-sm text-brand-navy">{t.label}</p>
                  <p className="font-body text-xs text-brand-contrast">{t.desc}</p>
                </div>
                {skinType === t.value && <Check size={16} className="text-brand-navy shrink-0" />}
              </button>
            ))}
          </div>
          <button
            onClick={() => setStep("concerns")}
            disabled={!skinType}
            className="w-full mt-8 py-3 bg-brand-navy text-brand-white text-xs font-heading font-bold uppercase tracking-widest hover:bg-brand-blue transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            Next <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* STEP 2 */}
      {step === "concerns" && (
        <div>
          <h2 className="font-heading font-bold text-lg text-brand-navy mb-2 text-center">
            What are your main skin concerns?
          </h2>
          <p className="text-center text-xs text-brand-contrast font-body mb-6">Select all that apply</p>
          <div className="grid grid-cols-2 gap-3">
            {CONCERNS.map((c) => (
              <button
                key={c.value}
                onClick={() => toggleConcern(c.value)}
                className={`py-3 px-4 border-2 text-sm font-heading font-bold text-left transition-colors flex items-center gap-2 ${concerns.includes(c.value) ? "border-brand-navy bg-brand-navy/5 text-brand-navy" : "border-brand-contrast/20 text-brand-contrast hover:border-brand-navy/40"}`}
              >
                {concerns.includes(c.value) && <Check size={13} className="shrink-0" />}
                {c.label}
              </button>
            ))}
          </div>
          <div className="flex gap-3 mt-8">
            <button onClick={() => setStep("type")} className="flex-1 py-3 border border-brand-contrast/30 text-brand-contrast text-xs font-heading font-bold uppercase tracking-widest hover:border-brand-navy hover:text-brand-navy transition-colors flex items-center justify-center gap-2">
              <ChevronLeft size={16} /> Back
            </button>
            <button onClick={() => setStep("details")} className="flex-1 py-3 bg-brand-navy text-brand-white text-xs font-heading font-bold uppercase tracking-widest hover:bg-brand-blue transition-colors flex items-center justify-center gap-2">
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3 */}
      {step === "details" && (
        <div>
          <h2 className="font-heading font-bold text-lg text-brand-navy mb-6 text-center">Almost there!</h2>

          <div className="mb-6">
            <p className="text-xs font-heading font-bold uppercase tracking-wider text-brand-navy mb-3">Age Range</p>
            <div className="grid grid-cols-4 gap-2">
              {AGE_RANGES.map((a) => (
                <button key={a} onClick={() => setAgeRange(a)}
                  className={`py-2.5 border-2 text-xs font-heading font-bold text-center transition-colors ${ageRange === a ? "border-brand-navy bg-brand-navy/5 text-brand-navy" : "border-brand-contrast/20 text-brand-contrast hover:border-brand-navy/40"}`}>
                  {a}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <p className="text-xs font-heading font-bold uppercase tracking-wider text-brand-navy mb-3">
              Skin Tone <span className="text-brand-contrast/60 normal-case font-normal">(optional)</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {SKIN_TONES.map((t) => (
                <button key={t} onClick={() => setSkinTone(skinTone === t ? "" : t)}
                  className={`px-4 py-2 border-2 text-xs font-heading font-bold transition-colors ${skinTone === t ? "border-brand-navy bg-brand-navy/5 text-brand-navy" : "border-brand-contrast/20 text-brand-contrast hover:border-brand-navy/40"}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep("concerns")} className="flex-1 py-3 border border-brand-contrast/30 text-brand-contrast text-xs font-heading font-bold uppercase tracking-widest hover:border-brand-navy hover:text-brand-navy transition-colors flex items-center justify-center gap-2">
              <ChevronLeft size={16} /> Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 py-3 bg-brand-accent text-brand-navy text-xs font-heading font-bold uppercase tracking-widest hover:bg-brand-accent/85 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <><Sparkles size={14} /> Get My Picks</>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
