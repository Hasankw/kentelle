export const dynamic = "force-dynamic";

import { Metadata } from "next";
import Link from "next/link";
import { Download } from "lucide-react";
import { db } from "@/lib/db";
import AdminShell from "@/components/admin/AdminShell";
import QuizAdminTabs from "@/components/admin/QuizAdminTabs";

export const metadata: Metadata = { title: "Quiz Submissions" };

const CONCERN_LABELS: Record<string, string> = {
  acne: "Breakouts",
  redness: "Redness",
  sensitivity: "Sensitivity",
  lines: "Fine Lines",
  firmness: "Firmness",
  pigment: "Pigmentation",
  dryness: "Dryness",
  shine: "Oil & Pores",
  posttreatment: "Post-Treatment",
};

// Submissions stored before the AM/PM engine rewrite carry a flat
// `routine.groups` list; newer ones carry `routine.am` / `routine.pm`.
function routineProductCount(routine: any): number {
  if (!routine) return 0;
  const groups: { products: unknown[] }[] = Array.isArray(routine.groups)
    ? routine.groups
    : [...(routine.am ?? []), ...(routine.pm ?? [])];
  const ids = new Set<string>();
  for (const g of groups) {
    for (const p of g.products as { id?: string }[]) ids.add(p.id ?? JSON.stringify(p));
  }
  return ids.size || groups.reduce((n, g) => n + g.products.length, 0);
}

export default async function AdminQuizPage() {
  let submissions: any[] = [];
  try {
    submissions = await db.quizSubmission.findMany({ orderBy: { createdAt: "desc" } });
  } catch {
    submissions = [];
  }

  return (
    <AdminShell>
      <div className="p-8">
        <QuizAdminTabs />
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-heading font-bold text-2xl text-brand-navy">
            Skin Quiz Submissions ({submissions.length})
          </h1>
          <a
            href="/api/admin/quiz/export"
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-navy text-white text-xs font-heading font-bold uppercase tracking-widest rounded hover:bg-brand-blue transition-colors"
          >
            <Download size={14} /> Export CSV
          </a>
        </div>

        {submissions.length === 0 ? (
          <div className="text-center py-10 text-brand-contrast font-body">
            No quiz submissions yet. The quiz lives at{" "}
            <Link href="/skin-quiz" className="text-brand-blue underline">/skin-quiz</Link>.
          </div>
        ) : (
          <div className="overflow-x-auto bg-white border border-brand-contrast/10">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-brand-contrast/10">
                  {["Date", "Email", "Name", "Concerns", "Routine Steps", "Emailed"].map((h) => (
                    <th key={h} className="px-4 py-3 text-[10px] font-heading font-bold uppercase tracking-widest text-brand-contrast whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {submissions.map((s) => {
                  const concerns: string[] = Array.isArray(s.concerns) ? s.concerns : [];
                  const productCount = routineProductCount(s.routine);
                  return (
                    <tr key={s.id} className="border-b border-brand-contrast/5 last:border-b-0">
                      <td className="px-4 py-3 text-xs font-body text-brand-contrast whitespace-nowrap">
                        {new Date(s.createdAt).toLocaleString("en-AU", { dateStyle: "medium", timeStyle: "short" })}
                      </td>
                      <td className="px-4 py-3 text-xs font-body">
                        {s.email ? (
                          <a href={`mailto:${s.email}`} className="text-brand-blue hover:underline">{s.email}</a>
                        ) : (
                          <span className="text-brand-contrast/50">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs font-body text-brand-navy">{s.name || <span className="text-brand-contrast/50">—</span>}</td>
                      <td className="px-4 py-3 text-xs font-body text-brand-navy">
                        {concerns.length ? concerns.map((c) => CONCERN_LABELS[c] ?? c).join(", ") : <span className="text-brand-contrast/50">Everyday essentials</span>}
                      </td>
                      <td className="px-4 py-3 text-xs font-body text-brand-navy whitespace-nowrap">{productCount} products</td>
                      <td className="px-4 py-3 text-xs font-body">
                        {s.emailSent ? (
                          <span className="px-2 py-0.5 text-[10px] font-heading font-bold uppercase bg-green-100 text-green-800 rounded">Sent</span>
                        ) : (
                          <span className="text-brand-contrast/50">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
