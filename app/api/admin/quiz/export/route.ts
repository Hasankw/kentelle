import { NextResponse } from "next/server";
import { db } from "@/lib/db";

const csvCell = (v: unknown) => {
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export async function GET() {
  const submissions = await db.quizSubmission.findMany({ orderBy: { createdAt: "desc" } });

  const header = ["Date", "Email", "Name", "Concerns", "Routine Summary", "Advisory Notes", "EmailSent"];
  const rows = submissions.map((s: any) => {
    const concerns: string[] = Array.isArray(s.concerns) ? s.concerns : [];
    const groups: { label: string; products: { name: string }[] }[] = s.routine?.groups ?? [];
    const routineSummary = groups.map((g) => `${g.label}: ${g.products.map((p) => p.name).join(" / ")}`).join(" | ");
    const notes: string[] = s.routine?.notes ?? [];
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
