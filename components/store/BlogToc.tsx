"use client";

import { useState, useEffect } from "react";

interface Heading { id: string; text: string; }

export default function BlogToc({ headings }: { headings: Heading[] }) {
  const [active, setActive] = useState(headings[0]?.id ?? "");

  useEffect(() => {
    if (headings.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-80px 0px -55% 0px", threshold: 0 }
    );
    headings.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <nav className="sticky top-24 self-start">
      <p className="text-[10px] font-heading font-bold uppercase tracking-[0.15em] text-brand-contrast mb-4">
        Table of Contents
      </p>
      <ul className="space-y-2.5">
        {headings.map(({ id, text }) => (
          <li key={id}>
            <a
              href={`#${id}`}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
                setActive(id);
              }}
              className={`block text-sm font-body leading-snug transition-colors duration-150 ${
                active === id
                  ? "text-brand-navy font-bold border-l-2 border-brand-accent pl-3"
                  : "text-brand-contrast hover:text-brand-navy pl-3 border-l-2 border-transparent"
              }`}
            >
              {text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
