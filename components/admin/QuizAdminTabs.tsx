"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { label: "Submissions", href: "/admin/quiz" },
  { label: "Builder", href: "/admin/quiz/builder" },
  { label: "Products", href: "/admin/quiz/products" },
  { label: "Safety Rules", href: "/admin/quiz/safety" },
  { label: "Settings", href: "/admin/quiz/settings" },
];

export default function QuizAdminTabs() {
  const pathname = usePathname();
  return (
    <div className="flex items-center gap-1 border-b border-brand-contrast/10 mb-6 px-8 pt-6 -mx-8 -mt-6 bg-white">
      {TABS.map((t) => {
        const active = pathname === t.href;
        return (
          <Link
            key={t.href}
            href={t.href}
            className={cn(
              "px-4 py-3 text-xs font-heading font-bold uppercase tracking-widest border-b-2 -mb-px transition-colors",
              active
                ? "border-brand-navy text-brand-navy"
                : "border-transparent text-brand-contrast hover:text-brand-navy"
            )}
          >
            {t.label}
          </Link>
        );
      })}
    </div>
  );
}
