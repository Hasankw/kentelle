export const dynamic = "force-dynamic";

import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { db } from "@/lib/db";
import AdminShell from "@/components/admin/AdminShell";

export const metadata: Metadata = { title: "Quiz Submission" };

const POOL_LABELS: Record<string, string> = {
  concerns: "Skin Concerns",
  sensitivity: "Sensitivity",
  aging: "Fine Lines & Firmness",
  dryness: "Dryness",
  acne: "Breakouts",
  redness: "Redness",
  pigment: "Pigmentation",
  oily: "Oil & Pores",
  posttreatment: "Recovery",
  lifestyle: "Lifestyle & Safety",
  profile: "About You",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminQuizSubmissionPage({ params }: PageProps) {
  const { id } = await params;

  const [submissions, concerns, questions] = await Promise.all([
    db.quizSubmission.findMany({ where: { id } }),
    db.quizConcern.findMany({}),
    db.quizQuestion.findMany({}),
  ]);

  const submission = (submissions as any[])[0];
  if (!submission) notFound();

  const concernLabelByKey = new Map((concerns as any[]).map((c) => [c.key, c.label]));
  const questionById = new Map((questions as any[]).map((q) => [q.id, q]));

  const selectedConcernKeys: string[] = Array.isArray(submission.concerns) ? submission.concerns : [];
  const responses: Record<string, unknown> = submission.responses ?? {};

  // Order answered questions by pool, then by their original sortOrder —
  // falls back to the end of the list for any question that's since been
  // deleted from the builder (still shown, so the raw answer isn't lost).
  const answeredEntries = Object.entries(responses)
    .map(([questionId, value]) => ({ questionId, value, question: questionById.get(questionId) }))
    .sort((a, b) => {
      const poolA = a.question?.poolKey ?? "zzz";
      const poolB = b.question?.poolKey ?? "zzz";
      if (poolA !== poolB) return poolA.localeCompare(poolB);
      return (a.question?.sortOrder ?? 999) - (b.question?.sortOrder ?? 999);
    });

  function resolveAnswer(question: any, value: unknown): string {
    if (!question) return typeof value === "string" ? value : JSON.stringify(value);
    if (question.type === "text") {
      const s = String(value ?? "").trim();
      return s || "(left blank)";
    }
    const values = Array.isArray(value) ? value : [value];
    const labels = values
      .map((v) => question.options?.find((o: any) => o.value === v)?.label ?? String(v))
      .filter(Boolean);
    return labels.length ? labels.join(", ") : "(no answer)";
  }

  const routine = submission.routine ?? {};
  const prescription: any[] = Array.isArray(routine.prescription) ? routine.prescription : [];
  // Older submissions (before the master-prescription rewrite) carried
  // routine.am/routine.pm groups with embedded products instead.
  const legacyGroups: any[] = Array.isArray(routine.groups) ? routine.groups : [...(routine.am ?? []), ...(routine.pm ?? [])];
  const legacyProducts = legacyGroups.length
    ? [...new Map(legacyGroups.flatMap((g) => g.products ?? []).map((p: any) => [p.id, p])).values()]
    : [];

  return (
    <AdminShell>
      <div className="p-8 max-w-4xl">
        <Link href="/admin/quiz" className="inline-flex items-center gap-2 text-xs font-heading font-bold uppercase tracking-widest text-brand-contrast hover:text-brand-navy transition-colors mb-4">
          <ArrowLeft size={14} /> Back to Submissions
        </Link>

        <div className="bg-white border border-brand-contrast/10 rounded p-6 mb-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="font-heading font-bold text-2xl text-brand-navy mb-1">
                {submission.name || "Anonymous"}&apos;s Skin Quiz
              </h1>
              <p className="font-body text-sm text-brand-contrast">
                {new Date(submission.createdAt).toLocaleString("en-AU", { dateStyle: "medium", timeStyle: "short" })}
              </p>
            </div>
            <div className="text-right">
              {submission.email && (
                <a href={`mailto:${submission.email}`} className="block text-sm font-body text-brand-blue hover:underline mb-1">
                  {submission.email}
                </a>
              )}
              {submission.emailSent ? (
                <span className="inline-block px-2 py-0.5 text-[10px] font-heading font-bold uppercase bg-green-100 text-green-800 rounded">Result Emailed</span>
              ) : (
                <span className="inline-block px-2 py-0.5 text-[10px] font-heading font-bold uppercase bg-brand-contrast/10 text-brand-contrast rounded">Not Emailed</span>
              )}
            </div>
          </div>

          <div className="mt-5 pt-5 border-t border-brand-contrast/10 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="font-heading font-bold text-[10px] uppercase tracking-widest text-brand-blue mb-1">Skin Concerns Selected</p>
              <p className="font-body text-sm text-brand-navy">
                {selectedConcernKeys.length ? selectedConcernKeys.map((k) => concernLabelByKey.get(k) ?? k).join(", ") : "—"}
              </p>
            </div>
            {routine.skinProfile?.primaryConcern && (
              <div>
                <p className="font-heading font-bold text-[10px] uppercase tracking-widest text-brand-blue mb-1">Primary Concern (as scored)</p>
                <p className="font-body text-sm text-brand-navy">{routine.skinProfile.primaryConcern}</p>
              </div>
            )}
          </div>
        </div>

        {(routine.notes?.length > 0 || routine.advisories?.length > 0 || routine.mappingError) && (
          <div className="bg-amber-50 border border-amber-300 rounded p-5 mb-6">
            <p className="font-heading font-bold text-[11px] uppercase tracking-widest text-amber-800 mb-2">
              Engine Notes {routine.mappingError && "— No routine could be matched"}
            </p>
            <div className="space-y-1.5">
              {[...(routine.advisories ?? []), ...(routine.notes ?? [])].map((n: string, i: number) => (
                <p key={i} className="font-body text-xs text-amber-900 leading-relaxed">{n}</p>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white border border-brand-contrast/10 rounded p-6 mb-6">
          <h2 className="font-heading font-bold text-sm uppercase tracking-widest text-brand-navy mb-4 pb-3 border-b border-brand-contrast/10">
            Complete Question &amp; Answer Flow ({answeredEntries.length})
          </h2>
          {answeredEntries.length === 0 ? (
            <p className="font-body text-sm text-brand-contrast">No recorded answers.</p>
          ) : (
            <div className="space-y-4">
              {answeredEntries.map(({ questionId, value, question }) => (
                <div key={questionId} className="pb-4 border-b border-brand-contrast/5 last:border-b-0 last:pb-0">
                  <p className="font-heading text-[10px] font-bold uppercase tracking-widest text-brand-blue mb-1">
                    {POOL_LABELS[question?.poolKey] ?? question?.poolKey ?? "Unknown"}
                  </p>
                  <p className="font-body text-sm text-brand-navy mb-1">
                    {question?.prompt ?? <span className="text-brand-contrast/60 italic">Question no longer exists (id: {questionId})</span>}
                  </p>
                  <p className="font-body text-sm font-bold text-brand-navy">{resolveAnswer(question, value)}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white border border-brand-contrast/10 rounded p-6 mb-6">
          <h2 className="font-heading font-bold text-sm uppercase tracking-widest text-brand-navy mb-4 pb-3 border-b border-brand-contrast/10">
            Resulting Prescription
          </h2>
          {prescription.length > 0 ? (
            <div className="space-y-2">
              {prescription.map((e: any) => {
                const isChoice = e.kind === "choice";
                const label = isChoice ? e.options.map((o: any) => o.name).join(" or ") : e.product.name;
                const timing = isChoice ? e.options[0]?.timingLabel : e.product.timingLabel;
                return (
                  <div key={e.id} className="flex items-center justify-between text-sm font-body">
                    <span className="text-brand-navy">{label}{isChoice && <span className="text-brand-contrast text-xs"> (choose one)</span>}</span>
                    <span className="text-brand-contrast text-xs uppercase tracking-wide">{timing}</span>
                  </div>
                );
              })}
            </div>
          ) : legacyProducts.length > 0 ? (
            <div className="space-y-2">
              {legacyProducts.map((p: any) => (
                <p key={p.id} className="text-sm font-body text-brand-navy">{p.name}</p>
              ))}
            </div>
          ) : (
            <p className="font-body text-sm text-brand-contrast">No products were recommended for this submission.</p>
          )}
        </div>

        <details className="bg-white border border-brand-contrast/10 rounded p-6">
          <summary className="font-heading font-bold text-sm uppercase tracking-widest text-brand-navy cursor-pointer">
            Raw Data (debugging)
          </summary>
          <div className="mt-4 space-y-4">
            <div>
              <p className="font-heading font-bold text-[10px] uppercase tracking-widest text-brand-blue mb-1.5">Raw Responses</p>
              <pre className="text-[11px] font-mono bg-brand-bg p-3 rounded overflow-x-auto">{JSON.stringify(responses, null, 2)}</pre>
            </div>
            <div>
              <p className="font-heading font-bold text-[10px] uppercase tracking-widest text-brand-blue mb-1.5">Raw Routine</p>
              <pre className="text-[11px] font-mono bg-brand-bg p-3 rounded overflow-x-auto">{JSON.stringify(routine, null, 2)}</pre>
            </div>
          </div>
        </details>
      </div>
    </AdminShell>
  );
}
