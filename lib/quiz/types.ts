export type QuizOption = {
  value: string;
  label: string;
  /** Short one-line reasoning shown after selection / used in the routine summary. */
  note?: string;
  /** Catalog product ids (see catalog.ts) this answer prescribes. */
  products?: string[];
  /** Safety / behaviour flags this answer sets, consumed by the engine. */
  flags?: string[];
};

export type QuizQuestion = {
  id: string;
  prompt: string;
  subtitle?: string;
  /** Optional "why we ask" diagnostic blurb, shown as an expandable hint. */
  why?: string;
  type: "single" | "multi" | "text";
  options?: QuizOption[];
  placeholder?: string;
};

export const CONCERN_KEYS = [
  "sensitivity",
  "lines",
  "firmness",
  "dryness",
  "acne",
  "redness",
  "pigment",
  "shine",
  "posttreatment",
] as const;

export type ConcernKey = (typeof CONCERN_KEYS)[number];

/** Maps each Stage 1 concern to the question pool that answers it. Two
 * concerns (lines / firmness) share the "aging" pool since the source guide
 * covers structural sagging inside the same fine-lines-&-wrinkles pool. */
export const CONCERN_POOL: Record<ConcernKey, string> = {
  sensitivity: "sensitivity",
  lines: "aging",
  firmness: "aging",
  dryness: "dryness",
  acne: "acne",
  redness: "redness",
  pigment: "pigment",
  shine: "oily",
  posttreatment: "posttreatment",
};
