import { NextResponse } from "next/server";
import { db } from "@/lib/db";

const csvCell = (v: unknown) => {
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

// Submissions stored before the master-prescription rewrite carry a flat
// `routine.groups` list or `routine.am`/`routine.pm` with embedded products;
// newer ones carry a deduplicated `routine.prescription` list. Flatten
// whichever shape into a single "Name — Timing" summary list.
function routineSummaryLines(routine: any): string[] {
  if (!routine) return [];
  if (Array.isArray(routine.prescription)) {
    return routine.prescription.map((e: any) =>
      e.kind === "product"
        ? `${e.product.name} (${e.product.timingLabel})`
        : `${e.options.map((o: any) => o.name).join(" / ")} — choose one (${e.options[0]?.timingLabel ?? ""})`,
    );
  }
  const groups: { label: string; products: { name: string }[] }[] = Array.isArray(routine.groups)
    ? routine.groups
    : [...(routine.am ?? []), ...(routine.pm ?? [])];
  return groups.map((g) => `${g.label}: ${(g.products ?? []).map((p) => p.name).join(" / ")}`);
}

export async function GET() {
  const submissions = await db.quizSubmission.findMany({ orderBy: { createdAt: "desc" } });

  const header = ["Date", "Email", "Name", "Concerns", "Routine Summary", "Advisory Notes", "EmailSent"];
  const rows = submissions.map((s: any) => {
    const concerns: string[] = Array.isArray(s.concerns) ? s.concerns : [];
    const routineSummary = routineSummaryLines(s.routine).join(" | ");
    const notes: string[] = [...(s.routine?.advisories ?? []), ...(s.routine?.notes ?? [])];
    return [s.createdAt, s.email, s.name, concerns.join(", "), routineSummary, notes.join(" "), s.emailSent]
      .map(csvCell)
      .join(",");
  });
  const csv = [header.join(","), ...rows].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="skin-quiz-submissions.csv"`,
    },
  });
}
