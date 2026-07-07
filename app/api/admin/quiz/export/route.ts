import { NextResponse } from "next/server";
import { db } from "@/lib/db";

const csvCell = (v: unknown) => {
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export async function GET() {
  const submissions = await db.quizSubmission.findMany({ orderBy: { createdAt: "desc" } });

  const header = ["Date", "Email", "MiddaySkin", "Breakouts", "Sensitivity", "Experience", "Concern", "ResultSlug", "ResultTitle", "EmailSent"];
  const rows = submissions.map((s: any) =>
    [s.createdAt, s.email, s.middaySkin, s.breakouts, s.sensitivity, s.experience, s.concern, s.resultSlug, s.resultTitle, s.emailSent]
      .map(csvCell)
      .join(",")
  );
  const csv = [header.join(","), ...rows].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="skin-quiz-submissions.csv"`,
    },
  });
}
