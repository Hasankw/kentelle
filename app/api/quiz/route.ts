import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendQuizResultEmail } from "@/lib/resend";
import { resolveRoutine } from "@/lib/quiz/engine";
import { loadQuizConfig, type QuizConfig } from "@/lib/quiz/db-config";

const EMAIL_PROFILE_FIELDS: { id: string; label: string }[] = [
  { id: "barrier_check", label: "Skin type" },
  { id: "reactivity", label: "Skin reactivity" },
  { id: "clinic_history", label: "Recent treatments" },
  { id: "current_actives", label: "Current actives" },
  { id: "sleep", label: "Restful sleep" },
  { id: "stress", label: "Stress level" },
  { id: "water", label: "Daily water" },
  { id: "sun", label: "Daily sun exposure" },
  { id: "climate", label: "Climate" },
];

function buildEmailProfile(
  config: QuizConfig,
  concerns: string[],
  responses: Record<string, string | string[]>,
) {
  const rows: { label: string; value: string }[] = [];
  const concernLabels = config.concerns
    .filter((concern) => concerns.includes(concern.key))
    .map((concern) => concern.label);

  if (concernLabels.length) {
    rows.push({ label: "Skin concerns", value: concernLabels.join(", ") });
  }

  const lifestyleQuestions = config.questionsByPool.lifestyle ?? [];
  for (const field of EMAIL_PROFILE_FIELDS) {
    const question = lifestyleQuestions.find((item) => item.id === field.id);
    const raw = responses[field.id];
    if (!question || raw == null || raw === "") continue;

    const values = Array.isArray(raw) ? raw : [raw];
    const labels = values
      .map((value) => question.options?.find((option) => option.value === value)?.label ?? value)
      .filter(Boolean);

    if (labels.length) rows.push({ label: field.label, value: labels.join(", ") });
  }

  return rows;
}

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
      await sendQuizResultEmail(email, name, routine, buildEmailProfile(config, concerns, responses));
      if (submission) {
        await db.quizSubmission.update({ where: { id: submission.id }, data: { emailSent: true } });
      }
    } catch (e) {
      console.error("quiz result email failed:", e);
    }
  }

  return NextResponse.json({ ok: true, routine });
}
