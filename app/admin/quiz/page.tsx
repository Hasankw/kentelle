export const dynamic = "force-dynamic";

import { Metadata } from "next";
import Link from "next/link";
import { Download } from "lucide-react";
import { db } from "@/lib/db";
import AdminShell from "@/components/admin/AdminShell";

export const metadata: Metadata = { title: "Quiz Submissions" };

const LABELS: Record<string, Record<string, string>> = {
  middaySkin: { oily: "Oily/Shiny", dry: "Dry/Tight", normal: "Normal" },
  breakouts: { often: "Often", sometimes: "Sometimes", rarely: "Rarely" },
  sensitivity: { very: "Very reactive", sometimes: "Sometimes", no: "No" },
  experience: { beginner: "Beginner (0–3)", advanced: "Advanced (4+)" },
  concern: { oil: "Shine/Oil", dryness: "Dryness", acne: "Acne/Clogs", redness: "Redness" },
};

const label = (field: string, value: string) => LABELS[field]?.[value] ?? value;

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
                  {["Date", "Email", "Midday Skin", "Breakouts", "Sensitivity", "Experience", "Concern", "Result", "Emailed"].map((h) => (
                    <th key={h} className="px-4 py-3 text-[10px] font-heading font-bold uppercase tracking-widest text-brand-contrast whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {submissions.map((s) => (
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
                    <td className="px-4 py-3 text-xs font-body text-brand-navy">{label("middaySkin", s.middaySkin)}</td>
                    <td className="px-4 py-3 text-xs font-body text-brand-navy">{label("breakouts", s.breakouts)}</td>
                    <td className="px-4 py-3 text-xs font-body text-brand-navy">{label("sensitivity", s.sensitivity)}</td>
                    <td className="px-4 py-3 text-xs font-body text-brand-navy">{label("experience", s.experience)}</td>
                    <td className="px-4 py-3 text-xs font-body text-brand-navy">{label("concern", s.concern)}</td>
                    <td className="px-4 py-3 text-xs font-body whitespace-nowrap">
                      <Link href={`/routines/${s.resultSlug}`} className="text-brand-blue hover:underline">
                        {s.resultTitle ?? s.resultSlug}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-xs font-body">
                      {s.emailSent ? (
                        <span className="px-2 py-0.5 text-[10px] font-heading font-bold uppercase bg-green-100 text-green-800 rounded">Sent</span>
                      ) : (
                        <span className="text-brand-contrast/50">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
