"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface AccordionItem {
  title: string;
  content: React.ReactNode;
}

interface AccordionProps {
  items: AccordionItem[];
  className?: string;
}

export default function Accordion({ items, className }: AccordionProps) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className={cn("divide-y divide-brand-contrast/20", className)}>
      {items.map((item, i) => (
        <div key={i}>
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between py-4 text-left font-heading font-bold text-sm tracking-wider uppercase text-brand-navy"
          >
            {item.title}
            <ChevronDown
              size={18}
              className={cn(
                "transition-transform duration-300 text-brand-contrast shrink-0",
                open === i && "rotate-180"
              )}
            />
          </button>
          <div
            className={cn(
              "overflow-hidden transition-all duration-300",
              open === i ? "max-h-[600px] pb-4" : "max-h-0"
            )}
          >
            <div className="text-sm text-brand-navy/80 leading-relaxed">
              {item.content}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
