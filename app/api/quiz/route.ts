import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendQuizResultEmail } from "@/lib/resend";
import { resolveRoutine } from "@/lib/quiz/engine";
import { loadQuizConfig } from "@/lib/quiz/db-config";

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const config = await loadQuizConfig();
  const validConcernKeys = new Set(config.concerns.map((c) => c.key));

  const concerns: string[] = Array.isArray(body.concerns)
    ? body.concerns.filter((c: unknown) => typeof c === "string" && validConcernKeys.has(c))
    : [];
  const name: string = typeof body.name === "string" ? body.name.trim().slice(0, 80) : "";
  const responses: Record<string, string | string[]> =
    body.responses && typeof body.responses === "object" ? body.responses : {};
  const email: string | null =
    typeof body.email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)
      ? body.email.trim().toLowerCase()
      : null;

  const routine = resolveRoutine(config, { concerns, name, responses });

  let submission: any = null;
  try {
    submission = await db.quizSubmission.create({
      data: { email, name: name || null, concerns, responses, routine, emailSent: false },
    });
  } catch (e) {
    console.error("quiz submission save failed:", e);
  }

  if (email) {
    try {
      await sendQuizResultEmail(email, name, routine);
      if (submission) {
        await db.quizSubmission.update({ where: { id: submission.id }, data: { emailSent: true } });
      }
    } catch (e) {
      console.error("quiz result email failed:", e);
    }
  }

  return NextResponse.json({ ok: true, routine });
}
