"use client";

import { useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

const messages = [
  "Free shipping on orders over $80 AUD",
  "Cruelty-free · Vegan · Made for Australian skin",
  "Try the Kentelle Skin Quiz for personalised recommendations",
];

export default function AnnouncementBar() {
  const [current, setCurrent] = useState(0);
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  const prev = () => setCurrent((c) => (c - 1 + messages.length) % messages.length);
  const next = () => setCurrent((c) => (c + 1) % messages.length);

  return (
    <div
      className="text-brand-navy text-xs py-2 px-4 flex items-center justify-center gap-3 relative"
      style={{
        background: "linear-gradient(90deg, rgba(226,137,153,1) 0%, rgba(226,137,153,1) 15%, rgba(232,240,242,1) 50%, rgba(57,205,153,1) 86%)",
      }}
    >
      <button
        onClick={prev}
        className="opacity-60 hover:opacity-100 transition-opacity"
        aria-label="Previous announcement"
      >
        <ChevronLeft size={14} />
      </button>
      <p className="font-body tracking-wider text-center font-semibold">{messages[current]}</p>
      <button
        onClick={next}
        className="opacity-60 hover:opacity-100 transition-opacity"
        aria-label="Next announcement"
      >
        <ChevronRight size={14} />
      </button>
      <button
        onClick={() => setVisible(false)}
        className="absolute right-3 opacity-60 hover:opacity-100 transition-opacity"
        aria-label="Close announcement"
      >
        <X size={14} />
      </button>
    </div>
  );
}
