"use client";

import { ChevronLeft } from "lucide-react";

type QuizProgressBarProps = {
  onBack?: () => void;
  showBack?: boolean;
  stageLabel?: string;
  stageIndex?: number;
  stageCount?: number;
  percent?: number;
};

/** Slim back + progress strip that sits directly under the site's real
 * sticky Navbar on quiz pages — the Navbar/Footer themselves come from
 * StoreLayout like any other page. */
export default function QuizProgressBar({
  onBack,
  showBack = true,
  stageLabel,
  stageIndex = 0,
  stageCount = 1,
  percent = 0,
}: QuizProgressBarProps) {
  return (
    <div className="sticky top-[68px] md:top-[76px] z-30 flex items-center h-11 px-4 bg-brand-bg/95 backdrop-blur-md border-b border-brand-contrast/10">
      <div className="flex items-center w-full max-w-5xl mx-auto">
        {showBack ? (
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 text-brand-navy hover:text-brand-contrast transition-colors"
            aria-label="Go back"
          >
            <ChevronLeft size={16} />
            <span className="font-body text-xs uppercase tracking-widest">Back</span>
          </button>
        ) : (
          <div />
        )}
        <div className="flex-1" />
        <div className="flex items-center gap-1.5">
          <div className="relative flex items-center h-6 rounded-full px-3 overflow-hidden bg-brand-contrast/10 min-w-[64px]">
            <div
              className="absolute top-0 left-0 h-full bg-brand-accent transition-all duration-300"
              style={{ width: `${percent}%`, borderRadius: "9999px 0 0 9999px" }}
            />
            <span className="relative z-10 font-body text-[10px] font-bold uppercase tracking-wider text-brand-navy">
              {stageLabel}
            </span>
          </div>
          {Array.from({ length: Math.max(stageCount - 1, 0) }).map((_, i) => (
            <div
              key={i}
              className={`w-2.5 h-2.5 rounded-full transition-colors ${
                i < stageIndex ? "bg-brand-accent" : "bg-brand-contrast/15"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
