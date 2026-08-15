"use client";

import { Check } from "lucide-react";

type QuizOptionCardProps = {
  label: string;
  note?: string;
  selected: boolean;
  multi?: boolean;
  onClick: () => void;
};

export default function QuizOptionCard({ label, note, selected, multi, onClick }: QuizOptionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`w-full flex items-center gap-3 text-left px-5 py-4 border-2 rounded transition-colors ${
        selected
          ? "border-brand-navy bg-brand-pink"
          : "border-brand-contrast/20 bg-brand-white hover:border-brand-navy/40"
      }`}
    >
      <div className="flex-1">
        <p className="font-heading font-bold text-sm text-brand-navy">{label}</p>
        {note && <p className="font-body text-xs text-brand-contrast mt-0.5">{note}</p>}
      </div>
      <div
        className={`shrink-0 w-5 h-5 flex items-center justify-center border-2 ${
          multi ? "rounded" : "rounded-full"
        } ${selected ? "bg-brand-navy border-brand-navy" : "border-brand-contrast/30"}`}
      >
        {selected && <Check size={12} className="text-brand-white" strokeWidth={3} />}
      </div>
    </button>
  );
}
